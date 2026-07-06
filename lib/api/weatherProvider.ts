import { WeatherData, ForecastData, SearchResult, CurrentWeather, AQIData, UVData, SunData } from '@/types/weather';
import { mapConditionToKey, MOCK_CITIES } from '../constants';
import { computeWeatherScore, generateRecommendations } from '../recommendation-engine';

const WEATHER_API_KEY = process.env.WEATHER_API_KEY || process.env.NEXT_PUBLIC_WEATHER_API_KEY;
const BASE_URL = 'https://api.weatherapi.com/v1';

// Normalize WeatherAPI AQI EPA index to text categories
function getAqiCategory(index: number): string {
  switch (index) {
    case 1: return 'Good';
    case 2: return 'Moderate';
    case 3: return 'Unhealthy for Sensitive Groups';
    case 4: return 'Unhealthy';
    case 5: return 'Very Unhealthy';
    case 6: return 'Hazardous';
    default: return 'Moderate';
  }
}

// Normalize UV value to category text
function getUvCategory(uv: number): string {
  if (uv <= 2) return 'Low';
  if (uv <= 5) return 'Moderate';
  if (uv <= 7) return 'High';
  if (uv <= 10) return 'Very High';
  return 'Extreme';
}

/**
 * Normalizes WeatherAPI response into our internal WeatherData and ForecastData format
 */
function normalizeWeatherData(data: any): { weather: WeatherData; forecast: ForecastData } {
  const current = data.current;
  const location = data.location;
  const forecastday0 = data.forecast?.forecastday?.[0];
  const astro = forecastday0?.astro || { sunrise: '06:00 AM', sunset: '06:30 PM' };
  
  // Format 12-hour AM/PM to 24-hour HH:MM for api spec consistency
  const parseTime12hTo24h = (timeStr: string) => {
    try {
      const [time, modifier] = timeStr.split(' ');
      let [hours, minutes] = time.split(':');
      if (hours === '12') hours = '00';
      if (modifier === 'PM') hours = String(parseInt(hours, 10) + 12);
      return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    } catch {
      return timeStr;
    }
  };

  const sunrise = parseTime12hTo24h(astro.sunrise);
  const sunset = parseTime12hTo24h(astro.sunset);

  const epaIndex = current.air_quality?.['us-epa-index'] || 1;

  const currentNormal: CurrentWeather = {
    temp: current.temp_c,
    feels_like: current.feelslike_c,
    condition: current.condition.text,
    icon: mapConditionToKey(current.condition.text, current.is_day === 0),
    humidity: current.humidity,
    wind_speed: current.wind_kph,
    pressure: current.pressure_mb,
  };

  const aqiNormal: AQIData = {
    value: epaIndex,
    category: getAqiCategory(epaIndex),
  };

  const uvNormal: UVData = {
    value: current.uv,
    category: getUvCategory(current.uv),
  };

  const sunNormal: SunData = {
    sunrise,
    sunset,
  };

  const forecastData: ForecastData = {
    hourly: (forecastday0?.hour || []).map((h: any) => {
      // time format: "2026-07-06 00:00" -> extract "00:00"
      const timePart = h.time.split(' ')[1] || '00:00';
      return {
        time: timePart,
        temp: h.temp_c,
        icon: mapConditionToKey(h.condition.text, h.is_day === 0),
        precip_chance: h.chance_of_rain > h.chance_of_snow ? h.chance_of_rain : h.chance_of_snow,
      };
    }),
    weekly: (data.forecast?.forecastday || []).map((w: any) => ({
      date: w.date,
      temp_min: w.day.mintemp_c,
      temp_max: w.day.maxtemp_c,
      icon: mapConditionToKey(w.day.condition.text),
      precip_chance: w.day.daily_chance_of_rain > w.day.daily_chance_of_snow ? w.day.daily_chance_of_rain : w.day.daily_chance_of_snow,
    })),
  };

  const score = computeWeatherScore({
    current: currentNormal,
    aqi: aqiNormal,
    uv_index: uvNormal,
    forecast: forecastData
  });

  const recs = generateRecommendations({
    current: currentNormal,
    aqi: aqiNormal,
    uv_index: uvNormal,
    forecast: forecastData
  });

  const weatherNormal: any = {
    city: location.name,
    country: location.country,
    coords: { lat: location.lat, lon: location.lon },
    current: currentNormal,
    aqi: aqiNormal,
    uv_index: uvNormal,
    sun: sunNormal,
    weather_score: score,
    clothing: recs.clothing,
    activity: recs.activity,
    travel: recs.travel,
    forecast: forecastData
  };

  return { weather: weatherNormal, forecast: forecastData };
}

