'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Tooltip } from '@/components/ui/tooltip';
import { cn } from '@/components/ui/cn';
import { NAV_ITEMS, isActive, type NavItem } from './nav-config';

type NavListProps = {
  items: NavItem[];
  /** Icon-only mode (desktop sidebar); names stay available to assistive tech. */
  collapsed?: boolean;
  onNavigate?: () => void;
};

export function NavList({ items, collapsed = false, onNavigate }: NavListProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="Principal">
      <ul className="flex flex-col gap-0.5">
        {items.map(({ href, label }) => {
          const Icon = NAV_ITEMS.find((i) => i.href === href)?.Icon;
          const active = isActive(pathname, href);
          const link = (
            <Link
              href={href}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'relative flex min-h-11 items-center gap-3 rounded-md px-3 text-[0.9375rem] font-medium text-muted transition-colors duration-150 hover:bg-background hover:text-foreground lg:min-h-10',
                active &&
                  'bg-brand-soft font-semibold text-brand hover:bg-brand-soft hover:text-brand',
                collapsed && 'justify-center px-0',
              )}
            >
              {active && (
                <span
                  aria-hidden="true"
                  className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-brand"
                />
              )}
              {Icon && <Icon aria-hidden="true" className="size-[1.125rem] shrink-0" />}
              <span className={cn('truncate', collapsed && 'sr-only')}>{label}</span>
            </Link>
          );
          return (
            <li key={href}>
              {collapsed ? (
                <Tooltip content={label} side="right">
                  {link}
                </Tooltip>
              ) : (
                link
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
