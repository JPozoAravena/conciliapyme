import { randomUUID } from 'node:crypto';
import mongoose from 'mongoose';
import { afterAll, describe, expect, it } from 'vitest';
import { Auditoria } from '@/lib/auditoria';
import {
  ConciliacionError,
  confirmarConciliacion,
} from '@/lib/conciliacion/confirmar';
import { prisma } from '@/lib/db';

const creados = {
  clientes: [] as string[],
  movimientos: [] as string[],
  facturas: [] as string[],
};
let folio = 900_000_000 + Math.floor(Math.random() * 1_000_000);

// Own user: CI databases are not seeded. The password is never used, so a random value is enough.
let usuarioId: string | undefined;
async function usuario() {
  if (!usuarioId) {
    const u = await prisma.user.create({
      data: {
        email: `test-${randomUUID()}@test.local`,
        passwordHash: randomUUID(),
        role: 'CONTADOR',
      },
    });
    usuarioId = u.id;
  }
  return { id: usuarioId };
}

async function escenario(montoMovimiento = 119_000, montoFactura = 119_000) {
  const id = randomUUID().slice(0, 8);
  const cliente = await prisma.cliente.create({
    data: { rut: `T-${id}`, razonSocial: `Test ${id}` },
  });
  const factura = await prisma.factura.create({
    data: {
      folio: ++folio,
      clienteId: cliente.id,
      montoClp: montoFactura,
      emision: new Date('2026-09-01T00:00:00Z'),
      vencimiento: new Date('2026-09-10T00:00:00Z'),
    },
  });
  const movimiento = await prisma.movimientoBancario.create({
    data: {
      importId: `test-${id}`,
      banco: 'BANCO_A',
      fecha: new Date('2026-09-09T00:00:00Z'),
      montoClp: montoMovimiento,
      descripcion: `PAGO FAC ${factura.folio}`,
      lineHash: `test-${id}`,
    },
  });
  creados.clientes.push(cliente.id);
  creados.facturas.push(factura.id);
  creados.movimientos.push(movimiento.id);
  return { factura, movimiento };
}

afterAll(async () => {
  await prisma.conciliacion.deleteMany({
    where: { movimientoId: { in: creados.movimientos } },
  });
  await prisma.movimientoBancario.deleteMany({
    where: { id: { in: creados.movimientos } },
  });
  await prisma.factura.deleteMany({ where: { id: { in: creados.facturas } } });
  await prisma.cliente.deleteMany({ where: { id: { in: creados.clientes } } });
  await Auditoria.deleteMany({ entidadId: { $in: creados.movimientos } });
  if (usuarioId) await prisma.user.delete({ where: { id: usuarioId } });
  await prisma.$disconnect();
  await mongoose.disconnect();
});

describe('confirmarConciliacion', () => {
  it('concilia movimiento y factura, recalcula la regla y audita después del commit', async () => {
    const { factura, movimiento } = await escenario();
    const { id: userId } = await usuario();
    const r = await confirmarConciliacion({
      movimientoId: movimiento.id,
      facturaId: factura.id,
      userId,
    });
    expect(r).toMatchObject({ regla: 'MONTO_Y_FOLIO', diferenciaClp: 0 });
    expect(
      await prisma.movimientoBancario.findUnique({
        where: { id: movimiento.id },
      }),
    ).toMatchObject({
      estado: 'CONCILIADO',
    });
    expect(
      await prisma.factura.findUnique({ where: { id: factura.id } }),
    ).toMatchObject({ estado: 'PAGADA' });
    const evento = await Auditoria.findOne({ entidadId: movimiento.id }).lean();
    expect(evento).toMatchObject({ accion: 'CONCILIACION_CONFIRMADA', userId });
  });

  it('marca CON_DIFERENCIA cuando el monto no es exacto', async () => {
    const { factura, movimiento } = await escenario(118_500, 119_000);
    const { id: userId } = await usuario();
    const r = await confirmarConciliacion({
      movimientoId: movimiento.id,
      facturaId: factura.id,
      userId,
    });
    expect(r).toMatchObject({ regla: 'DIFERENCIA_MENOR', diferenciaClp: -500 });
    expect(
      await prisma.factura.findUnique({ where: { id: factura.id } }),
    ).toMatchObject({
      estado: 'CON_DIFERENCIA',
    });
  });

  it('rechaza un par que no cumple ninguna regla, sin cambiar nada', async () => {
    const { factura, movimiento } = await escenario(50_000, 119_000);
    const { id: userId } = await usuario();
    await expect(
      confirmarConciliacion({
        movimientoId: movimiento.id,
        facturaId: factura.id,
        userId,
      }),
    ).rejects.toMatchObject({ codigo: 'conciliacion_sin_regla' });
    expect(
      await prisma.movimientoBancario.findUnique({
        where: { id: movimiento.id },
      }),
    ).toMatchObject({
      estado: 'SIN_CONCILIAR',
    });
  });

  it('revierte todo si la factura ya no está pendiente', async () => {
    const { factura, movimiento } = await escenario();
    await prisma.factura.update({
      where: { id: factura.id },
      data: { estado: 'PAGADA' },
    });
    const { id: userId } = await usuario();
    await expect(
      confirmarConciliacion({
        movimientoId: movimiento.id,
        facturaId: factura.id,
        userId,
      }),
    ).rejects.toMatchObject({ codigo: 'factura_no_pendiente' });
    expect(
      await prisma.movimientoBancario.findUnique({
        where: { id: movimiento.id },
      }),
    ).toMatchObject({
      estado: 'SIN_CONCILIAR',
    });
    expect(
      await prisma.conciliacion.count({
        where: { movimientoId: movimiento.id },
      }),
    ).toBe(0);
  });

  it('dos confirmaciones simultáneas del mismo movimiento: solo una gana', async () => {
    const { factura, movimiento } = await escenario();
    const { id: userId } = await usuario();
    const intento = () =>
      confirmarConciliacion({
        movimientoId: movimiento.id,
        facturaId: factura.id,
        userId,
      });
    const resultados = await Promise.allSettled([
      intento(),
      intento(),
      intento(),
    ]);

    expect(resultados.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    for (const r of resultados) {
      if (r.status === 'rejected')
        expect(r.reason).toBeInstanceOf(ConciliacionError);
    }
    expect(
      await prisma.conciliacion.count({
        where: { movimientoId: movimiento.id },
      }),
    ).toBe(1);
    expect(await Auditoria.countDocuments({ entidadId: movimiento.id })).toBe(
      1,
    );
  });

  it('dos movimientos distintos contra la misma factura: solo uno gana', async () => {
    const { factura, movimiento } = await escenario();
    const otro = await prisma.movimientoBancario.create({
      data: {
        ...movimiento,
        id: undefined,
        lineHash: `${movimiento.lineHash}-b`,
      },
    });
    creados.movimientos.push(otro.id);
    const { id: userId } = await usuario();
    const resultados = await Promise.allSettled([
      confirmarConciliacion({
        movimientoId: movimiento.id,
        facturaId: factura.id,
        userId,
      }),
      confirmarConciliacion({
        movimientoId: otro.id,
        facturaId: factura.id,
        userId,
      }),
    ]);
    expect(resultados.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    expect(
      await prisma.conciliacion.count({ where: { facturaId: factura.id } }),
    ).toBe(1);
  });
});
