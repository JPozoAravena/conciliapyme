import { FileText } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Aviso } from '@/app/_components/aviso';
import { BotonEnviar } from '@/app/_components/boton-enviar';
import { CamposCliente } from '@/app/_components/campos-cliente';
import { requerirSesion } from '@/app/_lib/autorizacion';
import { listarFacturas } from '@/app/_lib/facturas-listado';
import { leerFiltrosFacturas, paramsFacturas } from '@/app/_lib/facturas-params';
import { POR_PAGINA } from '@/app/_lib/listado-params';
import { Pagination } from '@/components/data-table/pagination';
import { FacturasFiltros } from '@/components/facturas/facturas-filtros';
import { FacturasTabla } from '@/components/facturas/facturas-tabla';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { prisma } from '@/lib/db';
import { leerAviso } from '@/lib/errores';
import { puede } from '@/lib/rbac';
import { idSchema } from '@/lib/schemas';
import { actualizarCliente, crearFactura, eliminarCliente } from '../actions';
import { FacturaForm } from './factura-form';
import { EliminarCliente } from './zona-peligro';

export default async function ClientePage({ params, searchParams }: PageProps<'/clientes/[id]'>) {
  const session = await requerirSesion();
  const id = idSchema.safeParse((await params).id);
  if (!id.success) notFound();

  const cliente = await prisma.cliente.findUnique({ where: { id: id.data } });
  if (!cliente) notFound();

  const query = await searchParams;
  const aviso = leerAviso(query);
  const filtros = { ...leerFiltrosFacturas(query), cliente: cliente.id };
  const facturas = await listarFacturas(filtros);
  const base = `/clientes/${cliente.id}`;
  const urlParams = { ...paramsFacturas(filtros), cliente: undefined };
  const puedeGestionar = puede(session.user.role, 'cliente:gestionar');

  return (
    <div className='contenedor flex flex-col gap-8'>
      <div>
        <Link href='/clientes' className='enlace inline-flex min-h-11 items-center'>
          ← Volver a clientes
        </Link>
        <h1 className='titulo'>{cliente.razonSocial}</h1>
        <p className='texto-suave mt-1 tabular-nums'>RUT {cliente.rut}</p>
      </div>
      <Aviso aviso={aviso} />

      <section aria-labelledby='facturas' className='flex flex-col gap-3'>
        <h2 id='facturas' className='subtitulo'>
          Facturas ({facturas.total})
        </h2>
        <FacturasFiltros base={base} filtros={filtros} />
        {facturas.total === 0 ? (
          <EmptyState
            icon={FileText}
            title={filtros.estado ? 'No hay facturas con este estado' : 'Este cliente no tiene facturas.'}
            description={
              !filtros.estado && puedeGestionar ? 'Agrega la primera con el formulario de más abajo.' : undefined
            }
            action={
              filtros.estado ? (
                <Button asChild variant='secondary'>
                  <Link href={base}>Limpiar filtros</Link>
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            <FacturasTabla
              label={`Facturas de ${cliente.razonSocial}`}
              filas={facturas.filas}
              filtros={filtros}
              base={base}
              params={urlParams}
            />
            <Pagination
              base={base}
              params={urlParams}
              pagina={facturas.pagina}
              paginas={facturas.paginas}
              porPagina={POR_PAGINA}
              total={facturas.total}
            />
          </>
        )}
      </section>

      {puedeGestionar && <FacturaForm accion={crearFactura.bind(null, cliente.id)} />}

      {puedeGestionar && (
        <section aria-labelledby='editar-cliente' className='tarjeta flex flex-col gap-5'>
          <h2 id='editar-cliente' className='subtitulo'>
            Editar cliente
          </h2>
          <form action={actualizarCliente.bind(null, cliente.id)} className='flex max-w-md flex-col gap-4'>
            <CamposCliente rut={cliente.rut} razonSocial={cliente.razonSocial} />
            <BotonEnviar texto='Guardar cambios' textoPendiente='Guardando…' className='self-start' />
          </form>
          <EliminarCliente accion={eliminarCliente.bind(null, cliente.id)} />
        </section>
      )}
    </div>
  );
}
