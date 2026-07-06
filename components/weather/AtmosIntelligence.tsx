'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Brain, Compass, ShieldAlert, CheckCircle2, 
  Layers, Glasses, Umbrella, Heart, Sun, Droplets, Wind, 
  Thermometer, Coffee, Camera, Sunset, Shirt, Activity, Car,
  Star, Info
} from 'lucide-react';
import { WeatherData } from '@/types/weather';
import { useAtmosStore } from '@/lib/store/useAtmosStore';
import GlassCard from '../ui/GlassCard';

interface AtmosIntelligenceProps {
  weather: WeatherData;
}

// Dynamic ratings for Best Time Planner
function getPlannerRatings(weather: WeatherData) {
  const current = weather.current;
  const aqi = weather.aqi;
  const uv = weather.uv_index;
  const temp = current.temp;
  const condition = current.condition.toLowerCase();
  const sunsetTime = weather.sun?.sunset || '18:30';

  // 1. Running
  let runScore = 5.0;
  if (temp < 10) runScore -= 1.5;
  if (temp < 5) runScore -= 1.5;
  if (temp > 28) runScore -= 1.5;
  if (temp > 35) runScore -= 2.0;
  if (aqi.value >= 3) runScore -= 1.5;
  if (aqi.value >= 4) runScore -= 2.0;
  if (uv.value >= 8) runScore -= 1.0;
  if (condition.includes('rain') || condition.includes('drizzle')) runScore -= 3.0;
  if (condition.includes('snow')) runScore -= 3.0;
  if (condition.includes('thunder') || condition.includes('storm')) runScore -= 4.0;
  runScore = Math.max(0.5, Math.min(5.0, runScore));

  let runTime = '6:00 AM - 8:00 AM';
  if (temp > 30) runTime = '7:00 PM - 9:00 PM';
  else if (temp < 12) runTime = '12:00 PM - 3:00 PM';
  else runTime = 'Anytime during daylight';
  if (condition.includes('rain') || condition.includes('storm') || condition.includes('snow')) runTime = 'Not recommended';

  // 2. Coffee Walk
  let walkScore = 5.0;
  if (temp < 5 || temp > 35) walkScore -= 2.0;
  if (condition.includes('rain') || condition.includes('drizzle')) walkScore -= 2.0;
  if (condition.includes('storm') || condition.includes('snow')) walkScore -= 3.5;
  if (aqi.value >= 4) walkScore -= 2.0;
  walkScore = Math.max(0.5, Math.min(5.0, walkScore));

  let walkTime = '8:00 AM - 10:00 AM';
  if (temp > 28) walkTime = '5:00 PM - 7:00 PM';
  else if (temp < 10) walkTime = '11:00 AM - 1:00 PM';

  // 3. Photography
  let photoScore = 4.0;
  if (condition.includes('clear')) photoScore = 5.0;
  if (condition.includes('partly')) photoScore = 5.0;
  if (condition.includes('rain') || condition.includes('drizzle')) photoScore -= 2.0;
  if (condition.includes('storm') || condition.includes('snow')) photoScore -= 3.0;
  if (condition.includes('fog') || condition.includes('mist')) photoScore = 4.5;
  photoScore = Math.max(0.5, Math.min(5.0, photoScore));
  const photoTime = `Golden Hour (${weather.sun?.sunrise || '06:00'} / ${sunsetTime})`;

  // 4. Laundry
  let laundryScore = 5.0;
  if (current.humidity > 70) laundryScore -= 2.0;
  if (current.humidity > 85) laundryScore -= 2.5;
  if (condition.includes('rain') || condition.includes('drizzle') || condition.includes('snow') || condition.includes('storm')) {
    laundryScore = 0.5;
  }
  if (current.wind_speed < 5) laundryScore -= 0.5;
  laundryScore = Math.max(0.5, Math.min(5.0, laundryScore));

  let laundryTime = '10:00 AM - 3:00 PM';
  if (laundryScore === 0.5) laundryTime = 'Better to dry indoors';

  // 5. Travel
  let travelScore = 5.0;
  if (condition.includes('storm') || condition.includes('thunder')) travelScore -= 3.0;
  if (condition.includes('snow')) travelScore -= 2.5;
  if (condition.includes('fog') || condition.includes('mist')) travelScore -= 2.0;
  if (current.wind_speed > 35) travelScore -= 1.5;
  travelScore = Math.max(0.5, Math.min(5.0, travelScore));

  let travelTime = 'Anytime';
  if (travelScore < 3.0) travelTime = 'Avoid peak storm hours';
  else if (condition.includes('fog')) travelTime = 'Late morning';

  // 6. Sunset View
  let sunsetScore = 5.0;
  if (condition.includes('overcast') || condition.includes('cloudy')) sunsetScore -= 2.5;
  if (condition.includes('rain') || condition.includes('drizzle') || condition.includes('storm') || condition.includes('snow')) sunsetScore -= 4.0;
  sunsetScore = Math.max(0.5, Math.min(5.0, sunsetScore));

  const sunsetViewTime = `${sunsetTime} (Sunset)`;

  return [
    { name: 'Running', score: runScore, time: runTime, icon: Activity },
    { name: 'Coffee Walk', score: walkScore, time: walkTime, icon: Coffee },
    { name: 'Photography', score: photoScore, time: photoTime, icon: Camera },
    { name: 'Laundry', score: laundryScore, time: laundryTime, icon: Shirt },
    { name: 'Travel', score: travelScore, time: travelTime, icon: Car },
    { name: 'Sunset View', score: sunsetScore, time: sunsetViewTime, icon: Sunset },
  ];
}

