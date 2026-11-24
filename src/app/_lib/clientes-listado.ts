import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { requerirSesion } from './autorizacion';
import type { FiltrosClientes } from './clientes-params';
import { paginar, POR_PAGINA } from './listado-params';

const MAX_OPCIONES = 500;

export type FilaCliente = {
  id: string;
  rut: string;
  razonSocial: string;
  facturas: number;
};

export type PaginaClientes = {
  filas: FilaCliente[];
  total: number;
  pagina: number;
  paginas: number;
};

function ordenar(f: FiltrosClientes): Prisma.ClienteOrderByWithRelationInput {
  if (f.orden === 'rut') return { rut: f.dir };
  if (f.orden === 'facturas') return { facturas: { _count: f.dir } };
  return { razonSocial: f.dir };
}

/** Paginated clients, searchable by razón social or RUT. */
export async function listarClientes(filtros: FiltrosClientes): Promise<PaginaClientes> {
  await requerirSesion();
  const where: Prisma.ClienteWhereInput = filtros.q
    ? {
        OR: [
          { razonSocial: { contains: filtros.q, mode: 'insensitive' } },
          { rut: { contains: filtros.q, mode: 'insensitive' } },
        ],
      }
    : {};
  const total = await prisma.cliente.count({ where });
  const { pagina, paginas, skip } = paginar(total, filtros.pagina);
  const clientes = await prisma.cliente.findMany({
    where,
    orderBy: [ordenar(filtros), { id: 'asc' }],
    skip,
    take: POR_PAGINA,
    select: {
      id: true,
      rut: true,
      razonSocial: true,
      _count: { select: { facturas: true } },
    },
  });
  return {
    filas: clientes.map(({ _count, ...c }) => ({ ...c, facturas: _count.facturas })),
    total,
    pagina,
    paginas,
  };
}

/** Light list for the invoice client filter. */
export async function opcionesClientes(): Promise<{ id: string; razonSocial: string }[]> {
  await requerirSesion();
  return prisma.cliente.findMany({
    orderBy: { razonSocial: 'asc' },
    take: MAX_OPCIONES,
    select: { id: true, razonSocial: true },
  });
}
