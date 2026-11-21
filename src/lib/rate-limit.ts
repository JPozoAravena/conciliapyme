type Entrada = { count: number; reset: number };
const globalForRate = globalThis as unknown as { rateLimitMap?: Map<string, Entrada> };
const intentos = (globalForRate.rateLimitMap ??= new Map<string, Entrada>());

export function limitar(clave: string, max = 5, ventanaMs = 60_000, ahora = Date.now()): boolean {
  const entrada = intentos.get(clave);
  if (!entrada || entrada.reset <= ahora) {
    intentos.set(clave, { count: 1, reset: ahora + ventanaMs });
    return true;
  }
  if (entrada.count >= max) return false;
  entrada.count += 1;
  return true;
}