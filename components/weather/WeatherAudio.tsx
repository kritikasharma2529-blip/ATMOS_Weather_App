'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';

/* ─── Sound type mapping ─────────────────────────────────────────────────── */
type SoundType = 'rain' | 'wind' | 'storm' | 'snow' | 'breeze';

function conditionToSound(condition: string): SoundType {
  const c = (condition || '').toLowerCase();
  if (c.includes('thunder') || c.includes('storm')) return 'storm';
  if (c.includes('rain') || c.includes('drizzle') || c.includes('shower')) return 'rain';
  if (c.includes('snow') || c.includes('blizzard') || c.includes('sleet')) return 'snow';
  if (c.includes('wind') || c.includes('gale')) return 'wind';
  return 'breeze';
}

/* ─── Noise buffer generators ────────────────────────────────────────────── */
function makeBrownNoise(ctx: AudioContext, secs: number): AudioBuffer {
  const n = ctx.sampleRate * secs;
  const buf = ctx.createBuffer(2, n, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    let last = 0;
    for (let i = 0; i < n; i++) {
      const w = Math.random() * 2 - 1;
      last = (last + 0.02 * w) / 1.02;
      d[i] = last * 3.5;
    }
  }
  return buf;
}

function makeWhiteNoise(ctx: AudioContext, secs: number): AudioBuffer {
  const n = ctx.sampleRate * secs;
  const buf = ctx.createBuffer(2, n, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  }
  return buf;
}

/* ─── Per-sound synthesis config ─────────────────────────────────────────── */
interface SoundCfg {
  noise: 'white' | 'brown';
  filterType: BiquadFilterType;
  freq: number;
  Q: number;
  gain: number;
}

const CONFIGS: Record<SoundType, SoundCfg> = {
  rain:   { noise: 'white', filterType: 'lowpass',  freq: 900,  Q: 0.7, gain: 0.16 },
  wind:   { noise: 'brown', filterType: 'bandpass', freq: 280,  Q: 0.5, gain: 0.22 },
  storm:  { noise: 'white', filterType: 'lowpass',  freq: 1800, Q: 0.8, gain: 0.20 },
  snow:   { noise: 'brown', filterType: 'lowpass',  freq: 180,  Q: 1.0, gain: 0.07 },
  breeze: { noise: 'brown', filterType: 'lowpass',  freq: 260,  Q: 0.7, gain: 0.055 },
};

/* ─── Component ─────────────────────────────────────────────────────────── */
export default function WeatherAudio({ condition }: { condition: string }) {
  const [muted, setMuted] = useState(true);
  const soundType = conditionToSound(condition);

  const ctxRef    = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainRef   = useRef<GainNode | null>(null);
  const thunderRef= useRef<ReturnType<typeof setTimeout> | null>(null);
  // Track the last sound type started so crossfade triggers correctly
  const activeTypeRef = useRef<SoundType | null>(null);

  /* -- stop current loop with optional fade -- */
  const stopCurrent = useCallback((fade = true) => {
    const ctx  = ctxRef.current;
    const gain = gainRef.current;
    const src  = sourceRef.current;
    if (!ctx || !gain || !src) return;
    if (fade) {
      gain.gain.setTargetAtTime(0, ctx.currentTime, 0.45);
      const t = setTimeout(() => { try { src.stop(); } catch {} }, 1600);
      return () => clearTimeout(t);
    }
    try { src.stop(); } catch {}
    sourceRef.current = null;
  }, []);

  /* -- thunder rumble for storm -- */
  const scheduleThunder = useCallback(() => {
    const delay = 9000 + Math.random() * 14000;
    thunderRef.current = setTimeout(() => {
      const ctx = ctxRef.current;
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(80 + Math.random() * 40, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(18, ctx.currentTime + 1.8);
      env.gain.setValueAtTime(0, ctx.currentTime);
      env.gain.linearRampToValueAtTime(0.14, ctx.currentTime + 0.12);
      env.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.8);
      osc.connect(env);
      env.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 3.2);
      scheduleThunder();
    }, delay);
  }, []);

  /* -- start a new sound layer -- */
  const startLayer = useCallback((type: SoundType) => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    const cfg = CONFIGS[type];

    const buf = cfg.noise === 'white' ? makeWhiteNoise(ctx, 5) : makeBrownNoise(ctx, 5);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = cfg.filterType;
    filter.frequency.value = cfg.freq;
    filter.Q.value = cfg.Q;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.setTargetAtTime(cfg.gain, ctx.currentTime, 1.4);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    src.start();

    sourceRef.current = src;
    gainRef.current   = gain;
    activeTypeRef.current = type;

    if (type === 'storm') scheduleThunder();
  }, [scheduleThunder]);

  /* -- main effect: react to mute + condition changes -- */
  useEffect(() => {
    if (muted) {
      gainRef.current?.gain.setTargetAtTime(0, ctxRef.current?.currentTime ?? 0, 0.4);
      if (thunderRef.current) { clearTimeout(thunderRef.current); thunderRef.current = null; }
      return;
    }

    // Lazy-init AudioContext on first user interaction
    if (!ctxRef.current) ctxRef.current = new AudioContext();
    if (ctxRef.current.state === 'suspended') ctxRef.current.resume();

    if (activeTypeRef.current === soundType) return; // no change

    // Crossfade: fade out → start new
    stopCurrent(true);
    if (thunderRef.current) { clearTimeout(thunderRef.current); thunderRef.current = null; }
    const t = setTimeout(() => startLayer(soundType), 700);
    return () => clearTimeout(t);
  }, [muted, soundType, stopCurrent, startLayer]);

  /* -- cleanup -- */
  useEffect(() => () => {
    if (thunderRef.current) clearTimeout(thunderRef.current);
    try { sourceRef.current?.stop(); } catch {}
    ctxRef.current?.close();
  }, []);

  return (
    <motion.button
      id="weather-audio-toggle"
      onClick={() => setMuted(m => !m)}
      title={muted ? 'Enable ambient sound' : 'Mute ambient sound'}
      aria-label={muted ? 'Enable ambient weather sounds' : 'Mute ambient weather sounds'}
      className="fixed top-4 right-4 z-[200] flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-900/70 hover:bg-slate-800/80 border border-white/10 hover:border-white/20 backdrop-blur-md text-white/60 hover:text-white transition-all shadow-lg"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2, duration: 0.4 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.93 }}
    >
      {muted
        ? <VolumeX className="w-4 h-4 shrink-0" />
        : <Volume2 className="w-4 h-4 shrink-0 text-cyan-400 animate-pulse" />
      }
      <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline select-none">
        {muted ? 'Sound' : 'Live'}
      </span>
    </motion.button>
  );
}
