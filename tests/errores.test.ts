import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { codigoPrisma, codigoValidacion, ejecutarConCodigo, leerAviso } from '@/lib/errores';

describe('ejecutarConCodigo', () => {
  const opciones = { duplicado: 'folio_duplicado' } as const;

  it('devuelve null si la operación funciona', async () => {
    await expect(ejecutarConCodigo(async () => 'ok', opciones)).resolves.toBeNull();
  });

  it('devuelve el código si el error es conocido', async () => {
    const falla = () => Promise.reject(Object.assign(new Error('x'), { code: 'P2002' }));
    await expect(ejecutarConCodigo(falla, opciones)).resolves.toBe('folio_duplicado');
  });

  it('relanza los errores desconocidos', async () => {
    const falla = () => Promise.reject(new Error('conexión caída'));
    await expect(ejecutarConCodigo(falla, opciones)).rejects.toThrow('conexión caída');
  });
});

describe('codigoValidacion', () => {
  const schema = z.object({ rut: z.string().min(3), nombre: z.string().min(2) });
  const mapa = { rut: 'rut_invalido', nombre: 'razon_social_invalida' } as const;

  it('usa el código del primer campo con error', () => {
    const r = schema.safeParse({ rut: 'x', nombre: 'Ok' });
    expect(r.success).toBe(false);
    if (!r.success) expect(codigoValidacion(r.error, mapa)).toBe('rut_invalido');
  });

  it('prefiere el código específico campo:tipo de issue', () => {
    const conRegla = z
      .object({ desde: z.number(), hasta: z.number() })
      .refine((v) => v.hasta >= v.desde, { path: ['hasta'] });
    const mapaFechas = { hasta: 'fecha_invalida', 'hasta:custom': 'vencimiento_anterior' } as const;
    const r = conRegla.safeParse({ desde: 2, hasta: 1 });
    expect(r.success).toBe(false);
    if (!r.success) expect(codigoValidacion(r.error, mapaFechas)).toBe('vencimiento_anterior');
    const r2 = conRegla.safeParse({ desde: 2, hasta: 'x' });
    expect(r2.success).toBe(false);
    if (!r2.success) expect(codigoValidacion(r2.error, mapaFechas)).toBe('fecha_invalida');
  });

  it('devuelve datos_invalidos si el campo no está mapeado', () => {
    const r = z.object({ otro: z.string() }).safeParse({});
    expect(r.success).toBe(false);
    if (!r.success) expect(codigoValidacion(r.error, mapa)).toBe('datos_invalidos');
  });
});

describe('codigoPrisma', () => {
  const opciones = { duplicado: 'rut_duplicado', enUso: 'cliente_con_facturas' } as const;

  it('traduce P2002 al código de duplicado', () => {
    expect(codigoPrisma({ code: 'P2002' }, opciones)).toBe('rut_duplicado');
  });

  it('traduce P2003 al código de registro en uso', () => {
    expect(codigoPrisma({ code: 'P2003' }, opciones)).toBe('cliente_con_facturas');
  });

  it('traduce P2025 a no_encontrado', () => {
    expect(codigoPrisma({ code: 'P2025' }, opciones)).toBe('no_encontrado');
  });

  it('devuelve null para errores desconocidos', () => {
    expect(codigoPrisma(new Error('boom'), opciones)).toBeNull();
    expect(codigoPrisma({ code: 'P9999' }, opciones)).toBeNull();
    expect(codigoPrisma(null, opciones)).toBeNull();
  });

  it('devuelve null si falta la opción para ese código', () => {
    expect(codigoPrisma({ code: 'P2003' }, { duplicado: 'folio_duplicado' })).toBeNull();
    expect(codigoPrisma({ code: 'P2002' }, { enUso: 'cliente_con_facturas' })).toBeNull();
  });
});

describe('leerAviso', () => {
  it('traduce un código de error conocido', () => {
    expect(leerAviso({ error: 'rut_duplicado' })).toEqual({
      tipo: 'error',
      mensaje: 'Ya existe un cliente con ese RUT.',
    });
  });

  it('traduce un código de éxito conocido', () => {
    expect(leerAviso({ ok: 'cliente_creado' })).toEqual({
      tipo: 'ok',
      mensaje: 'Cliente creado.',
    });
  });

  it('prioriza el error sobre el éxito', () => {
    expect(leerAviso({ error: 'sin_permiso', ok: 'cliente_creado' })?.tipo).toBe('error');
  });

  it('ignora códigos desconocidos y no refleja texto de la URL', () => {
    expect(leerAviso({ error: '<script>alert(1)</script>' })).toBeNull();
    expect(leerAviso({ ok: 'toString' })).toBeNull();
    expect(leerAviso({})).toBeNull();
  });

  it('ignora valores repetidos en la URL', () => {
    expect(leerAviso({ error: ['rut_duplicado', 'sin_permiso'] })).toBeNull();
  });
});
