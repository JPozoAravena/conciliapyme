'use client';

import { RotateCw, TriangleAlert } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

/** Shared fallback for route error boundaries. Never renders the error message. */
export function RouteError({ reset }: { reset: () => void }) {
  return (
    <div className="contenedor flex flex-1 items-center justify-center">
      <div className="flex w-full max-w-md animate-[fade-in_200ms_ease-out] flex-col items-center gap-4 rounded-lg border border-dashed border-border bg-surface px-6 py-10 text-center motion-reduce:animate-none">
        <span className="grid size-11 place-items-center rounded-full bg-warn-soft text-warn-text">
          <TriangleAlert aria-hidden="true" className="size-5" />
        </span>
        <div className="flex flex-col gap-1">
          <h1 className="text-lg font-semibold tracking-tight">Algo salió mal</h1>
          <p className="text-sm text-muted">
            No pudimos cargar esta sección. Intenta de nuevo; si persiste, recarga la página.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={reset}>
            <RotateCw aria-hidden="true" />
            Reintentar
          </Button>
          <Button asChild variant="secondary">
            <Link href="/">Ir al inicio</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
