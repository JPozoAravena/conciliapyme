import type { ReactNode } from 'react';
import { confirmarAction } from '@/app/conciliacion/actions';
import type { Movimiento, Sugerencia } from '@/lib/conciliacion/sugerir';
import { formatearClp, formatearFecha } from '@/lib/formato';
import { ConfirmarBloqueado } from './confirmar-bloqueado';
import { ConfirmarDialog } from './confirmar-dialog';
import { SugerenciaCard, type FacturaVista } from './sugerencia-card';

type Props = {
  movimiento: Movimiento;
  sugerencias: Sugerencia[];
  facturas: Map<string, FacturaVista>;
  puedeConfirmar: boolean;
};

function Fila({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs text-muted">{etiqueta}</dt>
      <dd className="break-words text-sm font-medium">{children}</dd>
    </div>
  );
}

function Resumen({
  movimiento,
  factura,
  diferenciaClp,
}: {
  movimiento: Movimiento;
  factura: FacturaVista;
  diferenciaClp: number;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <section aria-label="Movimiento" className="rounded-lg border border-border bg-background p-3">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Movimiento</h3>
          <dl className="flex flex-col gap-2">
            <Fila etiqueta="Descripción">{movimiento.descripcion}</Fila>
            <Fila etiqueta="Fecha">{formatearFecha(movimiento.fecha)}</Fila>
            <Fila etiqueta="Monto"><span className="tabular">{formatearClp(movimiento.montoClp)}</span></Fila>
          </dl>
        </section>
        <section aria-label="Factura" className="rounded-lg border border-border bg-background p-3">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Factura</h3>
          <dl className="flex flex-col gap-2">
            <Fila etiqueta="Folio y cliente">N° {factura.folio} · {factura.cliente.razonSocial}</Fila>
            <Fila etiqueta="Vencimiento">{formatearFecha(factura.vencimiento)}</Fila>
            <Fila etiqueta="Monto"><span className="tabular">{formatearClp(factura.montoClp)}</span></Fila>
          </dl>
        </section>
      </div>
      {diferenciaClp !== 0 && (
        <p className="flex justify-between gap-3 rounded-lg border border-warn-border bg-warn-soft px-3 py-2 text-sm text-warn-text">
          <span>Diferencia</span>
          <span className="font-semibold tabular">{formatearClp(diferenciaClp)}</span>
        </p>
      )}
    </div>
  );
}

export function MovimientoSugerencias({
  movimiento,
  sugerencias,
  facturas,
  puedeConfirmar,
}: Props) {
  return (
    <li className="flex flex-col gap-3">
      <h2 className="sr-only">Sugerencias para {movimiento.descripcion}</h2>
      {sugerencias.length === 0 && (
        <p className="rounded-lg border border-dashed border-border bg-surface p-4 text-sm">
          <span className="font-semibold">{movimiento.descripcion}</span> ·{' '}
          {formatearFecha(movimiento.fecha)} ·{' '}
          {formatearClp(movimiento.montoClp)}
          <span className="mt-1 block text-muted">Sin sugerencias.</span>
        </p>
      )}
      {sugerencias.map((s, i) => {
        const factura = facturas.get(s.facturaId);
        if (!factura) return null;
        const etiqueta = `Confirmar factura ${factura.folio} para ${movimiento.descripcion}`;
        return (
          <SugerenciaCard
            key={s.facturaId}
            movimiento={movimiento}
            factura={factura}
            puntaje={s.puntaje}
            destacada={sugerencias.length > 1 && i === 0}
            accion={
              puedeConfirmar ? (
                <ConfirmarDialog
                  action={confirmarAction.bind(null, movimiento.id, factura.id)}
                  etiqueta={etiqueta}
                >
                  <Resumen
                    movimiento={movimiento}
                    factura={factura}
                    diferenciaClp={s.diferenciaClp}
                  />
                </ConfirmarDialog>
              ) : (
                <ConfirmarBloqueado etiqueta={etiqueta} />
              )
            }
          />
        );
      })}
    </li>
  );
}
