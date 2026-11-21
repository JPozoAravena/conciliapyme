/** Upload limit. Kept below the 1 MB default body limit of Server Actions so our own error code is shown. */
export const MAX_BYTES = 512 * 1024;
export const MAX_FILAS = 5000;
export const MAX_DESCRIPCION = 300;
export const MAX_REFERENCIA = 100;
/** Prisma `Int` columns are 32-bit in PostgreSQL. */
export const INT_MAX = 2_147_483_647;
export const ANIO_MIN = 2000;
export const ANIO_MAX = 2100;
