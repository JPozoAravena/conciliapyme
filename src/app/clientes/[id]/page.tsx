import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Aviso } from '@/app/_components/aviso';
import { BotonEnviar } from '@/app/_components/boton-enviar';
import { CamposCliente } from '@/app/_components/campos-cliente';
import { requerirSesion } from '@/app/_lib/autorizacion';
import { prisma } from '@/lib/db';
import { leerAviso } from '@/lib/errores';
import { puede } from '@/lib/rbac';
import { idSchema } from '@/lib/schemas';
import { actualizarCliente, crearFactura, eliminarCliente } from '../actions';
import { FacturaForm } from './factura-form';
import { TablaFacturas } from './tabla-facturas';
import { EliminarCliente } from './zona-peligro';

export default async function ClientePage({ params, searchParams }: PageProps<'/clientes/[id]'>) {
  const session = await requerirSesion();
  const id = idSchema.safeParse((await params).id);
  if (!id.success) notFound();

  const cliente = await prisma.cliente.findUnique({
    where: { id: id.data },
    include: { facturas: { orderBy: { emision: 'desc' } } },
  });
  if (!cliente) notFound();

  const aviso = leerAviso(await searchParams);
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
          Facturas ({cliente.facturas.length})
        </h2>
        {cliente.facturas.length === 0 ? (
          <div className='tarjeta text-center'>
            <p className='font-semibold'>Este cliente no tiene facturas.</p>
            {puedeGestionar && <p className='texto-suave mt-1'>Agrega la primera con el formulario de más abajo.</p>}
          </div>
        ) : (
          <TablaFacturas facturas={cliente.facturas} cliente={cliente.razonSocial} />
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
