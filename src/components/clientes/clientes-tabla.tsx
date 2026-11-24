import Link from 'next/link';
import type { FilaCliente } from '@/app/_lib/clientes-listado';
import type { FiltrosClientes } from '@/app/_lib/clientes-params';
import { SortableTH } from '@/components/data-table/sortable-th';
import type { ParamsUrl } from '@/components/data-table/url';
import { Table, THead, TD, TR } from '@/components/ui/table';

type Props = {
  filas: FilaCliente[];
  filtros: FiltrosClientes;
  base: string;
  params: ParamsUrl;
};

export function ClientesTabla({ filas, filtros, base, params }: Props) {
  const orden = { orden: filtros.orden, dir: filtros.dir, base, params };
  return (
    <Table label="Listado de clientes" className="min-w-[28rem]">
      <THead>
        <TR>
          <SortableTH label="RUT" columna="rut" {...orden} />
          <SortableTH label="Razón social" columna="nombre" {...orden} />
          <SortableTH label="Facturas" columna="facturas" dirInicial="desc" numeric {...orden} />
        </TR>
      </THead>
      <tbody>
        {filas.map((c) => (
          <TR key={c.id}>
            <TD className="whitespace-nowrap tabular">{c.rut}</TD>
            <TD>
              <Link
                href={`/clientes/${c.id}`}
                title={c.razonSocial}
                className="flex min-h-11 max-w-80 items-center truncate font-medium text-foreground underline-offset-4 hover:text-brand hover:underline"
              >
                {c.razonSocial}
              </Link>
            </TD>
            <TD numeric>{c.facturas}</TD>
          </TR>
        ))}
      </tbody>
    </Table>
  );
}
