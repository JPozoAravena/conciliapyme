import { describe, expect, it } from 'vitest';
import { fechaParaInput, formatearClp, formatearFecha } from '@/lib/formato';

const sinEspacios = (s: string) => s.replace(/\s/g, ' ');

describe('formatearClp', () => {
  it('formatea pesos chilenos sin decimales', () => {
    expect(sinEspacios(formatearClp(1_190_000))).toBe('$1.190.000');
  });

  it('formatea cero', () => {
    expect(sinEspacios(formatearClp(0))).toBe('$0');
  });
});

describe('formatearFecha', () => {
  it('muestra la fecha en formato chileno sin desfase de zona horaria', () => {
    expect(formatearFecha(new Date('2026-10-01T00:00:00.000Z'))).toBe('01-10-2026');
  });
});

describe('fechaParaInput', () => {
  it('devuelve el formato AAAA-MM-DD de un input date', () => {
    expect(fechaParaInput(new Date('2026-03-09T00:00:00.000Z'))).toBe('2026-03-09');
  });
});
