import Link from 'next/link';
import { EstadoFactura } from '@/app/_components/estado-factura';
import type { FilaFactura } from '@/app/_lib/facturas-listado';
import type { FiltrosFacturas } from '@/app/_lib/facturas-params';
import { SortableTH } from '@/components/data-table/sortable-th';
import type { ParamsUrl } from '@/components/data-table/url';
import { Table, THead, TD, TH, TR } from '@/components/ui/table';
import { formatearClp, formatearFecha } from '@/lib/formato';

type Props = {
  label: string;
  filas: FilaFactura[];
  filtros: FiltrosFacturas;
  base: string;
  params: ParamsUrl;
  /** Global view: show the cliente column and link folios to the cliente. */
  conCliente?: boolean;
};

const enlace =
  'flex min-h-11 items-center font-medium text-foreground underline-offset-4 hover:text-brand hover:underline';

export function FacturasTabla({ label, filas, filtros, base, params, conCliente }: Props) {
  const orden = { orden: filtros.orden, dir: filtros.dir, base, params };
  return (
    <Table label={label} className="min-w-[40rem]">
      <THead>
        <TR>
          <SortableTH label="Folio" columna="folio" {...orden} />
          {conCliente && <TH>Cliente</TH>}
          <SortableTH label="Monto" columna="monto" dirInicial="desc" numeric {...orden} />
          <SortableTH label="Emisión" columna="fecha" dirInicial="desc" {...orden} />
          <TH>Vencimiento</TH>
          <TH>Estado</TH>
        </TR>
      </THead>
      <tbody>
        {filas.map((f) => (
          <TR key={f.id}>
            <TD className="font-medium tabular">
              {conCliente ? (
                <Link href={`/clientes/${f.cliente.id}`} className={enlace}>
                  {f.folio}
                </Link>
              ) : (
                f.folio
              )}
            </TD>
            {conCliente && (
              <TD>
                <Link
                  href={`/clientes/${f.cliente.id}`}
                  title={f.cliente.razonSocial}
                  className={`${enlace} max-w-64 truncate`}
                >
                  {f.cliente.razonSocial}
                </Link>
              </TD>
            )}
            <TD numeric>{formatearClp(f.montoClp)}</TD>
            <TD className="whitespace-nowrap tabular">{formatearFecha(f.emision)}</TD>
            <TD className="whitespace-nowrap text-muted tabular">{formatearFecha(f.vencimiento)}</TD>
            <TD>
              <EstadoFactura estado={f.estado} />
            </TD>
          </TR>
        ))}
      </tbody>
    </Table>
  );
}
