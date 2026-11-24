'use client';

import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/components/ui/cn';
import { Brand } from './brand';
import { NavList } from './nav-list';
import { SIDEBAR_COOKIE, type NavItem } from './nav-config';

const ONE_YEAR = 60 * 60 * 24 * 365;

type SidebarProps = { items: NavItem[]; defaultCollapsed: boolean };

export function Sidebar({ items, defaultCollapsed }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  function toggle() {
    const next = !collapsed;
    setCollapsed(next);
    document.cookie = `${SIDEBAR_COOKIE}=${next ? '1' : '0'}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
  }

  const label = collapsed ? 'Expandir menú' : 'Contraer menú';
  const Icon = collapsed ? PanelLeftOpen : PanelLeftClose;

  return (
    <aside
      id="barra-lateral"
      className={cn(
        'sticky top-0 hidden h-dvh shrink-0 flex-col overflow-hidden border-r border-border bg-surface transition-[width] duration-200 ease-out motion-reduce:transition-none lg:flex',
        collapsed ? 'w-[4.5rem]' : 'w-60',
      )}
    >
      <div
        className={cn(
          'flex h-14 shrink-0 items-center border-b border-border',
          collapsed ? 'justify-center' : 'px-4',
        )}
      >
        <Brand compact={collapsed} />
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        <NavList items={items} collapsed={collapsed} />
      </div>
      <div className="border-t border-border p-3">
        <Button
          variant="ghost"
          size={collapsed ? 'icon' : 'md'}
          className={cn(
            'h-10 min-h-10 text-muted hover:enabled:text-foreground',
            collapsed ? 'mx-auto w-10' : 'w-full justify-start px-3',
          )}
          onClick={toggle}
          aria-expanded={!collapsed}
          aria-controls="barra-lateral"
        >
          <Icon aria-hidden="true" className="size-[1.125rem]" />
          <span className={cn('font-medium', collapsed && 'sr-only')}>{label}</span>
        </Button>
      </div>
    </aside>
  );
}
