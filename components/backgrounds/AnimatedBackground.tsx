'use client';

import React, { useState, useEffect } from 'react';
import { WeatherConditionKey, CONDITION_GRADIENTS } from '@/lib/constants';

interface AnimatedBackgroundProps {
  condition: WeatherConditionKey;
}

/**
 * Full-page fixed gradient background only.
 * All weather particle effects are now scoped to HeroWeatherEffects inside WeatherHero.
 */
export default function AnimatedBackground({ condition }: AnimatedBackgroundProps) {
  const [mounted, setMounted] = useState(false);
  const gradient = CONDITION_GRADIENTS[condition] || CONDITION_GRADIENTS['clear-day'];

  useEffect(() => { setMounted(true); }, []);

  return (
    <div
      className="fixed inset-0 -z-50 h-full w-full overflow-hidden transition-all duration-[1200ms] ease-in-out"
      style={{
        background: `linear-gradient(135deg, ${gradient.from} 0%, ${gradient.to} 100%)`,
      }}
    >
      {/* Subtle ambient blurred glow nodes */}
      {mounted && (
        <>
          <div className="absolute top-[10%] left-[20%] h-96 w-96 rounded-full bg-white/5 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[15%] right-[10%] h-80 w-80 rounded-full bg-black/10 blur-[90px] pointer-events-none" />
        </>
      )}
    </div>
  );
}
