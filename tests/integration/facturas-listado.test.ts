import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { listarFacturas } from '@/app/_lib/facturas-listado';
import { leerFiltrosFacturas } from '@/app/_lib/facturas-params';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';

vi.mock('@/auth', () => ({ auth: vi.fn() }));
const mockAuth = auth as unknown as ReturnType<typeof vi.fn>;

const marca = randomUUID().slice(0, 8);
const base = 600_000_000 + Math.floor(Math.random() * 1_000_000);
let clienteId = '';

const filtros = (params: Record<string, string> = {}) =>
  leerFiltrosFacturas({ cliente: clienteId, ...params });

beforeAll(async () => {
  const cliente = await prisma.cliente.create({
    data: { rut: `L-${marca}`, razonSocial: `Listado ${marca}` },
  });
  clienteId = cliente.id;
  // 25 invoices: folio base+i, amount (i+1)*1000, one per day from 2026-03-01; i % 5 === 0 are PAGADA.
  await prisma.factura.createMany({
    data: Array.from({ length: 25 }, (_, i) => ({
      folio: base + i,
      clienteId,
      montoClp: (i + 1) * 1000,
      estado: i % 5 === 0 ? ('PAGADA' as const) : ('PENDIENTE' as const),
      emision: new Date(Date.UTC(2026, 2, 1 + i)),
      vencimiento: new Date(Date.UTC(2026, 3, 1 + i)),
    })),
  });
});

beforeEach(() => {
  mockAuth.mockResolvedValue({
    user: { id: 'u', email: 'u@test.local', role: 'DUENO' },
    expires: '',
  });
});

afterAll(async () => {
  await prisma.factura.deleteMany({ where: { clienteId } });
  await prisma.cliente.deleteMany({ where: { id: clienteId } });
});

describe('listarFacturas', () => {
  it('rechaza sin sesión', async () => {
    mockAuth.mockResolvedValue(null);
    await expect(listarFacturas(filtros())).rejects.toThrow();
  });

  it('pagina de 20 y ordena por fecha descendente por defecto', async () => {
    const p1 = await listarFacturas(filtros());
    expect(p1.total).toBe(25);
    expect(p1.paginas).toBe(2);
    expect(p1.filas).toHaveLength(20);
    expect(p1.filas[0].folio).toBe(base + 24);
    const p2 = await listarFacturas(filtros({ pagina: '2' }));
    expect(p2.filas).toHaveLength(5);
    expect(p2.filas.at(-1)?.folio).toBe(base);
  });

  it('limita una página fuera de rango a la última', async () => {
    const r = await listarFacturas(filtros({ pagina: '99' }));
    expect(r.pagina).toBe(2);
    expect(r.filas).toHaveLength(5);
  });

  it('filtra por estado', async () => {
    const r = await listarFacturas(filtros({ estado: 'PAGADA' }));
    expect(r.total).toBe(5);
    expect(r.filas.every((f) => f.estado === 'PAGADA')).toBe(true);
  });

  it('filtra por rango de emisión incluyendo el día "hasta"', async () => {
    const r = await listarFacturas(filtros({ desde: '2026-03-03', hasta: '2026-03-05' }));
    expect(r.filas.map((f) => f.folio).sort()).toEqual([base + 2, base + 3, base + 4]);
  });

  it('ordena por monto y por folio en ambas direcciones', async () => {
    const monto = await listarFacturas(filtros({ orden: 'monto', dir: 'asc' }));
    expect(monto.filas[0].montoClp).toBe(1000);
    const folio = await listarFacturas(filtros({ orden: 'folio', dir: 'desc' }));
    expect(folio.filas[0].folio).toBe(base + 24);
  });

  it('ignora filtros inválidos en lugar de fallar', async () => {
    const r = await listarFacturas(
      filtros({ estado: 'X', desde: '2026-02-31', orden: 'zzz', pagina: '-1' }),
    );
    expect(r.total).toBe(25);
  });
});
