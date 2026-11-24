'use client';

import { Tooltip as T } from 'radix-ui';
import type { ReactNode } from 'react';

type TooltipProps = {
  content: ReactNode;
  children: ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
};

/**
 * Supplementary hint only. A disabled control must also expose its reason as
 * visible or aria-describedby text: tooltips are not reachable on touch.
 */
export function Tooltip({ content, children, side = 'top' }: TooltipProps) {
  return (
    <T.Provider delayDuration={200}>
      <T.Root>
        <T.Trigger asChild>{children}</T.Trigger>
        <T.Portal>
          <T.Content
            side={side}
            sideOffset={6}
            className="z-50 max-w-xs rounded-md bg-foreground px-2.5 py-1.5 text-[0.8125rem] text-background shadow-overlay data-[state=delayed-open]:animate-[fade-in_120ms_ease-out]"
          >
            {content}
            <T.Arrow className="fill-foreground" />
          </T.Content>
        </T.Portal>
      </T.Root>
    </T.Provider>
  );
}
