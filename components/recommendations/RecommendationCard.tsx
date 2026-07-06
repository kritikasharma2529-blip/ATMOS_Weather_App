'use client';

import React from 'react';
import { Shirt, Compass, Plane, Sparkles } from 'lucide-react';
import GlassCard from '../ui/GlassCard';

interface RecommendationCardProps {
  clothing: string;
  activity: string;
  travel: string;
}

export default function RecommendationCard({ clothing, activity, travel }: RecommendationCardProps) {
  const recommendations = [
    {
      title: 'What to Wear',
      desc: clothing,
      icon: Shirt,
      colorClass: 'text-rose-400 bg-rose-400/10 border-rose-400/20',
    },
    {
      title: 'Outdoor Activities',
      desc: activity,
      icon: Compass,
      colorClass: 'text-green-400 bg-green-400/10 border-green-400/20',
    },
    {
      title: 'Travel Advice',
      desc: travel,
      icon: Plane,
      colorClass: 'text-sky-400 bg-sky-400/10 border-sky-400/20',
    },
  ];

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex items-center gap-2 text-white/80 select-text">
        <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
        <h2 className="text-xl font-bold tracking-wide">Personalized Atmos Insights</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {recommendations.map((rec, i) => {
          const Icon = rec.icon;
          return (
            <GlassCard key={`${rec.title}-${i}`} className="p-6 flex flex-col min-h-[180px]" delay={0.25 + i * 0.05}>
              {/* Header Icon + Label */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2.5 rounded-xl border ${rec.colorClass}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white tracking-wide">{rec.title}</h3>
              </div>

              {/* Text description */}
              <p className="text-sm text-white/80 leading-relaxed select-text flex-1">
                {rec.desc}
              </p>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
