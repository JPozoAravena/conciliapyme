'use client';

import { motion } from 'motion/react';
import type { ReactNode } from 'react';

type RevealProps = { index: number; className?: string; children: ReactNode };

// Staggered entrance: opacity + short translateY, ease-out, ~60ms between items.
export function Reveal({ index, className, children }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut', delay: index * 0.06 }}
    >
      {children}
    </motion.div>
  );
}
