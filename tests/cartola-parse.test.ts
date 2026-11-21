import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  CartolaError,
  MAX_FILAS,
  parseCartola,
  parseFechaCL,
  parseFechaIso,
  parseMontoClp,
} from '@/lib/cartola/parse';

const leer = (nombre: string) => readFileSync(`tests/fixtures/${nombre}`, 'utf8');
const ENCABEZADO_A = 'Fecha;Descripción;Cargo;Abono;Saldo\n';

function errorDe(fn: () => unknown): CartolaError {
  try {
    fn();
  } catch (e) {
    if (e instanceof CartolaError) return e;
    throw e;
  }
  throw new Error('no lanzó CartolaError');
}

describe('parseMontoClp', () => {
  it('interpreta separador de miles y signo', () => {
    expect(parseMontoClp('1.190.000')).toBe(1190000);
    expect(parseMontoClp('-4500')).toBe(-4500);
    expect(parseMontoClp(' 85.000 ')).toBe(85000);
  });
  it('rechaza decimales, texto y vacío', () => {
    expect(errorDe(() => parseMontoClp('12,5')).codigo).toBe('cartola_monto_invalido');
    expect(errorDe(() => parseMontoClp('abc')).codigo).toBe('cartola_monto_invalido');
    expect(errorDe(() => parseMontoClp('')).codigo).toBe('cartola_monto_invalido');
    expect(errorDe(() => parseMontoClp('12.5')).codigo).toBe('cartola_monto_invalido');
    expect(errorDe(() => parseMontoClp('1.19.000')).codigo).toBe('cartola_monto_invalido');
  });
  it('rechaza montos que no caben en un entero de 32 bits', () => {
    expect(parseMontoClp('2.147.483.647')).toBe(2147483647);
    expect(errorDe(() => parseMontoClp('99999999999')).codigo).toBe('cartola_monto_invalido');
    expect(errorDe(() => parseMontoClp('-2147483648')).codigo).toBe('cartola_monto_invalido');
  });
});

describe('fechas', () => {
  it('lee dd/mm/aaaa y aaaa-mm-dd en UTC', () => {
    expect(parseFechaCL('02/09/2026').toISOString()).toBe('2026-09-02T00:00:00.000Z');
    expect(parseFechaIso('2026-09-05').toISOString()).toBe('2026-09-05T00:00:00.000Z');
  });
  it('rechaza fechas imposibles o fuera de rango', () => {
    expect(errorDe(() => parseFechaCL('31/02/2026')).codigo).toBe('cartola_fecha_invalida');
    expect(errorDe(() => parseFechaCL('2026-09-02')).codigo).toBe('cartola_fecha_invalida');
    expect(errorDe(() => parseFechaIso('02/09/2026')).codigo).toBe('cartola_fecha_invalida');
    expect(errorDe(() => parseFechaCL('01/01/1999')).codigo).toBe('cartola_fecha_invalida');
    expect(errorDe(() => parseFechaIso('2101-01-01')).codigo).toBe('cartola_fecha_invalida');
  });
});

describe('parseCartola', () => {
  it('detecta el formato del banco A y calcula montos con signo', () => {
    const r = parseCartola(leer('banco-a.csv'));
    expect(r.banco).toBe('BANCO_A');
    expect(r.lineas.map((l) => l.montoClp)).toEqual([1190000, -85000, 237500]);
    expect(r.lineas[0]).toMatchObject({
      fila: 2,
      descripcion: 'TRANSF DE 76000000-0 FAC 1001',
      saldo: '5400000',
    });
    expect(parseCartola(leer('banco-b.csv')).lineas[0].saldo).toBeNull();
  });

  it('detecta el formato del banco B y conserva la referencia', () => {
    const r = parseCartola(leer('banco-b.csv'));
    expect(r.banco).toBe('BANCO_B');
    expect(r.lineas[0].referencia).toBe('FAC 1003');
    expect(r.lineas[1].referencia).toBeNull();
    expect(r.lineas[1].montoClp).toBe(-4500);
  });

  it('acepta BOM y saltos de línea de Windows', () => {
    const r = parseCartola('﻿' + leer('banco-a.csv').replace(/\n/g, '\r\n'));
    expect(r.lineas).toHaveLength(3);
  });

  it('guarda en raw solo las columnas conocidas', () => {
    const csv = 'date,detail,amount,__proto__,$where\n2026-09-05,X,100,a,b\n';
    const raw = parseCartola(csv).lineas[0].raw;
    expect(Object.keys(raw).sort()).toEqual(['amount', 'date', 'detail']);
    expect(Object.getPrototypeOf(raw)).toBe(Object.prototype);
  });

  it('informa la fila con error y no importa nada a medias', () => {
    const e = errorDe(() => parseCartola(`${ENCABEZADO_A}02/09/2026;X;;1;1\n03/09/2026;Y;;abc;1\n`));
    expect(e).toMatchObject({ codigo: 'cartola_monto_invalido', fila: 3 });
  });

  it('rechaza una fila con columnas de más o de menos', () => {
    const e = errorDe(() => parseCartola(`${ENCABEZADO_A}02/09/2026;X;;1\n`));
    expect(e).toMatchObject({ codigo: 'cartola_mal_formada', fila: 2 });
  });

  it('rechaza descripciones demasiado largas', () => {
    const e = errorDe(() => parseCartola(`${ENCABEZADO_A}02/09/2026;${'a'.repeat(301)};;1;1\n`));
    expect(e).toMatchObject({ codigo: 'cartola_descripcion_larga', fila: 2 });
  });

  it('rechaza una fila con cargo y abono a la vez', () => {
    const e = errorDe(() => parseCartola(`${ENCABEZADO_A}02/09/2026;X;1.000;2.000;1\n`));
    expect(e).toMatchObject({ codigo: 'cartola_monto_invalido', fila: 2 });
    expect(parseCartola(`${ENCABEZADO_A}02/09/2026;X;1.000;;1\n`).lineas[0].montoClp).toBe(-1000);
  });

  it('rechaza un cargo que no cabe en un entero de 32 bits', () => {
    const e = errorDe(() => parseCartola(`${ENCABEZADO_A}02/09/2026;X;3.000.000.000;;1\n`));
    expect(e).toMatchObject({ codigo: 'cartola_monto_invalido', fila: 2 });
  });

  it('rechaza formatos desconocidos o columnas faltantes', () => {
    expect(errorDe(() => parseCartola('a,b\n1,2\n')).codigo).toBe('cartola_formato');
    expect(errorDe(() => parseCartola('Fecha;Cargo;Abono\n02/09/2026;;1\n')).codigo).toBe(
      'cartola_formato',
    );
  });

  it('rechaza un archivo sin movimientos', () => {
    expect(errorDe(() => parseCartola(ENCABEZADO_A)).codigo).toBe('cartola_vacia');
    expect(errorDe(() => parseCartola('')).codigo).toBe('cartola_formato');
  });

  it(`rechaza más de ${MAX_FILAS} filas`, () => {
    const filas = '02/09/2026;X;;1;1\n'.repeat(MAX_FILAS + 1);
    expect(errorDe(() => parseCartola(ENCABEZADO_A + filas)).codigo).toBe(
      'cartola_demasiadas_filas',
    );
    expect(parseCartola(ENCABEZADO_A + '02/09/2026;X;;1;1\n'.repeat(MAX_FILAS)).lineas).toHaveLength(
      MAX_FILAS,
    );
  });
});
