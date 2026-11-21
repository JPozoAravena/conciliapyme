import { describe, expect, it } from 'vitest';
import { puede } from '@/lib/rbac';

describe('puede', () => {
  it('el contador gestiona clientes, importa cartolas y confirma conciliaciones', () => {
    expect(puede('CONTADOR', 'cliente:gestionar')).toBe(true);
    expect(puede('CONTADOR', 'cartola:importar')).toBe(true);
    expect(puede('CONTADOR', 'conciliacion:confirmar')).toBe(true);
  });
  it('el contador no ve la auditoría', () => {
    expect(puede('CONTADOR', 'auditoria:ver')).toBe(false);
  });
  it('el dueño ve la auditoría pero no confirma conciliaciones', () => {
    expect(puede('DUENO', 'auditoria:ver')).toBe(true);
    expect(puede('DUENO', 'conciliacion:confirmar')).toBe(false);
    expect(puede('DUENO', 'cliente:gestionar')).toBe(false);
  });
  it('el administrador puede todo', () => {
    expect(puede('ADMIN', 'cliente:gestionar')).toBe(true);
    expect(puede('ADMIN', 'cartola:importar')).toBe(true);
    expect(puede('ADMIN', 'conciliacion:confirmar')).toBe(true);
    expect(puede('ADMIN', 'auditoria:ver')).toBe(true);
  });
});