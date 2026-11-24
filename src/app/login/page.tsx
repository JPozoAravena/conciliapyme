import { AuthError } from 'next-auth';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';
import { MENSAJE_LOGIN_INVALIDO } from '@/components/feedback/mensajes';
import { Reveal } from '@/components/login/reveal';
import { LoginForm } from '@/components/login/login-form';
import { Brand } from '@/components/shell/brand';

// The public demo credentials are part of the README; hide them with NEXT_PUBLIC_SHOW_DEMO_USERS=false.
const MOSTRAR_DEMO = process.env.NEXT_PUBLIC_SHOW_DEMO_USERS !== 'false';

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
    <div className="relative isolate flex min-h-[calc(100dvh-3.5rem-1px)] w-full items-start justify-center overflow-hidden px-4 pb-10 pt-8 sm:items-center sm:pt-10">
      <div aria-hidden="true" className="login-bg pointer-events-none absolute inset-0 -z-10" />
      <div aria-hidden="true" className="login-grid pointer-events-none absolute inset-0 -z-10" />
      <div
        aria-hidden="true"
        className="login-blob pointer-events-none absolute -left-24 top-10 -z-10 size-96 rounded-full"
      />
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <Reveal index={0}>
            <Brand size="lg" />
          </Reveal>
          <Reveal index={1}>
            <h1 className="titulo">Ingresar a ConciliaPyme</h1>
          </Reveal>
          <Reveal index={2}>
            <p className="texto-suave text-balance">
              Concilia tu cartola con tus facturas en minutos, sin planillas.
            </p>
          </Reveal>
        </div>
        <Reveal index={3} className="login-card">
          <LoginForm
            action={login}
            error={error ? MENSAJE_LOGIN_INVALIDO : undefined}
            mostrarDemo={MOSTRAR_DEMO}
          />
        </Reveal>
        <Reveal index={4}>
          <p className="text-center text-xs text-muted">
            Conciliación bancaria para pymes chilenas. Tus datos se mantienen en tu cuenta.
          </p>
        </Reveal>
      </div>
    </div>
  );
}
