'use client';

import React, { useEffect } from 'react';
import NavBar from './NavBar';
import TabBar from './TabBar';
import AnimatedBackground from '../backgrounds/AnimatedBackground';
import CustomCursor from '../ui/CustomCursor';
import PageTransition from '../ui/PageTransition';
import { useAtmosStore } from '@/lib/store/useAtmosStore';
import { useHasMounted } from '@/lib/hooks/useHasMounted';

export default function PageShell({ children }: { children: React.ReactNode }) {
  const currentCondition = useAtmosStore((state) => state.currentCondition);
  const theme = useAtmosStore((state) => state.settings.theme);
  const hasMounted = useHasMounted();

  // Apply theme settings on client mount & settings changes
  useEffect(() => {
    if (!hasMounted) return;

    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      if (theme === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
      } else if (theme === 'light') {
        root.classList.add('light');
        root.classList.remove('dark');
      } else {
        // 'auto' theme
        if (mediaQuery.matches) {
          root.classList.add('dark');
          root.classList.remove('light');
        } else {
          root.classList.add('light');
          root.classList.remove('dark');
        }
      }
    };

    applyTheme();

    // Listen for system preference changes if 'auto'
    const handler = () => {
      if (theme === 'auto') applyTheme();
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [theme, hasMounted]);

  if (!hasMounted) {
    // Return placeholder layout during SSR/Hydration
    return (
      <div className="flex min-h-screen bg-slate-900 text-white">
        <div className="flex-1 p-6 md:p-8 pb-24 md:pb-8 max-w-[1200px] mx-auto w-full">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen text-white select-none transition-colors duration-500">
      {/* Global custom cursor — desktop only, self-disables on touch */}
      <CustomCursor />

      {/* Dynamic Background with Canvas animation */}
      <AnimatedBackground condition={currentCondition} />

      {/* Main Layout Container */}
      <div className="flex flex-col md:flex-row w-full min-h-screen overflow-x-hidden">
        {/* Desktop Sidebar Navigation */}
        <NavBar />

        {/* Core Content Area — wrapped in page transition */}
        <main className="flex-1 overflow-y-auto px-4 py-6 md:p-8 pb-28 md:pb-8 w-full max-w-[1200px] mx-auto flex flex-col">
          <PageTransition>
            {children}
          </PageTransition>
        </main>

        {/* Mobile Navigation Bottom Bar */}
        <TabBar />
      </div>
    </div>
  );
}
