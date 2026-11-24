'use client';

import { Loader2 } from 'lucide-react';
import { useFormStatus } from 'react-dom';
import { Button } from './button';

type SubmitButtonProps = {
  children: string;
  pendingText: string;
  className?: string;
};

/** Submit button that shows a pending state and blocks double submit. Must live inside a <form>. */
export function SubmitButton({ children, pendingText, className }: SubmitButtonProps) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className={className}>
      {pending && <Loader2 aria-hidden="true" className="animate-spin" />}
      {pending ? pendingText : children}
    </Button>
  );
}
