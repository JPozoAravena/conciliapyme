import { Importacion } from '@/lib/cartola/modelos';
import { prisma } from '@/lib/db';
import { connectMongo } from '@/lib/mongo';
import { puede } from '@/lib/rbac';
import { requerirSesion } from './autorizacion';

export type ImportacionReciente = {
  id: string;
  nombreArchivo: string;
  banco: string;
  totalFilas: number;
  estado: string;
  fecha: Date;
};

export type Kpis = {
  facturasPendientes: { cantidad: number; totalClp: number };
  movimientos: { total: number; sinConciliar: number };
  /** Reconciled share of all movements, 0-100; null when there are no movements. */
  tasaConciliacion: number | null;
  /** Only for roles that may import statements; empty otherwise. */
  importaciones: ImportacionReciente[];
};

const ULTIMAS = 5;

async function ultimasImportaciones(): Promise<ImportacionReciente[]> {
  await connectMongo();
  // _id is time-ordered and indexed, so no extra index is needed.
  const docs = await Importacion.find().sort({ _id: -1 }).limit(ULTIMAS).lean();
  return docs.map((d) => ({
    id: String(d._id),
    nombreArchivo: d.nombreArchivo,
    banco: d.banco,
    totalFilas: d.totalFilas,
    estado: d.estado,
    fecha: d.createdAt,
  }));
}

export async function obtenerKpis(): Promise<Kpis> {
  const session = await requerirSesion();
  const [pendientes, porEstado, importaciones] = await Promise.all([
    prisma.factura.aggregate({
      where: { estado: 'PENDIENTE' },
      _count: { _all: true },
      _sum: { montoClp: true },
    }),
    prisma.movimientoBancario.groupBy({ by: ['estado'], _count: { _all: true } }),
    puede(session.user.role, 'cartola:importar') ? ultimasImportaciones() : [],
  ]);
  const cantidad = (estado: string) =>
    porEstado.find((g) => g.estado === estado)?._count._all ?? 0;
  const sinConciliar = cantidad('SIN_CONCILIAR');
  const total = sinConciliar + cantidad('CONCILIADO');
  return {
    facturasPendientes: {
      cantidad: pendientes._count._all,
      totalClp: pendientes._sum.montoClp ?? 0,
    },
    movimientos: { total, sinConciliar },
    tasaConciliacion: total === 0 ? null : Math.round(((total - sinConciliar) / total) * 100),
    importaciones,
  };
}
