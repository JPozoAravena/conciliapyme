import type { ZodError } from 'zod';

const mensajesError = {
  sin_permiso: 'No tienes permiso para esta acción.',
  datos_invalidos: 'Revisa los datos ingresados.',
  rut_invalido: 'RUT inválido.',
  razon_social_invalida: 'Ingresa la razón social (mínimo 2 caracteres).',
  rut_duplicado: 'Ya existe un cliente con ese RUT.',
  no_encontrado: 'El registro no existe o fue eliminado.',
  cliente_con_facturas: 'No se puede eliminar un cliente que tiene facturas.',
  folio_invalido: 'El folio debe ser un número entero mayor a 0.',
  folio_duplicado: 'Ya existe una factura con ese folio.',
  monto_invalido: 'El monto debe ser un número entero de pesos mayor a 0.',
  fecha_invalida: 'Ingresa una fecha válida.',
  vencimiento_anterior: 'El vencimiento no puede ser anterior a la emisión.',
} as const;

const mensajesOk = {
  cliente_creado: 'Cliente creado.',
  cliente_actualizado: 'Cliente actualizado.',
  cliente_eliminado: 'Cliente eliminado.',
  factura_creada: 'Factura creada.',
} as const;

export type CodigoError = keyof typeof mensajesError;
export type CodigoOk = keyof typeof mensajesOk;
export type Aviso = { tipo: 'error' | 'ok'; mensaje: string };

export function codigoValidacion(
  error: ZodError,
  mapa: Readonly<Partial<Record<string, CodigoError>>>,
): CodigoError {
  const issue = error.issues[0];
  const campo = issue?.path[0];
  if (typeof campo !== 'string') return 'datos_invalidos';
  return mapa[`${campo}:${issue.code}`] ?? mapa[campo] ?? 'datos_invalidos';
}

type OpcionesPrisma = { duplicado?: CodigoError; enUso?: CodigoError };

export function codigoPrisma(error: unknown, opciones: OpcionesPrisma): CodigoError | null {
  if (typeof error !== 'object' || error === null || !('code' in error)) return null;
  switch (error.code) {
    case 'P2002':
      return opciones.duplicado ?? null;
    case 'P2003':
      return opciones.enUso ?? null;
    case 'P2025':
      return 'no_encontrado';
    default:
      return null;
  }
}

export async function ejecutarConCodigo(
  operacion: () => Promise<unknown>,
  opciones: OpcionesPrisma,
): Promise<CodigoError | null> {
  try {
    await operacion();
    return null;
  } catch (error) {
    const codigo = codigoPrisma(error, opciones);
    if (codigo) return codigo;
    throw error;
  }
}

function buscar<T extends Record<string, string>>(tabla: T, codigo: unknown): string | null {
  if (typeof codigo !== 'string' || !Object.hasOwn(tabla, codigo)) return null;
  return tabla[codigo];
}

export function leerAviso(params: {
  error?: string | string[];
  ok?: string | string[];
}): Aviso | null {
  const error = buscar(mensajesError, params.error);
  if (error) return { tipo: 'error', mensaje: error };
  const ok = buscar(mensajesOk, params.ok);
  return ok ? { tipo: 'ok', mensaje: ok } : null;
}
