import { z } from 'zod';
import { idSchema } from '@/lib/schemas';
import {
  direccionSchema,
  fechaSchema,
  paginaSchema,
  type Params,
} from './listado-params';

export const ESTADOS_FACTURA = ['PENDIENTE', 'PAGADA', 'CON_DIFERENCIA'] as const;
export const ORDENES_FACTURA = ['fecha', 'monto', 'folio'] as const;

const schema = z.object({
  estado: z.enum(ESTADOS_FACTURA).optional().catch(undefined),
  cliente: idSchema.optional().catch(undefined),
  desde: fechaSchema,
  hasta: fechaSchema,
  orden: z.enum(ORDENES_FACTURA).catch('fecha'),
  dir: direccionSchema.catch('desc'),
  pagina: paginaSchema,
});

export type FiltrosFacturas = z.infer<typeof schema>;

/** Reads invoice filters from URL params; invalid values fall back to defaults. */
export function leerFiltrosFacturas(params: Params): FiltrosFacturas {
  return schema.parse(params);
}

/** Non-default filters as URL params (used to build links that keep the current view). */
export function paramsFacturas(f: FiltrosFacturas): Record<string, string | undefined> {
  return {
    estado: f.estado,
    cliente: f.cliente,
    desde: f.desde,
    hasta: f.hasta,
    orden: f.orden === 'fecha' ? undefined : f.orden,
    dir: f.dir === 'desc' ? undefined : f.dir,
  };
}
