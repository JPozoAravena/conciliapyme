import { randomUUID } from 'node:crypto';
import mongoose from 'mongoose';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { obtenerKpis } from '@/app/_lib/dashboard-kpis';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';

vi.mock('@/auth', () => ({ auth: vi.fn() }));
const mockAuth = auth as unknown as ReturnType<typeof vi.fn>;

const marca = randomUUID().slice(0, 8);
let folio = 700_000_000 + Math.floor(Math.random() * 1_000_000);

function conSesion(role: 'CONTADOR' | 'DUENO' | 'ADMIN') {
  mockAuth.mockResolvedValue({ user: { id: 'u', email: 'u@test.local', role }, expires: '' });
}

beforeEach(() => {
  mockAuth.mockReset();
});

afterAll(async () => {
  await prisma.movimientoBancario.deleteMany({ where: { importId: marca } });
  await prisma.factura.deleteMany({ where: { cliente: { rut: `K-${marca}` } } });
  await prisma.cliente.deleteMany({ where: { rut: `K-${marca}` } });
  await mongoose.disconnect();
});

describe('obtenerKpis', () => {
  it('rechaza sin sesión', async () => {
    mockAuth.mockResolvedValue(null);
    await expect(obtenerKpis()).rejects.toThrow();
  });

  it('suma facturas pendientes y calcula la tasa con los movimientos sembrados', async () => {
    conSesion('CONTADOR');
    const antes = await obtenerKpis();

    const cliente = await prisma.cliente.create({
      data: { rut: `K-${marca}`, razonSocial: `Kpi ${marca}` },
    });
    const factura = (montoClp: number, estado: 'PENDIENTE' | 'PAGADA') =>
      prisma.factura.create({
        data: {
          folio: folio++,
          clienteId: cliente.id,
          montoClp,
          estado,
          emision: new Date('2026-01-01T00:00:00Z'),
          vencimiento: new Date('2026-01-10T00:00:00Z'),
        },
      });
    await factura(100_000, 'PENDIENTE');
    await factura(50_000, 'PENDIENTE');
    await factura(999_000, 'PAGADA');
    await prisma.movimientoBancario.createMany({
      data: ['SIN_CONCILIAR', 'SIN_CONCILIAR', 'CONCILIADO'].map((estado, i) => ({
        importId: marca,
        banco: 'test',
        fecha: new Date('2026-01-05T00:00:00Z'),
        montoClp: 1000,
        descripcion: `kpi ${i}`,
        lineHash: `${marca}-${i}`,
        estado: estado as 'SIN_CONCILIAR' | 'CONCILIADO',
      })),
    });

    const despues = await obtenerKpis();
    // Other test files write to the same database in parallel, so global totals
    // can only be asserted as lower bounds on the rows seeded here.
    expect(despues.facturasPendientes.cantidad - antes.facturasPendientes.cantidad).toBeGreaterThanOrEqual(2);
    expect(despues.facturasPendientes.totalClp - antes.facturasPendientes.totalClp).toBeGreaterThanOrEqual(150_000);
    expect(despues.movimientos.total - antes.movimientos.total).toBeGreaterThanOrEqual(3);
    expect(despues.movimientos.sinConciliar - antes.movimientos.sinConciliar).toBeGreaterThanOrEqual(2);
    const { total, sinConciliar } = despues.movimientos;
    expect(despues.tasaConciliacion).toBe(Math.round(((total - sinConciliar) / total) * 100));
    expect(despues.importaciones.length).toBeLessThanOrEqual(5);
  });

  it('no entrega importaciones a roles que no pueden importar', async () => {
    conSesion('DUENO');
    expect((await obtenerKpis()).importaciones).toEqual([]);
  });
});
