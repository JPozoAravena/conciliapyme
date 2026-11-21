import { enteroDeUrl } from '@/lib/parametros';

export const ACCIONES = ['CONCILIACION_CONFIRMADA'] as const;
export type AccionAuditoria = (typeof ACCIONES)[number];

export const POR_PAGINA = 20;
const MAX_PAGINA = 1000;
const DIA_MS = 86_400_000;

export type FiltrosAuditoria = {
  accion?: AccionAuditoria;
  desde?: Date;
  hasta?: Date;
  pagina: number;
};

type Params = Record<string, string | string[] | undefined>;

function fecha(valor: unknown): Date | undefined {
  if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor))
    return undefined;
  const d = new Date(`${valor}T00:00:00.000Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().startsWith(valor)
    ? d
    : undefined;
}

const esAccion = (valor: unknown): valor is AccionAuditoria =>
  typeof valor === 'string' && (ACCIONES as readonly string[]).includes(valor);

/** Reads filters from URL params; anything unknown or malformed is ignored, never passed to Mongo. */
export function leerFiltros(params: Params): FiltrosAuditoria {
  const filtros: FiltrosAuditoria = { pagina: 1 };
  if (esAccion(params.accion)) filtros.accion = params.accion;
  const desde = fecha(params.desde);
  const hasta = fecha(params.hasta);
  if (desde) filtros.desde = desde;
  if (hasta) filtros.hasta = hasta;
  const pagina = enteroDeUrl(params.pagina, MAX_PAGINA);
  if (pagina !== null && pagina >= 1) filtros.pagina = pagina;
  return filtros;
}

/** Mongo filter built only from validated values. "hasta" includes that whole day. */
export function consultaMongo(f: FiltrosAuditoria): Record<string, unknown> {
  const consulta: Record<string, unknown> = {};
  if (f.accion) consulta.accion = f.accion;
  if (f.desde || f.hasta) {
    consulta.fecha = {
      ...(f.desde && { $gte: f.desde }),
      ...(f.hasta && { $lt: new Date(f.hasta.getTime() + DIA_MS) }),
    };
  }
  return consulta;
}
