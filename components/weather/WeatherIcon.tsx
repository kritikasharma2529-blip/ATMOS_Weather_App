'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Cloud, CloudRain, CloudLightning, Snowflake, CloudFog, LucideProps } from 'lucide-react';
import { WeatherConditionKey } from '@/lib/constants';

interface WeatherIconProps {
  conditionKey: string;
  className?: string;
  size?: number;
}

export default function WeatherIcon({ conditionKey, className = '', size = 24 }: WeatherIconProps) {
  const iconProps: LucideProps = {
    size,
    className: 'stroke-[1.75]',
  };

  // Select animated wrappers based on weather state
  switch (conditionKey as WeatherConditionKey) {
    case 'clear-day':
      return (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className={`text-amber-400 drop-shadow-[0_2px_8px_rgba(245,158,11,0.4)] ${className}`}
        >
          <Sun {...iconProps} />
        </motion.div>
      );

    case 'clear-night':
      return (
        <motion.div
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className={`text-indigo-200 drop-shadow-[0_2px_8px_rgba(199,210,254,0.3)] ${className}`}
        >
          <Moon {...iconProps} />
        </motion.div>
      );

    case 'cloudy':
      return (
        <motion.div
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className={`text-slate-300 drop-shadow-[0_2px_4px_rgba(255,255,255,0.1)] ${className}`}
        >
          <Cloud {...iconProps} />
        </motion.div>
      );

    case 'rain':
      return (
        <motion.div
          animate={{ y: [0, 1.5, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className={`text-cyan-400 drop-shadow-[0_2px_6px_rgba(34,211,238,0.3)] ${className}`}
        >
          <CloudRain {...iconProps} />
        </motion.div>
      );

    case 'thunderstorm':
      return (
        <motion.div
          animate={{
            scale: [1, 1.02, 0.98, 1.02, 1],
            opacity: [1, 0.9, 1, 0.85, 1],
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className={`text-yellow-400 drop-shadow-[0_2px_8px_rgba(234,179,8,0.4)] ${className}`}
        >
          <CloudLightning {...iconProps} />
        </motion.div>
      );

    case 'snow':
      return (
        <motion.div
          animate={{ rotate: [0, 15, -15, 0], y: [0, -1, 1, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className={`text-blue-100 drop-shadow-[0_2px_6px_rgba(255,255,255,0.4)] ${className}`}
        >
          <Snowflake {...iconProps} />
        </motion.div>
      );

    case 'fog-haze':
      return (
        <motion.div
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className={`text-slate-400 drop-shadow-[0_2px_4px_rgba(148,163,184,0.2)] ${className}`}
        >
          <CloudFog {...iconProps} />
        </motion.div>
      );

    default:
      return (
        <div className={`text-slate-300 ${className}`}>
          <Cloud {...iconProps} />
        </div>
      );
  }
}
