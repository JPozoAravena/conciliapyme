import Papa from 'papaparse';
import type { CodigoError } from '@/lib/errores';
import {
  ANIO_MAX,
  ANIO_MIN,
  INT_MAX,
  MAX_DESCRIPCION,
  MAX_FILAS,
  MAX_REFERENCIA,
} from './limites';

export { MAX_FILAS } from './limites';

/** Error with a code that is safe to put in a URL, and the CSV row (1 = header) when it applies. */
export class CartolaError extends Error {
  constructor(
    readonly codigo: CodigoError,
    readonly fila?: number,
  ) {
    super(fila ? `${codigo} (fila ${fila})` : codigo);
    this.name = 'CartolaError';
  }
}

export type Banco = 'BANCO_A' | 'BANCO_B';

export type LineaCartola = {
  fila: number;
  fecha: Date;
  montoClp: number;
  descripcion: string;
  referencia: string | null;
  raw: Record<string, string>;
};

export type CartolaParseada = { banco: Banco; lineas: LineaCartola[] };

const formatos = {
  BANCO_A: { requeridas: ['fecha', 'descripcion', 'cargo', 'abono'], opcionales: ['saldo'] },
  BANCO_B: { requeridas: ['date', 'detail', 'amount'], opcionales: ['reference'] },
} as const satisfies Record<Banco, { requeridas: readonly string[]; opcionales: readonly string[] }>;

export function parseMontoClp(texto: string): number {
  const valor = texto.trim();
  // Plain digits, or dots only as thousands separators ("1.190.000"); "12.5" is rejected, not read as 125.
  if (!/^-?(\d{1,10}|\d{1,3}(\.\d{3}){1,3})$/.test(valor)) {
    throw new CartolaError('cartola_monto_invalido');
  }
  const monto = Number(valor.replace(/\./g, ''));
  if (Math.abs(monto) > INT_MAX) throw new CartolaError('cartola_monto_invalido');
  return monto;
}

function fechaUtc(anio: number, mes: number, dia: number): Date {
  const fecha = new Date(Date.UTC(anio, mes - 1, dia));
  const valida = fecha.getUTCMonth() === mes - 1 && fecha.getUTCDate() === dia;
  if (!valida || anio < ANIO_MIN || anio > ANIO_MAX) {
    throw new CartolaError('cartola_fecha_invalida');
  }
  return fecha;
}

export function parseFechaCL(texto: string): Date {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(texto.trim());
  if (!m) throw new CartolaError('cartola_fecha_invalida');
  return fechaUtc(Number(m[3]), Number(m[2]), Number(m[1]));
}

export function parseFechaIso(texto: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(texto.trim());
  if (!m) throw new CartolaError('cartola_fecha_invalida');
  return fechaUtc(Number(m[1]), Number(m[2]), Number(m[3]));
}

const normalizarEncabezado = (h: string) =>
  h.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

const montoOpcional = (t: string) => (t.trim() === '' ? 0 : parseMontoClp(t));

function texto(valor: string, max: number): string {
  const limpio = valor.trim();
  if (limpio.length > max) throw new CartolaError('cartola_descripcion_larga');
  return limpio;
}

function detectarBanco(campos: string[]): Banco {
  const tiene = (banco: Banco) => formatos[banco].requeridas.every((c) => campos.includes(c));
  if (tiene('BANCO_A')) return 'BANCO_A';
  if (tiene('BANCO_B')) return 'BANCO_B';
  throw new CartolaError('cartola_formato');
}

/** Copies only the known columns into a fresh object, so CSV headers never become arbitrary keys. */
function columnasConocidas(banco: Banco, fila: Record<string, string>): Record<string, string> {
  const { requeridas, opcionales } = formatos[banco];
  const raw: Record<string, string> = {};
  for (const c of [...requeridas, ...opcionales]) {
    if (Object.hasOwn(fila, c)) raw[c] = String(fila[c]);
  }
  return raw;
}

function leerLinea(banco: Banco, raw: Record<string, string>, fila: number): LineaCartola {
  if (banco === 'BANCO_A') {
    // A row is either a debit or a credit; both filled in means a broken export.
    if (raw.cargo.trim() !== '' && raw.abono.trim() !== '') {
      throw new CartolaError('cartola_monto_invalido');
    }
    const montoClp = montoOpcional(raw.abono) - montoOpcional(raw.cargo);
    return {
      fila,
      fecha: parseFechaCL(raw.fecha),
      montoClp,
      descripcion: texto(raw.descripcion, MAX_DESCRIPCION),
      referencia: null,
      raw,
    };
  }
  const referencia = texto(raw.reference ?? '', MAX_REFERENCIA);
  return {
    fila,
    fecha: parseFechaIso(raw.date),
    montoClp: parseMontoClp(raw.amount),
    descripcion: texto(raw.detail, MAX_DESCRIPCION),
    referencia: referencia === '' ? null : referencia,
    raw,
  };
}

/** Parses the whole file or throws: a single invalid row rejects the import, so nothing is half-imported. */
export function parseCartola(contenido: string): CartolaParseada {
  const { data, errors, meta } = Papa.parse<Record<string, string>>(contenido.replace(/^﻿/, ''), {
    header: true,
    skipEmptyLines: true,
    transformHeader: normalizarEncabezado,
  });
  const banco = detectarBanco(meta.fields ?? []);
  if (data.length > MAX_FILAS) throw new CartolaError('cartola_demasiadas_filas');
  if (errors.length > 0) {
    // Papa reports the 0-based data row; +2 skips the header and makes it 1-based.
    throw new CartolaError('cartola_mal_formada', (errors[0].row ?? 0) + 2);
  }
  if (data.length === 0) throw new CartolaError('cartola_vacia');

  const lineas = data.map((fila, i) => {
    const numero = i + 2;
    try {
      return leerLinea(banco, columnasConocidas(banco, fila), numero);
    } catch (e) {
      if (e instanceof CartolaError) throw new CartolaError(e.codigo, numero);
      throw e;
    }
  });
  return { banco, lineas };
}
