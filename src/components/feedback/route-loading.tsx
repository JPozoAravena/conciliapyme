import { Skeleton } from '@/components/ui/skeleton';

/** Generic page skeleton: page header, summary cards and a table-like block. */
export function RouteLoading({ rows = 3 }: { rows?: number }) {
  return (
    <div className="contenedor flex flex-col gap-6" aria-busy="true">
      <span className="sr-only">Cargando…</span>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full max-w-sm" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div
            key={i}
            className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 shadow-card"
          >
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-28" />
          </div>
        ))}
      </div>
      <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-card">
        <div className="border-b border-border px-4 py-3">
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="divide-y divide-border">
          {Array.from({ length: Math.max(rows, 3) }, (_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3.5">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="hidden h-4 w-16 sm:block" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
