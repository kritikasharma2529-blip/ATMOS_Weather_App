'use client';

import React, { useState, useMemo } from 'react';
import {
  Star, Info, Calendar, CloudRain,
  Thermometer, Droplets, Wind, Sun, Sunset, Globe,
} from 'lucide-react';
import { WeatherData, WeeklyForecastItem, CurrentWeather } from '@/types/weather';
import { useAtmosStore } from '@/lib/store/useAtmosStore';
import { formatTemp } from '@/lib/utils';
import WeatherIcon from './WeatherIcon';
import Modal from '../ui/Modal';

/* ─── helpers (duplicated from WeatherCalendar to keep components independent) ─── */

function formatDateLocal(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function isSameDay(d1: Date, d2: Date) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

function seedRandom(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return () => {
    const x = Math.sin(hash++) * 10000;
    return x - Math.floor(x);
  };
}

function mapIconToText(icon: string): string {
  switch (icon) {
    case 'clear-day': return 'Sunny';
    case 'clear-night': return 'Clear Night';
    case 'cloudy': return 'Cloudy';
    case 'rain': return 'Rainy';
    case 'thunderstorm': return 'Thunderstorm';
    case 'snow': return 'Snowy';
    case 'fog-haze': return 'Foggy';
    default: return 'Pleasant';
  }
}

interface DayData {
  temp: number;
  condition: string;
  conditionText: string;
  precip: number;
  uv: number;
  aqi: number;
  wind: number;
  humidity: number;
  sunrise: string;
  sunset: string;
  dotColor: string;
  isRealForecast: boolean;
  pressure: number;
}

function getDayWeatherData(
  city: string,
  lat: number,
  date: Date,
  weeklyForecast: WeeklyForecastItem[],
  currentDayReal: CurrentWeather | null | undefined
): DayData {
  const dateStr = formatDateLocal(date);
  const today = new Date();

  if (isSameDay(date, today) && currentDayReal) {
    let dot = 'yellow';
    const cond = (currentDayReal?.condition || '').toLowerCase();
    if (cond.includes('rain') || cond.includes('drizzle')) dot = 'blue';
    else if (cond.includes('storm') || cond.includes('thunder')) dot = 'purple';
    else if (cond.includes('cloud') || cond.includes('overcast')) dot = 'white';
    else if ((currentDayReal?.temp ?? 0) >= 18 && (currentDayReal?.temp ?? 0) <= 25) dot = 'green';
    return {
      temp: currentDayReal?.temp ?? 20,
      condition: currentDayReal?.icon || 'clear-day',
      conditionText: currentDayReal?.condition || 'Sunny',
      precip: 10, uv: 4, aqi: 2,
      wind: currentDayReal?.wind_speed ?? 10,
      humidity: currentDayReal?.humidity ?? 50,
      sunrise: '06:10', sunset: '18:40',
      dotColor: dot, isRealForecast: true,
      pressure: currentDayReal?.pressure ?? 1013,
    };
  }

  const forecastItem = (weeklyForecast || []).find(item => item && item.date === dateStr);
  if (forecastItem) {
    let dot = 'yellow';
    const cond = (forecastItem?.icon || '').toLowerCase();
    if (cond.includes('rain') || cond.includes('drizzle')) dot = 'blue';
    else if (cond.includes('storm') || cond.includes('thunder')) dot = 'purple';
    else if (cond.includes('cloud') || cond.includes('overcast')) dot = 'white';
    else if (
      ((forecastItem?.temp_max ?? 20) + (forecastItem?.temp_min ?? 10)) / 2 >= 18 &&
      ((forecastItem?.temp_max ?? 20) + (forecastItem?.temp_min ?? 10)) / 2 <= 25
    ) dot = 'green';
    return {
      temp: Math.round(((forecastItem?.temp_max ?? 20) + (forecastItem?.temp_min ?? 10)) / 2),
      condition: forecastItem?.icon || 'clear-day',
      conditionText: mapIconToText(forecastItem?.icon || 'clear-day'),
      precip: forecastItem?.precip_chance ?? 0,
      uv: 5, aqi: 2, wind: 12, humidity: 55,
      sunrise: '06:12', sunset: '18:42',
      dotColor: dot, isRealForecast: true, pressure: 1012,
    };
  }

  const rand = seedRandom(`${city || 'Default'}-${dateStr}`);
  const month = date.getMonth();
  const isNorthernHemisphere = (lat ?? 0) >= 0;
  const absLat = Math.abs(lat ?? 0);
  const baseTemp = 30 - absLat * 0.45;
  const seasonalAmplitude = Math.min(15, absLat * 0.3);
  const phaseShift = isNorthernHemisphere ? 6 : 0;
  const seasonalOffset = Math.sin(((month - phaseShift) / 12) * 2 * Math.PI) * seasonalAmplitude;
  const meanTemp = baseTemp + seasonalOffset;
  const temp = Math.round(meanTemp + rand() * 6 - 3);

  const conditionSeed = rand();
  let conditionText = 'Sunny', icon = 'clear-day', precip = 0, dotColor = 'yellow';
  if (conditionSeed < 0.28) { conditionText = 'Sunny'; icon = 'clear-day'; dotColor = 'yellow'; }
  else if (conditionSeed < 0.6) { conditionText = 'Cloudy'; icon = 'cloudy'; dotColor = 'white'; }
  else if (conditionSeed < 0.83) { conditionText = 'Rainy'; icon = 'rain'; precip = Math.round(rand() * 80 + 15); dotColor = 'blue'; }
  else if (conditionSeed < 0.94) { conditionText = 'Thunderstorm'; icon = 'thunderstorm'; precip = Math.round(rand() * 90 + 20); dotColor = 'purple'; }
  else { conditionText = 'Pleasant'; icon = 'clear-day'; dotColor = 'green'; }

  if (conditionText === 'Sunny' && temp >= 18 && temp <= 25) { conditionText = 'Pleasant'; dotColor = 'green'; }

  const uv = Math.max(1, Math.min(11, Math.round(rand() * 8 + (isNorthernHemisphere && month >= 4 && month <= 8 ? 3 : 1))));
  const aqi = Math.max(1, Math.min(5, Math.round(rand() * 3 + 1)));
  const wind = Math.round(rand() * 24 + 4);
  const humidity = Math.round(rand() * 45 + 45);
  const pressure = Math.round(1008 + rand() * 12);

  return { temp, condition: icon, conditionText, precip, uv, aqi, wind, humidity, sunrise: '06:15', sunset: '18:45', dotColor, isRealForecast: false, pressure };
}

function getDayActivities(dayData: DayData) {
  const temp = dayData?.temp ?? 20;
  const condition = (dayData?.conditionText || '').toLowerCase();
  const aqi = dayData?.aqi ?? 2;
  const uv = dayData?.uv ?? 4;
  const humidity = dayData?.humidity ?? 50;
  const wind = dayData?.wind ?? 10;

  let walk = 5.0;
  if (temp < 8 || temp > 35) walk -= 2.0;
  if (condition.includes('rain') || condition.includes('drizzle')) walk -= 2.0;
  if (condition.includes('storm') || condition.includes('snow')) walk -= 3.5;
  if (aqi >= 4) walk -= 2.0;
  walk = Math.max(0.5, Math.min(5.0, walk));

  let run = 5.0;
  if (temp < 10) run -= 1.5;
  if (temp > 28) run -= 1.5;
  if (aqi >= 3) run -= 1.5;
  if (uv >= 8) run -= 1.0;
  if (condition.includes('rain')) run -= 3.0;
  if (condition.includes('storm')) run -= 4.0;
  run = Math.max(0.5, Math.min(5.0, run));

  let photo = 4.0;
  if (condition.includes('sun') || condition.includes('clear')) photo = 5.0;
  if (condition.includes('pleasant')) photo = 5.0;
  if (condition.includes('rain')) photo -= 2.0;
  if (condition.includes('storm')) photo -= 3.0;
  photo = Math.max(0.5, Math.min(5.0, photo));

  let travel = 5.0;
  if (condition.includes('storm') || condition.includes('thunder')) travel -= 3.0;
  if (condition.includes('snow')) travel -= 2.5;
  if (wind > 35) travel -= 1.5;
  travel = Math.max(0.5, Math.min(5.0, travel));

  let laundry = 5.0;
  if (humidity > 70) laundry -= 2.0;
  if (condition.includes('rain') || condition.includes('storm')) laundry = 0.5;
  laundry = Math.max(0.5, Math.min(5.0, laundry));

  return [
    { name: 'Walking', score: walk },
    { name: 'Running', score: run },
    { name: 'Photography', score: photo },
    { name: 'Travel', score: travel },
    { name: 'Laundry', score: laundry },
  ];
}

function getSmartReminder(weekly: WeeklyForecastItem[]): string {
  if (!weekly || weekly.length === 0) return 'Weekend looks perfect for travel.';
  const rainDays = (weekly || []).filter(day => day && (day.precip_chance ?? 0) > 50);
  if (rainDays.length > 0 && rainDays[0]?.date) {
    const d = new Date(rainDays[0].date);
    return `Rain expected on ${d.toLocaleDateString('en-US', { weekday: 'long' })}. Better to carry an umbrella.`;
  }
  let bestDay = (weekly || [])[0];
  let bestScore = -100;
  (weekly || []).forEach(day => {
    if (!day) return;
    let score = ((day.temp_max ?? 20) + (day.temp_min ?? 10)) / 2;
    if ((day.precip_chance ?? 0) > 30) score -= 30;
    if (day.icon === 'clear-day') score += 10;
    if (score > bestScore) { bestScore = score; bestDay = day; }
  });
  if (bestDay && bestDay.date) {
    const d = new Date(bestDay.date);
    return `Best day this week for outdoor activities will be ${d.toLocaleDateString('en-US', { weekday: 'long' })}.`;
  }
  return 'Weekend looks perfect for travel.';
}

/* ─── StarRating sub-component ─── */
function StarRating({ score }: { score: number }) {
  const fullStars = Math.floor(score);
  const hasHalf = score % 1 !== 0;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => {
        if (i < fullStars) return <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />;
        if (i === fullStars && hasHalf) return (
          <div key={i} className="relative w-3.5 h-3.5">
            <Star className="absolute inset-0 w-3.5 h-3.5 text-white/10" />
            <div className="absolute inset-0 w-[50%] overflow-hidden">
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            </div>
          </div>
        );
        return <Star key={i} className="w-3.5 h-3.5 text-white/10" />;
      })}
      <span className="text-xs text-white/50 ml-1.5 font-bold font-mono">{score.toFixed(1)}</span>
    </div>
  );
}

