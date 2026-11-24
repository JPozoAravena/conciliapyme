import { CircleDollarSign, FileClock, Landmark, Percent } from 'lucide-react';
import { requerirSesion } from '@/app/_lib/autorizacion';
import { obtenerKpis } from '@/app/_lib/dashboard-kpis';
import { AccionSiguiente } from '@/components/dashboard/accion-siguiente';
import { StatCard } from '@/components/dashboard/stat-card';
import { UltimasImportaciones } from '@/components/dashboard/ultimas-importaciones';
import { formatearClp, formatearFecha } from '@/lib/formato';
import { puede } from '@/lib/rbac';

export default async function Home() {
  const session = await requerirSesion();
  const kpis = await obtenerKpis();
  const puedeImportar = puede(session.user.role, 'cartola:importar');
  const { facturasPendientes, movimientos, tasaConciliacion } = kpis;

  return (
    <div className="contenedor flex flex-col gap-6">
      <div>
        <h1 className="titulo">Inicio</h1>
        <p className="mt-1 text-muted">
          Resumen de tu conciliación, al {formatearFecha(new Date())}.
        </p>
      </div>
      <AccionSiguiente sinConciliar={movimientos.sinConciliar} puedeImportar={puedeImportar} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Facturas pendientes"
          value={String(facturasPendientes.cantidad)}
          context="Esperan un pago conciliado"
          Icon={FileClock}
        />
        <StatCard
          label="Monto por cobrar"
          value={formatearClp(facturasPendientes.totalClp)}
          context="Suma de facturas pendientes"
          Icon={CircleDollarSign}
        />
        <StatCard
          label="Movimientos sin conciliar"
          value={String(movimientos.sinConciliar)}
          context={`De ${movimientos.total} importados`}
          Icon={Landmark}
        />
        <StatCard
          label="Tasa de conciliación"
          value={tasaConciliacion === null ? '—' : `${tasaConciliacion}%`}
          context={
            tasaConciliacion === null ? 'Aún no hay movimientos' : 'Movimientos ya conciliados'
          }
          Icon={Percent}
        />
      </div>
      {puedeImportar && <UltimasImportaciones importaciones={kpis.importaciones} />}
    </div>
  );
}
