'use client';

import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';
import { MENSAJE_SOLO_LECTURA, SOLO_LECTURA_ID } from './solo-lectura';

/** Disabled confirm button for read-only roles. aria-disabled keeps it focusable for the tooltip. */
export function ConfirmarBloqueado({ etiqueta }: { etiqueta: string }) {
  return (
    <Tooltip content={MENSAJE_SOLO_LECTURA}>
      <Button
        size="sm"
        aria-label={etiqueta}
        aria-disabled="true"
        aria-describedby={SOLO_LECTURA_ID}
        onClick={(e) => e.preventDefault()}
      >
        Confirmar
      </Button>
    </Tooltip>
  );
}
