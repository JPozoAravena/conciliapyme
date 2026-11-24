import { Users } from 'lucide-react';
import Link from 'next/link';
import { Aviso } from '@/app/_components/aviso';
import { BotonEnviar } from '@/app/_components/boton-enviar';
import { CamposCliente } from '@/app/_components/campos-cliente';
import { requerirSesion } from '@/app/_lib/autorizacion';
import { listarClientes } from '@/app/_lib/clientes-listado';
import { leerFiltrosClientes, paramsClientes } from '@/app/_lib/clientes-params';
import { POR_PAGINA } from '@/app/_lib/listado-params';
import { ClientesBusqueda } from '@/components/clientes/clientes-busqueda';
import { ClientesTabla } from '@/components/clientes/clientes-tabla';
import { Pagination } from '@/components/data-table/pagination';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { leerAviso } from '@/lib/errores';
import { puede } from '@/lib/rbac';
import { crearCliente } from './actions';

const BASE = '/clientes';

export default async function ClientesPage({ searchParams }: PageProps<'/clientes'>) {
  const session = await requerirSesion();
  const query = await searchParams;
  const aviso = leerAviso(query);
  const filtros = leerFiltrosClientes(query);
  const puedeGestionar = puede(session.user.role, 'cliente:gestionar');
  const pagina = await listarClientes(filtros);
  const params = paramsClientes(filtros);

  return (
    <div className='contenedor flex flex-col gap-6'>
      <div>
        <h1 className='titulo'>Clientes</h1>
        <p className='mt-1 text-muted'>
          {pagina.total} {pagina.total === 1 ? 'cliente' : 'clientes'}
          {filtros.q ? ' encontrados' : ' registrados'}
        </p>
      </div>
      <Aviso aviso={aviso} />
      <ClientesBusqueda base={BASE} filtros={filtros} />

      {pagina.total === 0 ? (
        <EmptyState
          icon={Users}
          title={filtros.q ? 'No hay clientes con esa búsqueda' : 'Aún no hay clientes registrados.'}
          description={
            filtros.q
              ? 'Revisa el nombre o RUT, o quita la búsqueda.'
              : puedeGestionar
                ? 'Crea el primero con el formulario de más abajo.'
                : 'Cuando un contador agregue clientes aparecerán aquí.'
          }
          action={
            filtros.q ? (
              <Button asChild variant='secondary'>
                <Link href={BASE}>Limpiar búsqueda</Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <ClientesTabla filas={pagina.filas} filtros={filtros} base={BASE} params={params} />
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

      {puedeGestionar && (
        <section aria-labelledby='nuevo-cliente' className='tarjeta'>
          <h2 id='nuevo-cliente' className='subtitulo mb-4'>
            Nuevo cliente
          </h2>
          <form action={crearCliente} className='flex max-w-md flex-col gap-4'>
            <CamposCliente />
            <BotonEnviar texto='Crear cliente' textoPendiente='Guardando…' className='self-start' />
          </form>
        </section>
      )}
    </div>
  );
}
