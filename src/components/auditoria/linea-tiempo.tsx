import { CircleCheck } from 'lucide-react';
import type { ReactNode } from 'react';
import type { FacturaAuditada } from '@/app/_lib/auditoria-contexto';
import { Badge } from '@/components/ui/badge';
import { formatearClp } from '@/lib/formato';
import {
  etiquetaAccion,
  etiquetaEstadoFactura,
  etiquetaRegla,
  formatearFechaHora,
} from './etiquetas';

export type EventoVista = {
  id: string;
  userId: string;
  accion: string;
  fecha: Date;
  despues?: unknown;
};

type Props = {
  eventos: EventoVista[];
  correos: Map<string, string>;
  facturas: Map<string, FacturaAuditada>;
};

const texto = (v: unknown) => (typeof v === 'string' ? v : null);

function detalle(despues: unknown, facturas: Map<string, FacturaAuditada>): string[] {
  if (typeof despues !== 'object' || despues === null) return [];
  const d = despues as Record<string, unknown>;
  const factura = facturas.get(texto(d.facturaId) ?? '');
  const regla = texto(d.regla);
  const estado = texto(d.factura);
  return [
    factura && `Factura ${factura.folio}`,
    factura && formatearClp(factura.montoClp),
    regla && `Regla: ${etiquetaRegla(regla)}`,
    estado && `Factura ${etiquetaEstadoFactura(estado)}`,
    typeof d.diferenciaClp === 'number' && d.diferenciaClp !== 0
      ? `Diferencia ${formatearClp(d.diferenciaClp)}`
      : null,
  ].filter((p): p is string => Boolean(p));
}

function Dia({ dia, children }: { dia: string; children: ReactNode }) {
  return (
    <section aria-label={`Eventos del ${dia}`} className="flex flex-col gap-3">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-muted tabular">{dia}</h2>
      <ol className="relative flex flex-col gap-1 before:absolute before:bottom-4 before:left-[1.1875rem] before:top-4 before:w-px before:bg-border">
        {children}
      </ol>
    </section>
  );
}

/** Newest-first events grouped by day: what happened, who did it and when. */
export function LineaTiempo({ eventos, correos, facturas }: Props) {
  const grupos: { dia: string; eventos: EventoVista[] }[] = [];
  for (const e of eventos) {
    const dia = formatearFechaHora(e.fecha).slice(0, 10);
    const ultimo = grupos[grupos.length - 1];
    if (ultimo?.dia === dia) ultimo.eventos.push(e);
    else grupos.push({ dia, eventos: [e] });
  }
  return (
    <div className="flex flex-col gap-6">
      {grupos.map((g) => (
        <Dia key={g.dia} dia={g.dia}>
          {g.eventos.map((e) => (
            <li key={e.id} className="relative flex gap-4 rounded-lg px-1 py-2 hover:bg-brand-soft">
              <span
                aria-hidden="true"
                className="relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-brand"
              >
                <CircleCheck className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <p className="font-semibold">{etiquetaAccion(e.accion)}</p>
                  <time dateTime={e.fecha.toISOString()} className="text-sm text-muted tabular">
                    {formatearFechaHora(e.fecha).slice(11)}
                  </time>
                </div>
                <p className="truncate text-sm text-muted" title={correos.get(e.userId)}>
                  {correos.get(e.userId) ?? 'Usuario eliminado'}
                </p>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {detalle(e.despues, facturas).map((d) => (
                    <li key={d}>
                      <Badge tone="muted" className="font-medium tabular">
                        {d}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </Dia>
      ))}
    </div>
  );
}
