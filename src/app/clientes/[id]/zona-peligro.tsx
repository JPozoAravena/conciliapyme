import { BotonEnviar } from '@/app/_components/boton-enviar';

export function EliminarCliente({ accion }: { accion: (formData: FormData) => Promise<void> }) {
  return (
    <details className='rounded-lg border border-[var(--danger-border)] bg-[var(--danger-soft)] p-4'>
      <summary className='flex min-h-11 cursor-pointer items-center font-semibold text-[var(--danger-text)]'>
        Eliminar cliente
      </summary>
      <form action={accion} className='mt-2 flex flex-col items-start gap-3'>
        <p className='text-sm text-[var(--danger-text)]'>
          Esta acción no se puede deshacer. Solo es posible eliminar clientes que no tienen facturas.
        </p>
        <BotonEnviar texto='Sí, eliminar cliente' textoPendiente='Eliminando…' variante='peligro' />
      </form>
    </details>
  );
}
