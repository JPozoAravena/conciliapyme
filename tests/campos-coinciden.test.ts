import { describe, expect, it } from 'vitest';
import { camposQueCoinciden } from '@/components/conciliacion/campos-coinciden';
import {
  sugerir,
  type FacturaPendiente,
  type Movimiento,
  type Regla,
} from '@/lib/conciliacion/sugerir';

const d = (iso: string) => new Date(`${iso}T00:00:00Z`);
const factura = (p: Partial<FacturaPendiente> = {}): FacturaPendiente => ({
  id: 'f1',
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

/** Rule implied by the field-level results, following the table in CLAUDE.md. */
function reglaDesdeCampos(m: Movimiento, f: FacturaPendiente): Regla | null {
  const c = camposQueCoinciden(m, f);
  if (m.montoClp <= 0) return null;
  if (c.monto.coincide && c.folio.coincide) return 'MONTO_Y_FOLIO';
  if (c.monto.coincide && c.fecha.coincide) return 'MONTO_Y_FECHA';
  if (c.monto.enTolerancia && (c.folio.coincide || c.fecha.coincide))
    return 'DIFERENCIA_MENOR';
  return null;
}

const casos: [string, Movimiento, FacturaPendiente][] = [
  [
    'monto exacto con folio en la glosa',
    mov({ descripcion: 'TRANSF DE 76000000-0 FAC 1001' }),
    factura(),
  ],
  [
    'folio en la referencia',
    mov({ referencia: 'FAC 1001', fecha: d('2026-12-01') }),
    factura(),
  ],
  [
    'folio dentro de otro número',
    mov({ descripcion: 'FAC 10010', fecha: d('2026-12-01') }),
    factura(),
  ],
  ['monto exacto con fecha cercana', mov(), factura()],
  ['exactamente 5 días', mov({ fecha: d('2026-09-15') }), factura()],
  ['6 días', mov({ fecha: d('2026-09-16') }), factura()],
  ['monto exacto con fecha lejana', mov({ fecha: d('2026-10-30') }), factura()],
  [
    'diferencia pequeña con folio',
    mov({ montoClp: 1189500, descripcion: 'PAGO FAC 1001' }),
    factura(),
  ],
  [
    'tolerancia de $1.000 en factura chica',
    mov({ montoClp: 51000 }),
    factura({ montoClp: 50000, vencimiento: d('2026-09-09') }),
  ],
  [
    'sobre la tolerancia de $1.000',
    mov({ montoClp: 51001 }),
    factura({ montoClp: 50000, vencimiento: d('2026-09-09') }),
  ],
  ['tolerancia del 1 %', mov({ montoClp: 1201900 }), factura()],
  ['sobre la tolerancia del 1 %', mov({ montoClp: 1201901 }), factura()],
  [
    'diferencia pequeña sin folio ni fecha cercana',
    mov({ montoClp: 1189500, fecha: d('2026-12-01') }),
    factura(),
  ],
  ['movimiento negativo', mov({ montoClp: -1190000 }), factura()],
  ['movimiento en cero', mov({ montoClp: 0 }), factura()],
];

describe('camposQueCoinciden', () => {
  it.each(casos)('es consistente con sugerir(): %s', (_n, m, f) => {
    expect(reglaDesdeCampos(m, f)).toBe(sugerir(m, [f])[0]?.regla ?? null);
  });

  it('describe cada campo con texto legible', () => {
    const c = camposQueCoinciden(
      mov({ montoClp: 1189500, descripcion: 'PAGO FAC 1001' }),
      factura(),
    );
    expect(c.monto.texto).toMatch(/^Diferencia de /);
    expect(c.monto.coincide).toBe(false);
    expect(c.folio).toEqual({
      coincide: true,
      texto: 'Folio encontrado en la glosa',
    });
    expect(c.fecha.texto).toBe('Fecha a 1 día');
  });

  it('marca monto exacto y folio ausente', () => {
    const c = camposQueCoinciden(mov(), factura());
    expect(c.monto).toMatchObject({ coincide: true, texto: 'Monto exacto' });
    expect(c.folio.coincide).toBe(false);
  });
});
