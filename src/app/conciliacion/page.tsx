import { Inbox } from 'lucide-react';
import Link from 'next/link';
import { Aviso } from '@/app/_components/aviso';
import { requerirSesion } from '@/app/_lib/autorizacion';
import { avisoDesdeUrl } from '@/components/feedback/mensajes';
import { UrlToast } from '@/components/feedback/url-toast';
import { MovimientoSugerencias } from '@/components/conciliacion/movimiento-sugerencias';
import {
  MENSAJE_SOLO_LECTURA,
  SOLO_LECTURA_ID,
} from '@/components/conciliacion/solo-lectura';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { sugerir } from '@/lib/conciliacion/sugerir';
import { prisma } from '@/lib/db';
import { puede } from '@/lib/rbac';

const MAX_MOVIMIENTOS = 100;

export default async function ConciliacionPage({
  searchParams,
}: PageProps<'/conciliacion'>) {
  const session = await requerirSesion();
  const params = await searchParams;
  const aviso = avisoDesdeUrl(params);
  const puedeConfirmar = puede(session.user.role, 'conciliacion:confirmar');
  const puedeImportar = puede(session.user.role, 'cartola:importar');
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
  const conSugerencias = movimientos.map((m) => ({
    movimiento: m,
    sugerencias: sugerir(m, facturas),
  }));
  const totalConSugerencia = conSugerencias.filter(
    (c) => c.sugerencias.length > 0,
  ).length;

  return (
    <div className="contenedor flex flex-col gap-6">
      <div>
        <h1 className="titulo">Conciliación</h1>
        <p className="texto-suave mt-1">
          Abonos sin conciliar y las facturas pendientes que podrían
          corresponderles. El sistema solo sugiere: una persona confirma.
        </p>
        {movimientos.length > 0 && (
          <p className="mt-2 text-sm font-medium tabular">
            {movimientos.length}{' '}
            {movimientos.length === 1 ? 'abono por conciliar' : 'abonos por conciliar'}
            {' · '}
            {totalConSugerencia}{' '}
            {totalConSugerencia === 1 ? 'con sugerencia' : 'con sugerencias'}
          </p>
        )}
      </div>
      <Aviso aviso={aviso} />
      <UrlToast aviso={aviso} />
      {!puedeConfirmar && (
        <p id={SOLO_LECTURA_ID} className="texto-suave">
          {MENSAJE_SOLO_LECTURA}.
        </p>
      )}

      {movimientos.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No hay abonos pendientes de conciliar"
          description={
            puedeImportar
              ? 'Importa una cartola para ver nuevas sugerencias.'
              : 'Cuando se importe una cartola verás aquí las sugerencias.'
          }
          action={
            <Button asChild variant="secondary">
              <Link href={puedeImportar ? '/importar' : '/facturas'}>
                {puedeImportar ? 'Importar cartola' : 'Ver facturas'}
              </Link>
            </Button>
          }
        />
      ) : (
        <ul className="flex flex-col gap-6">
          {conSugerencias.map(({ movimiento, sugerencias }) => (
            <MovimientoSugerencias
              key={movimiento.id}
              movimiento={movimiento}
              sugerencias={sugerencias}
              facturas={porId}
              puedeConfirmar={puedeConfirmar}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
