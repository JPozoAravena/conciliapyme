import type {
  FacturaPendiente,
  Movimiento,
} from '@/lib/conciliacion/sugerir';
import { formatearClp } from '@/lib/formato';

// Source of truth: src/lib/conciliacion/sugerir.ts. These constants and the folio
// matching are mirrored here for presentation only; keep them in sync with it.
const DIA_MS = 86_400_000;
const VENTANA_DIAS = 5;
const tolerancia = (montoClp: number) =>
  Math.max(1_000, Math.round(montoClp * 0.01));

function mencionaFolio(m: Movimiento, folio: number): boolean {
  const numeros: string[] =
    `${m.referencia ?? ''} ${m.descripcion}`.match(/\d+/g) ?? [];
  return numeros.includes(String(folio));
}

export type CampoCoincidencia = { coincide: boolean; texto: string };

export type CamposCoinciden = {
  monto: CampoCoincidencia & { enTolerancia: boolean };
  folio: CampoCoincidencia;
  fecha: CampoCoincidencia;
};

export function camposQueCoinciden(
  mov: Movimiento,
  f: FacturaPendiente,
): CamposCoinciden {
  const diferencia = mov.montoClp - f.montoClp;
  const enTolerancia = Math.abs(diferencia) <= tolerancia(f.montoClp);
  const folio = mencionaFolio(mov, f.folio);
  const dias = Math.abs(mov.fecha.getTime() - f.vencimiento.getTime()) / DIA_MS;
  const diasRedondeados = Math.round(dias);

  return {
    monto: {
      coincide: diferencia === 0,
      enTolerancia,
      texto:
        diferencia === 0
          ? 'Monto exacto'
          : `Diferencia de ${formatearClp(Math.abs(diferencia))}`,
    },
    folio: {
      coincide: folio,
      texto: folio
        ? 'Folio encontrado en la glosa'
        : 'Folio no aparece en la glosa',
    },
    fecha: {
      coincide: dias <= VENTANA_DIAS,
      texto: `Fecha a ${diasRedondeados} ${diasRedondeados === 1 ? 'día' : 'días'}`,
    },
  };
}
