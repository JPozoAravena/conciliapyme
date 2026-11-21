import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { decodificarCsv, MAX_BYTES, validarArchivo } from '@/lib/cartola/archivo';
import { hashArchivo, hashesDeLineas } from '@/lib/cartola/hash';
import { parseCartola, type LineaCartola } from '@/lib/cartola/parse';

describe('validarArchivo', () => {
  const ok = { name: 'cartola.CSV', size: 1000, type: 'text/csv' };

  it('acepta un CSV dentro del límite', () => {
    expect(validarArchivo(ok)).toBeNull();
    expect(validarArchivo({ ...ok, type: '' })).toBeNull();
    expect(validarArchivo({ ...ok, type: 'application/vnd.ms-excel' })).toBeNull();
    expect(validarArchivo({ ...ok, type: 'application/octet-stream' })).toBeNull();
    expect(validarArchivo({ ...ok, size: MAX_BYTES })).toBeNull();
  });

  it('exige un archivo', () => {
    expect(validarArchivo(null)).toBe('archivo_requerido');
    expect(validarArchivo({ ...ok, size: 0 })).toBe('archivo_requerido');
  });

  it('rechaza otras extensiones o tipos', () => {
    expect(validarArchivo({ ...ok, name: 'cartola.txt' })).toBe('archivo_tipo');
    expect(validarArchivo({ ...ok, name: 'cartola.csv.exe' })).toBe('archivo_tipo');
    expect(validarArchivo({ ...ok, type: 'application/pdf' })).toBe('archivo_tipo');
  });

  it('rechaza archivos sobre el tamaño máximo', () => {
    expect(validarArchivo({ ...ok, size: MAX_BYTES + 1 })).toBe('archivo_grande');
  });
});

describe('decodificarCsv', () => {
  it('lee UTF-8', () => {
    expect(decodificarCsv(new TextEncoder().encode('Descripción'))).toBe('Descripción');
  });

  it('lee Windows-1252 (Latin-1) cuando no es UTF-8 válido', () => {
    const latin1 = Uint8Array.from(Buffer.from('Descripción;Ñuñoa', 'latin1'));
    expect(decodificarCsv(latin1)).toBe('Descripción;Ñuñoa');
  });

  it('permite detectar el formato de una cartola en Latin-1', () => {
    const bytes = Uint8Array.from(
      Buffer.from('Fecha;Descripción;Cargo;Abono;Saldo\n02/09/2026;Ñuñoa;;1.000;1\n', 'latin1'),
    );
    expect(parseCartola(decodificarCsv(bytes)).lineas[0].descripcion).toBe('Ñuñoa');
  });
});

describe('hashArchivo', () => {
  it('es el SHA-256 hexadecimal de los bytes', () => {
    const bytes = new TextEncoder().encode('hola');
    expect(hashArchivo(bytes)).toBe(createHash('sha256').update('hola').digest('hex'));
    expect(hashArchivo(bytes)).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe('hashesDeLineas', () => {
  const linea = (descripcion: string, montoClp = 1000): LineaCartola => ({
    fila: 2,
    fecha: new Date('2026-09-02T00:00:00.000Z'),
    montoClp,
    descripcion,
    referencia: null,
    raw: {},
  });

  it('el mismo contenido produce los mismos hashes', () => {
    const lineas = [linea('A'), linea('B')];
    expect(hashesDeLineas('BANCO_A', lineas)).toEqual(hashesDeLineas('BANCO_A', lineas));
  });

  it('dos líneas idénticas en un archivo producen hashes distintos', () => {
    const [h1, h2] = hashesDeLineas('BANCO_A', [linea('PAGO'), linea('PAGO')]);
    expect(h1).not.toBe(h2);
  });

  it('el contador hace que un archivo que se traslapa repita los mismos hashes', () => {
    const primero = hashesDeLineas('BANCO_A', [linea('PAGO'), linea('PAGO')]);
    const segundo = hashesDeLineas('BANCO_A', [linea('PAGO'), linea('PAGO'), linea('PAGO')]);
    expect(segundo.slice(0, 2)).toEqual(primero);
    expect(new Set(segundo).size).toBe(3);
  });

  it('cambia con el banco, el monto o la descripción', () => {
    const base = hashesDeLineas('BANCO_A', [linea('A')])[0];
    expect(hashesDeLineas('BANCO_B', [linea('A')])[0]).not.toBe(base);
    expect(hashesDeLineas('BANCO_A', [linea('A', 1001)])[0]).not.toBe(base);
    expect(hashesDeLineas('BANCO_A', [linea('B')])[0]).not.toBe(base);
  });
});
