import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { requerirSesion } from './autorizacion';
import type { FiltrosFacturas } from './facturas-params';
import { inicioDelDia, paginar, POR_PAGINA } from './listado-params';

const campoOrden = {
  fecha: 'emision',
  monto: 'montoClp',
  folio: 'folio',
} as const;

export type FilaFactura = {
  id: string;
  folio: number;
  montoClp: number;
  emision: Date;
  vencimiento: Date;
  estado: 'PENDIENTE' | 'PAGADA' | 'CON_DIFERENCIA';
  cliente: { id: string; razonSocial: string };
};

export type PaginaFacturas = {
  filas: FilaFactura[];
  total: number;
  pagina: number;
  paginas: number;
};

/** Paginated invoices for any signed-in role. "hasta" includes that whole day. */
export async function listarFacturas(filtros: FiltrosFacturas): Promise<PaginaFacturas> {
  await requerirSesion();
  const where: Prisma.FacturaWhereInput = {
    estado: filtros.estado,
    clienteId: filtros.cliente,
    ...((filtros.desde || filtros.hasta) && {
      emision: {
        ...(filtros.desde && { gte: inicioDelDia(filtros.desde) }),
        ...(filtros.hasta && { lte: inicioDelDia(filtros.hasta) }),
      },
    }),
  };
  const total = await prisma.factura.count({ where });
  const { pagina, paginas, skip } = paginar(total, filtros.pagina);
  const filas = await prisma.factura.findMany({
    where,
    orderBy: [{ [campoOrden[filtros.orden]]: filtros.dir }, { id: 'asc' }],
    skip,
    take: POR_PAGINA,
    select: {
      id: true,
      folio: true,
      montoClp: true,
      emision: true,
      vencimiento: true,
      estado: true,
      cliente: { select: { id: true, razonSocial: true } },
    },
  });
  return { filas, total, pagina, paginas };
}
