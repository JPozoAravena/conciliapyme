'use client';

import { motion } from 'motion/react';
import type { ReactNode } from 'react';

type FadeInProps = { children: ReactNode; index?: number; className?: string };

/** Short opacity/translate entrance, staggered by index. */
export function FadeIn({ children, index = 0, className }: FadeInProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
