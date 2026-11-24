import { z } from 'zod';
import {
  direccionSchema,
  paginaSchema,
  textoSchema,
  type Params,
} from './listado-params';

export const ORDENES_CLIENTE = ['nombre', 'rut', 'facturas'] as const;

const schema = z.object({
  q: textoSchema,
  orden: z.enum(ORDENES_CLIENTE).catch('nombre'),
  dir: direccionSchema.catch('asc'),
  pagina: paginaSchema,
});

export type FiltrosClientes = z.infer<typeof schema>;

/** Reads client list params from the URL; invalid values fall back to defaults. */
export function leerFiltrosClientes(params: Params): FiltrosClientes {
  return schema.parse(params);
}

export function paramsClientes(f: FiltrosClientes): Record<string, string | undefined> {
  return {
    q: f.q,
    orden: f.orden === 'nombre' ? undefined : f.orden,
    dir: f.dir === 'asc' ? undefined : f.dir,
  };
}
