/** Reads a non-negative integer from a URL search param, or null when it is missing, malformed or above `max`. */
export function enteroDeUrl(valor: unknown, max: number): number | null {
  if (typeof valor !== 'string' || !/^\d{1,9}$/.test(valor)) return null;
  const n = Number(valor);
  return n <= max ? n : null;
}
