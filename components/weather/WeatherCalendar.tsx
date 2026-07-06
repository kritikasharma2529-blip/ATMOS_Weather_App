'use client';

import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { WeatherData, WeeklyForecastItem, CurrentWeather } from '@/types/weather';
import { useAtmosStore } from '@/lib/store/useAtmosStore';
import { formatTemp } from '@/lib/utils';
import GlassCard from '../ui/GlassCard';
import WeatherIcon from './WeatherIcon';

function formatDateLocal(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

interface WeatherCalendarProps {
  weather: WeatherData;
  selectedDate?: Date;
  onDateChange?: (date: Date) => void;
}

// Seedable pseudo-random generator
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

// Format weekday names
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Helper to check if two dates fall on the same day
function isSameDay(d1: Date, d2: Date) {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
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

// Heuristic activity rater
function getDayActivities(dayData: DayData) {
  const temp = dayData?.temp ?? 20;
  const condition = (dayData?.conditionText || '').toLowerCase();
  const aqi = dayData?.aqi ?? 2;
  const uv = dayData?.uv ?? 4;
  const humidity = dayData?.humidity ?? 50;
  const wind = dayData?.wind ?? 10;

  // 1. Walking
  let walk = 5.0;
  if (temp < 8 || temp > 35) walk -= 2.0;
  if (condition.includes('rain') || condition.includes('drizzle')) walk -= 2.0;
  if (condition.includes('storm') || condition.includes('snow')) walk -= 3.5;
  if (aqi >= 4) walk -= 2.0;
  walk = Math.max(0.5, Math.min(5.0, walk));

  // 2. Running
  let run = 5.0;
  if (temp < 10) run -= 1.5;
  if (temp > 28) run -= 1.5;
  if (aqi >= 3) run -= 1.5;
  if (uv >= 8) run -= 1.0;
  if (condition.includes('rain')) run -= 3.0;
  if (condition.includes('storm')) run -= 4.0;
  run = Math.max(0.5, Math.min(5.0, run));

  // 3. Photography
  let photo = 4.0;
  if (condition.includes('sun') || condition.includes('clear')) photo = 5.0;
  if (condition.includes('pleasant')) photo = 5.0;
  if (condition.includes('rain')) photo -= 2.0;
  if (condition.includes('storm')) photo -= 3.0;
  photo = Math.max(0.5, Math.min(5.0, photo));

  // 4. Travel
  let travel = 5.0;
  if (condition.includes('storm') || condition.includes('thunder')) travel -= 3.0;
  if (condition.includes('snow')) travel -= 2.5;
  if (wind > 35) travel -= 1.5;
  travel = Math.max(0.5, Math.min(5.0, travel));

  // 5. Laundry
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

// Generate weather data for any day in the month
function getDayWeatherData(
  city: string,
  lat: number,
  date: Date,
  weeklyForecast: WeeklyForecastItem[],
  currentDayReal: CurrentWeather | null | undefined
): DayData {
  const dateStr = formatDateLocal(date);
  const today = new Date();

  // If it's today, return real current data
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
      precip: 10,
      uv: 4,
      aqi: 2,
      wind: currentDayReal?.wind_speed ?? 10,
      humidity: currentDayReal?.humidity ?? 50,
      sunrise: '06:10',
      sunset: '18:40',
      dotColor: dot,
      isRealForecast: true,
      pressure: currentDayReal?.pressure ?? 1013,
    };
  }

  // Check if date is in weekly forecast list
  const forecastItem = (weeklyForecast || []).find(item => item && item.date === dateStr);
  if (forecastItem) {
    let dot = 'yellow';
    const cond = (forecastItem?.icon || '').toLowerCase();
    if (cond.includes('rain') || cond.includes('drizzle')) dot = 'blue';
    else if (cond.includes('storm') || cond.includes('thunder')) dot = 'purple';
    else if (cond.includes('cloud') || cond.includes('overcast')) dot = 'white';
    else if (((forecastItem?.temp_max ?? 20) + (forecastItem?.temp_min ?? 10)) / 2 >= 18 && ((forecastItem?.temp_max ?? 20) + (forecastItem?.temp_min ?? 10)) / 2 <= 25) dot = 'green';

    return {
      temp: Math.round(((forecastItem?.temp_max ?? 20) + (forecastItem?.temp_min ?? 10)) / 2),
      condition: forecastItem?.icon || 'clear-day',
      conditionText: mapIconToText(forecastItem?.icon || 'clear-day'),
      precip: forecastItem?.precip_chance ?? 0,
      uv: 5,
      aqi: 2,
      wind: 12,
      humidity: 55,
      sunrise: '06:12',
      sunset: '18:42',
      dotColor: dot,
      isRealForecast: true,
      pressure: 1012,
    };
  }

  // Deterministic simulation fallback
  const rand = seedRandom(`${city || 'Default'}-${dateStr}`);
  const month = date.getMonth();
  const isNorthernHemisphere = (lat ?? 0) >= 0;

  const absLat = Math.abs(lat ?? 0);
  const baseTemp = 30 - (absLat * 0.45);
  const seasonalAmplitude = Math.min(15, absLat * 0.3);
  const phaseShift = isNorthernHemisphere ? 6 : 0;
  const seasonalOffset = Math.sin(((month - phaseShift) / 12) * 2 * Math.PI) * seasonalAmplitude;
  const meanTemp = baseTemp + seasonalOffset;
  const tempVariance = rand() * 6 - 3;
  const temp = Math.round(meanTemp + tempVariance);

  const conditionSeed = rand();
  let conditionText = 'Sunny';
  let icon = 'clear-day';
  let precip = 0;
  let dotColor = 'yellow';

  if (conditionSeed < 0.28) {
    conditionText = 'Sunny';
    icon = 'clear-day';
    dotColor = 'yellow';
  } else if (conditionSeed < 0.6) {
    conditionText = 'Cloudy';
    icon = 'cloudy';
    dotColor = 'white';
  } else if (conditionSeed < 0.83) {
    conditionText = 'Rainy';
    icon = 'rain';
    precip = Math.round(rand() * 80 + 15);
    dotColor = 'blue';
  } else if (conditionSeed < 0.94) {
    conditionText = 'Thunderstorm';
    icon = 'thunderstorm';
    precip = Math.round(rand() * 90 + 20);
    dotColor = 'purple';
  } else {
    conditionText = 'Pleasant';
    icon = 'clear-day';
    dotColor = 'green';
  }

  if (conditionText === 'Sunny' && temp >= 18 && temp <= 25) {
    conditionText = 'Pleasant';
    dotColor = 'green';
  }

  const uv = Math.max(1, Math.min(11, Math.round(rand() * 8 + (isNorthernHemisphere && month >= 4 && month <= 8 ? 3 : 1))));
  const aqi = Math.max(1, Math.min(5, Math.round(rand() * 3 + 1)));
  const wind = Math.round(rand() * 24 + 4);
  const humidity = Math.round(rand() * 45 + 45);
  const pressure = Math.round(1008 + rand() * 12);

  return {
    temp,
    condition: icon,
    conditionText,
    precip,
    uv,
    aqi,
    wind,
    humidity,
    sunrise: '06:15',
    sunset: '18:45',
    dotColor,
    isRealForecast: false,
    pressure,
  };
}



// Generate dynamically the smart weekly reminder
function getSmartReminder(weekly: WeeklyForecastItem[]): string {
  if (!weekly || weekly.length === 0) return 'Weekend looks perfect for travel.';

  // Look for rain
  const rainDays = (weekly || []).filter(day => day && (day.precip_chance ?? 0) > 50);
  if (rainDays.length > 0 && rainDays[0]?.date) {
    const d = new Date(rainDays[0].date);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
    return `Rain expected on ${dayName}. Better to carry an umbrella.`;
  }

  // Look for maximum temp
  let bestDay = (weekly || [])[0];
  let bestScore = -100;
  (weekly || []).forEach(day => {
    if (!day) return;
    let score = ((day.temp_max ?? 20) + (day.temp_min ?? 10)) / 2;
    if ((day.precip_chance ?? 0) > 30) score -= 30;
    if (day.icon === 'clear-day') score += 10;
    if (score > bestScore) {
      bestScore = score;
      bestDay = day;
    }
  });

  if (bestDay && bestDay.date) {
    const d = new Date(bestDay.date);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
    return `Best day this week for outdoor activities will be ${dayName}.`;
  }

  return 'Weekend looks perfect for travel.';
}

export default function WeatherCalendar({ weather, selectedDate: externalSelectedDate, onDateChange }: WeatherCalendarProps) {
  const units = useAtmosStore((state) => state.settings.units);
  const today = useMemo(() => new Date(), []);

  // Extract simple variables to prevent complex dependency array expressions
  const weeklyForecast = useMemo(() => (weather as any).forecast?.weekly || [], [(weather as any).forecast?.weekly]);
  const city = weather.city;
  const lat = weather.coords?.lat;
  const current = weather.current;

  // Navigation States — selectedDate can be controlled externally
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [internalSelectedDate, setInternalSelectedDate] = useState<Date>(new Date());
  const selectedDate = externalSelectedDate ?? internalSelectedDate;
  const setSelectedDate = (d: Date) => {
    setInternalSelectedDate(d);
    onDateChange?.(d);
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Helper arrays for calendar grid mapping
  const daysInMonth = useMemo(() => new Date(year, month + 1, 0).getDate(), [year, month]);
  const firstDayIndex = useMemo(() => new Date(year, month, 1).getDay(), [year, month]);

  const prevMonthDays = useMemo(() => {
    const prevYear = month === 0 ? year - 1 : year;
    const prevMonth = month === 0 ? 11 : month - 1;
    return new Date(prevYear, prevMonth + 1, 0).getDate();
  }, [year, month]);

  // Compute selected date weather details
  const selectedDayData = useMemo(() => {
    return getDayWeatherData(
      city,
      lat,
      selectedDate,
      weeklyForecast,
      current
    );
  }, [city, lat, selectedDate, weeklyForecast, current]);

  const selectedDayActivities = useMemo(() => {
    return getDayActivities(selectedDayData);
  }, [selectedDayData]);



  const smartReminder = useMemo(() => {
    return getSmartReminder(weeklyForecast);
  }, [weeklyForecast]);

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Render calendar days
  const calendarCells = useMemo(() => {
    const cells = [];

    // 1. Previous Month Overflow days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i;
      const cellDate = new Date(month === 0 ? year - 1 : year, month === 0 ? 11 : month - 1, dayNum);
      const data = getDayWeatherData(
        city,
        lat,
        cellDate,
        weeklyForecast,
        current
      );
      cells.push({ date: cellDate, isCurrentMonth: false, data });
    }

    // 2. Current Month days
    for (let i = 1; i <= daysInMonth; i++) {
      const cellDate = new Date(year, month, i);
      const data = getDayWeatherData(
        city,
        lat,
        cellDate,
        weeklyForecast,
        current
      );
      cells.push({ date: cellDate, isCurrentMonth: true, data });
    }

    // 3. Next Month Overflow days
    const totalCells = cells.length;
    const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let i = 1; i <= remainingCells; i++) {
      const cellDate = new Date(month === 11 ? year + 1 : year, month === 11 ? 0 : month + 1, i);
      const data = getDayWeatherData(
        city,
        lat,
        cellDate,
        weeklyForecast,
        current
      );
      cells.push({ date: cellDate, isCurrentMonth: false, data });
    }

    return cells;
  }, [year, month, daysInMonth, firstDayIndex, prevMonthDays, city, lat, weeklyForecast, current]);

  const monthLabel = currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  // Get dots coloring classes
  const getDotClass = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-cyan-400';
      case 'purple': return 'bg-fuchsia-400';
      case 'white': return 'bg-slate-300';
      case 'green': return 'bg-emerald-400';
      default: return 'bg-yellow-400';
    }
  };

  return (
    <GlassCard className="p-6 w-full flex flex-col gap-6" delay={0.2}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-gradient-to-tr from-cyan-400 to-indigo-500 rounded-xl shadow-lg shadow-cyan-500/20">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white tracking-wide uppercase flex items-center gap-1.5">
              Weather Calendar
            </h2>
            <p className="text-[10px] text-white/50 font-medium">Monthly schedule & atmospheric planning</p>
          </div>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 hover:bg-white/5 rounded-lg border border-white/5 text-white/60 hover:text-white transition-all active:scale-90"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-white px-2.5 min-w-[110px] text-center uppercase tracking-wide">
            {monthLabel}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1.5 hover:bg-white/5 rounded-lg border border-white/5 text-white/60 hover:text-white transition-all active:scale-90"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Month View (expanded to take full space) */}
      <div className="flex flex-col gap-3.5 w-full">
        {/* Weekday Labels Header */}
        <div className="grid grid-cols-7 gap-1.5 text-center border-b border-white/5 pb-2">
          {WEEKDAYS.map((day) => (
            <span key={day} className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
              {day}
            </span>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {calendarCells.map((cell, idx) => {
            const isSelected = isSameDay(cell.date, selectedDate);
            const isTodayCell = isSameDay(cell.date, today);
            const isCurr = cell.isCurrentMonth;

            return (
              <button
                key={`${cell.date.toISOString()}-${idx}`}
                onClick={() => setSelectedDate(cell.date)}
                className={`
                  p-2 rounded-2xl flex flex-col items-center justify-between min-h-[72px] md:min-h-[80px] transition-all relative border outline-none
                  ${isSelected
                    ? 'bg-gradient-to-b from-cyan-400/20 to-indigo-500/25 border-cyan-400/40 shadow-lg shadow-cyan-400/5'
                    : isTodayCell
                      ? 'bg-white/10 border-white/20 shadow-md'
                      : isCurr
                        ? 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
                        : 'bg-transparent border-transparent opacity-25 hover:opacity-40'
                  }
                `}
              >
                {/* Top: date number */}
                <div className="flex items-center justify-between w-full px-0.5">
                  <span className={`text-xs md:text-sm font-bold ${isSelected ? 'text-cyan-300' : isTodayCell ? 'text-white font-extrabold' : 'text-white/70'}`}>
                    {cell.date.getDate()}
                  </span>
                  {/* Small condition dot */}
                  <span className={`w-1.5 h-1.5 rounded-full ${getDotClass(cell.data.dotColor)}`} />
                </div>

                {/* Center: weather icon */}
                <div className="my-1 opacity-80 scale-105">
                  <WeatherIcon conditionKey={cell.data.condition} size={18} />
                </div>

                {/* Bottom: temp */}
                <div className="text-[10px] md:text-xs font-bold text-white/50 leading-none tabular-nums">
                  {formatTemp(cell.data.temp, units)}
                </div>
              </button>
            );
          })}
        </div>

        {/* Dots Legend */}
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 border-t border-white/5 pt-3 mt-1.5">
          <div className="flex items-center gap-2 text-[10px] font-bold text-white/50 uppercase tracking-wide">
            <span className="w-2 h-2 rounded-full bg-yellow-400" /> Sunny
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-white/50 uppercase tracking-wide">
            <span className="w-2 h-2 rounded-full bg-cyan-400" /> Rain
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-white/50 uppercase tracking-wide">
            <span className="w-2 h-2 rounded-full bg-slate-300" /> Cloudy
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-white/50 uppercase tracking-wide">
            <span className="w-2 h-2 rounded-full bg-fuchsia-400" /> Storm
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-white/50 uppercase tracking-wide">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> Pleasant
          </div>
        </div>
      </div>

    </GlassCard>
  );
}