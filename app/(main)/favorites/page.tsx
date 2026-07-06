'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Star, ArrowLeft, Cloud, Trash2, Heart } from 'lucide-react';
import { useAtmosStore } from '@/lib/store/useAtmosStore';
import { useWeather } from '@/lib/hooks/useWeather';
import { SearchResult } from '@/types/weather';
import { formatTemp } from '@/lib/utils';
import GlassCard from '@/components/ui/GlassCard';
import WeatherIcon from '@/components/weather/WeatherIcon';

function FavoriteCityCard({ cityItem }: { cityItem: SearchResult }) {
  const router = useRouter();
  const removeFavorite = useAtmosStore((state) => state.removeFavorite);
  const units = useAtmosStore((state) => state.settings.units);

  // Fetch individual weather data
  const { weather, isLoading, error } = useWeather({
    lat: cityItem.lat,
    lon: cityItem.lon,
  });

  const handleCardClick = () => {
    router.push(`/?lat=${cityItem.lat}&lon=${cityItem.lon}`);
  };

  const handleUnfavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeFavorite(cityItem.lat, cityItem.lon);
  };

  return (
    <GlassCard
      interactive
      className="p-5 flex items-center justify-between min-h-[100px] w-full"
      onClick={handleCardClick}
    >
      {/* City Information */}
      <div className="flex flex-col gap-0.5 max-w-[65%] select-text">
        <span className="text-base font-bold text-white tracking-wide truncate">{cityItem.city}</span>
        <span className="text-xs text-white/50">{cityItem.country}</span>
        {weather && (
          <span className="text-[11px] text-white/70 font-semibold tracking-wide mt-1 animate-fade-in truncate">
            {weather.current.condition}
          </span>
        )}
      </div>

      {/* Temperature & Icon */}
      <div className="flex items-center gap-4 shrink-0">
        {isLoading ? (
          <div className="w-10 h-10 rounded-full border-2 border-t-cyan-400 border-white/5 animate-spin" />
        ) : error ? (
          <span className="text-xs text-rose-400 font-medium">Offline</span>
        ) : weather ? (
          <div className="flex items-center gap-3">
            {/* Condition Icon */}
            <WeatherIcon conditionKey={weather.current.icon} size={32} />

            {/* Current temperature */}
            <span className="text-3xl font-light text-white tabular-nums select-text">
              {formatTemp(weather.current.temp, units)}
            </span>
          </div>
        ) : null}

        {/* Unstar favorite button */}
        <button
          onClick={handleUnfavorite}
          title="Remove from favorites"
          className="p-2 bg-amber-400/10 border border-amber-400/20 text-amber-400 hover:bg-rose-500/20 hover:border-rose-500/30 hover:text-rose-400 rounded-xl transition-all duration-300 active:scale-90"
        >
          <Star className="w-4 h-4 fill-amber-400 hover:fill-none" />
        </button>
      </div>
    </GlassCard>
  );
}

export default function FavoritesPage() {
  const router = useRouter();
  const favorites = useAtmosStore((state) => state.favorites);

  return (
    <div className="w-full flex flex-col max-w-4xl mx-auto py-4">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => router.push('/')}
          className="p-2 text-white/60 hover:text-white hover:bg-white/5 border border-white/10 rounded-xl transition-all active:scale-95"
          aria-label="Back to dashboard"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Favorite Cities</h1>
          <p className="text-xs text-white/50">Quick glance summaries of bookmarked cities</p>
        </div>
      </div>

      {/* Grid List */}
      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {favorites.map((city, index) => (
            <FavoriteCityCard key={`${city.city}-${city.lat}-${city.lon}-${index}`} cityItem={city} />
          ))}
        </div>
      ) : (
        <GlassCard className="flex flex-col items-center justify-center p-12 text-center text-white/40 min-h-[300px] w-full" delay={0.1}>
          <div className="p-4 bg-white/5 border border-white/10 rounded-full mb-4">
            <Heart className="w-8 h-8 text-rose-400/80 animate-pulse" />
          </div>
          <h2 className="text-lg font-bold text-white mb-1">No Favorite Cities</h2>
          <p className="text-sm text-white/60 max-w-sm leading-relaxed mb-6">
            Bookmark cities by tapping the star icon on the weather dashboard to view their quick forecasts here.
          </p>
          <button
            onClick={() => router.push('/search')}
            className="bg-cyan-500 hover:bg-cyan-400 text-white font-semibold py-2.5 px-6 rounded-xl transition-all duration-200 active:scale-95 shadow-lg shadow-cyan-500/20"
          >
            Find a City
          </button>
        </GlassCard>
      )}
    </div>
  );
}
