'use client';

import { cloneElement, isValidElement, useId, type ReactElement } from 'react';
import { CircleAlert } from 'lucide-react';
import { cn } from './cn';

type ControlProps = {
  id?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
};

type FieldProps = {
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  children: ReactElement<ControlProps>;
};

/** Wires label, hint and inline error to a single form control via ids. */
export function Field({ label, hint, error, className, children }: FieldProps) {
  const baseId = useId();
  const id = children.props.id ?? `${baseId}-control`;
  const hintId = hint ? `${baseId}-hint` : undefined;
  const errorId = error ? `${baseId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  const control = isValidElement(children)
    ? cloneElement(children, {
        id,
        'aria-describedby': describedBy,
        'aria-invalid': error ? true : undefined,
      })
    : children;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      {control}
      {hint && (
        <p id={hintId} className="text-[0.8125rem] text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p
          id={errorId}
          className="flex items-center gap-1 text-[0.8125rem] font-medium text-danger-text"
        >
          <CircleAlert aria-hidden="true" className="size-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
