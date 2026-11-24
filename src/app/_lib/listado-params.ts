import { z } from 'zod';

export const POR_PAGINA = 20;

export type Params = Record<string, string | string[] | undefined>;

/** Positive page number; anything else falls back to 1. */
export const paginaSchema = z
  .string()
  .regex(/^[1-9]\d{0,5}$/)
  .transform(Number)
  .catch(1);

/** Calendar date as yyyy-mm-dd; anything else (including 2026-02-31) becomes undefined. */
export const fechaSchema = z
  .string()
  .refine(
    (v) =>
      /^\d{4}-\d{2}-\d{2}$/.test(v) &&
      new Date(`${v}T00:00:00.000Z`).toISOString().startsWith(v),
  )
  .optional()
  .catch(undefined);

export const direccionSchema = z.enum(['asc', 'desc']);

/** Free-text search: trimmed, bounded, empty means no filter. */
export const textoSchema = z
  .string()
  .transform((v) => v.trim().slice(0, 80))
  .transform((v) => v || undefined)
  .optional()
  .catch(undefined);

export const inicioDelDia = (fecha: string) => new Date(`${fecha}T00:00:00.000Z`);

/** Page bounds for a total, clamping a requested page that is beyond the last one. */
export function paginar(total: number, pagina: number) {
  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA));
  const actual = Math.min(pagina, paginas);
  return { pagina: actual, paginas, skip: (actual - 1) * POR_PAGINA };
}
