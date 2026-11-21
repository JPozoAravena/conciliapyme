import { describe, expect, it } from 'vitest';
import { limitar } from '@/lib/rate-limit';

describe('limitar', () => {
  it('permite 5 intentos y bloquea el sexto dentro de la ventana', () => {
    const t = 1_000_000;
    for (let i = 0; i < 5; i++) expect(limitar('a@demo.cl', 5, 60_000, t)).toBe(true);
    expect(limitar('a@demo.cl', 5, 60_000, t)).toBe(false);
  });
  it('vuelve a permitir cuando pasó la ventana', () => {
    const t = 2_000_000;
    for (let i = 0; i < 5; i++) limitar('b@demo.cl', 5, 60_000, t);
    expect(limitar('b@demo.cl', 5, 60_000, t)).toBe(false);
    expect(limitar('b@demo.cl', 5, 60_000, t + 60_001)).toBe(true);
  });
  it('no mezcla claves distintas', () => {
    const t = 3_000_000;
    for (let i = 0; i < 5; i++) limitar('c@demo.cl', 5, 60_000, t);
    expect(limitar('c@demo.cl', 5, 60_000, t)).toBe(false);
    expect(limitar('d@demo.cl', 5, 60_000, t)).toBe(true);
  });
});