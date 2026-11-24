import Link from 'next/link';
import { cn } from '@/components/ui/cn';

type BrandProps = { compact?: boolean; size?: 'md' | 'lg' };

// Two overlapping ledger cards with a check in the overlap: two records matched.
function BrandMark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-[68%]" aria-hidden="true">
      <rect x="3" y="3.5" width="11" height="11" rx="3" stroke="currentColor" strokeOpacity="0.6" strokeWidth="1.8" />
      <rect x="10" y="9.5" width="11" height="11" rx="3" fill="var(--brand-grad-b)" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12.9 15.1l2.1 2.1 3.8-4.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Brand({ compact = false, size = 'md' }: BrandProps) {
  const large = size === 'lg';
  return (
    <Link
      href="/"
      className={cn(
        'flex min-h-11 items-center rounded-md font-semibold tracking-tight',
        large ? 'gap-3 text-xl' : 'gap-2.5 text-[0.9375rem]',
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'grid shrink-0 place-items-center rounded-[28%] bg-linear-to-br from-(--brand-grad-a) to-(--brand-grad-b) text-on-brand shadow-card ring-1 ring-inset ring-white/20',
          large ? 'size-11' : 'size-8',
        )}
      >
        <BrandMark />
      </span>
      <span className={cn(compact && 'sr-only')}>
        Concilia<span className="text-brand">Pyme</span>
      </span>
    </Link>
  );
}
