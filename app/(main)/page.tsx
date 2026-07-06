'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Bot, RefreshCw, AlertTriangle, CloudSun } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useWeather } from '@/lib/hooks/useWeather';
import { useAtmosStore } from '@/lib/store/useAtmosStore';
import { SearchResult } from '@/types/weather';
import { mapConditionToKey } from '@/lib/constants';

// Components
import SearchBar from '@/components/search/SearchBar';
import WeatherHero from '@/components/weather/WeatherHero';
import HourlyStrip from '@/components/weather/HourlyStrip';
import AtmosIntelligence from '@/components/weather/AtmosIntelligence';
import WeeklyList from '@/components/weather/WeeklyList';
import WeatherCalendar from '@/components/weather/WeatherCalendar';
import CalendarActions from '@/components/weather/CalendarActions';
import ScoreRing from '@/components/recommendations/ScoreRing';
import RecommendationCard from '@/components/recommendations/RecommendationCard';
import AIAssistantPanel from '@/components/ai/AIAssistantPanel';
import {
  AqiTile,
  UvTile,
  SunTile,
  HumidityTile,
  WindTile,
} from '@/components/weather/MetricTile';

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [cityQuery, setCityQuery] = useState<string | null>(null);
  const [coordQuery, setCoordQuery] = useState<{ lat: number; lon: number } | null>(null);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date>(new Date());

  const history = useAtmosStore((state) => state.history);
  const addHistory = useAtmosStore((state) => state.addHistory);
  const setCondition = useAtmosStore((state) => state.setCondition);
  const enableAi = useAtmosStore((state) => state.settings.enableAi);

  // 1. Initial Load Strategy
  useEffect(() => {
    // Read from search query parameters first
    const latParam = searchParams.get('lat');
    const lonParam = searchParams.get('lon');
    const cityParam = searchParams.get('city');

    if (latParam && lonParam) {
      setCoordQuery({ lat: parseFloat(latParam), lon: parseFloat(lonParam) });
    } else if (cityParam) {
      setCityQuery(cityParam);
    } else if (history.length > 0) {
      // If user has history, load the last searched city
      const lastCity = history[0];
      if (lastCity.lat !== undefined && lastCity.lon !== undefined) {
        setCoordQuery({ lat: lastCity.lat, lon: lastCity.lon });
      } else {
        setCityQuery(lastCity.city);
      }
    } else {
      // Fallback: ask for geolocation, or default to Agra
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const gpsCoords = {
              lat: position.coords.latitude,
              lon: position.coords.longitude,
            };
            setCoordQuery(gpsCoords);
            // Put coords in URL quietly
            router.replace(`/?lat=${gpsCoords.lat}&lon=${gpsCoords.lon}`);
          },
          () => {
            // Geolocation blocked or failed, load Agra
            setCityQuery('Agra');
            addHistory({ city: 'Agra', country: 'IN', lat: 27.18, lon: 78.02 });
            router.replace('/?city=Agra');
          }
        );
      } else {
        setCityQuery('Agra');
        addHistory({ city: 'Agra', country: 'IN', lat: 27.18, lon: 78.02 });
        router.replace('/?city=Agra');
      }
    }
  }, [searchParams]);

  // 2. Fetch current weather and forecast
  const fetchParams = coordQuery
    ? { lat: coordQuery.lat, lon: coordQuery.lon }
    : cityQuery
    ? { city: cityQuery }
    : null;

  const { weather, error: weatherError, isLoading: weatherLoading, mutate: refetchWeather } = useWeather(fetchParams);

  // Sync background animation when weather loaded
  useEffect(() => {
    if (weather) {
      setCondition(mapConditionToKey(weather.current.condition, new Date().getHours() < 6 || new Date().getHours() > 18));
      // Save search results to history if queried via coordinate/GPS
      if (coordQuery && !cityQuery) {
        const exists = history.some(
          (h) =>
            h.city.toLowerCase() === weather.city.toLowerCase() ||
            (Math.abs(h.lat - weather.coords.lat) < 0.05 && Math.abs(h.lon - weather.coords.lon) < 0.05)
        );
        if (!exists) {
          addHistory({
            city: weather.city,
            country: weather.country,
            lat: weather.coords.lat,
            lon: weather.coords.lon
          });
        }
      }
    }
  }, [weather]);

  const handleSelectCity = (cityItem: SearchResult) => {
    router.push(`/?lat=${cityItem.lat}&lon=${cityItem.lon}`);
  };

  const handleSelectCoords = (lat: number, lon: number) => {
    router.push(`/?lat=${lat}&lon=${lon}`);
  };

  // Render Shimmer Loader skeleton while loading data
  const renderSkeletons = () => (
    <div className="flex flex-col gap-6 w-full animate-pulse mt-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="h-[300px] w-full rounded-[24px] bg-white/5 border border-white/10 relative overflow-hidden">
            <div className="absolute inset-0 shimmer-loader" />
          </div>
          <div className="h-[180px] w-full rounded-[24px] bg-white/5 border border-white/10 relative overflow-hidden">
            <div className="absolute inset-0 shimmer-loader" />
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <div className="h-[220px] w-full rounded-[24px] bg-white/5 border border-white/10 relative overflow-hidden">
            <div className="absolute inset-0 shimmer-loader" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-[140px] rounded-[24px] bg-white/5 border border-white/10 relative overflow-hidden">
              <div className="absolute inset-0 shimmer-loader" />
            </div>
            <div className="h-[140px] rounded-[24px] bg-white/5 border border-white/10 relative overflow-hidden">
              <div className="absolute inset-0 shimmer-loader" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );


  return (
    <div className="w-full flex flex-col">
      {/* Top search controls bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-start gap-2 w-full">
        <div className="flex items-center gap-3">
          <CloudSun className="w-8 h-8 text-cyan-400" />
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-wide leading-tight">Atmos Dashboard</h1>
            <p className="text-xs text-white/50">Personalized climate tracking & insights</p>
          </div>
        </div>
          <div className="flex items-center gap-0">
          <div className="w-full md:w-96 shrink-0">
            <SearchBar onSelectCity={handleSelectCity} onSelectCoords={handleSelectCoords} />
          </div>
          <button
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setIsAiOpen(true);
          }}
          className="fixed top-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-white font-semibold shadow-2xl border border-cyan-400/30 hover:shadow-cyan-400/40 active:scale-95 transition-all duration-300"
        >
          <Bot className="w-5 h-5" />
          <span className="hidden sm:inline text-sm">Ask Atmos AI</span>
        </button>
        </div>
          {/* AI Assistant Panel */}
          {weather && enableAi && (
            <AIAssistantPanel
              isOpen={isAiOpen}
              onClose={() => setIsAiOpen(false)}
              city={weather.city}
              weatherContext={weather}
            />
          )}
      </div>

      {/* Render Error Fallback UI */}
      {weatherError && (
        <div className="flex flex-col items-center justify-center py-20 px-6 bg-white/5 border border-white/10 rounded-[24px] text-center max-w-lg mx-auto w-full mt-10 backdrop-blur-xl">
          <AlertTriangle className="w-12 h-12 text-rose-400 mb-4 animate-bounce" />
          <h2 className="text-lg font-bold text-white mb-2">Failed to Load Weather Data</h2>
          <p className="text-sm text-white/60 mb-6">
            {weatherError.message || "Upstream weather servers returned an error."}
          </p>
          <button
            onClick={() => refetchWeather()}
            className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-white font-semibold py-2.5 px-6 rounded-xl transition-all duration-200 active:scale-95 shadow-lg shadow-cyan-500/20"
          >
            <RefreshCw className="w-4 h-4" />
            Retry Connection
          </button>
        </div>
      )}

      {/* Render Skeletons or Main Content */}
      {weatherLoading && !weather && renderSkeletons()}

      {weather && !weatherError && (
        <div className="flex flex-col gap-6 w-full mt-6 select-text">
          {/* Main layout grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main weather dashboard items (left column) */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* Current conditions Hero */}
              <WeatherHero weather={weather} />

              {/* Scrollable Hourly Strip forecast */}
              {weatherLoading ? (
                <div className="h-[180px] w-full rounded-[24px] bg-white/5 border border-white/10 shimmer-loader" />
              ) : (
                <>
                  <HourlyStrip hourly={weather.current.condition ? (weather as any).forecast?.hourly || [] : []} />
                  <AtmosIntelligence weather={weather} />
                  {/* 3-column action buttons for the calendar (Best Activities | Smart Reminder | Forecast Details) */}
                  <CalendarActions weather={weather} selectedDate={selectedCalendarDate} />
                </>
              )}
            </div>

            {/* Side dashboard items (right column) */}
            <div className="flex flex-col gap-6">
              {/* Score ring */}
              <ScoreRing score={weather.weather_score} />

              {/* Core metrics grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AqiTile aqi={weather.aqi} />
                <UvTile uv={weather.uv_index} />
                <div className="sm:col-span-2">
                  <SunTile sun={weather.sun} />
                </div>
                <HumidityTile humidity={weather.current.humidity} />
                <WindTile windSpeed={weather.current.wind_speed} />
              </div>

              {/* Weather Calendar — fills the freed vertical space */}
              <WeatherCalendar
                weather={weather}
                selectedDate={selectedCalendarDate}
                onDateChange={setSelectedCalendarDate}
              />
            </div>
          </div>

          {/* Full-width 7-day Weekly Forecast list */}
          <WeeklyList weekly={(weather as any).forecast?.weekly || []} />

          {/* Activity Insights & Clothing Suggestions */}
          <RecommendationCard
            clothing={weather.current.condition ? (weather as any).clothing || '' : ''}
            activity={weather.current.condition ? (weather as any).activity || '' : ''}
            travel={weather.current.condition ? (weather as any).travel || '' : ''}
          />
        </div>
      )}

      {/* Floating glowing AI trigger (if enabled) */}
            {weather && enableAi && (
              <>
                {/* Slide-over panel */}
                <AIAssistantPanel
                  isOpen={isAiOpen}
                  onClose={() => setIsAiOpen(false)}
                  city={weather.city}
                  weatherContext={weather}
                />
              </>
            )}
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex flex-col gap-6 w-full animate-pulse mt-6">
        <div className="h-[300px] w-full rounded-[24px] bg-white/5 border border-white/10 relative overflow-hidden">
          <div className="absolute inset-0 shimmer-loader" />
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}

