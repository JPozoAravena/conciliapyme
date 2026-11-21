import { enteroDeUrl } from '@/lib/parametros';
import { MAX_FILAS } from './limites';

export type ResultadoImportacion =
  | { duplicada: true; importId: string }
  | { duplicada: false; importId: string; nuevas: number; omitidas: number };

export type ResultadoVisible =
  | { tipo: 'importada'; nuevas: number; omitidas: number }
  | { tipo: 'repetida' };

const RUTA = '/importar';

export function urlResultado(r: ResultadoImportacion): string {
  if (r.duplicada) return `${RUTA}?ok=cartola_repetida`;
  const params = new URLSearchParams({
    ok: 'cartola_importada',
    nuevas: String(r.nuevas),
    omitidas: String(r.omitidas),
  });
  return `${RUTA}?${params.toString()}`;
}

export function leerResultadoImportacion(params: {
  ok?: string | string[];
  nuevas?: string | string[];
  omitidas?: string | string[];
}): ResultadoVisible | null {
  if (params.ok === 'cartola_repetida') return { tipo: 'repetida' };
  if (params.ok !== 'cartola_importada') return null;
  const nuevas = enteroDeUrl(params.nuevas, MAX_FILAS);
  const omitidas = enteroDeUrl(params.omitidas, MAX_FILAS);
  if (nuevas === null || omitidas === null || nuevas + omitidas === 0) return null;
  if (nuevas + omitidas > MAX_FILAS) return null;
  return { tipo: 'importada', nuevas, omitidas };
}
