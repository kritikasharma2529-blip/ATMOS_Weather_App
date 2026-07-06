import { CurrentWeather, AQIData, UVData, ForecastData } from '@/types/weather';
import { mapConditionToKey } from '@/lib/constants';

interface RecommendationInput {
  current: CurrentWeather;
  aqi: AQIData;
  uv_index: UVData;
  forecast?: ForecastData;
}

export function computeWeatherScore(input: RecommendationInput): number {
  const { temp, humidity, wind_speed, condition } = input.current;
  const aqiValue = input.aqi.value;
  const uvValue = input.uv_index.value;
  
  let score = 100;

  // 1. Temperature Deduction (Ideal 20°C - 26°C)
  if (temp < 15) {
    // Deduct up to 30 points for freezing
    const diff = 15 - temp;
    score -= Math.min(30, diff * 2);
  } else if (temp > 28) {
    // Deduct up to 30 points for high heat
    const diff = temp - 28;
    score -= Math.min(30, diff * 2.5);
  }

  // 2. Humidity Deduction (Ideal 35% - 65%)
  if (humidity < 30) {
    score -= Math.min(10, (30 - humidity) * 0.5);
  } else if (humidity > 70) {
    score -= Math.min(15, (humidity - 70) * 0.5);
  }

  // 3. Wind Speed Deduction (Ideal < 15 km/h)
  if (wind_speed > 15) {
    score -= Math.min(20, (wind_speed - 15) * 0.6);
  }

  // 4. Condition Deduction
  const condKey = mapConditionToKey(condition);
  if (condKey === 'thunderstorm') {
    score -= 30;
  } else if (condKey === 'snow') {
    score -= 20;
  } else if (condKey === 'rain') {
    score -= 25;
  } else if (condKey === 'fog-haze') {
    score -= 15;
  } else if (condKey === 'cloudy') {
    score -= 5;
  }

  // 5. AQI Deduction (1: Good, 2: Moderate, 3: Unhealthy for sensitive, 4: Unhealthy, 5: Very Unhealthy/Hazardous)
  if (aqiValue === 3) {
    score -= 10;
  } else if (aqiValue === 4) {
    score -= 25;
  } else if (aqiValue >= 5) {
    score -= 45;
  }

  // 6. UV Index Deduction (Ideal < 6)
  if (uvValue >= 6 && uvValue < 8) {
    score -= 5;
  } else if (uvValue >= 8 && uvValue < 11) {
    score -= 12;
  } else if (uvValue >= 11) {
    score -= 20;
  }

  // Check weekly precipitation chance if forecast is available
  if (input.forecast && input.forecast.hourly && input.forecast.hourly.length > 0) {
    const nextFewHours = input.forecast.hourly.slice(0, 4);
    const maxPrecip = Math.max(...nextFewHours.map(h => h.precip_chance));
    if (maxPrecip > 30) {
      score -= Math.min(15, (maxPrecip - 30) * 0.2);
    }
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function generateRecommendations(input: RecommendationInput): {
  clothing: string;
  activity: string;
  travel: string;
} {
  const { temp, condition } = input.current;
  const aqiValue = input.aqi.value;
  const uvValue = input.uv_index.value;
  const condKey = mapConditionToKey(condition);

  // --- Clothing ---
  let clothing = '';
  if (temp <= 5) {
    clothing = 'Heavy winter coat, thermal layers, gloves, and a warm beanie are essential.';
  } else if (temp < 15) {
    clothing = 'Wear a warm coat, jacket, or heavy sweater. Layering is recommended.';
  } else if (temp <= 25) {
    clothing = 'Comfortable weather. A light jacket, cardigan, or long-sleeved shirt is perfect.';
  } else {
    clothing = 'Wear light, breathable cotton clothing. Short sleeves and shorts are ideal.';
  }

  if (condKey === 'rain' || condKey === 'thunderstorm') {
    clothing += ' Carry an umbrella or wear a waterproof raincoat and boots.';
  } else if (condKey === 'snow') {
    clothing += ' Wear insulated waterproof boots and snow-resistant outer layers.';
  }

  if (uvValue >= 6) {
    clothing += ' Don\'t forget sunglasses, sunscreen (SPF 30+), and a sun hat.';
  }

  // --- Activity ---
  let activity = '';
  if (condKey === 'thunderstorm' || condKey === 'snow') {
    activity = 'Severe weather conditions. Avoid outdoor exercises; perfect day for indoor workouts or cozy rest.';
  } else if (aqiValue >= 4) {
    activity = 'High air pollution. Skip outdoor runs or heavy exertion. Keep windows closed and exercise indoors.';
  } else if (temp > 35) {
    activity = 'Extreme heat warning. Restrict outdoor workouts to early morning, or opt for indoor air-conditioned activities and swimming.';
  } else if (condKey === 'rain') {
    activity = 'Rainy conditions. Move your activities indoors (like gym, yoga, or indoor sports).';
  } else if (temp < 10) {
    activity = 'Chilly weather. Suitable for outdoor activity if you dress in warm layers, but avoid staying stationary.';
  } else if (uvValue >= 8) {
    activity = 'Excellent for outdoors, but avoid direct mid-day sun. Schedule outdoor runs early in the morning or post-sunset.';
  } else {
    activity = 'Ideal conditions for outdoor sports, hiking, running, or a relaxed picnic in the park!';
  }

  // --- Travel ---
  let travel = '';
  if (condKey === 'thunderstorm') {
    travel = 'Storm conditions: High risk of flight delays and hazardous driving. Avoid unnecessary commutes.';
  } else if (condKey === 'snow') {
    travel = 'Snowy conditions: Slippery roads and potential delays. Drive carefully with winter tyres and check transit updates.';
  } else if (condKey === 'fog-haze') {
    travel = 'Reduced visibility: Use fog lights, maintain safe stopping distances, and allow extra time for travel.';
  } else if (condKey === 'rain') {
    travel = 'Rainy skies: Wet, slippery roads. Drive slowly and expect minor rush hour traffic delays.';
  } else {
    travel = 'Clear conditions: Smooth travel, no weather-related transit or highway disruptions expected.';
  }

  return { clothing, activity, travel };
}
