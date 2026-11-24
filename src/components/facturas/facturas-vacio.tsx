import { FileText } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';

/** Empty state for a filtered invoice list, with a way back to the full list. */
type Props = { base: string; conFiltros: boolean; puedeGestionar: boolean };

export function FacturasVacio({ base, conFiltros, puedeGestionar }: Props) {
  return (
    <EmptyState
      icon={FileText}
      title={conFiltros ? 'No hay facturas con estos filtros' : 'Aún no hay facturas'}
      description={
        conFiltros
          ? 'Prueba con otros criterios o quita los filtros.'
          : puedeGestionar
            ? 'Las facturas se agregan desde la ficha de cada cliente.'
            : 'Cuando un contador agregue facturas aparecerán aquí.'
      }
      action={
        conFiltros ? (
          <Button asChild variant="secondary">
            <Link href={base}>Limpiar filtros</Link>
          </Button>
        ) : puedeGestionar ? (
          <Button asChild>
            <Link href="/clientes">Ir a clientes</Link>
          </Button>
        ) : undefined
      }
    />
  );
}
