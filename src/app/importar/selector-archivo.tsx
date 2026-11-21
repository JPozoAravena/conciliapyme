'use client';

import { useState } from 'react';
import { Campo } from '@/app/_components/campo';

export function SelectorArchivo() {
  const [nombre, setNombre] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-2">
      <Campo
        id="archivo"
        etiqueta="Archivo CSV"
        type="file"
        accept=".csv,text/csv"
        required
        ayuda="Máximo 512 KB y 5.000 movimientos."
        onChange={(e) => setNombre(e.currentTarget.files?.[0]?.name ?? null)}
        className="cursor-pointer border-dashed p-2 file:mr-3 file:min-h-9 file:cursor-pointer file:rounded-md file:border-0 file:bg-[var(--brand)] file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-[var(--on-brand)] hover:file:bg-[var(--brand-hover)]"
      />
      <p aria-live="polite" className="texto-suave">
        {nombre ? (
          <>
            Seleccionado:{' '}
            <strong className="break-all font-semibold text-[var(--foreground)]">
              {nombre}
            </strong>
          </>
        ) : (
          'Aún no has elegido un archivo.'
        )}
      </p>
    </div>
  );
}
