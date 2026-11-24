'use client';

import { Menu, X } from 'lucide-react';
import { Dialog } from 'radix-ui';
import { useState, type ReactNode } from 'react';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { Button } from '@/components/ui/button';
import { Brand } from './brand';
import { NavList } from './nav-list';
import type { NavItem } from './nav-config';

type MobileNavProps = { items: NavItem[]; footer: ReactNode };

export function MobileNav({ items, footer }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between gap-2 border-b border-border bg-surface pl-4 pr-2 lg:hidden">
        <Brand />
        <div className="flex items-center">
          <ThemeToggle />
          <Dialog.Trigger asChild>
            <Button variant="ghost" size="icon" aria-label="Abrir menú">
              <Menu aria-hidden="true" />
            </Button>
          </Dialog.Trigger>
        </div>
      </div>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-overlay data-[state=closed]:animate-[fade-out_150ms_ease-in_forwards] data-[state=open]:animate-[fade-in_200ms_ease-out] motion-reduce:data-[state=closed]:animate-none motion-reduce:data-[state=open]:animate-none" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-y-0 left-0 z-50 flex w-[min(20rem,85vw)] flex-col border-r border-border bg-surface shadow-overlay data-[state=closed]:animate-[slide-out-left_150ms_ease-in_forwards] data-[state=open]:animate-[slide-in-left_220ms_ease-out] motion-reduce:data-[state=closed]:animate-none motion-reduce:data-[state=open]:animate-none"
        >
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-border pl-4 pr-2">
            <Dialog.Title className="text-[0.9375rem] font-semibold tracking-tight">
              Menú
            </Dialog.Title>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon" aria-label="Cerrar menú">
                <X aria-hidden="true" />
              </Button>
            </Dialog.Close>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            <NavList items={items} onNavigate={() => setOpen(false)} />
          </div>
          <div className="border-t border-border bg-background p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            {footer}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