// Dynamic emergency alerts generator
function getEmergencyAlerts(weather: WeatherData) {
  const current = weather.current;
  const aqi = weather.aqi;
  const temp = current.temp;
  const wind = current.wind_speed;
  const condition = current.condition.toLowerCase();

  const alerts = [];

  if (condition.includes('thunder') || condition.includes('storm')) {
    alerts.push({
      level: 'Critical', // Red
      title: 'Thunderstorm Warning',
      desc: 'Severe electrical storms in the area. Seek indoor shelter immediately.',
    });
  } else if (condition.includes('heavy rain') || condition.includes('torrential') || condition.includes('downpour')) {
    alerts.push({
      level: 'Warning', // Orange
      title: 'Heavy Rain Warning',
      desc: 'Risk of localized waterlogging and flash floods. Avoid driving.',
    });
  } else if (condition.includes('rain') || condition.includes('drizzle')) {
    alerts.push({
      level: 'Advisory', // Yellow
      title: 'Rain Advisory',
      desc: 'Expect wet road surfaces and minor commute slowdowns.',
    });
  }

  if (wind > 35) {
    alerts.push({
      level: 'Warning', // Orange
      title: 'Strong Wind Advisory',
      desc: `High wind gusts up to ${wind} km/h. Secure loose outdoor objects.`,
    });
  }

  if (temp > 38) {
    alerts.push({
      level: 'Critical', // Red
      title: 'Heat Wave Warning',
      desc: `Dangerous heat index of ${temp}°C. Avoid direct sun and hydrate constantly.`,
    });
  } else if (temp > 32) {
    alerts.push({
      level: 'Advisory', // Yellow
      title: 'High Heat Advisory',
      desc: `Temperatures reaching ${temp}°C. Stay hydrated and avoid strenuous activities.`,
    });
  } else if (temp < 0) {
    alerts.push({
      level: 'Warning', // Orange
      title: 'Freeze Warning',
      desc: `Sub-zero temperatures (${temp}°C). Protect delicate vegetation and outdoor pipes.`,
    });
  }

  if (condition.includes('fog') || condition.includes('mist')) {
    alerts.push({
      level: 'Advisory', // Yellow
      title: 'Dense Fog Advisory',
      desc: 'Significantly reduced visibility. Use fog lights and maintain safe braking distances.',
    });
  }

  if (aqi.value >= 5) {
    alerts.push({
      level: 'Critical', // Red
      title: 'Hazardous AQI',
      desc: 'Extremely poor air quality. Keep windows closed and avoid outdoor cardio.',
    });
  } else if (aqi.value === 4) {
    alerts.push({
      level: 'Warning', // Orange
      title: 'Poor AQI Advisory',
      desc: 'Unhealthy air quality detected. Limit heavy outdoor exercise.',
    });
  }

  return alerts;
}

