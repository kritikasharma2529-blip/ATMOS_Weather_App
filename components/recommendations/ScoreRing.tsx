'use client';

import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../ui/GlassCard';

interface ScoreRingProps {
  score: number;
}

export default function ScoreRing({ score }: ScoreRingProps) {
  const radius = 60;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getScoreColor = (val: number) => {
    if (val >= 75) return '#4ade80'; // Success green
    if (val >= 45) return '#fb923c'; // Moderate orange
    return '#ff6b6b'; // Alert red
  };

  const getScoreDescription = (val: number) => {
    if (val >= 75) return 'Excellent day for outdoor plans!';
    if (val >= 45) return 'Fair conditions, plan with minor checks.';
    return 'Unfavorable weather, stick to indoors.';
  };

  return (
    <GlassCard className="p-6 flex flex-col items-center justify-center min-h-[220px]" delay={0.2}>
      <h2 className="text-sm font-semibold text-white/50 tracking-wider uppercase mb-4 text-center">
        Weather Score
      </h2>

      <div className="relative flex items-center justify-center">
        {/* SVG Circular Progress Meter */}
        <svg className="w-36 h-36 transform -rotate-90">
          {/* Background track circle */}
          <circle
            cx="72"
            cy="72"
            r={radius}
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Active progress track circle */}
          <motion.circle
            cx="72"
            cy="72"
            r={radius}
            stroke={getScoreColor(score)}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            strokeLinecap="round"
            className="transition-all duration-300"
          />
        </svg>
        
        {/* Core Score Number text overlay */}
        <div className="absolute flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-extrabold text-white tracking-tight tabular-nums"
          >
            {score}
          </motion.span>
          <span className="text-[10px] text-white/40 uppercase tracking-widest mt-0.5">Rating</span>
        </div>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-xs text-white/70 text-center font-medium mt-4 select-text"
      >
        {getScoreDescription(score)}
      </motion.p>
    </GlassCard>
  );
}
