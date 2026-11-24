'use client';

import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { SubmitButton } from '@/components/ui/submit-button';

type Props = {
  /** Server action already bound to the movement and invoice ids. */
  action: () => Promise<void>;
  /** Accessible name of the trigger: "Confirmar factura {folio} para {descripcion}". */
  etiqueta: string;
  /** Summary of the movement and invoice, rendered on the server. */
  children: ReactNode;
};

export function ConfirmarDialog({ action, etiqueta, children }: Props) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" aria-label={etiqueta}>
          Confirmar
        </Button>
      </DialogTrigger>
      <DialogContent
        title="Confirmar conciliación"
        description="Revisa que el movimiento corresponda a la factura. Esta acción queda registrada."
      >
        <form action={action}>
          {children}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary">Cancelar</Button>
            </DialogClose>
            <SubmitButton pendingText="Confirmando…">
              Confirmar conciliación
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
