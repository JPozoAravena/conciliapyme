'use client';

import { Monitor, Moon, Sun, type LucideIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';
import { cn } from '@/components/ui/cn';

const OPCIONES: { valor: string; etiqueta: string; Icono: LucideIcon }[] = [
  { valor: 'light', etiqueta: 'Claro', Icono: Sun },
  { valor: 'dark', etiqueta: 'Oscuro', Icono: Moon },
  { valor: 'system', etiqueta: 'Sistema', Icono: Monitor },
];

const sinSuscripcion = () => () => {};

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  // The stored theme is only known on the client; avoid a hydration mismatch.
  const montado = useSyncExternalStore(sinSuscripcion, () => true, () => false);
  const actual = montado ? theme : undefined;

  return (
    <div
      role="radiogroup"
      aria-label="Tema de color"
      className="inline-flex rounded-md border border-border bg-background p-0.5"
    >
      {OPCIONES.map(({ valor, etiqueta, Icono }) => {
        const activo = actual === valor;
        return (
          <button
            key={valor}
            type="button"
            role="radio"
            aria-checked={activo}
            aria-label={etiqueta}
            title={etiqueta}
            onClick={() => setTheme(valor)}
            className={cn(
              'grid size-8 place-items-center rounded-sm text-muted transition-colors duration-150 hover:text-foreground',
              activo && 'bg-surface text-foreground shadow-card',
            )}
          >
            <Icono aria-hidden="true" className="size-4" />
          </button>
        );
      })}
    </div>
  );
}
