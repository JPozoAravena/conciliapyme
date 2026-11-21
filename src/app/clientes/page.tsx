import Link from 'next/link';
import { Aviso } from '@/app/_components/aviso';
import { BotonEnviar } from '@/app/_components/boton-enviar';
import { CamposCliente } from '@/app/_components/campos-cliente';
import { requerirSesion } from '@/app/_lib/autorizacion';
import { prisma } from '@/lib/db';
import { leerAviso } from '@/lib/errores';
import { puede } from '@/lib/rbac';
import { crearCliente } from './actions';

export default async function ClientesPage({ searchParams }: PageProps<'/clientes'>) {
  const session = await requerirSesion();
  const aviso = leerAviso(await searchParams);
  const puedeGestionar = puede(session.user.role, 'cliente:gestionar');
  const clientes = await prisma.cliente.findMany({
    orderBy: { razonSocial: 'asc' },
    include: { _count: { select: { facturas: true } } },
  });

  return (
    <div className='contenedor flex flex-col gap-6'>
      <div>
        <h1 className='titulo'>Clientes</h1>
        <p className='texto-suave mt-1'>
          {clientes.length} {clientes.length === 1 ? 'cliente registrado' : 'clientes registrados'}
        </p>
      </div>
      <Aviso aviso={aviso} />

      {clientes.length === 0 ? (
        <div className='tarjeta text-center'>
          <p className='font-semibold'>Aún no hay clientes registrados.</p>
          <p className='texto-suave mt-1'>
            {puedeGestionar
              ? 'Crea el primero con el formulario de más abajo.'
              : 'Cuando un contador agregue clientes aparecerán aquí.'}
          </p>
        </div>
      ) : (
        <div className='tabla-scroll'>
          <table className='tabla'>
            <caption className='sr-only'>Listado de clientes</caption>
            <thead>
              <tr>
                <th scope='col'>RUT</th>
                <th scope='col'>Razón social</th>
                <th scope='col' className='num'>
                  Facturas
                </th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((c) => (
                <tr key={c.id}>
                  <td className='whitespace-nowrap tabular-nums'>{c.rut}</td>
                  <td>
                    <Link href={`/clientes/${c.id}`} className='enlace inline-flex min-h-11 items-center'>
                      {c.razonSocial}
                    </Link>
                  </td>
                  <td className='num'>{c._count.facturas}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
