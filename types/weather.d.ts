export interface Coords {
  lat: number;
  lon: number;
}

export interface CurrentWeather {
  temp: number;
  feels_like: number;
  condition: string;
  icon: string; // clear-day, clear-night, cloudy, rain, thunderstorm, snow, fog-haze
  humidity: number;
  wind_speed: number;
  pressure: number;
}

export interface AQIData {
  value: number; // 1 to 5 (standard Index) or US AQI
  category: string; // Good, Moderate, Unhealthy for Sensitive Groups, Unhealthy, Very Unhealthy, Hazardous
}

export interface UVData {
  value: number;
  category: string; // Low, Moderate, High, Very High, Extreme
}

export interface SunData {
  sunrise: string; // "HH:MM"
  sunset: string; // "HH:MM"
}

export interface WeatherData {
  city: string;
  country: string;
  coords: Coords;
  current: CurrentWeather;
  aqi: AQIData;
  uv_index: UVData;
  sun: SunData;
  weather_score: number;
}

export interface HourlyForecastItem {
  time: string; // "HH:MM"
  temp: number;
  icon: string;
  precip_chance: number;
}

export interface WeeklyForecastItem {
  date: string; // "YYYY-MM-DD"
  temp_min: number;
  temp_max: number;
  icon: string;
  precip_chance: number;
}

export interface ForecastData {
  hourly: HourlyForecastItem[];
  weekly: WeeklyForecastItem[];
}

export interface RecommendationsData {
  clothing: string;
  activity: string;
  travel: string;
  weather_score: number;
}

export interface SearchResult {
  city: string;
  country: string;
  lat: number;
  lon: number;
}
