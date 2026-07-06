export type WeatherConditionKey =
  | 'clear-day'
  | 'clear-night'
  | 'cloudy'
  | 'rain'
  | 'thunderstorm'
  | 'snow'
  | 'fog-haze';

export const CONDITION_GRADIENTS: Record<WeatherConditionKey, { from: string; to: string; textDark: boolean }> = {
  'clear-day': { from: '#4facfe', to: '#00c6ff', textDark: false },
  'clear-night': { from: '#0f2027', to: '#2c5364', textDark: false },
  cloudy: { from: '#757f9a', to: '#d7dde8', textDark: true },
  rain: { from: '#3a6073', to: '#16222a', textDark: false },
  thunderstorm: { from: '#232526', to: '#414345', textDark: false },
  snow: { from: '#e6dada', to: '#274046', textDark: false },
  'fog-haze': { from: '#bdc3c7', to: '#2c3e50', textDark: false },
};

// Maps weather condition strings to standard condition keys
export function mapConditionToKey(conditionText: string, isNight = false): WeatherConditionKey {
  const text = conditionText.toLowerCase();
  
  if (text.includes('thunder') || text.includes('storm')) {
    return 'thunderstorm';
  }
  if (text.includes('snow') || text.includes('sleet') || text.includes('hail') || text.includes('ice') || text.includes('blizzard')) {
    return 'snow';
  }
  if (text.includes('rain') || text.includes('drizzle') || text.includes('shower')) {
    return 'rain';
  }
  if (text.includes('fog') || text.includes('mist') || text.includes('haze') || text.includes('smoke') || text.includes('dust') || text.includes('sand') || text.includes('ash')) {
    return 'fog-haze';
  }
  if (text.includes('cloud') || text.includes('overcast') || text.includes('misty')) {
    return 'cloudy';
  }
  
  return isNight ? 'clear-night' : 'clear-day';
}

export const MOCK_CITIES = [
  { city: 'Agra', country: 'IN', lat: 27.18, lon: 78.02 },
  { city: 'London', country: 'GB', lat: 51.5074, lon: -0.1278 },
  { city: 'New York', country: 'US', lat: 40.7128, lon: -74.006 },
  { city: 'Tokyo', country: 'JP', lat: 35.6762, lon: 139.6503 },
  { city: 'Sydney', country: 'AU', lat: -33.8688, lon: 151.2093 },
  { city: 'Cairo', country: 'EG', lat: 30.0444, lon: 31.2357 },
  { city: 'Paris', country: 'FR', lat: 48.8566, lon: 2.3522 },
];
