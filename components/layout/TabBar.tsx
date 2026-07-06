'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CloudSun, Search, Star, Settings } from 'lucide-react';

export default function TabBar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Weather', href: '/', icon: CloudSun },
    { name: 'Search', href: '/search', icon: Search },
    { name: 'Favorites', href: '/favorites', icon: Star },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <nav className="md:hidden fixed bottom-4 left-4 right-4 z-40 h-16 px-4 bg-white/10 backdrop-blur-2xl border border-white/15 rounded-3xl shadow-2xl flex items-center justify-around">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.name}
            className={`
              flex
              flex-col
              items-center
              justify-center
              flex-1
              h-full
              min-w-[44px]
              min-h-[44px]
              rounded-2xl
              transition-all
              duration-300
              ${isActive ? 'text-cyan-400 font-semibold' : 'text-white/60'}
            `}
          >
            <div className={`p-1.5 rounded-xl transition-all duration-300 ${isActive ? 'bg-white/10 shadow-lg' : ''}`}>
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-[9px] mt-0.5 tracking-wide">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
