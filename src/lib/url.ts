import type { CodigoError, CodigoOk } from '@/lib/errores';

export function conAviso(ruta: string, aviso: { error: CodigoError } | { ok: CodigoOk }): string {
  return `${ruta}?${new URLSearchParams(aviso).toString()}`;
}
