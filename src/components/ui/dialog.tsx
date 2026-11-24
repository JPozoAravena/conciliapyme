'use client';

import { Dialog as D } from 'radix-ui';
import { X } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from './cn';

export const Dialog = D.Root;
export const DialogTrigger = D.Trigger;
export const DialogClose = D.Close;

type DialogContentProps = ComponentProps<typeof D.Content> & {
  title: string;
  description?: ReactNode;
};

export function DialogContent({
  className,
  title,
  description,
  children,
  ...props
}: DialogContentProps) {
  return (
    <D.Portal>
      <D.Overlay className="fixed inset-0 z-40 bg-overlay data-[state=open]:animate-[fade-in_150ms_ease-out]" />
      <D.Content
        className={cn(
          'fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-surface-raised p-6 shadow-overlay focus-visible:outline-none data-[state=open]:animate-[pop-in_180ms_ease-out]',
          className,
        )}
        {...props}
      >
        <D.Title className="pr-8 text-lg font-semibold tracking-tight">{title}</D.Title>
        {description ? (
          <D.Description className="mt-1.5 text-sm text-muted">{description}</D.Description>
        ) : (
          <D.Description className="sr-only">{title}</D.Description>
        )}
        <div className="mt-5">{children}</div>
        <D.Close
          aria-label="Cerrar"
          className="absolute right-3 top-3 grid size-9 place-items-center rounded-md text-muted hover:bg-brand-soft hover:text-foreground"
        >
          <X aria-hidden="true" className="size-4" />
        </D.Close>
      </D.Content>
    </D.Portal>
  );
}

export function DialogFooter({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
      {...props}
    />
  );
}
