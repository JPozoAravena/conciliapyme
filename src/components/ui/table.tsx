import type { ComponentProps } from 'react';
import { cn } from './cn';

type TableProps = ComponentProps<'table'> & {
  /** Accessible name for the scroll region (required: it is keyboard-focusable). */
  label: string;
};

export function Table({ className, label, ...props }: TableProps) {
  return (
    <div
      role="region"
      aria-label={label}
      tabIndex={0}
      className="overflow-x-auto rounded-lg border border-border bg-surface"
    >
      <table
        className={cn('w-full border-collapse text-left text-[0.9375rem]', className)}
        {...props}
      />
    </div>
  );
}

export function THead({ className, ...props }: ComponentProps<'thead'>) {
  return <thead className={cn('bg-background', className)} {...props} />;
}

export function TR({ className, ...props }: ComponentProps<'tr'>) {
  return (
    <tr
      className={cn(
        'border-b border-border last:border-b-0 [tbody_&]:hover:bg-brand-soft',
        className,
      )}
      {...props}
    />
  );
}

type CellProps = { numeric?: boolean };

export function TH({
  className,
  numeric,
  scope = 'col',
  ...props
}: ComponentProps<'th'> & CellProps) {
  return (
    <th
      scope={scope}
      className={cn(
        'whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted',
        numeric && 'text-right',
        className,
      )}
      {...props}
    />
  );
}

export function TD({ className, numeric, ...props }: ComponentProps<'td'> & CellProps) {
  return (
    <td
      className={cn(
        'px-4 py-3.5',
        numeric && 'whitespace-nowrap text-right tabular',
        className,
      )}
      {...props}
    />
  );
}
