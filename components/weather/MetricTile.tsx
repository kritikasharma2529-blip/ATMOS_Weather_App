'use client';

import React from 'react';
import { Wind, Droplets, Sun, Sunrise, Sunset, Shield, Wind as WindIcon, AlertCircle } from 'lucide-react';
import { AQIData, UVData, SunData } from '@/types/weather';
import { useAtmosStore } from '@/lib/store/useAtmosStore';
import { formatWindSpeed, formatTime12h } from '@/lib/utils';
import GlassCard from '../ui/GlassCard';

// 1. AQI Tile Component
export function AqiTile({ aqi }: { aqi: AQIData }) {
  const getAqiColor = (val: number) => {
    if (val === 1) return 'text-green-400';
    if (val === 2) return 'text-yellow-300';
    if (val === 3) return 'text-orange-400';
    return 'text-rose-400';
  };

  const getAqiAdvice = (val: number) => {
    switch (val) {
      case 1: return 'Air quality is excellent. Great day for outdoor activities!';
      case 2: return 'Moderate air quality. Safe for most people, minimal risks.';
      case 3: return 'Sensitive individuals may feel slight discomfort. Consider lighter activities.';
      case 4: return 'Unhealthy air. Active kids/adults should limit prolonged exertion.';
      default: return 'Hazardous conditions. Keep windows closed, avoid outdoor efforts, wear a mask.';
    }
  };

  return (
    <GlassCard className="p-6 flex flex-col justify-between min-h-[160px]" delay={0.25}>
      <div className="flex items-center justify-between text-white/50 text-xs font-semibold tracking-wider uppercase">
        <span>Air Quality</span>
        <Wind className="w-4 h-4" />
      </div>
      
      <div className="mt-2">
        <span className={`text-3xl font-bold ${getAqiColor(aqi.value)}`}>
          Index {aqi.value}
        </span>
        <p className="text-sm font-semibold text-white mt-1">{aqi.category}</p>
      </div>

      <p className="text-xs text-white/60 leading-relaxed mt-2 select-text">
        {getAqiAdvice(aqi.value)}
      </p>
    </GlassCard>
  );
}

// 2. UV Index Tile Component
export function UvTile({ uv }: { uv: UVData }) {
  const getUvColor = (val: number) => {
    if (val <= 2) return 'text-green-400';
    if (val <= 5) return 'text-yellow-300';
    if (val <= 7) return 'text-orange-400';
    return 'text-rose-400';
  };

  const getUvAdvice = (val: number) => {
    if (val <= 2) return 'Low risk. Standard sunscreen if outdoors long.';
    if (val <= 5) return 'Apply sunscreen (SPF 15+) and wear sunglasses.';
    if (val <= 7) return 'SPF 30+ needed. Seek shade between 11 AM - 3 PM.';
    return 'Extreme risk. Wear protective hat, SPF 50+, avoid direct sun.';
  };

  return (
    <GlassCard className="p-6 flex flex-col justify-between min-h-[160px]" delay={0.3}>
      <div className="flex items-center justify-between text-white/50 text-xs font-semibold tracking-wider uppercase">
        <span>UV Index</span>
        <Shield className="w-4 h-4" />
      </div>

      <div className="mt-2">
        <span className={`text-3xl font-bold ${getUvColor(uv.value)}`}>
          {uv.value}
        </span>
        <p className="text-sm font-semibold text-white mt-1">{uv.category}</p>
      </div>

      <p className="text-xs text-white/60 leading-relaxed mt-2 select-text">
        {getUvAdvice(uv.value)}
      </p>
    </GlassCard>
  );
}

