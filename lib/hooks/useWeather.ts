import useSWR from 'swr';
import { WeatherData, ForecastData, SearchResult } from '@/types/weather';

import { useAtmosStore } from '@/lib/store/useAtmosStore';

const fetcher = async (url: string) => {
  const headers: Record<string, string> = {};
  
  try {
    const settings = useAtmosStore.getState().settings;
    if (settings.weatherApiKey) {
      headers['x-weather-api-key'] = settings.weatherApiKey;
    }
  } catch (err) {
    console.error('Fetcher failed to read Zustand settings:', err);
  }

  const res = await fetch(url, { headers });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const error = new Error(errorData.error?.message || 'An error occurred while fetching data.');
    (error as any).info = errorData;
    (error as any).status = res.status;
    throw error;
  }
  return res.json();
};

export function useWeather(params: { city?: string; lat?: number; lon?: number } | null) {
  const shouldFetch = params && (params.city || (params.lat !== undefined && params.lon !== undefined));
  let url = '';
  
  if (shouldFetch) {
    const searchParams = new URLSearchParams();
    if (params.lat !== undefined && params.lon !== undefined) {
      searchParams.set('lat', String(params.lat));
      searchParams.set('lon', String(params.lon));
    } else if (params.city) {
      searchParams.set('city', params.city);
    }
    url = `/api/weather?${searchParams.toString()}`;
  }

  const { data, error, isLoading, mutate } = useSWR<WeatherData>(
    url ? url : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 10 * 60 * 1000, // 10 minutes cache deduplication
    }
  );

  return {
    weather: data,
    error,
    isLoading,
    mutate,
  };
}

export function useForecast(params: { city?: string; lat?: number; lon?: number; type?: 'hourly' | 'weekly' | 'both' } | null) {
  const shouldFetch = params && (params.city || (params.lat !== undefined && params.lon !== undefined));
  let url = '';

  if (shouldFetch) {
    const searchParams = new URLSearchParams();
    if (params.lat !== undefined && params.lon !== undefined) {
      searchParams.set('lat', String(params.lat));
      searchParams.set('lon', String(params.lon));
    } else if (params.city) {
      searchParams.set('city', params.city);
    }
    searchParams.set('type', params.type || 'both');
    url = `/api/forecast?${searchParams.toString()}`;
  }

  const { data, error, isLoading } = useSWR<ForecastData>(
    url ? url : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 10 * 60 * 1000, // 10 minutes cache deduplication
    }
  );

  return {
    forecast: data,
    error,
    isLoading,
  };
}

export function useSearch(query: string) {
  const shouldFetch = query && query.trim().length >= 2;
  const url = shouldFetch ? `/api/search?q=${encodeURIComponent(query)}` : null;

  const { data, error, isLoading } = useSWR<{ results: SearchResult[] }>(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60 * 1000, // 1 minute cache
    }
  );

  return {
    results: data?.results || [],
    error,
    isLoading,
  };
}
