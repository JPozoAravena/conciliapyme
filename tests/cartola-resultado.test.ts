import { describe, expect, it } from 'vitest';
import { leerResultadoImportacion, urlResultado } from '@/lib/cartola/resultado';

describe('urlResultado', () => {
  it('codifica una importación nueva', () => {
    expect(urlResultado({ duplicada: false, importId: 'x', nuevas: 3, omitidas: 1 })).toBe(
      '/importar?ok=cartola_importada&nuevas=3&omitidas=1',
    );
  });

  it('codifica un archivo repetido sin exponer el id interno', () => {
    expect(urlResultado({ duplicada: true, importId: 'x' })).toBe('/importar?ok=cartola_repetida');
  });
});

describe('leerResultadoImportacion', () => {
  it('lee los conteos de una importación', () => {
    expect(leerResultadoImportacion({ ok: 'cartola_importada', nuevas: '3', omitidas: '0' })).toEqual(
      { tipo: 'importada', nuevas: 3, omitidas: 0 },
    );
  });

  it('reconoce un archivo repetido', () => {
    expect(leerResultadoImportacion({ ok: 'cartola_repetida' })).toEqual({ tipo: 'repetida' });
  });

  it('ignora conteos inválidos o fuera de rango', () => {
    expect(leerResultadoImportacion({ ok: 'cartola_importada', nuevas: '-1', omitidas: '0' })).toBeNull();
    expect(leerResultadoImportacion({ ok: 'cartola_importada', nuevas: '1e3', omitidas: '0' })).toBeNull();
    expect(leerResultadoImportacion({ ok: 'cartola_importada', nuevas: '99999', omitidas: '0' })).toBeNull();
    expect(leerResultadoImportacion({ ok: 'cartola_importada', nuevas: '1' })).toBeNull();
    expect(leerResultadoImportacion({ ok: 'cartola_importada', nuevas: '0', omitidas: '0' })).toBeNull();
  });

  it('ignora otros códigos', () => {
    expect(leerResultadoImportacion({ ok: 'cliente_creado' })).toBeNull();
    expect(leerResultadoImportacion({})).toBeNull();
  });
});
