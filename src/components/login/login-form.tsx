'use client';

import { CircleAlert } from 'lucide-react';
import { useState } from 'react';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { SubmitButton } from '@/components/ui/submit-button';
import { DemoUsuarios } from './demo-usuarios';

type LoginFormProps = {
  action: (formData: FormData) => Promise<void>;
  error?: string;
  mostrarDemo: boolean;
};

export function LoginForm({ action, error, mostrarDemo }: LoginFormProps) {
  const [email, setEmail] = useState('');
  return (
    <>
      <form action={action} className="flex flex-col gap-4">
        {error && (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-md border border-danger-border bg-danger-soft px-3 py-2 text-sm font-medium text-danger-text"
          >
            <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            {error}
          </p>
        )}
        <Field label="Correo">
          <Input
            name="email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field label="Contraseña">
          <Input name="password" type="password" autoComplete="current-password" required />
        </Field>
        <SubmitButton pendingText="Ingresando…" className="login-cta w-full">
          Ingresar
        </SubmitButton>
      </form>
      {mostrarDemo && <DemoUsuarios onUsar={setEmail} />}
    </>
  );
}
