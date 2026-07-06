import { format, parseISO } from 'date-fns';

/**
 * Converts Celsius to Fahrenheit
 */
export function convertTemp(celsius: number, unit: 'metric' | 'imperial'): number {
  if (unit === 'imperial') {
    return Math.round((celsius * 9) / 5 + 32);
  }
  return Math.round(celsius);
}

/**
 * Formats temperature string with degree symbol
 */
export function formatTemp(celsius: number, unit: 'metric' | 'imperial'): string {
  const converted = convertTemp(celsius, unit);
  return `${converted}°${unit === 'metric' ? 'C' : 'F'}`;
}

/**
 * Converts wind speed from kph to mph if needed
 */
export function formatWindSpeed(kph: number, unit: 'metric' | 'imperial'): string {
  if (unit === 'imperial') {
    const mph = Math.round(kph * 0.621371);
    return `${mph} mph`;
  }
  return `${Math.round(kph)} km/h`;
}

/**
 * Formats standard date "YYYY-MM-DD" into a friendly day name like "Mon, Jul 7"
 */
export function formatWeeklyDate(dateStr: string): string {
  try {
    const date = parseISO(dateStr);
    return format(date, 'eee, MMM d');
  } catch {
    return dateStr;
  }
}

/**
 * Converts 24h time "HH:MM" to 12h time "H:MM AM/PM"
 */
export function formatTime12h(timeStr: string): string {
  try {
    const [hours, minutes] = timeStr.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 === 0 ? 12 : h % 12;
    return `${displayHour}:${minutes} ${ampm}`;
  } catch {
    return timeStr;
  }
}
