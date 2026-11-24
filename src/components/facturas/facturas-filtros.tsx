import Link from 'next/link';
import type { ReactNode } from 'react';
import { ESTADOS_FACTURA, type FiltrosFacturas } from '@/app/_lib/facturas-params';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';

export const NOMBRE_ESTADO = {
  PENDIENTE: 'Pendiente',
  PAGADA: 'Pagada',
  CON_DIFERENCIA: 'Con diferencia',
} as const;

function Campo({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-40 flex-1 basis-40 flex-col gap-1.5">
      <label htmlFor={id} className="text-[0.8125rem] font-semibold text-muted">
        {label}
      </label>
      {children}
    </div>
  );
}

type Props = {
  base: string;
  filtros: FiltrosFacturas;
  /** When given, the cliente and date filters are shown too. */
  clientes?: { id: string; razonSocial: string }[];
};

/** GET form: works without JavaScript and keeps every filter in the URL. */
export function FacturasFiltros({ base, filtros, clientes }: Props) {
  return (
    <form
      method="get"
      action={base}
      className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-surface p-4 shadow-card"
    >
      {filtros.orden !== 'fecha' && <input type="hidden" name="orden" value={filtros.orden} />}
      {filtros.dir !== 'desc' && <input type="hidden" name="dir" value={filtros.dir} />}
      <Campo id="f-estado" label="Estado">
        <Select id="f-estado" name="estado" defaultValue={filtros.estado ?? ''}>
          <option value="">Todos</option>
          {ESTADOS_FACTURA.map((e) => (
            <option key={e} value={e}>
              {NOMBRE_ESTADO[e]}
            </option>
          ))}
        </Select>
      </Campo>
      {clientes && (
        <>
          <Campo id="f-cliente" label="Cliente">
            <Select id="f-cliente" name="cliente" defaultValue={filtros.cliente ?? ''}>
              <option value="">Todos</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.razonSocial}
                </option>
              ))}
            </Select>
          </Campo>
          <Campo id="f-desde" label="Emitida desde">
            <Input id="f-desde" type="date" name="desde" defaultValue={filtros.desde ?? ''} />
          </Campo>
          <Campo id="f-hasta" label="Emitida hasta">
            <Input id="f-hasta" type="date" name="hasta" defaultValue={filtros.hasta ?? ''} />
          </Campo>
        </>
      )}
      <div className="flex w-full items-end gap-2 sm:w-auto">
        <Button type="submit">Aplicar</Button>
        <Button asChild variant="ghost">
          <Link href={base}>Limpiar</Link>
        </Button>
      </div>
    </form>
  );
}
