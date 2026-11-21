import type { CodigoError, CodigoOk } from '@/lib/errores';

type AvisoUrl = { error: CodigoError; fila?: number } | { ok: CodigoOk };

export function conAviso(ruta: string, aviso: AvisoUrl): string {
  const params = new URLSearchParams();
  if ('ok' in aviso) {
    params.set('ok', aviso.ok);
  } else {
    params.set('error', aviso.error);
    if (aviso.fila !== undefined) params.set('fila', String(aviso.fila));
  }
  return `${ruta}?${params.toString()}`;
}
