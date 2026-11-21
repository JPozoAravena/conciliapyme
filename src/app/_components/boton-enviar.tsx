'use client';

import { useFormStatus } from 'react-dom';

type Props = {
  texto: string;
  textoPendiente: string;
  variante?: 'primario' | 'peligro';
  className?: string;
};

export function BotonEnviar({ texto, textoPendiente, variante = 'primario', className = '' }: Props) {
  const { pending } = useFormStatus();
  return (
    <button
      type='submit'
      disabled={pending}
      aria-disabled={pending}
      className={`btn btn-${variante} ${className}`}
    >
      {pending && <span className='spinner' aria-hidden='true' />}
      {pending ? textoPendiente : texto}
    </button>
  );
}
