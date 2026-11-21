import { FacturaEstado, MovimientoEstado } from '@prisma/client';
import { registrarAuditoria } from '@/lib/auditoria';
import { prisma } from '@/lib/db';
import type { CodigoError } from '@/lib/errores';
import { evaluarRegla, type Regla } from './sugerir';

export class ConciliacionError extends Error {
  constructor(readonly codigo: CodigoError) {
    super(codigo);
    this.name = 'ConciliacionError';
  }
}

export type Confirmacion = {
  conciliacionId: string;
  regla: Regla;
  diferenciaClp: number;
  estadoFactura: FacturaEstado;
};

/**
 * Marks the movement as reconciled, the invoice as paid (or paid with a difference) and creates the
 * reconciliation record: all three or none. The rule is recalculated here, never taken from the
 * browser. Concurrency is decided by conditional UPDATEs (WHERE estado = ...), not by a prior read.
 */
export async function confirmarConciliacion(input: {
  movimientoId: string;
  facturaId: string;
  userId: string;
}): Promise<Confirmacion> {
  const resultado = await prisma.$transaction(async (tx) => {
    const [mov, factura] = await Promise.all([
      tx.movimientoBancario.findUnique({ where: { id: input.movimientoId } }),
      tx.factura.findUnique({ where: { id: input.facturaId } }),
    ]);
    if (!mov || !factura) throw new ConciliacionError('no_encontrado');
    const regla = evaluarRegla(mov, factura);
    if (!regla) throw new ConciliacionError('conciliacion_sin_regla');

    const diferenciaClp = mov.montoClp - factura.montoClp;
    const estadoFactura =
      diferenciaClp === 0 ? FacturaEstado.PAGADA : FacturaEstado.CON_DIFERENCIA;

    const m = await tx.movimientoBancario.updateMany({
      where: { id: mov.id, estado: MovimientoEstado.SIN_CONCILIAR },
      data: { estado: MovimientoEstado.CONCILIADO },
    });
    if (m.count !== 1) throw new ConciliacionError('movimiento_ya_conciliado');
    const f = await tx.factura.updateMany({
      where: { id: factura.id, estado: FacturaEstado.PENDIENTE },
      data: { estado: estadoFactura },
    });
    if (f.count !== 1) throw new ConciliacionError('factura_no_pendiente');

    const conciliacion = await tx.conciliacion.create({
      data: {
        movimientoId: mov.id,
        facturaId: factura.id,
        userId: input.userId,
        regla,
        diferenciaClp,
      },
    });
    return {
      conciliacionId: conciliacion.id,
      regla,
      diferenciaClp,
      estadoFactura,
    };
  });

  await registrarAuditoria({
    userId: input.userId,
    accion: 'CONCILIACION_CONFIRMADA',
    entidad: 'MovimientoBancario',
    entidadId: input.movimientoId,
    antes: {
      movimiento: MovimientoEstado.SIN_CONCILIAR,
      factura: FacturaEstado.PENDIENTE,
    },
    despues: {
      movimiento: MovimientoEstado.CONCILIADO,
      factura: resultado.estadoFactura,
      facturaId: input.facturaId,
      conciliacionId: resultado.conciliacionId,
      regla: resultado.regla,
      diferenciaClp: resultado.diferenciaClp,
    },
  });
  return resultado;
}
