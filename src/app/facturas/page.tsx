import { listarFacturas } from '@/app/_lib/facturas-listado';
import { leerFiltrosFacturas, paramsFacturas } from '@/app/_lib/facturas-params';
import { opcionesClientes } from '@/app/_lib/clientes-listado';
import { POR_PAGINA } from '@/app/_lib/listado-params';
import { Pagination } from '@/components/data-table/pagination';
import { FacturasFiltros } from '@/components/facturas/facturas-filtros';
import { FacturasTabla } from '@/components/facturas/facturas-tabla';
import { FacturasVacio } from '@/components/facturas/facturas-vacio';

const BASE = '/facturas';

export default async function FacturasPage({ searchParams }: PageProps<'/facturas'>) {
  const filtros = leerFiltrosFacturas(await searchParams);
  const [pagina, clientes] = await Promise.all([listarFacturas(filtros), opcionesClientes()]);
  const params = paramsFacturas(filtros);
  const conFiltros = Boolean(filtros.estado || filtros.cliente || filtros.desde || filtros.hasta);

  return (
    <div className="contenedor flex flex-col gap-6">
      <div>
        <h1 className="titulo">Facturas</h1>
        <p className="mt-1 text-muted">Todas las facturas, con su estado de conciliación.</p>
      </div>
      <FacturasFiltros base={BASE} filtros={filtros} clientes={clientes} />
      {pagina.total === 0 ? (
        <FacturasVacio base={BASE} conFiltros={conFiltros} />
      ) : (
        <>
          <FacturasTabla
            label="Listado de facturas"
            filas={pagina.filas}
            filtros={filtros}
            base={BASE}
            params={params}
            conCliente
          />
          <Pagination
            base={BASE}
            params={params}
            pagina={pagina.pagina}
            paginas={pagina.paginas}
            porPagina={POR_PAGINA}
            total={pagina.total}
          />
        </>
      )}
    </div>
  );
}
