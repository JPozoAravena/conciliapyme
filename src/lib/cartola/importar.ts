import { prisma } from '@/lib/db';
import { connectMongo } from '@/lib/mongo';
import { decodificarCsv } from './archivo';
import { hashArchivo, hashesDeLineas } from './hash';
import { CartolaLinea, Importacion } from './modelos';
import { CartolaError, parseCartola, type CartolaParseada } from './parse';
import type { ResultadoImportacion } from './resultado';

export type { ResultadoImportacion } from './resultado';

/** An import still PROCESANDO after this long, with no stored movements, is treated as abandoned. */
export const MS_ABANDONO = 5 * 60 * 1000;

type Entrada = { bytes: Uint8Array; nombreArchivo: string; userId: string };

const esDuplicadoMongo = (e: unknown) =>
  typeof e === 'object' && e !== null && 'code' in e && e.code === 11000;

/**
 * Undoes the MongoDB side of an import. PostgreSQL rows are never deleted here: the single
 * createMany is the commit point, and once it ran other imports may already count those rows.
 */
async function descartarEnMongo(importId: string): Promise<void> {
  await CartolaLinea.deleteMany({ importId });
  await Importacion.deleteOne({ _id: importId, estado: 'PROCESANDO' });
}

async function tieneMovimientos(importId: string): Promise<boolean> {
  return (await prisma.movimientoBancario.findFirst({ where: { importId }, select: { id: true } })) !== null;
}

/** Returns the result for an existing import of the same file, or null when the file can be imported. */
async function revisarExistente(fileHash: string): Promise<ResultadoImportacion | null> {
  const existente = await Importacion.findOne({ fileHash });
  if (!existente) return null;
  const importId = String(existente._id);
  if (existente.estado === 'COMPLETA') return { duplicada: true, importId };

  // Movements stored means the import passed its commit point: finish it instead of redoing it.
  if (await tieneMovimientos(importId)) {
    await Importacion.updateOne({ _id: existente._id }, { estado: 'COMPLETA' });
    return { duplicada: true, importId };
  }
  if (Date.now() - existente.updatedAt.getTime() < MS_ABANDONO) {
    throw new CartolaError('cartola_en_proceso');
  }
  // Claim the abandoned record atomically: only succeeds if nobody touched it since we read it.
  const reclamada = await Importacion.findOneAndDelete({
    _id: existente._id,
    estado: 'PROCESANDO',
    updatedAt: existente.updatedAt,
  });
  if (!reclamada) throw new CartolaError('cartola_en_proceso');
  await CartolaLinea.deleteMany({ importId });
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

/** Stores raw lines and refreshes updatedAt, so a slow import is not taken for an abandoned one. */
async function guardarLineasCrudas(importId: string, parseada: CartolaParseada): Promise<void> {
  try {
    await CartolaLinea.insertMany(parseada.lineas.map((l) => ({ importId, fila: l.fila, raw: l.raw })));
    const vigente = await Importacion.updateOne(
      { _id: importId, estado: 'PROCESANDO' },
      { $set: { updatedAt: new Date() } },
    );
    // The record was claimed as abandoned meanwhile: stop before writing to PostgreSQL.
    if (vigente.matchedCount === 0) throw new CartolaError('cartola_en_proceso');
  } catch (e) {
    await descartarEnMongo(importId);
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
  await guardarLineasCrudas(importId, parseada);

  const hashes = hashesDeLineas(parseada.banco, parseada.lineas);
  let nuevas: number;
  try {
    // Single INSERT: either all new rows are stored or none. This is the commit point.
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
    nuevas = count;
  } catch (e) {
    await descartarEnMongo(importId);
    throw e;
  }

  // If this fails the movements stay; the next attempt with the same file completes the import.
  await Importacion.updateOne({ _id: importacion._id }, { estado: 'COMPLETA' });
  return { duplicada: false, importId, nuevas, omitidas: parseada.lineas.length - nuevas };
}
