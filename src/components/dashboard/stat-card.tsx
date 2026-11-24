import type { LucideIcon } from 'lucide-react';

type Props = {
  label: string;
  value: string;
  context: string;
  Icon: LucideIcon;
};

export function StatCard({ label, value, context, Icon }: Props) {
  return (
    <div className="flex min-h-36 flex-col justify-between gap-4 rounded-lg border border-border bg-surface p-5 shadow-card">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium text-muted">{label}</h2>
        <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-brand-soft text-brand">
          <Icon aria-hidden="true" className="size-[18px]" />
        </span>
      </div>
      <div>
        <p className="truncate text-3xl font-semibold tracking-tight tabular">{value}</p>
        <p className="mt-1 text-sm text-muted">{context}</p>
      </div>
    </div>
  );
}
