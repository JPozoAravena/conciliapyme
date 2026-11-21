import { describe, expect, it } from 'vitest';
import {
  consultaMongo,
  leerFiltros,
  POR_PAGINA,
} from '@/lib/auditoria-filtros';

describe('leerFiltros', () => {
  it('usa valores por defecto sin parámetros', () => {
    expect(leerFiltros({})).toEqual({ pagina: 1 });
  });

  it('lee acción conocida, fechas válidas y página', () => {
    expect(
      leerFiltros({
        accion: 'CONCILIACION_CONFIRMADA',
        desde: '2026-09-01',
        hasta: '2026-09-30',
        pagina: '3',
      }),
    ).toEqual({
      accion: 'CONCILIACION_CONFIRMADA',
      desde: new Date('2026-09-01T00:00:00.000Z'),
      hasta: new Date('2026-09-30T00:00:00.000Z'),
      pagina: 3,
    });
  });

  it('ignora acciones desconocidas, fechas inválidas y páginas fuera de rango', () => {
    expect(
      leerFiltros({
        accion: '{"$ne":null}',
        desde: '2026-02-31',
        hasta: 'ayer',
        pagina: '0',
      }),
    ).toEqual({ pagina: 1 });
    expect(leerFiltros({ pagina: '99999' })).toEqual({ pagina: 1 });
    expect(leerFiltros({ accion: ['CONCILIACION_CONFIRMADA', 'x'] })).toEqual({
      pagina: 1,
    });
  });
});

describe('consultaMongo', () => {
  it('sin filtros consulta todo', () => {
    expect(consultaMongo({ pagina: 1 })).toEqual({});
  });

  it('incluye el día completo de "hasta"', () => {
    expect(
      consultaMongo({
        pagina: 1,
        accion: 'CONCILIACION_CONFIRMADA',
        desde: new Date('2026-09-01T00:00:00Z'),
        hasta: new Date('2026-09-30T00:00:00Z'),
      }),
    ).toEqual({
      accion: 'CONCILIACION_CONFIRMADA',
      fecha: {
        $gte: new Date('2026-09-01T00:00:00Z'),
        $lt: new Date('2026-10-01T00:00:00Z'),
      },
    });
  });

  it('pagina de a POR_PAGINA', () => {
    expect(POR_PAGINA).toBe(20);
  });
});
