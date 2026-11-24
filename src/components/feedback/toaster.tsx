'use client';

import { useTheme } from 'next-themes';
import type { CSSProperties } from 'react';
import { Toaster as Sonner } from 'sonner';

const ESTILO = {
  '--normal-bg': 'var(--surface-raised)',
  '--normal-text': 'var(--foreground)',
  '--normal-border': 'var(--border-strong)',
  '--border-radius': 'var(--radius-lg)',
  '--success-bg': 'var(--ok-soft)',
  '--success-border': 'var(--ok-border)',
  '--success-text': 'var(--ok-text)',
  '--error-bg': 'var(--danger-soft)',
  '--error-border': 'var(--danger-border)',
  '--error-text': 'var(--danger-text)',
  boxShadow: 'var(--shadow-lg)',
} as CSSProperties;

export function Toaster() {
  const { resolvedTheme } = useTheme();
  return (
    <Sonner
      position="bottom-right"
      mobileOffset={16}
      theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
      style={ESTILO}
    />
  );
}
