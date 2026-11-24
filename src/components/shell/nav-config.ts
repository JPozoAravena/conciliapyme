import {
  GitCompareArrows,
  LayoutDashboard,
  ScrollText,
  Upload,
  Users,
  type LucideIcon,
} from 'lucide-react';
import type { Accion } from '@/lib/rbac';

/** Cookie that persists the desktop sidebar state so the server can render it. */
export const SIDEBAR_COOKIE = 'sidebar-collapsed';

export type NavItemConfig = {
  href: string;
  label: string;
  Icon: LucideIcon;
  /** Permission required to see the item; omitted when open to every role. */
  permiso?: Accion;
};

export const NAV_ITEMS: NavItemConfig[] = [
  { href: '/', label: 'Inicio', Icon: LayoutDashboard },
  { href: '/clientes', label: 'Clientes', Icon: Users },
  { href: '/importar', label: 'Importar cartola', Icon: Upload, permiso: 'cartola:importar' },
  { href: '/conciliacion', label: 'Conciliación', Icon: GitCompareArrows },
  { href: '/auditoria', label: 'Auditoría', Icon: ScrollText, permiso: 'auditoria:ver' },
];

/** Serializable subset passed from the server shell to client components. */
export type NavItem = { href: string; label: string };

export function isActive(pathname: string, href: string): boolean {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
}
