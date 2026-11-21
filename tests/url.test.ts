import { describe, expect, it } from 'vitest';
import { conAviso } from '@/lib/url';

describe('conAviso', () => {
  it('agrega el código de error a la ruta', () => {
    expect(conAviso('/clientes', { error: 'rut_invalido' })).toBe('/clientes?error=rut_invalido');
  });

  it('agrega el código de éxito a la ruta', () => {
    expect(conAviso('/clientes/abc', { ok: 'factura_creada' })).toBe(
      '/clientes/abc?ok=factura_creada',
    );
  });
});
