'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X, History, Cloud } from 'lucide-react';
import { SearchResult } from '@/types/weather';
import { useSearch } from '@/lib/hooks/useWeather';
import { useAtmosStore } from '@/lib/store/useAtmosStore';

interface SearchBarProps {
  onSelectCity: (city: SearchResult) => void;
  onSelectCoords: (lat: number, lon: number) => void;
}

export default function SearchBar({ onSelectCity, onSelectCoords }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const history = useAtmosStore((state) => state.history);
  const addHistory = useAtmosStore((state) => state.addHistory);
  const clearHistory = useAtmosStore((state) => state.clearHistory);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(handler);
  }, [query]);

  // Autocomplete fetcher hook
  const { results, isLoading } = useSearch(debouncedQuery);

  // Click outside listener to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectCity = (city: SearchResult) => {
    addHistory(city);
    onSelectCity(city);
    setQuery('');
    setDebouncedQuery('');
    setIsFocused(false);
  };

  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onSelectCoords(position.coords.latitude, position.coords.longitude);
        setIsFocused(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Unable to retrieve your location. Please check browser permissions.');
      }
    );
  };

  const showDropdown = isFocused && (query.trim().length >= 2 || history.length > 0);

  return (
    <div ref={containerRef} className="relative w-full z-30">
      <div className="flex gap-2 w-full">
        {/* Search Input Box */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-white/50">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder="Search for cities..."
            className="w-full h-12 pl-12 pr-10 text-sm bg-white/10 text-white placeholder-white/40 border border-white/10 rounded-2xl outline-none backdrop-blur-md focus:border-white/20 focus:bg-white/15 transition-all duration-300 font-medium"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setDebouncedQuery('');
              }}
              className="absolute inset-y-0 right-3 flex items-center text-white/50 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Current Location GPS Button */}
        <button
          onClick={handleGeolocate}
          title="Use current location"
          className="flex items-center justify-center w-12 h-12 bg-white/10 hover:bg-white/15 text-cyan-400 border border-white/10 hover:border-white/20 rounded-2xl transition-all duration-300 backdrop-blur-md group active:scale-95"
        >
          <MapPin className="w-5 h-5 group-hover:animate-bounce" />
        </button>
      </div>

      {/* Autocomplete and History Dropdown Menu */}
      {showDropdown && (
        <div className="absolute w-full mt-2 border border-white/10 bg-slate-900/95 backdrop-blur-3xl rounded-2xl overflow-hidden shadow-2xl transition-all duration-300">
          {/* Autocomplete query results */}
          {query.trim().length >= 2 && (
            <div className="flex flex-col p-2">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-3 py-1">
                Matched Cities
              </span>
              {isLoading ? (
                <div className="flex items-center gap-3 px-3 py-4 text-sm text-white/50 font-medium">
                  <Cloud className="w-4 h-4 animate-bounce text-cyan-400" />
                  <span>Searching database...</span>
                </div>
              ) : results.length > 0 ? (
                results.map((result, index) => (
                  <button
                    key={`${result.city}-${result.lat}-${result.lon}-${index}`}
                    onClick={() => handleSelectCity(result)}
                    className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-white/10 text-left text-sm text-white font-medium group transition-all duration-200"
                  >
                    <span>
                      {result.city}
                      <span className="text-white/40 text-xs font-normal ml-2">{result.country}</span>
                    </span>
                    <span className="text-[10px] text-white/30 font-mono group-hover:text-cyan-400 transition-colors">
                      {result.lat.toFixed(2)}, {result.lon.toFixed(2)}
                    </span>
                  </button>
                ))
              ) : (
                <div className="px-3 py-4 text-sm text-white/40 font-medium">
                  No matching cities found.
                </div>
              )}
            </div>
          )}

          {/* Search History */}
          {query.trim().length < 2 && history.length > 0 && (
            <div className="flex flex-col p-2">
              <div className="flex items-center justify-between px-3 py-1.5">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5" />
                  Recent Searches
                </span>
                <button
                  onClick={clearHistory}
                  className="text-[9px] font-semibold text-rose-400/80 hover:text-rose-400 hover:underline uppercase tracking-wide"
                >
                  Clear History
                </button>
              </div>
              <div className="flex flex-col mt-1">
                {history.map((item, index) => (
                  <button
                    key={`${item.city}-${item.lat}-${item.lon}-${index}`}
                    onClick={() => handleSelectCity(item)}
                    className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-white/10 text-left text-sm text-white/80 font-medium group transition-all duration-200"
                  >
                    <span>
                      {item.city}
                      <span className="text-white/40 text-xs font-normal ml-2">{item.country}</span>
                    </span>
                    <span className="text-[10px] text-white/30 font-mono group-hover:text-cyan-400 transition-colors">
                      {item.lat.toFixed(2)}, {item.lon.toFixed(2)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
