'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CloudSun, Search, Star, Settings } from 'lucide-react';

export default function NavBar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Weather', href: '/', icon: CloudSun },
    { name: 'Search', href: '/search', icon: Search },
    { name: 'Favorites', href: '/favorites', icon: Star },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col items-center justify-between w-24 h-[calc(100vh-48px)] py-8 my-6 ml-6 border border-white/10 bg-white/10 backdrop-blur-xl rounded-[32px] shadow-2xl">
      {/* Brand Logo Icon */}
      <div className="flex flex-col items-center gap-1">
        <div className="p-3 bg-gradient-to-tr from-cyan-400 to-blue-500 rounded-2xl shadow-lg shadow-cyan-500/20">
          <CloudSun className="w-7 h-7 text-white" />
        </div>
        <span className="text-[11px] font-bold tracking-widest text-cyan-400 uppercase mt-1">Atmos</span>
      </div>

      {/* Nav List */}
      <nav className="flex flex-col gap-6 w-full px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.name}
              className={`
                relative
                flex
                flex-col
                items-center
                justify-center
                py-4
                w-full
                rounded-2xl
                transition-all
                duration-300
                group
                interactive-glow-sm
                ${
                  isActive
                    ? 'bg-white/15 text-white border border-white/10 shadow-[0_4px_12px_rgba(255,255,255,0.05)]'
                    : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
                }
              `}
            >
              {isActive && (
                <div className="absolute left-1 w-1 h-6 bg-cyan-400 rounded-full" />
              )}
              <Icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
              <span className="text-[10px] font-medium mt-1.5">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Version Tag */}
      <div className="text-[10px] font-medium text-white/30">v1.0</div>
    </aside>
  );
}
