import { leerAviso, type Aviso } from '@/lib/errores';

type ParamsAviso = Parameters<typeof leerAviso>[0];

/** Presentation wording that replaces the generic message of a URL error code. */
const MENSAJES_UI: Readonly<Record<string, string>> = {
  movimiento_ya_conciliado:
    'Otra persona confirmó este movimiento primero. Actualizamos la lista.',
};

export const MENSAJE_LOGIN_INVALIDO = 'Credenciales inválidas o demasiados intentos.';

/** Single code -> Spanish message source for banners and toasts. */
export function avisoDesdeUrl(params: ParamsAviso): Aviso | null {
  const error = params.error;
  if (typeof error === 'string' && Object.hasOwn(MENSAJES_UI, error)) {
    return { tipo: 'error', mensaje: MENSAJES_UI[error] };
  }
  return leerAviso(params);
}
