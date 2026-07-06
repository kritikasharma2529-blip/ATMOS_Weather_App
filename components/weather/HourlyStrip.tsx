'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CloudRain } from 'lucide-react';
import { HourlyForecastItem } from '@/types/weather';
import { useAtmosStore } from '@/lib/store/useAtmosStore';
import { formatTime12h, convertTemp } from '@/lib/utils';
import WeatherIcon from './WeatherIcon';
import GlassCard from '../ui/GlassCard';

interface HourlyStripProps {
  hourly: HourlyForecastItem[];
}

export default function HourlyStrip({ hourly }: HourlyStripProps) {
  const units = useAtmosStore((state) => state.settings.units);

  return (
    <GlassCard className="p-6 w-full" delay={0.15}>
      <h2 className="text-lg font-semibold text-white tracking-wide mb-4">Hourly Forecast</h2>
      
      {/* Horizontal scroll container */}
      <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar scroll-smooth snap-x">
        {hourly.slice(0, 24).map((item, index) => {
          const isNow = index === 0;
          const displayTime = isNow
            ? 'Now'
            : units === 'imperial'
            ? formatTime12h(item.time)
            : item.time;

          const tempDisplay = convertTemp(item.temp, units);

          return (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05, y: -2 }}
              className={`
                flex flex-col items-center justify-between
                min-w-[76px] py-4 px-2 rounded-2xl snap-align-start
                transition-all duration-300 border
                ${
                  isNow
                    ? 'bg-white/20 border-white/20 shadow-lg text-white font-semibold'
                    : 'bg-white/5 border-white/5 text-white/80 hover:bg-white/10'
                }
              `}
            >
              {/* Time */}
              <span className="text-xs tracking-tight">{displayTime}</span>

              {/* Icon */}
              <div className="my-3">
                <WeatherIcon conditionKey={item.icon} size={28} />
              </div>

              {/* Temperature */}
              <span className="text-sm font-semibold tabular-nums">{tempDisplay}°</span>

              {/* Precipitation Chance */}
              <div className="h-4 flex items-center justify-center mt-1">
                {item.precip_chance > 0 ? (
                  <span className="text-[10px] text-cyan-400 flex items-center gap-0.5 font-medium">
                    <CloudRain className="w-2.5 h-2.5" />
                    {item.precip_chance}%
                  </span>
                ) : (
                  <span className="text-[10px] text-transparent">-</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </GlassCard>
  );
}