// Local natural text summary generator
function getLocalSummary(weather: WeatherData): string {
  const current = weather.current;
  const temp = current.temp;
  const condition = current.condition;
  const uv = weather.uv_index.value;
  const aqi = weather.aqi.category;
  
  let summary = `Today in ${weather.city}, expect ${condition.toLowerCase()} conditions with temperatures around ${temp}°C. `;
  
  if (condition.toLowerCase().includes('rain') || condition.toLowerCase().includes('storm') || condition.toLowerCase().includes('drizzle')) {
    summary += `With active precipitation in the forecast, outdoor sessions are not recommended, and an umbrella is essential. `;
  } else if (temp > 28) {
    summary += `Due to elevated temperatures, the best window for outdoor activities is early morning or after sunset. `;
  } else if (temp < 12) {
    summary += `It is quite chilly, so layering up with a warm coat or jacket is advised if you head out. `;
  } else {
    summary += `The weather is highly pleasant; ideal for outdoor runs, coffee walks, or sunset viewing. `;
  }

  if (uv >= 6) {
    summary += `Remember to apply sunscreen (SPF 30+) due to high UV levels. `;
  } else if (weather.aqi.value >= 4) {
    summary += `Air quality is poor (${aqi.toLowerCase()}), so consider indoor workouts.`;
  }
  
  return summary;
}

