import { prisma } from '@/lib/db';
import { connectMongo } from '@/lib/mongo';
import { decodificarCsv } from './archivo';
import { hashArchivo, hashesDeLineas } from './hash';
import { CartolaLinea, Importacion } from './modelos';
import { CartolaError, parseCartola, type CartolaParseada } from './parse';
import type { ResultadoImportacion } from './resultado';

export type { ResultadoImportacion } from './resultado';

/** An import still PROCESANDO after this long is treated as abandoned (crashed process) and retried. */
export const MS_ABANDONO = 5 * 60 * 1000;

type Entrada = { bytes: Uint8Array; nombreArchivo: string; userId: string };

const esDuplicadoMongo = (e: unknown) =>
  typeof e === 'object' && e !== null && 'code' in e && e.code === 11000;

/** PostgreSQL and MongoDB share no transaction, so a failed import is undone by hand. */
async function compensar(importId: string): Promise<void> {
  await prisma.movimientoBancario.deleteMany({ where: { importId } });
  await CartolaLinea.deleteMany({ importId });
  await Importacion.deleteOne({ _id: importId });
}

/** Returns the result for an existing import of the same file, or null when the file can be imported. */
async function revisarExistente(fileHash: string): Promise<ResultadoImportacion | null> {
  const existente = await Importacion.findOne({ fileHash });
  if (!existente) return null;
  const importId = String(existente._id);
  if (existente.estado === 'COMPLETA') return { duplicada: true, importId };
  if (Date.now() - existente.updatedAt.getTime() < MS_ABANDONO) {
    throw new CartolaError('cartola_en_proceso');
  }
  await compensar(importId);
  return null;
}

async function registrar(fileHash: string, parseada: CartolaParseada, entrada: Entrada) {
  try {
    return await Importacion.create({
      fileHash,
      nombreArchivo: entrada.nombreArchivo.slice(0, 255),
      banco: parseada.banco,
      userId: entrada.userId,
      totalFilas: parseada.lineas.length,
    });
  } catch (e) {
    // Another request with the same file won the race on the unique index.
    if (esDuplicadoMongo(e)) return null;
    throw e;
  }
}

export async function importarCartola(entrada: Entrada): Promise<ResultadoImportacion> {
  // Parse first: an invalid file fails before touching either database.
  const parseada = parseCartola(decodificarCsv(entrada.bytes));
  const fileHash = hashArchivo(entrada.bytes);
  await connectMongo();
  await Importacion.init(); // make sure the unique index exists before relying on it

  const previa = await revisarExistente(fileHash);
  if (previa) return previa;
  const importacion = await registrar(fileHash, parseada, entrada);
  if (!importacion) {
    const ganadora = await revisarExistente(fileHash);
    if (ganadora) return ganadora;
    throw new CartolaError('cartola_en_proceso');
  }

  const importId = String(importacion._id);
  try {
    await CartolaLinea.insertMany(
      parseada.lineas.map((l) => ({ importId, fila: l.fila, raw: l.raw })),
    );
    const hashes = hashesDeLineas(parseada.banco, parseada.lineas);
    const { count } = await prisma.movimientoBancario.createMany({
      data: parseada.lineas.map((l, i) => ({
        importId,
        banco: parseada.banco,
        fecha: l.fecha,
        montoClp: l.montoClp,
        descripcion: l.descripcion,
        referencia: l.referencia,
        lineHash: hashes[i],
      })),
      skipDuplicates: true,
    });
    await Importacion.updateOne({ _id: importacion._id }, { estado: 'COMPLETA' });
    return { duplicada: false, importId, nuevas: count, omitidas: parseada.lineas.length - count };
  } catch (e) {
    await compensar(importId);
    throw e;
  }
}
