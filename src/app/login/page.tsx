import { AuthError } from 'next-auth';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';
import { Campo } from '@/app/_components/campo';

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
    <div className='contenedor max-w-md pt-10 sm:pt-16'>
      <h1 className='titulo mb-1'>Ingresar a ConciliaPyme</h1>
      <p className='texto-suave mb-6'>Usa tu correo y contraseña de trabajo.</p>
      <form action={login} className='tarjeta flex flex-col gap-4'>
        {error && (
          <p role='alert' className='aviso aviso-error'>
            Credenciales inválidas o demasiados intentos.
          </p>
        )}
        <Campo id='email' etiqueta='Correo' type='email' autoComplete='username' required />
        <Campo id='password' etiqueta='Contraseña' type='password' autoComplete='current-password' required />
        <button type='submit' className='btn btn-primario'>
          Ingresar
        </button>
      </form>
    </div>
  );
}
