'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

/**
 * CustomCursor — a smooth, spring-interpolated glowing cursor.
 * - Renders only on non-touch (pointer: fine) devices.
 * - Hides the native cursor via CSS class on <html>.
 * - Scales up + brightens when hovering any interactive element.
 */
export default function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(true); // default true = hidden during SSR

  const rawX = useMotionValue(-100);
  const rawY = useMotionValue(-100);

  // Spring config — gives the "lagging" feel
  const springConfig = { damping: 28, stiffness: 320, mass: 0.6 };
  const x = useSpring(rawX, springConfig);
  const y = useSpring(rawY, springConfig);

  useEffect(() => {
    // Detect touch-only devices — disable cursor on them
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    setIsTouchDevice(isTouch);
    if (isTouch) return;

    // Hide native cursor globally
    document.documentElement.classList.add('custom-cursor-active');

    const INTERACTIVE_SELECTORS = [
      'a', 'button', '[role="button"]', 'input', 'textarea', 'select',
      'label', '[tabindex]', '.cursor-pointer',
    ].join(',');

    const onMove = (e: MouseEvent) => {
      rawX.set(e.clientX);
      rawY.set(e.clientY);
    };

    const onOver = (e: MouseEvent) => {
      const el = e.target as Element;
      if (el?.closest(INTERACTIVE_SELECTORS)) setIsHovering(true);
    };

    const onOut = (e: MouseEvent) => {
      const el = e.relatedTarget as Element | null;
      if (!el || !el.closest(INTERACTIVE_SELECTORS)) setIsHovering(false);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseover', onOver, { passive: true });
    document.addEventListener('mouseout', onOut, { passive: true });

    return () => {
      document.documentElement.classList.remove('custom-cursor-active');
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout', onOut);
    };
  }, [rawX, rawY]);

  if (isTouchDevice) return null;

  return (
    <>
      {/* Outer ring — slower, more lag */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full border border-cyan-400/60"
        style={{
          x,
          y,
          translateX: '-50%',
          translateY: '-50%',
          willChange: 'transform',
        }}
        animate={{
          width: isHovering ? 36 : 24,
          height: isHovering ? 36 : 24,
          opacity: isHovering ? 0.85 : 0.5,
          boxShadow: isHovering
            ? '0 0 18px 4px rgba(34,211,238,0.55), 0 0 6px 1px rgba(34,211,238,0.35)'
            : '0 0 8px 2px rgba(34,211,238,0.25)',
        }}
        transition={{ type: 'spring', damping: 22, stiffness: 280, mass: 0.5 }}
      />

      {/* Inner dot — faster, near-instant */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full bg-cyan-400"
        style={{
          x: rawX,
          y: rawY,
          translateX: '-50%',
          translateY: '-50%',
          willChange: 'transform',
        }}
        animate={{
          width: isHovering ? 6 : 5,
          height: isHovering ? 6 : 5,
          opacity: isHovering ? 1 : 0.9,
          boxShadow: isHovering
            ? '0 0 10px 3px rgba(34,211,238,0.8)'
            : '0 0 5px 1px rgba(34,211,238,0.5)',
        }}
        transition={{ duration: 0.12 }}
      />
    </>
  );
}
