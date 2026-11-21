import { AuthError } from 'next-auth';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  async function login(formData: FormData) {
    'use server';
    try {
      await signIn('credentials', {
        email: formData.get('email'),
        password: formData.get('password'),
        redirectTo: '/',
      });
    } catch (e) {
      if (e instanceof AuthError) redirect('/login?error=1');
      throw e;
    }
  }

  return (
    <main className='mx-auto mt-24 max-w-sm px-4'>
      <h1 className='mb-6 text-2xl font-semibold'>Ingresar a ConciliaPyme</h1>
      <form action={login} className='flex flex-col gap-3'>
        <label htmlFor='email'>Correo</label>
        <input id='email' name='email' type='email' autoComplete='username' required className='rounded border px-2 py-1' />
        <label htmlFor='password'>Contraseña</label>
        <input id='password' name='password' type='password' autoComplete='current-password' required className='rounded border px-2 py-1' />
        {error && <p role='alert' className='text-red-700'>Credenciales inválidas o demasiados intentos.</p>}
        <button type='submit' className='rounded bg-black px-3 py-2 text-white'>Ingresar</button>
      </form>
    </main>
  );
}