/**
 * Generate high-quality mock data when keys are missing
 */
function getMockWeatherData(query: string): { weather: WeatherData; forecast: ForecastData } {
  // Try to find matching city or pick a random one
  let baseCity = MOCK_CITIES[0];
  const queryLower = query.toLowerCase();
  
  if (query.includes(',')) {
    // Looks like coords, check proximity or just parse it
    const [latStr, lonStr] = query.split(',');
    const lat = parseFloat(latStr) || 27.18;
    const lon = parseFloat(lonStr) || 78.02;
    baseCity = MOCK_CITIES.find(c => Math.abs(c.lat - lat) < 1 && Math.abs(c.lon - lon) < 1) || {
      city: 'Detected City',
      country: 'LOC',
      lat,
      lon
    };
  } else {
    baseCity = MOCK_CITIES.find(c => c.city.toLowerCase().includes(queryLower)) || {
      city: query.charAt(0).toUpperCase() + query.slice(1),
      country: 'GLOBAL',
      lat: 25.0,
      lon: 50.0
    };
  }

  // Create a seeded-style pseudo-random weather based on city name characters
  const charSum = baseCity.city.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Decide base temp & conditions from seed
  const conditionsList = ['Clear', 'Partly Cloudy', 'Patchy Rain', 'Thunderstorm', 'Heavy Snow', 'Mist/Fog'] as const;
  const condition = conditionsList[charSum % conditionsList.length];
  
  // Temp between 5 and 38
  const baseTemp = 10 + (charSum % 29); 
  const isNight = new Date().getHours() < 6 || new Date().getHours() > 18;
  const iconKey = mapConditionToKey(condition, isNight);

  const currentNormal: CurrentWeather = {
    temp: parseFloat(baseTemp.toFixed(1)),
    feels_like: parseFloat((baseTemp + (charSum % 3 === 0 ? 2 : -1)).toFixed(1)),
    condition,
    icon: iconKey,
    humidity: 40 + (charSum % 45),
    wind_speed: parseFloat((5 + (charSum % 25)).toFixed(1)),
    pressure: 1005 + (charSum % 10),
  };

  const epaIndex = (charSum % 5) + 1; // 1-5
  const aqiNormal: AQIData = {
    value: epaIndex,
    category: getAqiCategory(epaIndex),
  };

  const uvVal = Math.max(1, charSum % 11);
  const uvNormal: UVData = {
    value: uvVal,
    category: getUvCategory(uvVal),
  };

  const sunNormal: SunData = {
    sunrise: '05:45',
    sunset: '19:15',
  };

  // Generate 24 hours starting now
  const hourly: any[] = [];
  const currentHour = new Date().getHours();
  for (let i = 0; i < 24; i++) {
    const hr = (currentHour + i) % 24;
    const isHrNight = hr < 6 || hr > 18;
    const hrTemp = baseTemp + Math.sin((i / 24) * Math.PI * 2) * 5;
    hourly.push({
      time: `${String(hr).padStart(2, '0')}:00`,
      temp: parseFloat(hrTemp.toFixed(1)),
      icon: mapConditionToKey(condition, isHrNight),
      precip_chance: iconKey === 'rain' ? Math.max(20, 90 - i * 3) : iconKey === 'thunderstorm' ? 80 : 0,
    });
  }

  // Generate 7 days
  const weekly: any[] = [];
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayIdx = new Date().getDay();
  for (let i = 0; i < 7; i++) {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + i);
    const dateStr = nextDate.toISOString().split('T')[0];
    
    const dayTemp = baseTemp + Math.sin(i) * 3;
    weekly.push({
      date: dateStr,
      temp_min: parseFloat((dayTemp - 4).toFixed(1)),
      temp_max: parseFloat((dayTemp + 4).toFixed(1)),
      icon: mapConditionToKey(conditionsList[(charSum + i) % conditionsList.length]),
      precip_chance: (charSum + i) % 3 === 0 ? 60 : 10,
    });
  }

  const forecastData: ForecastData = { hourly, weekly };

  const score = computeWeatherScore({
    current: currentNormal,
    aqi: aqiNormal,
    uv_index: uvNormal,
    forecast: forecastData
  });

  const recs = generateRecommendations({
    current: currentNormal,
    aqi: aqiNormal,
    uv_index: uvNormal,
    forecast: forecastData
  });

  const weatherNormal: any = {
    city: baseCity.city,
    country: baseCity.country,
    coords: { lat: baseCity.lat, lon: baseCity.lon },
    current: currentNormal,
    aqi: aqiNormal,
    uv_index: uvNormal,
    sun: sunNormal,
    weather_score: score,
    clothing: recs.clothing,
    activity: recs.activity,
    travel: recs.travel,
    forecast: forecastData
  };

  return { weather: weatherNormal, forecast: forecastData };
}

