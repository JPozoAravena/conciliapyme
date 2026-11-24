import { Upload } from 'lucide-react';
import Link from 'next/link';
import type { ImportacionReciente } from '@/app/_lib/dashboard-kpis';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { formatearFecha } from '@/lib/formato';

export function UltimasImportaciones({ importaciones }: { importaciones: ImportacionReciente[] }) {
  return (
    <Card aria-labelledby="ultimas-importaciones">
      <CardHeader>
        <CardTitle id="ultimas-importaciones">Últimas importaciones</CardTitle>
      </CardHeader>
      {importaciones.length === 0 ? (
        <EmptyState
          icon={Upload}
          title="Aún no importas cartolas"
          description="Sube la cartola de tu banco para empezar a conciliar."
          action={
            <Button asChild>
              <Link href="/importar">Importar cartola</Link>
            </Button>
          }
        />
      ) : (
        <ul className="-mx-2 flex flex-col divide-y divide-border">
          {importaciones.map((i) => (
            <li
              key={i.id}
              className="flex items-center justify-between gap-3 rounded-md px-2 py-3 hover:bg-brand-soft"
            >
              <div className="min-w-0">
                <p className="truncate font-medium" title={i.nombreArchivo}>
                  {i.nombreArchivo}
                </p>
                <p className="truncate text-sm text-muted tabular">
                  {formatearFecha(i.fecha)} · {i.banco} · {i.totalFilas} filas
                </p>
              </div>
              <Badge tone={i.estado === 'COMPLETA' ? 'success' : 'warning'}>
                {i.estado === 'COMPLETA' ? 'Completa' : 'Procesando'}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
