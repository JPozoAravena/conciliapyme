import Link from 'next/link';
import { ACCIONES, type FiltrosAuditoria } from '@/lib/auditoria-filtros';
import { fechaParaInput } from '@/lib/formato';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
import { etiquetaAccion } from './etiquetas';

function Campo({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-40 flex-1 basis-40 flex-col gap-1.5">
      <label htmlFor={id} className="text-[0.8125rem] font-semibold text-muted">
        {label}
      </label>
      {children}
    </div>
  );
}

/** GET form: keeps the existing accion/desde/hasta URL params. */
export function AuditoriaFiltrosForm({ filtros }: { filtros: FiltrosAuditoria }) {
  return (
    <form
      method="get"
      action="/auditoria"
      className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-surface p-4 shadow-card"
    >
      <Campo id="accion" label="Acción">
        <Select id="accion" name="accion" defaultValue={filtros.accion ?? ''}>
          <option value="">Todas</option>
          {ACCIONES.map((a) => (
            <option key={a} value={a}>
              {etiquetaAccion(a)}
            </option>
          ))}
        </Select>
      </Campo>
      <Campo id="desde" label="Desde">
        <Input
          id="desde"
          name="desde"
          type="date"
          defaultValue={filtros.desde ? fechaParaInput(filtros.desde) : ''}
        />
      </Campo>
      <Campo id="hasta" label="Hasta">
        <Input
          id="hasta"
          name="hasta"
          type="date"
          defaultValue={filtros.hasta ? fechaParaInput(filtros.hasta) : ''}
        />
      </Campo>
      <div className="flex w-full items-end gap-2 sm:w-auto">
        <Button type="submit">Filtrar</Button>
        <Button asChild variant="ghost">
          <Link href="/auditoria">Limpiar</Link>
        </Button>
      </div>
    </form>
  );
}
