import { describe, expect, it } from 'vitest';
import { leerFiltrosClientes } from '@/app/_lib/clientes-params';
import { leerFiltrosFacturas, paramsFacturas } from '@/app/_lib/facturas-params';
import { paginar } from '@/app/_lib/listado-params';

describe('leerFiltrosFacturas', () => {
  it('usa los valores por defecto sin parámetros', () => {
    expect(leerFiltrosFacturas({})).toEqual({ orden: 'fecha', dir: 'desc', pagina: 1 });
  });

  it('acepta valores válidos', () => {
    const f = leerFiltrosFacturas({
      estado: 'PAGADA',
      cliente: 'abc123',
      desde: '2026-01-01',
      hasta: '2026-01-31',
      orden: 'monto',
      dir: 'asc',
      pagina: '3',
    });
    expect(f).toMatchObject({ estado: 'PAGADA', orden: 'monto', dir: 'asc', pagina: 3 });
    expect(f.desde).toBe('2026-01-01');
  });

  it('descarta valores inválidos o repetidos sin lanzar', () => {
    const f = leerFiltrosFacturas({
      estado: 'otro',
      cliente: "x'; drop",
      desde: '2026-02-31',
      hasta: ['2026-01-01', '2026-01-02'],
      orden: 'zzz',
      dir: 'up',
      pagina: '0',
    });
    expect(f).toEqual({ orden: 'fecha', dir: 'desc', pagina: 1 });
  });

  it('omite los valores por defecto al armar la URL', () => {
    expect(paramsFacturas(leerFiltrosFacturas({ orden: 'folio', dir: 'asc' }))).toMatchObject({
      orden: 'folio',
      dir: 'asc',
      estado: undefined,
    });
    expect(paramsFacturas(leerFiltrosFacturas({})).orden).toBeUndefined();
  });
});

describe('leerFiltrosClientes', () => {
  it('normaliza la búsqueda y aplica defaults', () => {
    expect(leerFiltrosClientes({ q: '  acme  ' })).toEqual({
      q: 'acme',
      orden: 'nombre',
      dir: 'asc',
      pagina: 1,
    });
    expect(leerFiltrosClientes({ q: '   ' }).q).toBeUndefined();
  });

  it('acota la búsqueda y descarta orden inválido', () => {
    expect(leerFiltrosClientes({ q: 'a'.repeat(200) }).q).toHaveLength(80);
    expect(leerFiltrosClientes({ orden: 'razon', dir: 'x' })).toMatchObject({
      orden: 'nombre',
      dir: 'asc',
    });
  });
});

describe('paginar', () => {
  it('calcula páginas y limita la solicitada', () => {
    expect(paginar(0, 5)).toEqual({ pagina: 1, paginas: 1, skip: 0 });
    expect(paginar(41, 9)).toEqual({ pagina: 3, paginas: 3, skip: 40 });
  });
});
