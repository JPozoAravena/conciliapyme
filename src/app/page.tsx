import { redirect } from 'next/navigation';
import { auth, signOut } from '@/auth';

export default async function Home() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return (
    <main className='mx-auto mt-16 max-w-2xl px-4'>
      <h1 className='text-2xl font-semibold'>Hola, {session.user.email}</h1>
      <p className='mt-2'>Rol: {session.user.role}</p>
      <form
        action={async () => {
          'use server';
          await signOut({ redirectTo: '/login' });
        }}
      >
        <button className='mt-6 rounded border px-3 py-2'>Cerrar sesión</button>
      </form>
    </main>
  );
}