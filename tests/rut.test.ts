import { describe, expect, it } from 'vitest';
import { normalizarRut, validarRut } from '@/lib/rut';

describe('validarRut', () => {
  it('acepta RUT con dígito verificador numérico', () => {
    expect(validarRut('12.345.678-5')).toBe(true);
  });
  it('acepta RUT con dígito verificador K, en mayúscula o minúscula', () => {
    expect(validarRut('10.000.013-K')).toBe(true);
    expect(validarRut('10000013-k')).toBe(true);
  });
  it('acepta RUT con dígito verificador 0', () => {
    expect(validarRut('14.000.000-0')).toBe(true);
  });
  it('rechaza dígito verificador incorrecto', () => {
    expect(validarRut('12.345.678-9')).toBe(false);
  });
  it('rechaza formatos inválidos', () => {
    expect(validarRut('')).toBe(false);
    expect(validarRut('abc')).toBe(false);
    expect(validarRut('123-4')).toBe(false);
  });
});

describe('normalizarRut', () => {
  it('quita puntos y deja guion antes del dígito verificador', () => {
    expect(normalizarRut('12.345.678-5')).toBe('12345678-5');
    expect(normalizarRut('10000013k')).toBe('10000013-K');
  });
});