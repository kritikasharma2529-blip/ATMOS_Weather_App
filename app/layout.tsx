import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import PageShell from '@/components/layout/PageShell';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Atmos 🌤️ Premium Weather & Activity Insights',
  description: 'Atmos combines accurate real-time forecasts with dynamic, condition-based backgrounds, a composite Weather Score, and personalized clothing/travel/outdoor activity recommendations.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className={`${inter.className} min-h-full bg-slate-950`}>
        <PageShell>{children}</PageShell>
      </body>
    </html>
  );
}
