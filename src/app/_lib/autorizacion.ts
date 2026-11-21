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
  return (await sesionConPermiso(accion)) !== null;
}

/** The session when its user may perform `accion`, otherwise null. */
export async function sesionConPermiso(accion: Accion): Promise<Session | null> {
  const session = await auth();
  return session?.user && puede(session.user.role, accion) ? session : null;
}
