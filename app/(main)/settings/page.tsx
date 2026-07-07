'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, Eye, EyeOff, Save, Trash2, ArrowLeft, Bot, Shield, Globe, Monitor, Sun, Moon } from 'lucide-react';
import { useAtmosStore } from '@/lib/store/useAtmosStore';
import GlassCard from '@/components/ui/GlassCard';

export default function SettingsPage() {
  const router = useRouter();
  
  const settings = useAtmosStore((state) => state.settings);
  const updateSettings = useAtmosStore((state) => state.updateSettings);
  const clearHistory = useAtmosStore((state) => state.clearHistory);
  const history = useAtmosStore((state) => state.history);

  // Local state for keys inputs
  const [weatherKey, setWeatherKey] = useState(settings.weatherApiKey || '');
  const [geminiKey, setGeminiKey] = useState(settings.geminiApiKey || '');
  const [showWeatherKey, setShowWeatherKey] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveKeys = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      weatherApiKey: weatherKey.trim() || undefined,
      geminiApiKey: geminiKey.trim() || undefined,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear your search history?')) {
      clearHistory();
      alert('Search history cleared.');
    }
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
          <h1 className="text-2xl font-bold text-white tracking-tight">Atmos Settings</h1>
          <p className="text-xs text-white/50">Personalize your application preferences and integrations</p>
        </div>
      </div>

      <div className="flex flex-col gap-6 w-full">
        {/* Unit and Theme Preference Controls */}
        <GlassCard className="p-6 md:p-8 flex flex-col gap-6" delay={0.1}>
          <h2 className="text-base font-bold text-white tracking-wide border-b border-white/10 pb-3 flex items-center gap-2">
            <Globe className="w-4 h-4 text-cyan-400" />
            General Preferences
          </h2>

          {/* Unit selection */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-sm font-bold text-white block">Measurement Units</span>
              <span className="text-xs text-white/50">Choose between Metric (°C, km/h) and Imperial (°F, mph) formats</span>
            </div>
            <div className="flex bg-white/5 border border-white/10 p-1 rounded-xl">
              <button
                onClick={() => updateSettings({ units: 'metric' })}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                  settings.units === 'metric' ? 'bg-cyan-500 text-white shadow-md' : 'text-white/60 hover:text-white'
                }`}
              >
                Metric (°C)
              </button>
              <button
                onClick={() => updateSettings({ units: 'imperial' })}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                  settings.units === 'imperial' ? 'bg-cyan-500 text-white shadow-md' : 'text-white/60 hover:text-white'
                }`}
              >
                Imperial (°F)
              </button>
            </div>
          </div>


        </GlassCard>



        {/* Clear Data & Utility Panel */}
        <GlassCard className="p-6 md:p-8 flex flex-col gap-6" delay={0.2}>
          <h2 className="text-base font-bold text-rose-400 tracking-wide border-b border-white/10 pb-3 flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            Danger Zone
          </h2>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-sm font-bold text-white block">Clear Local Cached Data</span>
              <span className="text-xs text-white/50">
                Wipes search history logs. (Active: {history.length} items logged)
              </span>
            </div>
            <button
              onClick={handleClearHistory}
              disabled={history.length === 0}
              className="px-4 py-2.5 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 hover:border-rose-500/30 transition-all duration-300 active:scale-95 text-xs font-semibold disabled:opacity-30 disabled:scale-100"
            >
              Clear Search History
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