export default function AtmosIntelligence({ weather }: AtmosIntelligenceProps) {
  const [aiSummary, setAiSummary] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState<boolean>(false);

  useEffect(() => {
    if (!weather?.city) return;

    let isMounted = true;
    const fetchAiSummary = async () => {
      setLoadingAi(true);
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        
        // Try getting API key from Atmos store
        const settings = useAtmosStore.getState().settings;
        if (settings.geminiApiKey) {
          headers['x-gemini-api-key'] = settings.geminiApiKey;
        }

        const response = await fetch('/api/ai', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            city: weather.city,
            weather_context: weather,
            message: `Generate a premium 2-3 sentence summary of today's weather context. Mention the condition/rain potential, temperature, best outdoor activity time, and any warnings/cautions in a natural, friendly tone. Do not mention HTML tags.`,
          }),
        });

        const data = await response.json();
        if (isMounted) {
          if (response.ok && data.reply) {
            setAiSummary(data.reply);
          } else {
            setAiSummary(getLocalSummary(weather));
          }
        }
      } catch (err) {
        console.warn('[Atmos Intelligence] API failed, using fallback summary:', err);
        if (isMounted) {
          setAiSummary(getLocalSummary(weather));
        }
      } finally {
        if (isMounted) {
          setLoadingAi(false);
        }
      }
    };

    fetchAiSummary();

    return () => {
      isMounted = false;
    };
  }, [weather.city, weather.current.temp, weather.current.condition]);

  // Derive all planners, outfits, health tips, and alerts
  const planners = getPlannerRatings(weather);
  const alerts = getEmergencyAlerts(weather);
  const currentTemp = weather.current.temp;
  const isRainy = weather.current.condition.toLowerCase().includes('rain') || 
                  weather.current.condition.toLowerCase().includes('storm') || 
                  weather.current.condition.toLowerCase().includes('drizzle');
  const uvValue = weather.uv_index.value;

  // Outfit Logic
  let topRec = 'Light Breathable T-Shirt';
  if (currentTemp < 10) topRec = 'Heavy Coat & Thermal Inner';
  else if (currentTemp < 17) topRec = 'Warm Sweater or Windbreaker';
  else if (currentTemp < 25) topRec = 'Light Sweater or Long Sleeve';

  let bottomRec = 'Shorts or Breathable Chinos';
  if (currentTemp < 15) bottomRec = 'Thick Denim or Fleece Joggers';
  else if (currentTemp < 25) bottomRec = 'Cotton Trousers or Jeans';

  let accRec = 'Minimalist Canvas Cap';
  if (currentTemp < 10) accRec = 'Knit Beanie & Scarf';
  else if (currentTemp < 18) accRec = 'Comfortable Crew Socks';

  const sunglassesRec = uvValue >= 5 ? 'Polarized UV Sunglasses' : null;
  const umbrellaRec = isRainy ? 'Windproof Compact Umbrella' : null;

  // Health Tips Logic
  const healthTips = [];
  // 1. UV Index Tip
  if (uvValue >= 8) healthTips.push('Apply SPF 50+ sunscreen, seek midday shade, and wear a hat.');
  else if (uvValue >= 5) healthTips.push('Apply SPF 30+ sunscreen and wear protective eyewear.');
  else healthTips.push('UV index is low; safe for extended outdoor exposure.');

  // 2. Air Quality Tip
  if (weather.aqi.value >= 4) healthTips.push('Avoid prolonged outdoor cardio; keep indoor windows closed.');
  else if (weather.aqi.value === 3) healthTips.push('Sensitive groups should limit heavy outdoor cardio.');
  else healthTips.push('Air quality is clean; ideal for deep breathing and physical activity.');

  // 3. Hydration / Humidity Tip
  if (currentTemp > 35) healthTips.push('Extreme heat: Drink electrolyte fluids and stay in shade.');
  else if (weather.current.humidity < 30) healthTips.push('Dry air: Drink extra fluids and apply skin moisturizer.');
  else if (weather.current.humidity > 80) healthTips.push('High humidity: Sweating is less efficient, slow down pace.');

  // 4. Wind Tip
  if (weather.current.wind_speed > 25) healthTips.push('Windy conditions: Protect eyes from airborne dust.');

  // Framer Motion staggered lists
  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } }
  };

  // Helper for alert colors
  const getAlertStyle = (level: string) => {
    switch (level) {
      case 'Critical':
        return { bg: 'bg-rose-500/15 border-rose-500/30', text: 'text-rose-400', badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40' };
      case 'Warning':
        return { bg: 'bg-amber-500/15 border-amber-500/30', text: 'text-amber-400', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      case 'Advisory':
        return { bg: 'bg-yellow-500/15 border-yellow-500/30', text: 'text-yellow-400', badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40' };
      default:
        return { bg: 'bg-emerald-500/15 border-emerald-500/30', text: 'text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
    }
  };

  return (
    <GlassCard className="p-6 w-full flex flex-col gap-6" delay={0.2}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-gradient-to-tr from-cyan-400 to-indigo-500 rounded-xl shadow-lg shadow-cyan-500/20">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white tracking-wide flex items-center gap-1.5 uppercase">
              Atmos Intelligence
              <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            </h2>
            <p className="text-[10px] text-white/50 font-medium">Real-time heuristics & AI synthesis</p>
          </div>
        </div>
      </div>

      {/* 5. Emergency Alerts at the top for critical visibility */}
      <div className="w-full">
        {alerts.length > 0 ? (
          <div className="flex flex-col gap-3">
            {alerts.map((alert, i) => {
              const styles = getAlertStyle(alert.level);
              return (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={`alert-${alert.title}-${i}`}
                  className={`flex items-start gap-3 p-4 rounded-2xl border ${styles.bg}`}
                >
                  <ShieldAlert className={`w-5 h-5 shrink-0 ${styles.text} mt-0.5`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-xs font-bold text-white leading-none">{alert.title}</h4>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full border font-semibold ${styles.badge}`}>
                        {alert.level}
                      </span>
                    </div>
                    <p className="text-[11px] text-white/70 leading-relaxed">{alert.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="text-xs font-bold text-emerald-300">✅ No Weather Alerts Today</span>
          </div>
        )}
      </div>

      {/* Grid: 1. AI Summary */}
      <div className="w-full">
        <h3 className="text-xs font-bold text-white/50 tracking-wider uppercase mb-2 flex items-center gap-1.5">
          <Brain className="w-3.5 h-3.5 text-cyan-400" />
          AI Summary
        </h3>
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 relative overflow-hidden min-h-[70px]">
          {loadingAi ? (
            <div className="space-y-2.5 animate-pulse py-1">
              <div className="h-3.5 bg-white/10 rounded-full w-full" />
              <div className="h-3.5 bg-white/10 rounded-full w-[90%]" />
              <div className="h-3.5 bg-white/10 rounded-full w-[60%]" />
            </div>
          ) : (
            <p className="text-xs text-white/90 leading-relaxed font-medium">
              {aiSummary}
            </p>
          )}
        </div>
      </div>

      {/* 2. Best Time Planner */}
      <div className="w-full">
        <h3 className="text-xs font-bold text-white/50 tracking-wider uppercase mb-3 flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-cyan-400" />
          Best Time Planner
        </h3>
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 md:grid-cols-3 gap-3"
        >
          {planners.map((activity, index) => {
            const Icon = activity.icon;
            // Generate star arrays
            const fullStars = Math.floor(activity.score);
            const hasHalfStar = activity.score % 1 !== 0;

            return (
              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.03, y: -2 }}
                key={`planner-${activity.name.toLowerCase().replace(/\s/g, '-')}-${index}`}
                className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex flex-col justify-between hover:bg-white/10 hover:border-white/15 transition-all duration-300"
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-cyan-400/10 text-cyan-400 rounded-lg">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-white">{activity.name}</span>
                  </div>
                  
                  {/* Star Rating */}
                  <div className="flex items-center gap-0.5 mb-2">
                    {Array.from({ length: 5 }).map((_, starIndex) => {
                      if (starIndex < fullStars) {
                        return <Star key={starIndex} className="w-3 h-3 fill-yellow-400 text-yellow-400" />;
                      }
                      if (starIndex === fullStars && hasHalfStar) {
                        return (
                          <div key={starIndex} className="relative w-3 h-3">
                            <Star className="absolute top-0 left-0 w-3 h-3 text-white/20" />
                            <div className="absolute top-0 left-0 w-[50%] h-full overflow-hidden">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            </div>
                          </div>
                        );
                      }
                      return <Star key={starIndex} className="w-3 h-3 text-white/20" />;
                    })}
                    <span className="text-[10px] text-white/60 ml-1 font-bold tabular-nums">
                      {activity.score.toFixed(1)}
                    </span>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-2 mt-1">
                  <span className="text-[9px] text-white/50 block uppercase tracking-wider font-semibold">Best Window</span>
                  <span className="text-[10px] text-white/80 font-bold leading-tight line-clamp-1">{activity.time}</span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Columns: Outfit & Health Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 3. Outfit Recommendation */}
        <div className="flex flex-col">
          <h3 className="text-xs font-bold text-white/50 tracking-wider uppercase mb-3 flex items-center gap-1.5">
            <Shirt className="w-3.5 h-3.5 text-cyan-400" />
            Outfit Recommendation
          </h3>
          <div className="flex-1 p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-3">
            {/* Top */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                <Shirt className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-white/50 uppercase tracking-wider block font-semibold">Top Layers</span>
                <span className="text-xs text-white/90 font-bold">{topRec}</span>
              </div>
            </div>

            {/* Bottom */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
                <Layers className="w-4 h-4 rotate-180" />
              </div>
              <div>
                <span className="text-[10px] text-white/50 uppercase tracking-wider block font-semibold">Bottoms</span>
                <span className="text-xs text-white/90 font-bold">{bottomRec}</span>
              </div>
            </div>

            {/* Accessories */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-white/50 uppercase tracking-wider block font-semibold">Accessories</span>
                <span className="text-xs text-white/90 font-bold">{accRec}</span>
              </div>
            </div>

            {/* Conditionally rendered sunglasses and umbrella */}
            <AnimatePresence>
              {sunglassesRec && (
                <motion.div
                  key="sunglasses"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-3 overflow-hidden"
                >
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                    <Glasses className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-white/50 uppercase tracking-wider block font-semibold">Sun Protection</span>
                    <span className="text-xs text-white/90 font-bold">{sunglassesRec}</span>
                  </div>
                </motion.div>
              )}

              {umbrellaRec && (
                <motion.div
                  key="umbrella"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-3 overflow-hidden"
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                    <Umbrella className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-white/50 uppercase tracking-wider block font-semibold">Rain Gear</span>
                    <span className="text-xs text-white/90 font-bold">{umbrellaRec}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* 4. Health Tips */}
        <div className="flex flex-col">
          <h3 className="text-xs font-bold text-white/50 tracking-wider uppercase mb-3 flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-cyan-400" />
            Health Tips
          </h3>
          <div className="flex-1 p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col justify-center gap-3.5">
            {healthTips.map((tip, index) => {
              // Assign bullet point icons
              let tipIcon = <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />;
              if (tip.includes('SPF') || tip.includes('sunscreen')) {
                tipIcon = <Sun className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5 animate-pulse" />;
              } else if (tip.includes('cardio') || tip.includes('air quality')) {
                tipIcon = <Droplets className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />;
              } else if (tip.includes('hydrate') || tip.includes('heat')) {
                tipIcon = <Thermometer className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />;
              } else if (tip.includes('Windy') || tip.includes('wind')) {
                tipIcon = <Wind className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />;
              }

              return (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  key={`tip-${index}`}
                  className="flex items-start gap-2.5"
                >
                  {tipIcon}
                  <p className="text-[11px] text-white/80 font-medium leading-relaxed">{tip}</p>
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>
    </GlassCard>
  );
}
