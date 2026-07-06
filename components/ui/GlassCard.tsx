'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
  delay?: number;
  onClick?: () => void;
}

export default function GlassCard({
  children,
  className = '',
  interactive = false,
  delay = 0,
  onClick,
}: GlassCardProps) {
  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: 'easeOut' as const,
        delay,
      },
    },
  };

  const baseClasses = `
    relative
    overflow-hidden
    rounded-[24px]
    border
    border-white/10
    bg-white/10
    backdrop-blur-xl
    shadow-[0_8px_32px_0_rgba(0,0,0,0.08)]
    transition-all
    duration-300
    ${interactive ? 'cursor-pointer interactive-glow' : 'interactive-glow'}
    ${className}
  `;

  if (interactive) {
    return (
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={baseClasses}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      onClick={onClick}
      className={baseClasses}
    >
      {children}
    </motion.div>
  );
}
