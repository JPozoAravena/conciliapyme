import type { ZodError } from 'zod';
import { MAX_FILAS } from '@/lib/cartola/limites';
import { enteroDeUrl } from '@/lib/parametros';

const mensajesError = {
  sin_permiso: 'No tienes permiso para esta acción.',
  datos_invalidos: 'Revisa los datos ingresados.',
  rut_invalido: 'RUT inválido.',
  razon_social_invalida: 'Ingresa la razón social (entre 2 y 120 caracteres).',
  rut_duplicado: 'Ya existe un cliente con ese RUT.',
  no_encontrado: 'El registro no existe o fue eliminado.',
  cliente_con_facturas: 'No se puede eliminar un cliente que tiene facturas.',
  folio_invalido: 'El folio debe ser un número entero entre 1 y 2.147.483.647.',
  folio_duplicado: 'Ya existe una factura con ese folio.',
  monto_invalido: 'El monto debe ser un número entero de pesos entre 1 y 2.147.483.647.',
  fecha_invalida: 'Ingresa una fecha válida.',
  vencimiento_anterior: 'El vencimiento no puede ser anterior a la emisión.',
  archivo_requerido: 'Selecciona un archivo CSV.',
  archivo_tipo: 'El archivo debe ser un CSV (.csv).',
  archivo_grande: 'El archivo supera el tamaño máximo de 512 KB.',
  cartola_formato:
    'No reconocemos el formato de la cartola. Revisa que tenga las columnas esperadas.',
  cartola_vacia: 'El archivo no tiene movimientos.',
  cartola_demasiadas_filas:
    'La cartola supera el máximo de 5.000 movimientos. Divídela en archivos más pequeños.',
  cartola_mal_formada: 'Hay una fila con más o menos columnas que el encabezado.',
  cartola_monto_invalido: 'Hay un monto que no es un número entero de pesos válido.',
  cartola_fecha_invalida: 'Hay una fecha inválida o fuera de rango.',
  cartola_descripcion_larga: 'Hay una descripción o referencia demasiado larga.',
  cartola_en_proceso: 'Este archivo se está importando en este momento. Revisa en unos segundos.',
  importacion_fallida: 'No se pudo importar el archivo. Inténtalo nuevamente.',
  conciliacion_sin_regla: 'Ese movimiento y esa factura no cumplen ninguna regla de coincidencia.',
  movimiento_ya_conciliado: 'Ese movimiento ya fue conciliado.',
  factura_no_pendiente: 'Esa factura ya no está pendiente.',
  conciliacion_fallida: 'No se pudo confirmar la conciliación. Inténtalo nuevamente.',
} as const;

const codigosConFila: ReadonlySet<string> = new Set([
  'cartola_mal_formada',
  'cartola_monto_invalido',
  'cartola_fecha_invalida',
  'cartola_descripcion_larga',
]);

const mensajesOk = {
  cliente_creado: 'Cliente creado.',
  cliente_actualizado: 'Cliente actualizado.',
  cliente_eliminado: 'Cliente eliminado.',
  factura_creada: 'Factura creada.',
  conciliacion_confirmada: 'Conciliación confirmada.',
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

function conFila(codigo: unknown, mensaje: string, filaCruda: unknown): string {
  // Row 1 is the header, so data rows go from 2 to MAX_FILAS + 1.
  const fila = enteroDeUrl(filaCruda, MAX_FILAS + 1);
  if (typeof codigo !== 'string' || !codigosConFila.has(codigo) || fila === null || fila < 2) {
    return mensaje;
  }
  return `Fila ${fila}: ${mensaje.charAt(0).toLowerCase()}${mensaje.slice(1)}`;
}

export function leerAviso(params: {
  error?: string | string[];
  ok?: string | string[];
  fila?: string | string[];
}): Aviso | null {
  const error = buscar(mensajesError, params.error);
  if (error) return { tipo: 'error', mensaje: conFila(params.error, error, params.fila) };
  const ok = buscar(mensajesOk, params.ok);
  return ok ? { tipo: 'ok', mensaje: ok } : null;
}
