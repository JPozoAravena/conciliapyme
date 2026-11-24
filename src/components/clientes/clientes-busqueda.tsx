import Link from 'next/link';
import type { FiltrosClientes } from '@/app/_lib/clientes-params';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/** GET search form: works without JavaScript and keeps the query in the URL. */
export function ClientesBusqueda({ base, filtros }: { base: string; filtros: FiltrosClientes }) {
  return (
    <form
      method="get"
      action={base}
      role="search"
      className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-surface p-4 shadow-card"
    >
      {filtros.orden !== 'nombre' && <input type="hidden" name="orden" value={filtros.orden} />}
      {filtros.dir !== 'asc' && <input type="hidden" name="dir" value={filtros.dir} />}
      <div className="flex min-w-48 flex-1 basis-60 flex-col gap-1.5 sm:max-w-sm">
        <label htmlFor="q" className="text-[0.8125rem] font-semibold text-muted">
          Buscar por nombre o RUT
        </label>
        <Input id="q" name="q" type="search" defaultValue={filtros.q ?? ''} maxLength={80} />
      </div>
      <Button type="submit">Buscar</Button>
      <Button asChild variant="ghost">
        <Link href={base}>Limpiar</Link>
      </Button>
    </form>
  );
}
