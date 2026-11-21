import { BotonEnviar } from '@/app/_components/boton-enviar';
import { Campo } from '@/app/_components/campo';

export function FacturaForm({ accion }: { accion: (formData: FormData) => Promise<void> }) {
  return (
    <section aria-labelledby='nueva-factura' className='tarjeta'>
      <h2 id='nueva-factura' className='subtitulo mb-4'>
        Nueva factura
      </h2>
      <form action={accion} className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        <Campo id='folio' etiqueta='Folio' type='number' min={1} step={1} inputMode='numeric' required />
        <Campo
          id='montoClp'
          etiqueta='Monto (CLP)'
          type='number'
          min={1}
          step={1}
          inputMode='numeric'
          required
          ayuda='Pesos chilenos, sin decimales.'
        />
        <Campo id='emision' etiqueta='Fecha de emisión' type='date' required />
        <Campo id='vencimiento' etiqueta='Fecha de vencimiento' type='date' required />
        <div className='sm:col-span-2'>
          <BotonEnviar texto='Crear factura' textoPendiente='Guardando…' />
        </div>
      </form>
    </section>
  );
}
