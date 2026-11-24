import { Eye } from 'lucide-react';
import { cookies } from 'next/headers';
import type { ReactNode } from 'react';
import { auth, signOut } from '@/auth';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { puede, type Role } from '@/lib/rbac';
import { Brand } from './brand';
import { MobileNav } from './mobile-nav';
import { NAV_ITEMS, SIDEBAR_COOKIE } from './nav-config';
import { Sidebar } from './sidebar';
import { UserPanel } from './user-panel';

const ROLE_LABELS: Record<Role, string> = {
  CONTADOR: 'Contador',
  DUENO: 'Dueño',
  ADMIN: 'Administrador',
};

async function cerrarSesion() {
  'use server';
  await signOut({ redirectTo: '/login' });
}

export async function AppShell({ children }: { children: ReactNode }) {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    return (
      <>
        <div className="flex h-14 items-center justify-between gap-2 border-b border-border bg-surface pl-4 pr-2">
          <Brand />
          <ThemeToggle />
        </div>
        {children}
      </>
    );
  }

  const items = NAV_ITEMS.filter((i) => !i.permiso || puede(user.role, i.permiso)).map(
    ({ href, label }) => ({ href, label }),
  );
  const readOnly =
    !puede(user.role, 'cartola:importar') && !puede(user.role, 'conciliacion:confirmar');
  const collapsed = (await cookies()).get(SIDEBAR_COOKIE)?.value === '1';
  const roleLabel = ROLE_LABELS[user.role];
  const email = user.email ?? '';

  return (
    <div className="flex flex-1">
      <Sidebar items={items} defaultCollapsed={collapsed} />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileNav
          items={items}
          footer={
            <UserPanel
              email={email}
              roleLabel={roleLabel}
              signOutAction={cerrarSesion}
              showTheme={false}
              stacked
            />
          }
        />
        <div className="sticky top-0 z-30 hidden h-14 items-center justify-end border-b border-border bg-surface px-6 lg:flex">
          <UserPanel email={email} roleLabel={roleLabel} signOutAction={cerrarSesion} />
        </div>
        {readOnly && (
          <p className="flex items-start gap-2 border-b border-info-border bg-info-soft px-4 py-2 text-sm leading-5 text-info-text sm:items-center sm:px-6">
            <Eye aria-hidden="true" className="mt-0.5 size-4 shrink-0 sm:mt-0" />
            <span className="min-w-0">
              Modo solo lectura: puedes revisar, pero no importar ni confirmar.
            </span>
          </p>
        )}
        {children}
      </div>
    </div>
  );
}
