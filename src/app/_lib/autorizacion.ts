import { redirect } from 'next/navigation';
import type { Session } from 'next-auth';
import { auth } from '@/auth';
import { puede, type Accion } from '@/lib/rbac';

export async function requerirSesion(): Promise<Session> {
  const session = await auth();
  if (!session?.user) redirect('/login');
  return session;
}

export async function tienePermiso(accion: Accion): Promise<boolean> {
  const session = await auth();
  return Boolean(session?.user && puede(session.user.role, accion));
}
