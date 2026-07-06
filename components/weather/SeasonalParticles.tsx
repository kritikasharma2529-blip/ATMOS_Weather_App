'use client';

import { useEffect, useRef, useState } from 'react';

/* ─── Season detection ───────────────────────────────────────────────────── */
type Season = 'spring' | 'summer' | 'autumn' | 'winter';

function getSeason(lat = 30): Season {
  const m = new Date().getMonth(); // 0–11
  // Meteorological seasons (northern hemisphere)
  let s: Season;
  if (m >= 2 && m <= 4) s = 'spring';
  else if (m >= 5 && m <= 7) s = 'summer';
  else if (m >= 8 && m <= 10) s = 'autumn';
  else s = 'winter';
  // Flip for southern hemisphere
  if (lat < 0) {
    const flip: Record<Season, Season> = { spring: 'autumn', summer: 'winter', autumn: 'spring', winter: 'summer' };
    s = flip[s];
  }
  return s;
}

/* ─── Particle type ──────────────────────────────────────────────────────── */
interface P {
  x: number; y: number;
  vx: number; vy: number;
  size: number; rot: number; rotV: number;
  opacity: number;
  wobble: number; wobbleV: number; wobbleA: number;
  color: string;
  shape: 'leaf' | 'flake' | 'petal' | 'shimmer';
}

/* ─── Season configs ─────────────────────────────────────────────────────── */
const COUNTS: Record<Season, number> = { autumn: 30, winter: 45, spring: 28, summer: 10 };

const AUTUMN_COLORS = ['#C84B11','#E25822','#D4A017','#8B4513','#B5530A','#A0522D'];
const SPRING_COLORS = ['#FFB7C5','#FFD1DC','#FFC0CB','#FFAEC9','#FFF0F5'];

function spawnParticle(W: number, season: Season): P {
  const x = Math.random() * W;
  switch (season) {
    case 'autumn': return {
      x, y: -20 - Math.random() * 60,
      vx: (Math.random() - 0.5) * 0.7, vy: 0.7 + Math.random() * 1.1,
      size: 8 + Math.random() * 11, rot: Math.random() * 360, rotV: (Math.random() - 0.5) * 2.8,
      opacity: 0.38 + Math.random() * 0.42,
      wobble: 0, wobbleV: 0.022 + Math.random() * 0.018, wobbleA: 22 + Math.random() * 22,
      color: AUTUMN_COLORS[Math.floor(Math.random() * AUTUMN_COLORS.length)],
      shape: 'leaf',
    };
    case 'winter': return {
      x, y: -20 - Math.random() * 40,
      vx: (Math.random() - 0.5) * 0.35, vy: 0.35 + Math.random() * 0.7,
      size: 2 + Math.random() * 4.5, rot: 0, rotV: 0.4 + Math.random() * 0.5,
      opacity: 0.28 + Math.random() * 0.48,
      wobble: 0, wobbleV: 0.014 + Math.random() * 0.012, wobbleA: 14 + Math.random() * 14,
      color: '#DCF0FF', shape: 'flake',
    };
    case 'spring': return {
      x, y: -20 - Math.random() * 50,
      vx: (Math.random() - 0.5) * 0.55, vy: 0.45 + Math.random() * 0.85,
      size: 5 + Math.random() * 7, rot: Math.random() * 360, rotV: (Math.random() - 0.5) * 1.4,
      opacity: 0.28 + Math.random() * 0.38,
      wobble: 0, wobbleV: 0.016 + Math.random() * 0.014, wobbleA: 18 + Math.random() * 16,
      color: SPRING_COLORS[Math.floor(Math.random() * SPRING_COLORS.length)],
      shape: 'petal',
    };
    default: return { // summer shimmer
      x, y: -20 - Math.random() * 30,
      vx: (Math.random() - 0.5) * 0.08, vy: 0.08 + Math.random() * 0.15,
      size: 45 + Math.random() * 65, rot: 0, rotV: 0,
      opacity: 0.015 + Math.random() * 0.025,
      wobble: 0, wobbleV: 0.008, wobbleA: 4,
      color: `rgba(255,${195 + Math.floor(Math.random() * 45)},60,1)`,
      shape: 'shimmer',
    };
  }
}

/* ─── Drawers ────────────────────────────────────────────────────────────── */
function drawLeaf(ctx: CanvasRenderingContext2D, p: P) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate((p.rot * Math.PI) / 180);
  ctx.globalAlpha = p.opacity;
  ctx.fillStyle = p.color;
  ctx.beginPath();
  ctx.ellipse(0, 0, p.size * 0.42, p.size * 0.88, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.18)';
  ctx.lineWidth = 0.6;
  ctx.beginPath(); ctx.moveTo(0, -p.size * 0.82); ctx.lineTo(0, p.size * 0.82);
  ctx.stroke();
  ctx.restore();
}

function drawFlake(ctx: CanvasRenderingContext2D, p: P) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate((p.rot * Math.PI) / 180);
  ctx.globalAlpha = p.opacity;
  ctx.fillStyle = p.color;
  ctx.beginPath(); ctx.arc(0, 0, p.size, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = p.color;
  ctx.lineWidth = p.size * 0.28;
  for (let i = 0; i < 6; i++) {
    ctx.save(); ctx.rotate((i * Math.PI) / 3);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, p.size * 2.4);
    ctx.stroke(); ctx.restore();
  }
  ctx.restore();
}

function drawPetal(ctx: CanvasRenderingContext2D, p: P) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate((p.rot * Math.PI) / 180);
  ctx.globalAlpha = p.opacity;
  ctx.fillStyle = p.color;
  ctx.beginPath();
  ctx.ellipse(0, 0, p.size * 0.32, p.size * 0.72, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawShimmer(ctx: CanvasRenderingContext2D, p: P) {
  const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
  g.addColorStop(0, `rgba(255,220,100,${p.opacity * 2.2})`);
  g.addColorStop(1, 'rgba(255,200,50,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
}

/* ─── Component ─────────────────────────────────────────────────────────── */
export default function SeasonalParticles({ lat }: { lat?: number }) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const frameRef   = useRef<number>(0);
  const pRef       = useRef<P[]>([]);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mq.matches);
    const h = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);

  useEffect(() => {
    if (reduceMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const season = getSeason(lat);
    const MAX    = COUNTS[season];

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const W = canvas.width, H = canvas.height;

      // Top up particle pool
      while (pRef.current.length < MAX) pRef.current.push(spawnParticle(W, season));

      pRef.current = pRef.current.filter(p => {
        // Physics
        p.wobble += p.wobbleV;
        p.x += p.vx + Math.sin(p.wobble) * (p.wobbleA / 65);
        p.y += p.vy;
        p.rot += p.rotV;

        if (p.y > H + 30 || p.x < -60 || p.x > W + 60) return false;

        ctx.save();
        switch (p.shape) {
          case 'leaf':    drawLeaf(ctx, p);    break;
          case 'flake':   drawFlake(ctx, p);   break;
          case 'petal':   drawPetal(ctx, p);   break;
          case 'shimmer': drawShimmer(ctx, p); break;
        }
        ctx.restore();
        return true;
      });

      frameRef.current = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', resize);
      pRef.current = [];
    };
  }, [lat, reduceMotion]);

  if (reduceMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[4]"
      aria-hidden="true"
      style={{ willChange: 'transform' }}
    />
  );
}
