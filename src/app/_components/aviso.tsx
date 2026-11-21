import type { Aviso as AvisoDatos } from '@/lib/errores';

export function Aviso({ aviso }: { aviso: AvisoDatos | null }) {
  if (!aviso) return null;
  if (aviso.tipo === 'error') {
    return (
      <p role='alert' className='aviso aviso-error'>
        <span aria-hidden='true'>⚠</span>
        <span>{aviso.mensaje}</span>
      </p>
    );
  }
  return (
    <p role='status' className='aviso aviso-ok'>
      <span aria-hidden='true'>✓</span>
      <span>{aviso.mensaje}</span>
    </p>
  );
}
