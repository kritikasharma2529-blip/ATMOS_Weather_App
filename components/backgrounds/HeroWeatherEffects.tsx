'use client';

import React, { useEffect, useRef } from 'react';
import { WeatherConditionKey } from '@/lib/constants';

interface HeroWeatherEffectsProps {
  condition: WeatherConditionKey;
}

/**
 * Weather particle effects scoped to the hero card only.
 * Renders rain, snow, stars, cloud blobs, sun-glow and moving clouds
 * as an absolute canvas inside the hero container — scrolls away naturally.
 */
export default function HeroWeatherEffects({ condition }: HeroWeatherEffectsProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    let animationFrameId: number;

    // Size canvas to match the hero container (not the viewport)
    let width = (canvas.width = parent.offsetWidth);
    let height = (canvas.height = parent.offsetHeight);

    const ro = new ResizeObserver(() => {
      width = canvas.width = parent.offsetWidth;
      height = canvas.height = parent.offsetHeight;
    });
    ro.observe(parent);

    // ── Rain ─────────────────────────────────────────────────────────────────
    interface RainDrop { x: number; y: number; len: number; speed: number; opacity: number; }
    const rainDrops: RainDrop[] = [];
    if (condition === 'rain' || condition === 'thunderstorm') {
      for (let i = 0; i < 100; i++) {
        rainDrops.push({
          x: Math.random() * width,
          y: Math.random() * height - height,
          len: 10 + Math.random() * 18,
          speed: 6 + Math.random() * 7,
          opacity: 0.15 + Math.random() * 0.28,
        });
      }
    }

    // ── Snow ─────────────────────────────────────────────────────────────────
    interface SnowFlake { x: number; y: number; r: number; d: number; speed: number; opacity: number; }
    const flakes: SnowFlake[] = [];
    if (condition === 'snow') {
      for (let i = 0; i < 80; i++) {
        flakes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: 1 + Math.random() * 3,
          d: Math.random() * 80,
          speed: 0.8 + Math.random() * 1.5,
          opacity: 0.2 + Math.random() * 0.6,
        });
      }
    }

    // ── Stars ────────────────────────────────────────────────────────────────
    interface Star { x: number; y: number; r: number; opacity: number; speed: number; increasing: boolean; }
    const stars: Star[] = [];
    if (condition === 'clear-night') {
      for (let i = 0; i < 60; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: 0.5 + Math.random() * 1.5,
          opacity: Math.random(),
          speed: 0.005 + Math.random() * 0.015,
          increasing: Math.random() > 0.5,
        });
      }
    }

    // ── Cloud blobs (cloudy / fog-haze) ──────────────────────────────────────
    interface CloudBlob { x: number; y: number; r: number; speed: number; opacity: number; }
    const cloudBlobs: CloudBlob[] = [];
    if (condition === 'cloudy' || condition === 'fog-haze') {
      for (let i = 0; i < 6; i++) {
        cloudBlobs.push({
          x: Math.random() * width * 1.5 - width * 0.25,
          y: Math.random() * (height * 0.5),
          r: 80 + Math.random() * 100,
          speed: 0.04 + Math.random() * 0.08,
          opacity: 0.05 + Math.random() * 0.08,
        });
      }
    }

    // ── Moving clouds with proper silhouette shape (all conditions) ─────────────
    interface CloudDef { x: number; y: number; w: number; h: number; speed: number; opacity: number; }
    const movingClouds: CloudDef[] = [
      { x: width * 0.00, y: height * 0.18, w: 260, h: 80, speed: 0.20, opacity: 0.52 },
      { x: width * 0.40, y: height * 0.12, w: 200, h: 62, speed: 0.12, opacity: 0.44 },
      { x: width * 0.68, y: height * 0.22, w: 160, h: 50, speed: 0.26, opacity: 0.40 },
      { x: -220, y: height * 0.15, w: 230, h: 70, speed: 0.18, opacity: 0.46 },
    ];

    /**
     * Draws a realistic cloud silhouette using connected circular arcs.
     * cx/cy = left-edge, bottom of the cloud.
     * w = total width, h = total height of the cloud.
     */
    function drawCloudShape(
      cx: number, cy: number,
      w: number, h: number,
      opacity: number
    ) {
      ctx!.save();
      ctx!.beginPath();

      // Cloud arc layout (all positions relative to cx/cy):
      //   bottom-left → left bump → tall centre bump → right-centre bump → right small bump → bottom-right → flat base → close
      const bx = cx;   // base-left x
      const by = cy;   // base y (bottom of cloud)

      // Left small bump
      ctx!.arc(bx + w * 0.15, by - h * 0.28, h * 0.28, Math.PI * 0.5, Math.PI * 1.55, false);
      // Centre-left tall bump (highest point)
      ctx!.arc(bx + w * 0.38, by - h * 0.62, h * 0.36, Math.PI * 1.0, Math.PI * 1.92, false);
      // Centre-right bump
      ctx!.arc(bx + w * 0.62, by - h * 0.48, h * 0.28, Math.PI * 0.85, 0, false);
      // Right small bump
      ctx!.arc(bx + w * 0.83, by - h * 0.22, h * 0.20, Math.PI * 0.6, 0, false);

      // Flat base: bottom-right → bottom-left
      ctx!.lineTo(bx + w, by);
      ctx!.lineTo(bx, by);
      ctx!.closePath();

      // Vertical gradient: bright white at top, soft transparent at base
      const grad = ctx!.createLinearGradient(bx, by - h, bx, by);
      grad.addColorStop(0, `rgba(255,255,255,${(opacity * 1.00).toFixed(3)})`);
      grad.addColorStop(0.35, `rgba(248,252,255,${(opacity * 0.88).toFixed(3)})`);
      grad.addColorStop(0.70, `rgba(235,245,255,${(opacity * 0.60).toFixed(3)})`);
      grad.addColorStop(1, `rgba(210,230,255,${(opacity * 0.20).toFixed(3)})`);

      ctx!.fillStyle = grad;
      ctx!.fill();
      ctx!.restore();
    }

    // ── Thunderstorm flash ────────────────────────────────────────────────────
    let flashOpacity = 0;
    let nextFlash = 120 + Math.random() * 240;

    // ── Draw loop ─────────────────────────────────────────────────────────────
    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Moving clouds — proper silhouette shape
      movingClouds.forEach((c) => {
        // cx = left edge of cloud, cy = bottom of cloud
        drawCloudShape(c.x, c.y, c.w, c.h, c.opacity);
        c.x += c.speed;
        if (c.x > width + c.w) {
          c.x = -c.w;
          c.y = height * (0.08 + Math.random() * 0.20);
        }
      });

      // Cloud blobs
      if (condition === 'cloudy' || condition === 'fog-haze') {
        cloudBlobs.forEach((cloud) => {
          const grad = ctx.createRadialGradient(cloud.x, cloud.y, 10, cloud.x, cloud.y, cloud.r);
          grad.addColorStop(0, `rgba(255,255,255,${cloud.opacity})`);
          grad.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.beginPath();
          ctx.arc(cloud.x, cloud.y, cloud.r, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
          cloud.x += cloud.speed;
          if (cloud.x - cloud.r > width) {
            cloud.x = -cloud.r;
            cloud.y = Math.random() * (height * 0.5);
          }
        });
      }

      // Rain
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
          if (d.y > height) { d.y = -d.len; d.x = Math.random() * width; }
        });
        ctx.stroke();
      }

      // Thunderstorm flash
      if (condition === 'thunderstorm') {
        nextFlash--;
        if (nextFlash <= 0) {
          flashOpacity = 0.5 + Math.random() * 0.4;
          nextFlash = 200 + Math.random() * 350;
        }
        if (flashOpacity > 0) {
          ctx.fillStyle = `rgba(255,255,255,${flashOpacity})`;
          ctx.fillRect(0, 0, width, height);
          flashOpacity -= 0.05;
        }
      }

      // Snow
      if (condition === 'snow') {
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.beginPath();
        flakes.forEach((f) => {
          ctx.moveTo(f.x, f.y);
          ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2, true);
          f.y += f.speed;
          f.x += Math.sin(f.d / 30) * 0.5;
          if (f.y > height) { f.y = -5; f.x = Math.random() * width; }
          f.d += 1;
        });
        ctx.fill();
      }

      // Stars
      if (condition === 'clear-night') {
        stars.forEach((s) => {
          ctx.beginPath();
          ctx.fillStyle = `rgba(255,255,255,${s.opacity})`;
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          ctx.fill();
          if (s.increasing) { s.opacity += s.speed; if (s.opacity >= 0.9) s.increasing = false; }
          else { s.opacity -= s.speed; if (s.opacity <= 0.1) s.increasing = true; }
        });
      }

      // Sun glow
      if (condition === 'clear-day') {
        const glow = ctx.createRadialGradient(width * 0.88, height * 0.12, 30, width * 0.88, height * 0.12, width * 0.5);
        glow.addColorStop(0, 'rgba(255,230,150,0.14)');
        glow.addColorStop(0.5, 'rgba(255,255,255,0.04)');
        glow.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(width * 0.88, height * 0.12, width * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    animationFrameId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationFrameId);
      ro.disconnect();
    };
  }, [condition]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none z-0 rounded-[inherit] overflow-hidden opacity-70"
    />
  );
}
