'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Search, History, Trash2, ArrowLeft, Navigation, MapPin } from 'lucide-react';
import SearchBar from '@/components/search/SearchBar';
import { useAtmosStore } from '@/lib/store/useAtmosStore';
import GlassCard from '@/components/ui/GlassCard';
import { SearchResult } from '@/types/weather';

export default function SearchPage() {
  const router = useRouter();
  const history = useAtmosStore((state) => state.history);
  const clearHistory = useAtmosStore((state) => state.clearHistory);

  const handleSelectCity = (cityItem: SearchResult) => {
    router.push(`/?lat=${cityItem.lat}&lon=${cityItem.lon}`);
  };

  const handleSelectCoords = (lat: number, lon: number) => {
    router.push(`/?lat=${lat}&lon=${lon}`);
  };

  return (
    <div className="w-full flex flex-col max-w-2xl mx-auto py-4">
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
          <h1 className="text-2xl font-bold text-white tracking-tight">Search Locations</h1>
          <p className="text-xs text-white/50">Explore conditions in thousands of global cities</p>
        </div>
      </div>

      {/* Main Search Panel */}
      <GlassCard className="p-6 md:p-8 flex flex-col gap-6" delay={0.1}>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-white/80">Enter City Name or Coordinates</label>
          <SearchBar onSelectCity={handleSelectCity} onSelectCoords={handleSelectCoords} />
        </div>

        {/* History Area */}
        <div className="mt-4 flex flex-col">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
            <h2 className="text-sm font-bold text-white/70 tracking-wide flex items-center gap-2">
              <History className="w-4 h-4 text-cyan-400" />
              Recent Searches
            </h2>
            {history.length > 0 && (
              <button
                onClick={clearHistory}
                className="flex items-center gap-1 text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors uppercase tracking-wide"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear All
              </button>
            )}
          </div>

          {history.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {history.map((item, index) => (
                <button
                  key={`${item.city}-${item.lat}-${item.lon}-${index}`}
                  onClick={() => handleSelectCity(item)}
                  className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-left transition-all duration-200 group active:scale-98"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
                      {item.city}
                    </span>
                    <span className="text-xs text-white/50">{item.country}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1 text-[10px] text-white/30 font-mono">
                    <span className="flex items-center gap-0.5 text-cyan-400/80">
                      <MapPin className="w-3 h-3" />
                      {item.lat.toFixed(2)}°
                    </span>
                    <span>{item.lon.toFixed(2)}°</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center text-white/40">
              <History className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm">No recent searches yet.</p>
              <p className="text-xs text-white/30 mt-1">Your search history will appear here for fast re-access.</p>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
