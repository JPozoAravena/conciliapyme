import { ArrowRight, CircleCheck, Scale } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';

type Props = { sinConciliar: number; puedeImportar: boolean };

function Icono({ children }: { children: ReactNode }) {
  return (
    <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
      {children}
    </span>
  );
}

/** Suggests the single most useful next step for the current data and role. */
export function AccionSiguiente({ sinConciliar, puedeImportar }: Props) {
  if (sinConciliar > 0) {
    return (
      <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Icono>
            <Scale aria-hidden="true" className="size-5" />
          </Icono>
          <div>
            <CardTitle>Siguiente paso</CardTitle>
            <CardDescription>
              {sinConciliar} {sinConciliar === 1 ? 'movimiento espera' : 'movimientos esperan'} una
              factura.
            </CardDescription>
          </div>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/conciliacion">
            Revisar {sinConciliar} {sinConciliar === 1 ? 'movimiento' : 'movimientos'}
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </Card>
    );
  }
  return (
    <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <Icono>
          <CircleCheck aria-hidden="true" className="size-5" />
        </Icono>
        <div>
          <CardTitle>Todo al día</CardTitle>
          <CardDescription>No hay movimientos pendientes de conciliar.</CardDescription>
        </div>
      </div>
      {puedeImportar && (
        <Button asChild variant="secondary" className="w-full sm:w-auto">
          <Link href="/importar">Importar cartola</Link>
        </Button>
      )}
    </Card>
  );
}
