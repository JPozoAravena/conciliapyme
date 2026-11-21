import { readFileSync } from 'node:fs';
import mongoose from 'mongoose';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { prisma } from '@/lib/db';
import { decodificarCsv } from '@/lib/cartola/archivo';
import { hashArchivo, hashesDeLineas } from '@/lib/cartola/hash';
import { importarCartola } from '@/lib/cartola/importar';
import { CartolaLinea, Importacion } from '@/lib/cartola/modelos';
import { parseCartola } from '@/lib/cartola/parse';
import { connectMongo } from '@/lib/mongo';

// The fixtures are fixed files, so their hashes may already exist (e.g. from a manual test).
// Remove exactly what belongs to them before and after, and touch nothing else.
const archivos = ['banco-a.csv', 'banco-b.csv'].map((nombre) => {
  const bytes = Uint8Array.from(readFileSync(`tests/fixtures/${nombre}`));
  const { banco, lineas } = parseCartola(decodificarCsv(bytes));
  return {
    nombre,
    bytes,
    fileHash: hashArchivo(bytes),
    lineHashes: hashesDeLineas(banco, lineas),
  };
});

async function limpiarFixtures() {
  await connectMongo();
  const fileHashes = archivos.map((a) => a.fileHash);
  const lineHash = { in: archivos.flatMap((a) => a.lineHashes) };
  // Imports that own these movements, even if the file bytes differed (e.g. other line endings).
  const duenas = await prisma.movimientoBancario.findMany({
    where: { lineHash },
    select: { importId: true },
    distinct: ['importId'],
  });
  const porArchivo = await Importacion.find(
    { fileHash: { $in: fileHashes } },
    { _id: 1 },
  ).lean();
  const importIds = [
    ...new Set([
      ...duenas.map((m) => m.importId),
      ...porArchivo.map((i) => String(i._id)),
    ]),
  ];

  await prisma.movimientoBancario.deleteMany({ where: { lineHash } });
  await CartolaLinea.deleteMany({ importId: { $in: importIds } });
  await Importacion.deleteMany({ _id: { $in: importIds } });
}

const importar = (indice: number) =>
  importarCartola({
    bytes: archivos[indice].bytes,
    nombreArchivo: archivos[indice].nombre,
    userId: 'test-fixtures',
  });

// If someone already reconciled the fixture movements in this database (manual testing), leave
// their data alone and skip: deleting reconciled movements is not the test's business.
let enUso = false;
beforeAll(async () => {
  enUso =
    (await prisma.conciliacion.count({
      where: {
        movimiento: { lineHash: { in: archivos.flatMap((a) => a.lineHashes) } },
      },
    })) > 0;
  if (!enUso) await limpiarFixtures();
});

afterAll(async () => {
  if (!enUso) await limpiarFixtures();
  await prisma.$disconnect();
  await mongoose.disconnect();
});

describe('importación de los archivos de ejemplo', () => {
  it('banco-a: 3 nuevos, reimportación sin cambios, banco-b: 2 nuevos', async (ctx) => {
    if (enUso) ctx.skip();
    const primera = await importar(0);
    expect(primera).toMatchObject({ duplicada: false, nuevas: 3, omitidas: 0 });

    const repetida = await importar(0);
    expect(repetida).toEqual({ duplicada: true, importId: primera.importId });
    expect(
      await prisma.movimientoBancario.count({
        where: { lineHash: { in: archivos[0].lineHashes } },
      }),
    ).toBe(3);

    const bancoB = await importar(1);
    expect(bancoB).toMatchObject({ duplicada: false, nuevas: 2, omitidas: 0 });

    const todos = archivos.flatMap((a) => a.lineHashes);
    expect(
      await prisma.movimientoBancario.count({
        where: { lineHash: { in: todos } },
      }),
    ).toBe(5);
    expect(
      await Importacion.countDocuments({
        fileHash: { $in: archivos.map((a) => a.fileHash) },
      }),
    ).toBe(2);
  });
});
