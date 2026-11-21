import { randomUUID } from 'node:crypto';
import mongoose from 'mongoose';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Auditoria, listarAuditoria } from '@/lib/auditoria';
import { connectMongo } from '@/lib/mongo';

const marca = `test-auditoria-${randomUUID()}`;

beforeAll(async () => {
  await connectMongo();
  const base = new Date('2001-01-01T00:00:00Z').getTime();
  await Auditoria.insertMany(
    Array.from({ length: 25 }, (_, i) => ({
      userId: marca,
      accion: 'CONCILIACION_CONFIRMADA',
      entidad: 'MovimientoBancario',
      entidadId: `${marca}-${i}`,
      fecha: new Date(base + i * 3_600_000),
    })),
  );
});

afterAll(async () => {
  await Auditoria.deleteMany({ userId: marca });
  await mongoose.disconnect();
});

describe('listarAuditoria', () => {
  const filtros = {
    desde: new Date('2001-01-01T00:00:00Z'),
    hasta: new Date('2001-01-02T00:00:00Z'),
  };

  it('pagina de más reciente a más antiguo e informa el total', async () => {
    const p1 = await listarAuditoria({ ...filtros, pagina: 1 });
    expect(p1.total).toBe(25);
    expect(p1.paginas).toBe(2);
    expect(p1.eventos).toHaveLength(20);
    expect(p1.eventos[0].entidadId).toBe(`${marca}-24`);
    const p2 = await listarAuditoria({ ...filtros, pagina: 2 });
    expect(p2.eventos).toHaveLength(5);
    expect(p2.eventos.at(-1)?.entidadId).toBe(`${marca}-0`);
  });

  it('filtra por rango de fechas', async () => {
    const r = await listarAuditoria({
      desde: new Date('2001-01-03T00:00:00Z'),
      pagina: 1,
    });
    expect(r.eventos.some((e) => e.userId === marca)).toBe(false);
  });
});
