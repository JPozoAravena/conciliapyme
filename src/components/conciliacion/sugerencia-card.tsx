import { ArrowLeftRight, Check, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { formatearClp, formatearFecha } from '@/lib/formato';
import type { Movimiento } from '@/lib/conciliacion/sugerir';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/components/ui/cn';
import { camposQueCoinciden } from './campos-coinciden';
import { ScoreBadge } from './score-badge';

export type FacturaVista = {
  id: string;
  folio: number;
  montoClp: number;
  vencimiento: Date;
  cliente: { razonSocial: string };
};

type Props = {
  movimiento: Movimiento;
  factura: FacturaVista;
  puntaje: number;
  /** Confirm control (dialog or disabled button), decided by the page from the role. */
  accion: ReactNode;
  /** Highlights the best of several suggestions for the same movement. */
  destacada?: boolean;
};

function Dato({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap justify-between gap-x-3 gap-y-0.5">
      <dt className="text-sm text-muted">{etiqueta}</dt>
      <dd className="min-w-0 break-words text-right text-sm font-medium tabular">{children}</dd>
    </div>
  );
}

function Panel({
  titulo,
  monto,
  children,
}: {
  titulo: string;
  monto: number;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-3 p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
        {titulo}
      </h3>
      <p className="text-right text-2xl font-semibold leading-none tabular">
        {formatearClp(monto)}
      </p>
      <dl className="flex flex-col gap-1.5">{children}</dl>
    </div>
  );
}

export function SugerenciaCard({
  movimiento,
  factura,
  puntaje,
  accion,
  destacada,
}: Props) {
  const campos = camposQueCoinciden(movimiento, factura);
  const items = [campos.monto, campos.folio, campos.fecha];

  return (
    <article
      className={cn(
        'overflow-hidden rounded-lg border bg-surface shadow-card',
        destacada ? 'border-brand ring-1 ring-brand' : 'border-border',
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-background px-4 py-3">
        <ScoreBadge puntaje={puntaje} />
        {destacada && <Badge tone="neutral">Mejor coincidencia</Badge>}
      </div>
      <div className="grid divide-y divide-border md:grid-cols-[1fr_auto_1fr] md:divide-y-0">
        <Panel titulo="Movimiento bancario" monto={movimiento.montoClp}>
          <Dato etiqueta="Fecha">{formatearFecha(movimiento.fecha)}</Dato>
          <Dato etiqueta="Descripción">{movimiento.descripcion}</Dato>
        </Panel>
        <div
          aria-hidden="true"
          className="hidden items-center border-x border-border bg-background px-3 text-muted md:flex"
        >
          <ArrowLeftRight className="size-5" />
        </div>
        <Panel titulo="Factura sugerida" monto={factura.montoClp}>
          <Dato etiqueta="Folio">{factura.folio}</Dato>
          <Dato etiqueta="Cliente">{factura.cliente.razonSocial}</Dato>
          <Dato etiqueta="Vencimiento">{formatearFecha(factura.vencimiento)}</Dato>
        </Panel>
      </div>
      <div className="flex flex-col gap-4 border-t border-border p-4 sm:flex-row sm:items-end sm:justify-between">
        <section aria-labelledby={`campos-${factura.id}-${movimiento.id}`}>
          <h3
            id={`campos-${factura.id}-${movimiento.id}`}
            className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted"
          >
            Campos que coinciden
          </h3>
          <ul className="flex flex-wrap gap-2 text-sm">
            {items.map((c) => (
              <li
                key={c.texto}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1',
                  c.coincide
                    ? 'border-ok-border bg-ok-soft text-ok-text'
                    : 'border-border bg-background text-muted',
                )}
              >
                {c.coincide ? (
                  <Check aria-hidden="true" className="size-4 shrink-0" />
                ) : (
                  <X aria-hidden="true" className="size-4 shrink-0" />
                )}
                <span>
                  <span className="sr-only">
                    {c.coincide ? 'Coincide: ' : 'No coincide: '}
                  </span>
                  {c.texto}
                </span>
              </li>
            ))}
          </ul>
        </section>
        <div className="shrink-0 [&_button]:min-h-11 sm:[&_button]:min-h-8">{accion}</div>
      </div>
    </article>
  );
}
