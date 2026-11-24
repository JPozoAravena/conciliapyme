import { FileText } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';

/** Empty state for a filtered invoice list, with a way back to the full list. */
export function FacturasVacio({ base, conFiltros }: { base: string; conFiltros: boolean }) {
  return (
    <EmptyState
      icon={FileText}
      title={conFiltros ? 'No hay facturas con estos filtros' : 'Aún no hay facturas'}
      description={
        conFiltros ? 'Prueba con otros criterios o quita los filtros.' : undefined
      }
      action={
        conFiltros ? (
          <Button asChild variant="secondary">
            <Link href={base}>Limpiar filtros</Link>
          </Button>
        ) : undefined
      }
    />
  );
}
