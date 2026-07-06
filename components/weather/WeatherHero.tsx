'use client';

import React from 'react';
import { Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { WeatherData } from '@/types/weather';
import { useAtmosStore } from '@/lib/store/useAtmosStore';
import { formatTemp } from '@/lib/utils';
import WeatherIcon from './WeatherIcon';
import GlassCard from '../ui/GlassCard';

interface WeatherHeroProps {
  weather: WeatherData;
  tempMin?: number;
  tempMax?: number;
}

export default function WeatherHero({ weather, tempMin, tempMax }: WeatherHeroProps) {
  const { city, country, coords, current } = weather;
  const units = useAtmosStore((state) => state.settings.units);
  const addFavorite = useAtmosStore((state) => state.addFavorite);
  const removeFavorite = useAtmosStore((state) => state.removeFavorite);
  const isFav = useAtmosStore((state) => state.isFavorite(coords.lat, coords.lon));

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const cityItem = {
      city,
      country,
      lat: coords.lat,
      lon: coords.lon,
    };
    if (isFav) {
      removeFavorite(coords.lat, coords.lon);
    } else {
      addFavorite(cityItem);
    }
  };

  return (
    <GlassCard className="flex flex-col p-8 md:p-10 justify-between min-h-[300px] w-full" delay={0.1}>
      {/* Header Info */}
      <div className="flex items-start justify-between">
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            key={city}
            className="text-3xl md:text-4xl font-bold text-white tracking-tight"
          >
            {city}
            <span className="text-xl md:text-2xl font-medium text-white/50 ml-2">{country}</span>
          </motion.h1>
          <p className="text-xs text-white/40 font-mono mt-1">
            Lat: {coords.lat.toFixed(2)}° • Lon: {coords.lon.toFixed(2)}°
          </p>
        </div>

        {/* Favorite Button */}
        <motion.button
          onClick={handleFavoriteToggle}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.85 }}
          aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
          className={`p-3 rounded-full border border-white/10 backdrop-blur-md transition-all duration-300 ${
            isFav
              ? 'bg-amber-400/20 border-amber-400/30 text-amber-400'
              : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
          }`}
        >
          <Star className={`w-5 h-5 ${isFav ? 'fill-amber-400' : ''}`} />
        </motion.button>
      </div>

      {/* Main Temperature and Icon Display */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mt-8 sm:mt-12">
        <div className="flex items-baseline select-text">
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            key={`${current.temp}-${units}`}
            className="text-7xl md:text-8xl font-light text-white tracking-tighter tabular-nums leading-none"
          >
            {Math.round(current.temp)}
          </motion.span>
          <span className="text-3xl md:text-4xl font-light text-cyan-400 ml-1 leading-none">
            °{units === 'metric' ? 'C' : 'F'}
          </span>
        </div>

        <div className="flex flex-col items-start sm:items-end">
          <div className="flex items-center gap-3">
            <WeatherIcon conditionKey={current.icon} size={48} />
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              key={current.condition}
              className="text-2xl md:text-3xl font-medium text-white tracking-wide"
            >
              {current.condition}
            </motion.span>
          </div>
          
          <div className="flex flex-wrap gap-x-3 text-sm text-white/70 mt-2 font-medium">
            <span>Feels like {formatTemp(current.feels_like, units)}</span>
            {tempMin !== undefined && tempMax !== undefined && (
              <span className="text-white/40">
                • H: {Math.round(tempMax)}° L: {Math.round(tempMin)}°
              </span>
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
