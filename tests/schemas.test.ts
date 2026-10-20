import { describe, expect, it } from 'vitest';
import { clienteSchema, facturaSchema } from '@/lib/schemas';

describe('clienteSchema', () => {
  it('acepta un cliente válido', () => {
    const r = clienteSchema.safeParse({ rut: '12.345.678-5', razonSocial: 'Ferretería Los Andes' });
    expect(r.success).toBe(true);
  });
  it('rechaza un RUT inválido', () => {
    const r = clienteSchema.safeParse({ rut: '12.345.678-9', razonSocial: 'Ferretería Los Andes' });
    expect(r.success).toBe(false);
  });
});

describe('facturaSchema', () => {
  const base = {
    folio: 1001,
    clienteId: 'c1',
    montoClp: 119000,
    emision: '2026-10-01',
    vencimiento: '2026-10-31',
  };
  it('acepta una factura válida', () => {
    expect(facturaSchema.safeParse(base).success).toBe(true);
  });
  it('rechaza un monto con decimales (el CLP es entero)', () => {
    expect(facturaSchema.safeParse({ ...base, montoClp: 1000.5 }).success).toBe(false);
  });
  it('rechaza un vencimiento anterior a la emisión', () => {
    const r = facturaSchema.safeParse({ ...base, vencimiento: '2026-09-01' });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].path).toEqual(['vencimiento']);
  });
});