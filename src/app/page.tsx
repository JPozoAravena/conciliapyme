import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { puede } from '@/lib/rbac';

export default async function Home() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return (
    <div className="contenedor flex flex-col gap-6">
      <div>
        <h1 className="titulo">Hola, {session.user.email}</h1>
        <p className="texto-suave mt-1">
          Rol: <span className="badge badge-neutro">{session.user.role}</span>
        </p>
      </div>
      <section className="tarjeta flex flex-col items-start gap-3">
        <h2 className="subtitulo">Clientes y facturas</h2>
        <p className="texto-suave">
          Revisa tus clientes, sus facturas y su estado de conciliación.
        </p>
        <Link href="/clientes" className="btn btn-primario">
          Ver clientes y facturas
        </Link>
      </section>
      {puede(session.user.role, 'cartola:importar') && (
        <section className="tarjeta flex flex-col items-start gap-3">
          <h2 className="subtitulo">Importar cartola</h2>
          <p className="texto-suave">
            Sube la cartola de tu banco en CSV; los movimientos repetidos no se
            duplican.
          </p>
          <Link href="/importar" className="btn btn-primario">
            Importar cartola
          </Link>
        </section>
      )}
    </div>
  );
}
