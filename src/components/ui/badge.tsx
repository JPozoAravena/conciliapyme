import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from './cn';

export const badgeVariants = cva(
  'inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[0.8125rem] font-semibold [&_svg]:size-3.5 [&_svg]:shrink-0',
  {
    variants: {
      tone: {
        neutral: 'border-transparent bg-brand-soft text-brand',
        success: 'border-ok-border bg-ok-soft text-ok-text',
        warning: 'border-warn-border bg-warn-soft text-warn-text',
        danger: 'border-danger-border bg-danger-soft text-danger-text',
        info: 'border-info-border bg-info-soft text-info-text',
        muted: 'border-border bg-background text-muted',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
);

type BadgeProps = ComponentProps<'span'> & VariantProps<typeof badgeVariants>;

/** Always pair the tone with visible text (and ideally an icon): never color alone. */
export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
