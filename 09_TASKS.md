# Atmos — Task Checklist

## Setup
- [ ] Initialize Next.js project with TypeScript
- [ ] Configure Tailwind CSS + design tokens
- [ ] Install Framer Motion, SWR/React Query, Zustand, Zod, date-fns
- [ ] Set up `.env.local` with weather provider API key
- [ ] Configure Vercel project + environment variables

## Core Weather Data
- [ ] Build internal `weatherProvider` abstraction (OpenWeatherMap/WeatherAPI)
- [ ] Implement `/api/weather` route (current conditions)
- [ ] Implement `/api/forecast` route (hourly + weekly)
- [ ] Implement `/api/search` route (city autocomplete)
- [ ] Add response caching (TTL) for weather endpoints

## UI — Core Components
- [ ] Build `GlassCard` base component
- [ ] Build `WeatherHero` (temp, condition, icon)
- [ ] Build `HourlyStrip` (scrollable hourly forecast)
- [ ] Build `WeeklyList` (7-day forecast)
- [ ] Build `MetricTile` (AQI, UV, sunrise/sunset, humidity, wind)
- [ ] Build `SearchBar` with autocomplete dropdown

## Visual Experience
- [ ] Define gradient tokens per condition + time-of-day
- [ ] Build animated background layer (rain, snow, clouds, clear, storm, fog)
- [ ] Apply glassmorphism styling app-wide
- [ ] Implement page/section transition animations (Framer Motion)
- [ ] Add skeleton/shimmer loading states
- [ ] Implement `prefers-reduced-motion` handling

## Personalization & Insights
- [ ] Build Recommendation Engine (clothing logic)
- [ ] Build Recommendation Engine (outdoor activity logic)
- [ ] Build Recommendation Engine (travel advice logic)
- [ ] Implement Weather Score calculation
- [ ] Build `WeatherScoreRing` animated component
- [ ] Implement Favorites (add/remove, persisted via Zustand + localStorage)
- [ ] Implement Search History (capped, de-duplicated, persisted)
- [ ] Build Favorites tab/page
- [ ] Build Settings page (units, theme, clear history)

## AI Assistant (Optional)
- [ ] Set up Gemini API client
- [ ] Implement `/api/ai` route with weather-context injection
- [ ] Build `AIAssistantPanel` chat UI (drawer/sheet)
- [ ] Add streaming response handling
- [ ] Add feature flag to enable/disable AI Assistant
- [ ] Handle AI errors/unavailable states gracefully

## Responsive & Accessibility
- [ ] Verify layouts at `sm`, `md`, `lg`, `xl` breakpoints
- [ ] Ensure 44px+ touch targets on mobile
- [ ] Audit color contrast on all gradient backgrounds
- [ ] Add ARIA labels to icons and interactive elements
- [ ] Verify full keyboard navigation
- [ ] Screen-reader test for Weather Score and AQI announcements

## Performance & QA
- [ ] Optimize images/assets via Next.js `<Image>`
- [ ] Lazy-load AI panel and heavy animation components
- [ ] Measure and tune Core Web Vitals (LCP, CLS, INP)
- [ ] Cross-browser testing (Chrome, Safari, Firefox, Edge)
- [ ] Cross-device testing (iOS, Android, desktop)

## Launch
- [ ] Final QA pass on production build
- [ ] Deploy to Vercel (production)
- [ ] Verify environment variables in production
- [ ] Smoke test all API routes in production
- [ ] Publish README with setup instructions
