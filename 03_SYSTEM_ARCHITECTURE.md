# Atmos — System Architecture

## 1. High-Level Architecture

```
┌────────────────────────────────────────────────────────┐
│                        Client (Browser)                 │
│   Next.js (React) + Tailwind CSS + Framer Motion         │
└───────────────┬──────────────────────────┬──────────────┘
                │                          │
                ▼                          ▼
   ┌─────────────────────┐     ┌─────────────────────────┐
   │  Next.js API Routes  │     │  FastAPI Backend (opt.) │
   │  (BFF / proxy layer) │     │  Advanced logic, caching│
   └──────────┬───────────┘     └──────────┬──────────────┘
              │                             │
              ▼                             ▼
   ┌─────────────────────┐     ┌─────────────────────────┐
   │ OpenWeatherMap /     │     │   Gemini API (optional)  │
   │ WeatherAPI           │     │   AI Weather Assistant   │
   └─────────────────────┘     └─────────────────────────┘
```

Atmos is deployed as a Next.js app on Vercel. For MVP, Next.js API routes act as a lightweight Backend-for-Frontend (BFF), proxying and caching requests to the weather provider. FastAPI is an optional service layer introduced when logic (recommendation scoring, AI orchestration, caching, rate-limiting) grows beyond what serverless functions comfortably handle.

## 2. Frontend
- **Framework**: Next.js (App Router), React Server Components where suitable for data-heavy pages.
- **Styling**: Tailwind CSS with custom design tokens (gradients, glass utilities).
- **Animation**: Framer Motion for transitions; Canvas/SVG for weather background effects.
- **State Management**: 
  - Server state (weather data): React Query / SWR (cache, revalidate, background refetch).
  - Client/UI state (favorites, history, theme, units): Zustand + localStorage persistence.
- **Rendering strategy**: Client-side fetch with SWR for live data; static shell pre-rendered for fast first paint.

## 3. Backend (Optional — FastAPI)
Introduced when needed for:
- Centralizing API key usage (hide provider keys from client).
- Response caching/normalization across providers.
- Weather Score computation (server-side, consistent logic).
- Gemini API orchestration (prompt construction, response streaming, rate limiting).
- Rate limiting & abuse protection.

Endpoints exposed to the frontend are documented in `07_API_SPEC.md`.

## 4. API Flow
1. User searches/selects a city → frontend calls internal API route (`/api/weather?city=...`).
2. Internal route (Next.js or FastAPI) checks cache (short TTL, e.g., 10 min) → if miss, calls OpenWeatherMap/WeatherAPI.
3. Response normalized into Atmos's internal weather schema.
4. Recommendation engine (clothing/activity/travel/score) computes derived fields server-side or client-side from normalized data.
5. Normalized payload returned to client → rendered with animated UI.
6. (Optional) AI Assistant queries include current weather context + user question → sent to Gemini API → streamed response back to client.

## 5. Data Flow
```
User Input (city / geolocation)
        │
        ▼
Frontend request → Internal API layer
        │
        ▼
Cache check ──► HIT ──► Return cached normalized data
        │
       MISS
        │
        ▼
External Weather Provider API
        │
        ▼
Normalize + enrich (AQI, UV, sunrise/sunset)
        │
        ▼
Recommendation Engine (clothing, activity, travel, score)
        │
        ▼
Cache write (TTL) → Response to client
        │
        ▼
Client state (React Query/SWR) → UI render + animated background
        │
        ▼
Local persistence (favorites, history) via localStorage/Zustand
```

## 6. Caching & Performance Notes
- Cache weather responses for 5–15 minutes per city (reduce API cost, respect rate limits).
- Debounce city search/autocomplete requests (300ms).
- Prefetch favorite cities' data in background for instant load.
