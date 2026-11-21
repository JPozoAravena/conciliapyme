import type { InputHTMLAttributes } from 'react';

type Props = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  etiqueta: string;
  ayuda?: string;
};

export function Campo({ id, etiqueta, ayuda, className = '', ...resto }: Props) {
  const ayudaId = ayuda ? `${id}-ayuda` : undefined;
  return (
    <div>
      <label htmlFor={id} className='etiqueta'>
        {etiqueta}
      </label>
      <input id={id} name={id} aria-describedby={ayudaId} className={`campo ${className}`} {...resto} />
      {ayuda && (
        <p id={ayudaId} className='ayuda'>
          {ayuda}
        </p>
      )}
    </div>
  );
}