/**
 * Fetch weather data for a city name or latitude/longitude coordinates
 */
export async function fetchWeather(query: string, customApiKey?: string): Promise<{ weather: WeatherData; forecast: ForecastData }> {
  const apiKey = customApiKey || WEATHER_API_KEY;
  if (!apiKey) {
    // Fall back to Mock Provider
    return getMockWeatherData(query);
  }

  try {
    const url = `${BASE_URL}/forecast.json?key=${apiKey}&q=${encodeURIComponent(query)}&days=7&aqi=yes&alerts=no`;
    const res = await fetch(url);
    if (!res.ok) {
      if (res.status === 400 || res.status === 404) {
        throw new Error('CITY_NOT_FOUND');
      }
      throw new Error('PROVIDER_ERROR');
    }
    const data = await res.json();
    return normalizeWeatherData(data);
  } catch (error: any) {
    if (error.message === 'CITY_NOT_FOUND' || error.message === 'PROVIDER_ERROR') {
      throw error;
    }
    // Network or other issue, fall back to mock data
    console.error('API call failed, falling back to mock:', error);
    return getMockWeatherData(query);
  }
}

/**
 * Search autocomplete cities list
 */
export async function searchCities(query: string, customApiKey?: string): Promise<SearchResult[]> {
  if (!query || query.trim().length < 2) return [];

  const apiKey = customApiKey || WEATHER_API_KEY;
  if (!apiKey) {
    // Autocomplete filter on mock data
    const queryLower = query.toLowerCase().trim();
    return MOCK_CITIES.filter(
      c => c.city.toLowerCase().includes(queryLower) || c.country.toLowerCase().includes(queryLower)
    );
  }

  try {
    const url = `${BASE_URL}/search.json?key=${apiKey}&q=${encodeURIComponent(query)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('PROVIDER_ERROR');
    const data = await res.json();
    
    return data.map((item: any) => ({
      city: item.name,
      country: item.country,
      lat: item.lat,
      lon: item.lon,
    }));
  } catch (error) {
    console.error('Search failed, falling back to mock search:', error);
    const queryLower = query.toLowerCase().trim();
    return MOCK_CITIES.filter(
      c => c.city.toLowerCase().includes(queryLower) || c.country.toLowerCase().includes(queryLower)
    );
  }
}

