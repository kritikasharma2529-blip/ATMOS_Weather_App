'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

/**
 * PageTransition — wraps every page with a fade + slight upward slide.
 * Uses `pathname` as key so AnimatePresence re-mounts on route change.
 */
export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
        style={{ willChange: 'opacity, transform' }}
        className="flex flex-col flex-1 w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
