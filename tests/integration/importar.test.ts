import { randomUUID } from 'node:crypto';
import mongoose from 'mongoose';
import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '@/lib/db';
import { hashArchivo } from '@/lib/cartola/hash';
import { importarCartola, MS_ABANDONO } from '@/lib/cartola/importar';
import { CartolaLinea, Importacion } from '@/lib/cartola/modelos';
import { CartolaError } from '@/lib/cartola/parse';

const creados = new Set<string>();
const usuario = 'test-integracion';
const bytes = (texto: string) => new TextEncoder().encode(texto);

function cartolaUnica(lineasExtra = '') {
  const id = randomUUID().slice(0, 8);
  return (
    'Fecha;Descripción;Cargo;Abono;Saldo\n' +
    `02/09/2026;TEST ${id} UNO;;100.000;1\n` +
    `02/09/2026;TEST ${id} DOS;;200.000;1\n` +
    lineasExtra
  );
}

async function importar(texto: string, nombreArchivo = 'a.csv') {
  const r = await importarCartola({ bytes: bytes(texto), nombreArchivo, userId: usuario });
  creados.add(r.importId);
  return r;
}

async function limpiar(importId: string) {
  await prisma.movimientoBancario.deleteMany({ where: { importId } });
  await CartolaLinea.deleteMany({ importId });
  await Importacion.deleteOne({ _id: importId });
}

afterEach(() => {
  vi.restoreAllMocks();
});

afterAll(async () => {
  for (const importId of creados) await limpiar(importId);
  await Importacion.deleteMany({ userId: usuario });
  await prisma.$disconnect();
  await mongoose.disconnect();
});

describe('importarCartola', () => {
  it('importa movimientos y guarda las líneas crudas en MongoDB', async () => {
    const r = await importar(cartolaUnica());
    expect(r).toMatchObject({ duplicada: false, nuevas: 2, omitidas: 0 });
    const movimientos = await prisma.movimientoBancario.findMany({ where: { importId: r.importId } });
    expect(movimientos.map((m) => m.montoClp).sort()).toEqual([100000, 200000]);
    const lineas = await CartolaLinea.find({ importId: r.importId }).lean();
    expect(lineas).toHaveLength(2);
    expect(lineas[0].raw).toMatchObject({ abono: '100.000' });
    const registro = await Importacion.findById(r.importId).lean();
    expect(registro).toMatchObject({ estado: 'COMPLETA', totalFilas: 2, banco: 'BANCO_A' });
  });

  it('es idempotente con el mismo archivo', async () => {
    const contenido = cartolaUnica();
    const a = await importar(contenido);
    const b = await importar(contenido);
    expect(b).toEqual({ duplicada: true, importId: a.importId });
    expect(await prisma.movimientoBancario.count({ where: { importId: a.importId } })).toBe(2);
    expect(await CartolaLinea.countDocuments({ importId: a.importId })).toBe(2);
  });

  it('no duplica movimientos cuando otro archivo repite las mismas líneas', async () => {
    const contenido = cartolaUnica();
    await importar(contenido);
    const b = await importar(`${contenido}02/09/2026;OTRA ${randomUUID()};;5;1\n`, 'b.csv');
    expect(b).toMatchObject({ duplicada: false, nuevas: 1, omitidas: 2 });
  });

  it('no deja rastros si el archivo es inválido', async () => {
    const antes = await Importacion.countDocuments();
    await expect(
      importarCartola({ bytes: bytes('x,y\n1,2\n'), nombreArchivo: 'c.csv', userId: usuario }),
    ).rejects.toBeInstanceOf(CartolaError);
    expect(await Importacion.countDocuments()).toBe(antes);
  });

  it('deshace MongoDB y PostgreSQL si falla a mitad de camino', async () => {
    const contenido = cartolaUnica();
    vi.spyOn(prisma.movimientoBancario, 'createMany').mockRejectedValueOnce(new Error('pg caído'));
    await expect(
      importarCartola({ bytes: bytes(contenido), nombreArchivo: 'd.csv', userId: usuario }),
    ).rejects.toThrow('pg caído');
    expect(await Importacion.countDocuments({ fileHash: hashArchivo(bytes(contenido)) })).toBe(0);
    // After the failure the same file can be imported normally.
    expect(await importar(contenido)).toMatchObject({ duplicada: false, nuevas: 2 });
  });

  it('informa una importación en curso y reintenta una abandonada', async () => {
    const contenido = cartolaUnica();
    const registro = await Importacion.create({
      fileHash: hashArchivo(bytes(contenido)),
      nombreArchivo: 'e.csv',
      banco: 'BANCO_A',
      userId: usuario,
      totalFilas: 2,
    });
    await expect(
      importarCartola({ bytes: bytes(contenido), nombreArchivo: 'e.csv', userId: usuario }),
    ).rejects.toMatchObject({ codigo: 'cartola_en_proceso' });

    const viejo = new Date(Date.now() - MS_ABANDONO - 1000);
    await Importacion.collection.updateOne({ _id: registro._id }, { $set: { updatedAt: viejo } });
    const r = await importar(contenido);
    expect(r).toMatchObject({ duplicada: false, nuevas: 2 });
    expect(r.importId).not.toBe(String(registro._id));
  });

  it('dos importaciones simultáneas del mismo archivo no duplican nada', async () => {
    const contenido = cartolaUnica();
    const resultados = await Promise.allSettled([importar(contenido), importar(contenido)]);
    const ok = resultados.filter((r) => r.status === 'fulfilled');
    expect(ok.length).toBeGreaterThanOrEqual(1);
    const nuevas = ok.map((r) => (r.value.duplicada ? 0 : r.value.nuevas));
    expect(nuevas.reduce((a, b) => a + b, 0)).toBe(2);
    for (const r of resultados) {
      if (r.status === 'rejected') expect(r.reason).toMatchObject({ codigo: 'cartola_en_proceso' });
    }
    expect(await Importacion.countDocuments({ fileHash: hashArchivo(bytes(contenido)) })).toBe(1);
  });
});
