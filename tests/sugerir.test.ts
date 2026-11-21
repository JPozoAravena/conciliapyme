import { describe, expect, it } from 'vitest';
import {
  sugerir,
  type FacturaPendiente,
  type Movimiento,
} from '@/lib/conciliacion/sugerir';

const d = (iso: string) => new Date(`${iso}T00:00:00Z`);
const factura = (
  p: Partial<FacturaPendiente> & { id: string },
): FacturaPendiente => ({
  folio: 1001,
  montoClp: 1190000,
  vencimiento: d('2026-09-10'),
  ...p,
});
const mov = (p: Partial<Movimiento> = {}): Movimiento => ({
  id: 'm1',
  fecha: d('2026-09-09'),
  montoClp: 1190000,
  descripcion: 'TRANSFERENCIA',
  referencia: null,
  ...p,
});

describe('sugerir', () => {
  it('da 100 puntos a monto exacto con folio en la glosa', () => {
    const r = sugerir(mov({ descripcion: 'TRANSF DE 76000000-0 FAC 1001' }), [
      factura({ id: 'f1' }),
    ]);
    expect(r[0]).toMatchObject({
      facturaId: 'f1',
      puntaje: 100,
      regla: 'MONTO_Y_FOLIO',
      diferenciaClp: 0,
    });
  });
  it('reconoce el folio en la referencia', () => {
    const r = sugerir(mov({ referencia: 'FAC 1001', fecha: d('2026-12-01') }), [
      factura({ id: 'f1' }),
    ]);
    expect(r[0]).toMatchObject({ puntaje: 100 });
  });
  it('no confunde un folio con parte de otro número', () => {
    const r = sugerir(
      mov({ descripcion: 'FAC 10010', fecha: d('2026-12-01') }),
      [factura({ id: 'f1' })],
    );
    expect(r).toEqual([]);
  });
  it('da 70 puntos a monto exacto con fecha cercana y sin folio', () => {
    expect(sugerir(mov(), [factura({ id: 'f1' })])[0]).toMatchObject({
      puntaje: 70,
      regla: 'MONTO_Y_FECHA',
    });
  });
  it('acepta exactamente 5 días y rechaza 6', () => {
    expect(
      sugerir(mov({ fecha: d('2026-09-15') }), [factura({ id: 'f1' })]),
    ).toHaveLength(1);
    expect(
      sugerir(mov({ fecha: d('2026-09-16') }), [factura({ id: 'f1' })]),
    ).toEqual([]);
  });
  it('no sugiere monto exacto con fecha lejana y sin folio', () => {
    expect(
      sugerir(mov({ fecha: d('2026-10-30') }), [factura({ id: 'f1' })]),
    ).toEqual([]);
  });
  it('da 40 puntos a una diferencia pequeña y registra la diferencia', () => {
    const r = sugerir(
      mov({ montoClp: 1189500, descripcion: 'PAGO FAC 1001' }),
      [factura({ id: 'f1' })],
    );
    expect(r[0]).toMatchObject({
      puntaje: 40,
      regla: 'DIFERENCIA_MENOR',
      diferenciaClp: -500,
    });
  });
  it('usa como tolerancia el mayor entre $1.000 y el 1 %', () => {
    const chica = factura({ id: 'f1', montoClp: 50000 });
    expect(
      sugerir(mov({ montoClp: 51000 }), [
        { ...chica, vencimiento: d('2026-09-09') },
      ]),
    ).toHaveLength(1);
    expect(
      sugerir(mov({ montoClp: 51001 }), [
        { ...chica, vencimiento: d('2026-09-09') },
      ]),
    ).toEqual([]);
    expect(
      sugerir(mov({ montoClp: 1201900 }), [factura({ id: 'f1' })])[0]?.puntaje,
    ).toBe(40);
    expect(
      sugerir(mov({ montoClp: 1201901 }), [factura({ id: 'f1' })]),
    ).toEqual([]);
  });
  it('no sugiere una diferencia pequeña sin folio ni fecha cercana', () => {
    expect(
      sugerir(mov({ montoClp: 1189500, fecha: d('2026-12-01') }), [
        factura({ id: 'f1' }),
      ]),
    ).toEqual([]);
  });
  it('ignora movimientos negativos o en cero', () => {
    expect(
      sugerir(mov({ montoClp: -1190000 }), [factura({ id: 'f1' })]),
    ).toEqual([]);
    expect(sugerir(mov({ montoClp: 0 }), [factura({ id: 'f1' })])).toEqual([]);
  });
  it('ordena por puntaje, luego por cercanía, y limita la cantidad', () => {
    const facturas = [
      factura({ id: 'lejana', folio: 2002, vencimiento: d('2026-09-13') }),
      factura({ id: 'cercana', folio: 3003, vencimiento: d('2026-09-09') }),
      factura({ id: 'con-folio', folio: 1001 }),
    ];
    const r = sugerir(mov({ descripcion: 'FAC 1001' }), facturas, 2);
    expect(r.map((s) => s.facturaId)).toEqual(['con-folio', 'cercana']);
  });
});
