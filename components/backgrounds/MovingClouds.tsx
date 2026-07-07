'use client';

import React, { useEffect, useRef } from 'react';

interface CloudDef {
  x: number;
  y: number;
  scale: number;
  speed: number;
  opacity: number;
}

function drawCloud(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
  opacity: number
) {
  const puffs = [
    { dx: 0,    dy: 0,   r: 70 * scale },
    { dx: 60,   dy: 10,  r: 58 * scale },
    { dx: -60,  dy: 10,  r: 54 * scale },
    { dx: 110,  dy: 20,  r: 46 * scale },
    { dx: -110, dy: 20,  r: 44 * scale },
    { dx: 30,   dy: -44, r: 50 * scale },
    { dx: -30,  dy: -40, r: 48 * scale },
    { dx: 80,   dy: -20, r: 40 * scale },
    { dx: -80,  dy: -16, r: 38 * scale },
    { dx: 0,    dy: -68, r: 36 * scale },
  ];

  ctx.save();
  ctx.globalCompositeOperation = 'source-over';

  puffs.forEach(({ dx, dy, r }) => {
    const px = cx + dx;
    const py = cy + dy;
    const grad = ctx.createRadialGradient(px, py, r * 0.05, px, py, r);
    grad.addColorStop(0,    `rgba(255,255,255,${(opacity * 0.95).toFixed(3)})`);
    grad.addColorStop(0.25, `rgba(245,250,255,${(opacity * 0.82).toFixed(3)})`);
    grad.addColorStop(0.55, `rgba(230,240,255,${(opacity * 0.55).toFixed(3)})`);
    grad.addColorStop(0.80, `rgba(215,230,255,${(opacity * 0.22).toFixed(3)})`);
    grad.addColorStop(1,    `rgba(200,220,255,0)`);

    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
  });

  ctx.restore();
}

export default function MovingClouds() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width  = (canvas.width  = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width  = canvas.width  = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Scroll fade: listen on the actual scrollable container (#main-scroll)
    const FADE_END = 120;
    const scrollEl = document.getElementById('main-scroll');

    const handleScroll = () => {
      const scrollTop = scrollEl ? scrollEl.scrollTop : window.scrollY;
      const progress = Math.min(scrollTop / FADE_END, 1);
      canvas.style.opacity = String((1 - progress).toFixed(3));
    };

    const target: EventTarget = scrollEl ?? window;
    target.addEventListener('scroll', handleScroll, { passive: true } as AddEventListenerOptions);
    handleScroll(); // apply on mount in case already scrolled

    const clouds: CloudDef[] = [
      { x: width * 0.00,  y: height * 0.02,  scale: 1.4,  speed: 0.25, opacity: 0.55 },
      { x: width * 0.35,  y: height * 0.01,  scale: 1.1,  speed: 0.15, opacity: 0.48 },
      { x: width * 0.68,  y: height * 0.04,  scale: 0.85, speed: 0.32, opacity: 0.45 },
      { x: width * 0.15,  y: height * 0.07,  scale: 0.65, speed: 0.40, opacity: 0.40 },
      { x: width * 0.52,  y: height * 0.06,  scale: 1.2,  speed: 0.18, opacity: 0.50 },
      { x: width * 0.80,  y: height * 0.03,  scale: 0.90, speed: 0.28, opacity: 0.42 },
      { x: -280,           y: height * 0.05,  scale: 1.0,  speed: 0.22, opacity: 0.46 },
    ];

    let raf: number;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      clouds.forEach((c) => {
        drawCloud(ctx, c.x, c.y, c.scale, c.opacity);
        c.x += c.speed;
        const cloudWidth = 220 * c.scale;
        if (c.x - cloudWidth > width) {
          c.x = -cloudWidth;
          c.y = height * (0.01 + Math.random() * 0.08);
        }
      });
      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', handleResize);
      target.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-500"
    />
  );
}
