import { LogOut } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/components/ui/cn';

type UserPanelProps = {
  email: string;
  roleLabel: string;
  signOutAction: () => Promise<void>;
  showTheme?: boolean;
  /** Vertical layout for the mobile drawer footer. */
  stacked?: boolean;
  className?: string;
};

export function UserPanel({
  email,
  roleLabel,
  signOutAction,
  showTheme = true,
  stacked = false,
  className,
}: UserPanelProps) {
  const identity = (
    <div className="flex min-w-0 items-center gap-2">
      <span
        className={cn('min-w-0 truncate text-sm text-muted', stacked ? 'flex-1' : 'max-w-64')}
        title={email}
      >
        {email}
      </span>
      <Badge tone="muted">{roleLabel}</Badge>
    </div>
  );

  if (stacked) {
    return (
      <div className={cn('flex min-w-0 flex-col gap-3', className)}>
        {identity}
        <form action={signOutAction}>
          <Button type="submit" variant="secondary" className="w-full">
            <LogOut aria-hidden="true" />
            Cerrar sesión
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className={cn('flex min-w-0 items-center gap-2', className)}>
      {identity}
      <span aria-hidden="true" className="mx-1 h-5 w-px bg-border" />
      {showTheme && <ThemeToggle />}
      <form action={signOutAction}>
        <Button
          type="submit"
          variant="ghost"
          size="sm"
          className="text-muted hover:enabled:text-foreground"
        >
          <LogOut aria-hidden="true" />
          Cerrar sesión
        </Button>
      </form>
    </div>
  );
}
