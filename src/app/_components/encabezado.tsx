import Link from 'next/link';
import { auth, signOut } from '@/auth';
import { puede } from '@/lib/rbac';

export async function Encabezado() {
  const session = await auth();

  return (
    <header className="border-b border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2 sm:px-6">
        <Link
          href="/"
          className="flex min-h-11 items-center gap-2 text-lg font-bold tracking-tight"
        >
          <span
            aria-hidden="true"
            className="grid size-7 place-items-center rounded-md bg-[var(--brand)] text-sm text-[var(--on-brand)]"
          >
            C
          </span>
          ConciliaPyme
        </Link>
        {session?.user && (
          <nav
            aria-label="Principal"
            className="flex flex-wrap items-center gap-2 sm:gap-4"
          >
            <Link
              href="/clientes"
              className="flex min-h-11 items-center px-2 font-medium hover:underline"
            >
              Clientes
            </Link>
            {puede(session.user.role, 'cartola:importar') && (
              <Link
                href="/importar"
                className="flex min-h-11 items-center px-2 font-medium hover:underline"
              >
                Importar cartola
              </Link>
            )}
            <span className="texto-suave hidden sm:inline">
              {session.user.email}
            </span>
            <form
              action={async () => {
                'use server';
                await signOut({ redirectTo: '/login' });
              }}
            >
              <button type="submit" className="btn btn-secundario">
                Cerrar sesión
              </button>
            </form>
          </nav>
        )}
      </div>
    </header>
  );
}
