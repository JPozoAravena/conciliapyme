import type { ComponentProps } from 'react';
import { cn } from './cn';

export const inputClass =
  'w-full min-h-11 rounded-md border border-border-strong bg-surface px-3 py-2 text-base text-foreground transition-colors duration-150 ease-out placeholder:text-muted hover:border-foreground focus-visible:border-ring focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-danger';

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return <input className={cn(inputClass, className)} {...props} />;
}

export function Select({ className, ...props }: ComponentProps<'select'>) {
  return <select className={cn(inputClass, 'pr-8', className)} {...props} />;
}