/* ─── Main component ─── */
interface CalendarActionsProps {
  weather: WeatherData;
  selectedDate: Date;
}

export default function CalendarActions({ weather, selectedDate }: CalendarActionsProps) {
  const units = useAtmosStore(state => state.settings.units);

  const weeklyForecast = useMemo(() => (weather as any).forecast?.weekly || [], [(weather as any).forecast?.weekly]);
  const city = weather.city;
  const lat = weather.coords?.lat;
  const current = weather.current;

  const selectedDayData = useMemo(
    () => getDayWeatherData(city, lat, selectedDate, weeklyForecast, current),
    [city, lat, selectedDate, weeklyForecast, current]
  );
  const selectedDayActivities = useMemo(() => getDayActivities(selectedDayData), [selectedDayData]);
  const smartReminder = useMemo(() => getSmartReminder(weeklyForecast), [weeklyForecast]);

  const [isActivitiesOpen, setIsActivitiesOpen] = useState(false);
  const [isReminderOpen, setIsReminderOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const dateLabel = selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <>
      {/* ── 3-column button row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          id="cal-btn-activities"
          onClick={() => setIsActivitiesOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl text-xs font-bold text-white transition-all active:scale-95 shadow-md uppercase tracking-wider outline-none"
        >
          <Star className="w-4 h-4 text-cyan-400 shrink-0" />
          Best Activities
        </button>
        <button
          id="cal-btn-reminder"
          onClick={() => setIsReminderOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl text-xs font-bold text-white transition-all active:scale-95 shadow-md uppercase tracking-wider outline-none"
        >
          <Info className="w-4 h-4 text-cyan-400 shrink-0" />
          Smart Reminder
        </button>
        <button
          id="cal-btn-forecast"
          onClick={() => setIsDetailsOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl text-xs font-bold text-white transition-all active:scale-95 shadow-md uppercase tracking-wider outline-none"
        >
          <Calendar className="w-4 h-4 text-cyan-400 shrink-0" />
          Forecast Details
        </button>
      </div>

      {/* ── Modal: Best Activities ── */}
      <Modal isOpen={isActivitiesOpen} onClose={() => setIsActivitiesOpen(false)} title="🧭 Best Activities Suitability">
        <div className="flex flex-col gap-4">
          <p className="text-xs text-white/50 mb-1">
            Activity suitability for{' '}
            <span className="text-white font-bold">{dateLabel}</span>
          </p>
          <div className="flex flex-col gap-3.5 bg-white/5 p-4 rounded-2xl border border-white/5">
            {selectedDayActivities.map(act => (
              <div key={act.name} className="flex items-center justify-between text-sm">
                <span className="font-bold text-white/80">{act.name}</span>
                <StarRating score={act.score} />
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* ── Modal: Smart Reminder ── */}
      <Modal isOpen={isReminderOpen} onClose={() => setIsReminderOpen(false)} title="🔔 Smart Reminder">
        <div className="flex flex-col gap-3">
          <p className="text-xs text-white/50">Smart notifications and safety notes for this week's weather</p>
          <div className="bg-cyan-500/10 border border-cyan-500/20 p-4 rounded-2xl flex items-start gap-3.5">
            <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-xl shrink-0">
              <CloudRain className="w-5 h-5 animate-pulse" />
            </div>
            <p className="text-sm text-white/90 leading-relaxed font-bold">{smartReminder}</p>
          </div>
        </div>
      </Modal>

      {/* ── Modal: Forecast Details ── */}
      <Modal isOpen={isDetailsOpen} onClose={() => setIsDetailsOpen(false)} title="📊 Forecast Details">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div>
              <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-widest">Selected Date</span>
              <h4 className="text-base font-bold text-white">{dateLabel}</h4>
            </div>
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
              <WeatherIcon conditionKey={selectedDayData.condition} size={24} />
              <span className="text-xs font-bold text-white">{selectedDayData.conditionText}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: <Thermometer className="w-5 h-5 text-cyan-400" />,  label: 'Temperature',    value: formatTemp(selectedDayData.temp, units) },
              { icon: <Droplets    className="w-5 h-5 text-cyan-400" />,  label: 'Precipitation',  value: `${selectedDayData.precip}%` },
              { icon: <Wind        className="w-5 h-5 text-teal-400" />,  label: 'Wind Speed',     value: `${selectedDayData.wind} km/h` },
              { icon: <Info        className="w-5 h-5 text-rose-400" />,  label: 'AQI',            value: `Index ${selectedDayData.aqi}` },
              { icon: <Sun         className="w-5 h-5 text-yellow-400" />,label: 'UV Index',       value: `Category ${selectedDayData.uv}` },
              { icon: <Sunset      className="w-5 h-5 text-amber-400" />, label: 'Daylight',       value: `${selectedDayData.sunrise} – ${selectedDayData.sunset}` },
              { icon: <Droplets    className="w-5 h-5 text-cyan-400" />,  label: 'Humidity',       value: `${selectedDayData.humidity}%` },
              { icon: <Globe       className="w-5 h-5 text-indigo-400" />,label: 'Pressure',       value: `${selectedDayData.pressure} hPa` },
            ].map(({ icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                {icon}
                <div>
                  <span className="text-[10px] text-white/40 block font-semibold uppercase">{label}</span>
                  <span className="text-sm font-bold text-white/90">{value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </>
  );
}
