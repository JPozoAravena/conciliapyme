import { createHash } from 'node:crypto';
import type { LineaCartola } from './parse';

const sha256 = (dato: string | Uint8Array) => createHash('sha256').update(dato).digest('hex');

/** SHA-256 of the uploaded bytes, used as the unique key of the import in MongoDB. */
export const hashArchivo = (bytes: Uint8Array): string => sha256(bytes);

/**
 * One hash per line, unique in PostgreSQL. An occurrence counter tells apart identical lines in
 * the same file (two equal payments on the same day), and still matches when a later file overlaps.
 */
export function hashesDeLineas(banco: string, lineas: LineaCartola[]): string[] {
  const vistos = new Map<string, number>();
  return lineas.map((l) => {
    const base = [banco, l.fecha.toISOString().slice(0, 10), l.montoClp, l.descripcion].join('|');
    const n = (vistos.get(base) ?? 0) + 1;
    vistos.set(base, n);
    return sha256(`${base}|${n}`);
  });
}
