'use client';

import { FileText, UploadCloud } from 'lucide-react';
import { useState, type ComponentProps } from 'react';
import { cn } from '@/components/ui/cn';

const kb = new Intl.NumberFormat('es-CL', { maximumFractionDigits: 1 });

type Props = Omit<ComponentProps<'input'>, 'type' | 'onChange'> & {
  onSeleccion?: () => void;
};

/**
 * Drop zone around a real <input type="file">: the input covers the zone, so click,
 * keyboard and native drag & drop all work, and the form posts without JS.
 */
export function ZonaArchivo({ onSeleccion, className, ...props }: Props) {
  const [archivo, setArchivo] = useState<{ nombre: string; bytes: number } | null>(null);
  const [arrastrando, setArrastrando] = useState(false);

  return (
    <div
      onDragEnter={() => setArrastrando(true)}
      onDragLeave={() => setArrastrando(false)}
      onDrop={() => setArrastrando(false)}
      className={cn(
        'relative flex min-h-44 flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border-strong bg-surface px-4 py-8 text-center transition-colors duration-150 hover:border-brand hover:bg-brand-soft sm:px-8 sm:py-10 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring has-[[aria-invalid=true]]:border-danger',
        arrastrando && 'border-brand bg-brand-soft',
        archivo && 'border-solid border-brand bg-brand-soft',
      )}
    >
      <input
        type="file"
        className={cn('absolute inset-0 size-full cursor-pointer opacity-0', className)}
        onChange={(e) => {
          const f = e.currentTarget.files?.[0];
          setArchivo(f ? { nombre: f.name, bytes: f.size } : null);
          onSeleccion?.();
        }}
        {...props}
      />
      {archivo ? (
        <div className="flex w-full max-w-md items-center gap-3 rounded-lg border border-border bg-surface p-3 text-left shadow-card">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-brand-soft text-brand">
            <FileText aria-hidden="true" className="size-5" />
          </span>
          <span aria-live="polite" className="flex min-w-0 flex-1 flex-col">
            <strong className="break-all font-semibold text-foreground">
              {archivo.nombre}
            </strong>
            <span className="text-sm text-muted tabular">
              {kb.format(archivo.bytes / 1024)} KB
            </span>
          </span>
          <span className="shrink-0 rounded-md border border-border px-3 py-1.5 text-sm font-semibold">
            Cambiar archivo
          </span>
        </div>
      ) : (
        <>
          <span className="flex size-12 items-center justify-center rounded-full bg-brand-soft text-brand">
            <UploadCloud aria-hidden="true" className="size-6" />
          </span>
          <p className="font-semibold">
            Arrastra tu cartola aquí o haz clic para elegirla
          </p>
          <p aria-live="polite" className="text-sm text-muted">
            Solo archivos .csv. Aún no has elegido un archivo.
          </p>
        </>
      )}
    </div>
  );
}
