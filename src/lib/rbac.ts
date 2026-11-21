export type Role = 'CONTADOR' | 'DUENO' | 'ADMIN';

const permisos = {
  'cliente:gestionar': ['CONTADOR', 'ADMIN'],
  'cartola:importar': ['CONTADOR', 'ADMIN'],
  'conciliacion:confirmar': ['CONTADOR', 'ADMIN'],
  'auditoria:ver': ['DUENO', 'ADMIN'],
} as const;

export type Accion = keyof typeof permisos;

export function puede(role: Role, accion: Accion): boolean {
  return (permisos[accion] as readonly Role[]).includes(role);
}