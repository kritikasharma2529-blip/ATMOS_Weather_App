'use client';

import React from 'react';
import { CloudRain } from 'lucide-react';
import { WeeklyForecastItem } from '@/types/weather';
import { useAtmosStore } from '@/lib/store/useAtmosStore';
import { formatWeeklyDate, convertTemp } from '@/lib/utils';
import WeatherIcon from './WeatherIcon';
import GlassCard from '../ui/GlassCard';

interface WeeklyListProps {
  weekly: WeeklyForecastItem[];
}

export default function WeeklyList({ weekly }: WeeklyListProps) {
  const units = useAtmosStore((state) => state.settings.units);

  return (
    <GlassCard className="p-6 w-full" delay={0.2}>
      <h2 className="text-lg font-semibold text-white tracking-wide mb-4">7-Day Forecast</h2>

      <div className="flex flex-col divide-y divide-white/10">
        {weekly.map((item, index) => {
          const isToday = index === 0;
          const dayName = isToday ? 'Today' : formatWeeklyDate(item.date);
          const minTemp = convertTemp(item.temp_min, units);
          const maxTemp = convertTemp(item.temp_max, units);

          return (
            <div
              key={`${item.date}-${index}`}
              className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
            >
              {/* Day Label */}
              <div className="w-28 flex flex-col">
                <span className={`text-sm ${isToday ? 'text-cyan-400 font-semibold' : 'text-white/80 font-medium'}`}>
                  {dayName}
                </span>
              </div>

              {/* Icon & Precipitation Chance */}
              <div className="flex items-center gap-2 w-24">
                <WeatherIcon conditionKey={item.icon} size={24} />
                {item.precip_chance > 20 ? (
                  <span className="text-[10px] text-cyan-400 flex items-center gap-0.5 font-medium tabular-nums">
                    <CloudRain className="w-3 h-3" />
                    {item.precip_chance}%
                  </span>
                ) : (
                  <span className="text-[10px] text-white/30 font-light">-</span>
                )}
              </div>

              {/* Min/Max Temperature Row */}
              <div className="flex items-center justify-end gap-3 flex-1 select-text">
                <span className="text-sm font-medium text-white/50 w-8 text-right tabular-nums">{minTemp}°</span>
                
                {/* Horizontal range bar visual indicator */}
                <div className="hidden sm:block h-1.5 w-24 bg-white/10 rounded-full relative overflow-hidden">
                  <div 
                    className="absolute h-full rounded-full bg-gradient-to-r from-blue-400 to-cyan-400"
                    style={{ left: '20%', right: '15%' }} // stylized range indicator
                  />
                </div>

                <span className="text-sm font-semibold text-white w-8 text-right tabular-nums">{maxTemp}°</span>
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
