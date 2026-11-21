import { EstadoFactura } from '@/app/_components/estado-factura';
import { formatearClp, formatearFecha } from '@/lib/formato';

type Factura = {
  id: string | number;
  folio: number;
  montoClp: number;
  emision: Date;
  vencimiento: Date;
  estado: 'PENDIENTE' | 'PAGADA' | 'CON_DIFERENCIA';
};

export function TablaFacturas({ facturas, cliente }: { facturas: Factura[]; cliente: string }) {
  return (
    <div className='tabla-scroll' role='region' aria-label={`Facturas de ${cliente}`} tabIndex={0}>
      <table className='tabla min-w-[36rem]'>
        <caption className='sr-only'>Facturas de {cliente}</caption>
        <thead>
          <tr>
            <th scope='col'>Folio</th>
            <th scope='col' className='num'>
              Monto
            </th>
            <th scope='col'>Emisión</th>
            <th scope='col'>Vencimiento</th>
            <th scope='col'>Estado</th>
          </tr>
        </thead>
        <tbody>
          {facturas.map((f) => (
            <tr key={f.id}>
              <td className='tabular-nums'>{f.folio}</td>
              <td className='num'>{formatearClp(f.montoClp)}</td>
              <td className='whitespace-nowrap tabular-nums'>{formatearFecha(f.emision)}</td>
              <td className='whitespace-nowrap tabular-nums'>{formatearFecha(f.vencimiento)}</td>
              <td>
                <EstadoFactura estado={f.estado} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
