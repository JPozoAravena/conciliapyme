export type Movimiento = {
  id: string;
  fecha: Date;
  montoClp: number;
  descripcion: string;
  referencia: string | null;
};

export type FacturaPendiente = {
  id: string;
  folio: number;
  montoClp: number;
  vencimiento: Date;
};

export type Regla = 'MONTO_Y_FOLIO' | 'MONTO_Y_FECHA' | 'DIFERENCIA_MENOR';

export type Sugerencia = {
  facturaId: string;
  puntaje: number;
  regla: Regla;
  diferenciaClp: number;
};

const DIA_MS = 86_400_000;
const VENTANA_DIAS = 5;
const PUNTAJES: Record<Regla, number> = {
  MONTO_Y_FOLIO: 100,
  MONTO_Y_FECHA: 70,
  DIFERENCIA_MENOR: 40,
};

/** Folio as a whole number in the description or reference ("FAC 1001" matches 1001, not 10010). */
function mencionaFolio(m: Movimiento, folio: number): boolean {
  const numeros: string[] =
    `${m.referencia ?? ''} ${m.descripcion}`.match(/\d+/g) ?? [];
  return numeros.includes(String(folio));
}

/** Small difference: up to 1% of the invoice or $1,000, whichever is greater. */
const tolerancia = (montoClp: number) =>
  Math.max(1_000, Math.round(montoClp * 0.01));

/** Rule a movement meets against an invoice, as defined in CLAUDE.md (100 / 70 / 40), or null. */
export function evaluarRegla(
  mov: Movimiento,
  f: FacturaPendiente,
): Regla | null {
  if (mov.montoClp <= 0) return null;
  const diferencia = mov.montoClp - f.montoClp;
  const folio = mencionaFolio(mov, f.folio);
  const cerca =
    Math.abs(mov.fecha.getTime() - f.vencimiento.getTime()) / DIA_MS <=
    VENTANA_DIAS;
  if (diferencia === 0 && folio) return 'MONTO_Y_FOLIO';
  if (diferencia === 0 && cerca) return 'MONTO_Y_FECHA';
  if (Math.abs(diferencia) <= tolerancia(f.montoClp) && (folio || cerca))
    return 'DIFERENCIA_MENOR';
  return null;
}

export const puntajeDe = (regla: Regla): number => PUNTAJES[regla];

/** Candidate invoices for a movement, best first (score, then closest due date). Only suggests. */
export function sugerir(
  mov: Movimiento,
  facturas: FacturaPendiente[],
  max = 3,
): Sugerencia[] {
  const candidatos: { sugerencia: Sugerencia; dias: number }[] = [];
  for (const f of facturas) {
    const regla = evaluarRegla(mov, f);
    if (!regla) continue;
    candidatos.push({
      sugerencia: {
        facturaId: f.id,
        puntaje: puntajeDe(regla),
        regla,
        diferenciaClp: mov.montoClp - f.montoClp,
      },
      dias: Math.abs(mov.fecha.getTime() - f.vencimiento.getTime()) / DIA_MS,
    });
  }
  return candidatos
    .sort(
      (a, b) => b.sugerencia.puntaje - a.sugerencia.puntaje || a.dias - b.dias,
    )
    .slice(0, max)
    .map((c) => c.sugerencia);
}
