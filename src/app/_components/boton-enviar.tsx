'use client';

import { useFormStatus } from 'react-dom';

type Props = {
  texto: string;
  textoPendiente: string;
  variante?: 'primario' | 'peligro';
  className?: string;
  /** Accessible name when several buttons share the same visible text. */
  etiqueta?: string;
};

export function BotonEnviar({ texto, textoPendiente, variante = 'primario', className = '', etiqueta }: Props) {
  const { pending } = useFormStatus();
  return (
    <button
      type='submit'
      disabled={pending}
      aria-disabled={pending}
      aria-label={etiqueta}
      className={`btn btn-${variante} ${className}`}
    >
      {pending && <span className='spinner' aria-hidden='true' />}
      {pending ? textoPendiente : texto}
    </button>
  );
}
