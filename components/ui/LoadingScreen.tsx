'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { CloudSun } from 'lucide-react';

interface LoadingScreenProps {
  onComplete: () => void;
}

const LOADING_QUOTES = [
  "\"There is no such thing as bad weather, only different kinds of good weather.\" — John Ruskin",
  "\"Wherever you go, no matter what the weather, always bring your own sunshine.\" — Anthony J. D'Angelo",
  "\"In the presence of nature, a wild delight runs through the man, in spite of real sorrows.\" — Ralph Waldo Emerson",
  "\"The air soft, the stars so fine, the promise of every clean breeze.\" — Jack Kerouac",
  "\"Some people feel the rain. Others just get wet.\" — Bob Marley",
  "\"A change in the weather is sufficient to recreate the world and ourselves.\" — Marcel Proust",
  "\"Live in the sunshine, swim the sea, drink the wild air.\" — Ralph Waldo Emerson"
];

const getGreeting = () => {
  const hr = new Date().getHours();
  if (hr >= 5 && hr < 12) return '☀ Good Morning';
  if (hr >= 12 && hr < 17) return '🌤 Good Afternoon';
  return '🌙 Good Evening';
};

const getLoadingMessage = (progress: number) => {
  if (progress < 20) return '🌍 Detecting Location...';
  if (progress < 45) return '☁ Fetching Weather...';
  if (progress < 70) return '🧠 Connecting AI...';
  if (progress < 90) return '📊 Calculating Weather Score...';
  return '✨ Preparing Dashboard...';
};

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [quote] = useState(() => LOADING_QUOTES[Math.floor(Math.random() * LOADING_QUOTES.length)]);
  const [greeting] = useState(() => getGreeting());
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Animate progress bar to 100% over 2.8 seconds
  useEffect(() => {
    const duration = 2800; // 2.8 seconds
    const intervalTime = 20; // 50 updates per second
    const increment = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 300); // Small pause at 100% before completion callback
          return 100;
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onComplete]);

  // Floating ambient particles canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      color: string;
    }> = [];

    const numParticles = 35;
    const colors = ['rgba(34, 211, 238, 0.25)', 'rgba(168, 85, 247, 0.2)', 'rgba(255, 255, 255, 0.15)'];

    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() * 0.3 - 0.15),
        vy: (Math.random() * 0.3 - 0.15),
        size: Math.random() * 5 + 2,
        opacity: Math.random() * 0.4 + 0.2,
        color: colors[i % colors.length],
      });
    }

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#0b1528] via-[#091f3a] to-[#040c1a]">
      {/* Canvas background particles */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Decorative ambient gradients */}
      <div className="absolute top-[15%] left-[10%] h-[30rem] w-[30rem] rounded-full bg-cyan-500/10 blur-[150px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[10%] right-[10%] h-[30rem] w-[30rem] rounded-full bg-purple-500/10 blur-[150px] animate-pulse pointer-events-none" />

      {/* Central Glassmorphism Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 w-[90%] max-w-[460px] p-8 md:p-10 rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_24px_64px_rgba(0,0,0,0.4)] text-center"
      >
        {/* Animated Logo Wrapper */}
        <div className="flex justify-center mb-6">
          <motion.div
            animate={{
              scale: [1, 1.06, 1],
              rotate: [0, 4, -4, 0],
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="relative flex items-center justify-center w-20 h-20 rounded-[24px] bg-gradient-to-br from-cyan-400/20 to-purple-500/20 border border-white/10 shadow-lg shadow-cyan-500/10"
          >
            <CloudSun className="w-10 h-10 text-cyan-300 drop-shadow-[0_0_12px_rgba(34,211,238,0.5)]" />
          </motion.div>
        </div>

        {/* Dynamic Greeting */}
        <h2 className="text-sm font-semibold tracking-widest text-cyan-400 uppercase mb-2 select-none">
          {greeting}
        </h2>

        {/* Title */}
        <h1 className="text-3xl font-extrabold text-white tracking-wide mb-6 select-none">
          ATMOS
        </h1>

        {/* Status Text Box with subtle swap transition */}
        <div className="h-6 mb-3 flex items-center justify-center">
          <span className="text-sm font-medium text-white/70 tracking-wide select-none animate-pulse">
            {getLoadingMessage(progress)}
          </span>
        </div>

        {/* Premium Progress Bar Wrapper */}
        <div className="relative w-full h-[6px] bg-white/10 rounded-full overflow-hidden mb-6">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-500 rounded-full transition-all duration-150 ease-out"
            style={{
              width: `${progress}%`,
              boxShadow: '0 0 10px rgba(34,211,238,0.5)',
            }}
          />
        </div>

        {/* Random Quote */}
        <div className="min-h-[60px] flex items-center justify-center px-2">
          <p className="text-xs italic text-white/40 leading-relaxed font-light select-none">
            {quote}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
