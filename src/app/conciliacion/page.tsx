import { requerirSesion } from '@/app/_lib/autorizacion';
import { sugerir, type Regla } from '@/lib/conciliacion/sugerir';
import { prisma } from '@/lib/db';
import { formatearClp, formatearFecha } from '@/lib/formato';

const nombreRegla: Record<Regla, string> = {
  MONTO_Y_FOLIO: 'Monto y folio',
  MONTO_Y_FECHA: 'Monto y fecha',
  DIFERENCIA_MENOR: 'Diferencia menor',
};

const MAX_MOVIMIENTOS = 100;

export default async function ConciliacionPage() {
  await requerirSesion();
  const [movimientos, facturas] = await Promise.all([
    prisma.movimientoBancario.findMany({
      where: { estado: 'SIN_CONCILIAR', montoClp: { gt: 0 } },
      orderBy: { fecha: 'asc' },
      take: MAX_MOVIMIENTOS,
    }),
    prisma.factura.findMany({
      where: { estado: 'PENDIENTE' },
      select: {
        id: true,
        folio: true,
        montoClp: true,
        vencimiento: true,
        cliente: { select: { razonSocial: true } },
      },
    }),
  ]);
  const porId = new Map(facturas.map((f) => [f.id, f]));

  return (
    <div className="contenedor flex flex-col gap-6">
      <div>
        <h1 className="titulo">Conciliación</h1>
        <p className="texto-suave mt-1">
          Abonos sin conciliar y las facturas pendientes que podrían
          corresponderles. El sistema solo sugiere: una persona confirma.
        </p>
      </div>

      {movimientos.length === 0 ? (
        <p className="tarjeta">No hay abonos pendientes de conciliar.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {movimientos.map((m) => {
            const sugerencias = sugerir(m, facturas);
            return (
              <li key={m.id} className="tarjeta flex flex-col gap-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-semibold">{m.descripcion}</p>
                  <p className="tabular-nums">
                    {formatearFecha(m.fecha)} ·{' '}
                    <strong>{formatearClp(m.montoClp)}</strong>
                  </p>
                </div>
                {sugerencias.length === 0 ? (
                  <p className="texto-suave">Sin sugerencias.</p>
                ) : (
                  <div className="tabla-scroll">
                    <table className="tabla">
                      <caption className="sr-only">
                        Facturas sugeridas para {m.descripcion}
                      </caption>
                      <thead>
                        <tr>
                          <th scope="col">Folio</th>
                          <th scope="col">Cliente</th>
                          <th scope="col" className="num">
                            Monto
                          </th>
                          <th scope="col">Regla</th>
                          <th scope="col" className="num">
                            Puntaje
                          </th>
                          <th scope="col" className="num">
                            Diferencia
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {sugerencias.map((s) => {
                          const f = porId.get(s.facturaId);
                          if (!f) return null;
                          return (
                            <tr key={s.facturaId}>
                              <td className="tabular-nums">{f.folio}</td>
                              <td>{f.cliente.razonSocial}</td>
                              <td className="num">
                                {formatearClp(f.montoClp)}
                              </td>
                              <td>{nombreRegla[s.regla]}</td>
                              <td className="num">{s.puntaje}</td>
                              <td className="num">
                                {formatearClp(s.diferenciaClp)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
