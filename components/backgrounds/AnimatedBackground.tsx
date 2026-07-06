'use client';

import React, { useEffect, useRef, useState } from 'react';
import { WeatherConditionKey, CONDITION_GRADIENTS } from '@/lib/constants';

interface AnimatedBackgroundProps {
  condition: WeatherConditionKey;
}

export default function AnimatedBackground({ condition }: AnimatedBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const gradient = CONDITION_GRADIENTS[condition] || CONDITION_GRADIENTS['clear-day'];

  // Check for reduced motion preferences
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // --- Weather Particles Definitions ---

    // 1. Rain
    interface RainDrop {
      x: number;
      y: number;
      len: number;
      speed: number;
      opacity: number;
    }
    const rainDrops: RainDrop[] = [];
    const maxRain = 120;
    const initRain = () => {
      for (let i = 0; i < maxRain; i++) {
        rainDrops.push({
          x: Math.random() * width,
          y: Math.random() * height - height,
          len: 10 + Math.random() * 20,
          speed: 6 + Math.random() * 8,
          opacity: 0.15 + Math.random() * 0.3,
        });
      }
    };

    // 2. Snow
    interface SnowFlake {
      x: number;
      y: number;
      r: number;
      d: number; // density/speed
      speed: number;
      opacity: number;
    }
    const flakes: SnowFlake[] = [];
    const maxSnow = 100;
    const initSnow = () => {
      for (let i = 0; i < maxSnow; i++) {
        flakes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: 1 + Math.random() * 4,
          d: Math.random() * maxSnow,
          speed: 1 + Math.random() * 2,
          opacity: 0.2 + Math.random() * 0.6,
        });
      }
    };

    // 3. Stars (Clear Night)
    interface Star {
      x: number;
      y: number;
      r: number;
      opacity: number;
      speed: number;
      increasing: boolean;
    }
    const stars: Star[] = [];
    const maxStars = 80;
    const initStars = () => {
      for (let i = 0; i < maxStars; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: 0.5 + Math.random() * 1.5,
          opacity: Math.random(),
          speed: 0.005 + Math.random() * 0.015,
          increasing: Math.random() > 0.5,
        });
      }
    };

    // 4. Clouds (Cloudy)
    interface CloudParticle {
      x: number;
      y: number;
      r: number;
      speed: number;
      opacity: number;
    }
    const clouds: CloudParticle[] = [];
    const maxClouds = 8;
    const initClouds = () => {
      for (let i = 0; i < maxClouds; i++) {
        clouds.push({
          x: Math.random() * width * 1.5 - width * 0.25,
          y: Math.random() * (height * 0.5),
          r: 100 + Math.random() * 120,
          speed: 0.05 + Math.random() * 0.1,
          opacity: 0.05 + Math.random() * 0.08,
        });
      }
    };

    // Initialize based on condition
    if (condition === 'rain' || condition === 'thunderstorm') initRain();
    if (condition === 'snow') initSnow();
    if (condition === 'clear-night') initStars();
    if (condition === 'cloudy' || condition === 'fog-haze') initClouds();

    // Thunderstorm state
    let flashOpacity = 0;
    let nextFlash = 120 + Math.random() * 240; // frames till next flash

    // Draw Loop
    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // --- RENDER CLOUDY / FOG-HAZE ANIMATION ---
      if (condition === 'cloudy' || condition === 'fog-haze') {
        clouds.forEach((cloud) => {
          ctx.beginPath();
          const grad = ctx.createRadialGradient(cloud.x, cloud.y, 10, cloud.x, cloud.y, cloud.r);
          grad.addColorStop(0, `rgba(255, 255, 255, ${cloud.opacity})`);
          grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = grad;
          ctx.arc(cloud.x, cloud.y, cloud.r, 0, Math.PI * 2);
          ctx.fill();

          cloud.x += cloud.speed;
          if (cloud.x - cloud.r > width) {
            cloud.x = -cloud.r;
            cloud.y = Math.random() * (height * 0.5);
          }
        });
      }

      // --- RENDER RAIN ---
      if (condition === 'rain' || condition === 'thunderstorm') {
        ctx.strokeStyle = 'rgba(174,194,224,0.5)';
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        rainDrops.forEach((d) => {
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d.x + d.len * 0.15, d.y + d.len);

          d.y += d.speed;
          d.x += d.speed * 0.15;

          if (d.y > height) {
            d.y = -d.len;
            d.x = Math.random() * width;
          }
        });
        ctx.stroke();
      }

      // --- RENDER THUNDERSTORM SPECIAL FLASH ---
      if (condition === 'thunderstorm') {
        nextFlash--;
        if (nextFlash <= 0) {
          flashOpacity = 0.5 + Math.random() * 0.4; // set high flash opacity
          nextFlash = 200 + Math.random() * 350; // reset counter
        }

        if (flashOpacity > 0) {
          ctx.fillStyle = `rgba(255, 255, 255, ${flashOpacity})`;
          ctx.fillRect(0, 0, width, height);
          flashOpacity -= 0.05; // fade flash quickly
        }
      }

      // --- RENDER SNOW ---
      if (condition === 'snow') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        flakes.forEach((f) => {
          ctx.moveTo(f.x, f.y);
          ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2, true);

          // Update position
          f.y += f.speed;
          f.x += Math.sin(f.d / 30) * 0.5;

          if (f.y > height) {
            f.y = -5;
            f.x = Math.random() * width;
          }
          f.d += 1;
        });
        ctx.fill();
      }

      // --- RENDER TWINKLING STARS (Clear Night) ---
      if (condition === 'clear-night') {
        stars.forEach((s) => {
          ctx.beginPath();
          ctx.fillStyle = `rgba(255, 255, 255, ${s.opacity})`;
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          ctx.fill();

          // Twinkle opacity swing
          if (s.increasing) {
            s.opacity += s.speed;
            if (s.opacity >= 0.9) s.increasing = false;
          } else {
            s.opacity -= s.speed;
            if (s.opacity <= 0.1) s.increasing = true;
          }
        });
      }

      // --- RENDER CLEAR SUN GLOW (Clear Day) ---
      if (condition === 'clear-day') {
        // Draw soft pulsing light ray vectors from top right corner
        const gradientGlow = ctx.createRadialGradient(
          width * 0.9,
          height * 0.1,
          50,
          width * 0.9,
          height * 0.1,
          width * 0.5
        );
        gradientGlow.addColorStop(0, 'rgba(255, 230, 150, 0.12)');
        gradientGlow.addColorStop(0.5, 'rgba(255, 255, 255, 0.04)');
        gradientGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradientGlow;
        ctx.beginPath();
        ctx.arc(width * 0.9, height * 0.1, width * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    animationFrameId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [condition, reducedMotion]);

  return (
    <div
      className="fixed inset-0 -z-50 h-full w-full overflow-hidden transition-all duration-[1200ms] ease-in-out"
      style={{
        background: `linear-gradient(135deg, ${gradient.from} 0%, ${gradient.to} 100%)`,
      }}
    >
      {/* Decorative ambient blurred nodes */}
      <div className="absolute top-[10%] left-[20%] h-96 w-96 rounded-full bg-white/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[15%] right-[10%] h-80 w-80 rounded-full bg-black/10 blur-[90px] pointer-events-none" />

      {!reducedMotion && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full pointer-events-none mix-blend-screen opacity-90"
        />
      )}
    </div>
  );
}
