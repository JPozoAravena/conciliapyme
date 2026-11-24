import Link from 'next/link';
import { cn } from '@/components/ui/cn';

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/"
      className="flex min-h-11 items-center gap-2.5 rounded-md text-[0.9375rem] font-semibold tracking-tight"
    >
      <span
        aria-hidden="true"
        className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand text-sm font-bold tracking-normal text-on-brand shadow-card"
      >
        C
      </span>
      <span className={cn(compact && 'sr-only')}>
        Concilia<span className="text-brand">Pyme</span>
      </span>
    </Link>
  );
}