// 3. Sunrise & Sunset Tile Component (with progress bar)
export function SunTile({ sun }: { sun: SunData }) {
  const units = useAtmosStore((state) => state.settings.units);

  const riseTime = units === 'imperial' ? formatTime12h(sun.sunrise) : sun.sunrise;
  const setTime = units === 'imperial' ? formatTime12h(sun.sunset) : sun.sunset;

  // Calculate day length and progress bar
  const getSunProgress = () => {
    try {
      const now = new Date();
      const currentMin = now.getHours() * 60 + now.getMinutes();
      
      const [riseH, riseM] = sun.sunrise.split(':').map(Number);
      const [setH, setM] = sun.sunset.split(':').map(Number);
      
      const riseMin = riseH * 60 + riseM;
      const setMin = setH * 60 + setM;

      if (currentMin < riseMin) return { progress: 0, state: 'Before Sunrise' };
      if (currentMin > setMin) return { progress: 100, state: 'After Sunset' };

      const totalDay = setMin - riseMin;
      const elapsed = currentMin - riseMin;
      const progress = Math.round((elapsed / totalDay) * 100);

      return { progress, state: 'Daylight Progress' };
    } catch {
      return { progress: 50, state: 'Daytime' };
    }
  };

  const { progress, state } = getSunProgress();

  return (
    <GlassCard className="p-6 flex flex-col justify-between min-h-[160px]" delay={0.35}>
      <div className="flex items-center justify-between text-white/50 text-xs font-semibold tracking-wider uppercase">
        <span>Sun Schedule</span>
        <Sun className="w-4 h-4" />
      </div>

      <div className="grid grid-cols-2 gap-4 mt-2">
        <div className="flex items-center gap-2">
          <Sunrise className="w-5 h-5 text-amber-300" />
          <div>
            <span className="text-[10px] text-white/40 block">Sunrise</span>
            <span className="text-sm font-semibold text-white">{riseTime}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Sunset className="w-5 h-5 text-indigo-400" />
          <div>
            <span className="text-[10px] text-white/40 block">Sunset</span>
            <span className="text-sm font-semibold text-white">{setTime}</span>
          </div>
        </div>
      </div>

      <div className="mt-3">
        <div className="flex justify-between items-center text-[10px] text-white/50 mb-1">
          <span>{state}</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 w-full bg-white/10 rounded-full relative overflow-hidden">
          <div
            className="absolute h-full rounded-full bg-gradient-to-r from-amber-400 to-indigo-400 progress-pulse transition-all duration-1000 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </GlassCard>
  );
}

// 4. Humidity Tile Component
export function HumidityTile({ humidity }: { humidity: number }) {
  const getHumidityState = (h: number) => {
    if (h < 30) return 'Dry (may feel parched)';
    if (h <= 60) return 'Comfortable (optimal)';
    if (h <= 80) return 'Humid (noticeable moisture)';
    return 'Sticky (highly damp/sweaty)';
  };

  return (
    <GlassCard className="p-6 flex flex-col justify-between min-h-[160px]" delay={0.4}>
      <div className="flex items-center justify-between text-white/50 text-xs font-semibold tracking-wider uppercase">
        <span>Humidity</span>
        <Droplets className="w-4 h-4 text-cyan-400" />
      </div>

      <div className="mt-2">
        <span className="text-3xl font-bold text-white tabular-nums">
          {humidity}%
        </span>
        <p className="text-sm font-semibold text-white mt-1">{getHumidityState(humidity)}</p>
      </div>

      <p className="text-xs text-white/60 leading-relaxed mt-2 select-text">
        The dew point is currently ideal for indoor/outdoor respiratory comfort.
      </p>
    </GlassCard>
  );
}

// 5. Wind Tile Component
export function WindTile({ windSpeed }: { windSpeed: number }) {
  const units = useAtmosStore((state) => state.settings.units);
  const displaySpeed = formatWindSpeed(windSpeed, units);

  const getWindState = (speedKph: number) => {
    if (speedKph < 6) return 'Calm';
    if (speedKph <= 19) return 'Gentle Breeze';
    if (speedKph <= 38) return 'Moderate Wind';
    return 'Strong Gale (Advisory)';
  };

  return (
    <GlassCard className="p-6 flex flex-col justify-between min-h-[160px]" delay={0.45}>
      <div className="flex items-center justify-between text-white/50 text-xs font-semibold tracking-wider uppercase">
        <span>Wind Speed</span>
        <WindIcon className="w-4 h-4 text-indigo-200" />
      </div>

      <div className="mt-2">
        <span className="text-3xl font-bold text-white tabular-nums">
          {displaySpeed}
        </span>
        <p className="text-sm font-semibold text-white mt-1">{getWindState(windSpeed)}</p>
      </div>

      <p className="text-xs text-white/60 leading-relaxed mt-2 select-text">
        Safe conditions for flight plans and daily highway navigation.
      </p>
    </GlassCard>
  );
}
