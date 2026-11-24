import { AuthError } from 'next-auth';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';
import { MENSAJE_LOGIN_INVALIDO } from '@/components/feedback/mensajes';
import { LoginForm } from '@/components/login/login-form';
import { Brand } from '@/components/shell/brand';
import { Card } from '@/components/ui/card';

const MOSTRAR_DEMO =
  process.env.NODE_ENV !== 'production' || process.env.NEXT_PUBLIC_SHOW_DEMO_USERS === 'true';

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
    <div className="relative isolate flex min-h-[calc(100dvh-2rem)] w-full items-start justify-center overflow-hidden px-4 pb-10 pt-8 sm:items-center sm:pt-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60rem_28rem_at_50%_-8rem,var(--brand-soft),transparent_70%)]"
      />
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <Brand />
          <h1 className="titulo">Ingresar a ConciliaPyme</h1>
          <p className="texto-suave text-balance">
            Concilia tu cartola con tus facturas en minutos, sin planillas.
          </p>
        </div>
        <Card className="shadow-overlay">
          <LoginForm
            action={login}
            error={error ? MENSAJE_LOGIN_INVALIDO : undefined}
            mostrarDemo={MOSTRAR_DEMO}
          />
        </Card>
        <p className="text-center text-xs text-muted">
          Conciliación bancaria para pymes chilenas. Tus datos se mantienen en tu cuenta.
        </p>
      </div>
    </div>
  );
}
