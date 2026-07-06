import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SearchResult } from '@/types/weather';
import { WeatherConditionKey } from '@/lib/constants';

interface AtmosSettings {
  units: 'metric' | 'imperial';
  theme: 'auto' | 'light' | 'dark';
  weatherApiKey?: string;
  geminiApiKey?: string;
  enableAi: boolean;
}

interface AtmosState {
  favorites: SearchResult[];
  history: SearchResult[];
  settings: AtmosSettings;
  currentCondition: WeatherConditionKey;
  
  // Actions
  addFavorite: (city: SearchResult) => void;
  removeFavorite: (lat: number, lon: number) => void;
  isFavorite: (lat: number, lon: number) => boolean;
  
  addHistory: (city: SearchResult) => void;
  clearHistory: () => void;
  
  updateSettings: (settings: Partial<AtmosSettings>) => void;
  setCondition: (cond: WeatherConditionKey) => void;
}

export const useAtmosStore = create<AtmosState>()(
  persist(
    (set, get) => ({
      favorites: [],
      history: [],
      settings: {
        units: 'metric',
        theme: 'auto',
        enableAi: true,
      },
      currentCondition: 'clear-day',

      addFavorite: (city) => {
        const { favorites } = get();
        // Check if already in favorites
        const exists = favorites.some(
          (fav) =>
            (fav.lat.toFixed(4) === city.lat.toFixed(4) &&
              fav.lon.toFixed(4) === city.lon.toFixed(4)) ||
            (fav.city.toLowerCase() === city.city.toLowerCase() &&
              fav.country.toLowerCase() === city.country.toLowerCase())
        );
        if (!exists) {
          set({ favorites: [...favorites, city] });
        }
      },

      removeFavorite: (lat, lon) => {
        const { favorites } = get();
        set({
          favorites: favorites.filter(
            (fav) =>
              fav.lat.toFixed(4) !== lat.toFixed(4) ||
              fav.lon.toFixed(4) !== lon.toFixed(4)
          ),
        });
      },

      isFavorite: (lat, lon) => {
        const { favorites } = get();
        return favorites.some(
          (fav) =>
            fav.lat.toFixed(4) === lat.toFixed(4) &&
            fav.lon.toFixed(4) === lon.toFixed(4)
        );
      },

      addHistory: (city) => {
        const { history } = get();
        // Filter out existing instances of this city
        const filtered = history.filter(
          (h) =>
            !(
              (h.lat.toFixed(4) === city.lat.toFixed(4) &&
                h.lon.toFixed(4) === city.lon.toFixed(4)) ||
              (h.city.toLowerCase() === city.city.toLowerCase() &&
                h.country.toLowerCase() === city.country.toLowerCase())
            )
        );
        // Add to front of history, slice to cap at 10
        set({ history: [city, ...filtered].slice(0, 10) });
      },

      clearHistory: () => {
        set({ history: [] });
      },

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },

      setCondition: (cond) => {
        set({ currentCondition: cond });
      },
    }),
    {
      name: 'atmos-user-storage',
      // Since currentCondition is dynamic and volatile, we can choose not to persist it or persist it.
      // Persisting it is fine, or we can use partialize to only persist settings, favorites, and history.
      partialize: (state) => ({
        favorites: state.favorites,
        history: state.history,
        settings: state.settings,
      }),
    }
  )
);

