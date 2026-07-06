# Atmos — Technical Specification

## 1. Technologies
| Layer | Technology | Purpose |
|---|---|---|
| Frontend Framework | Next.js (App Router) | Rendering, routing, API routes |
| UI Library | React | Component model |
| Styling | Tailwind CSS | Utility-first styling, design tokens |
| Animation | Framer Motion | Transitions, weather background motion |
| Backend (optional) | FastAPI (Python) | Advanced logic, AI orchestration, caching |
| Weather Data | OpenWeatherMap or WeatherAPI | Current/hourly/weekly/AQI/UV data |
| AI | Gemini API | Conversational weather assistant |
| Hosting | Vercel | Frontend + serverless API routes |

## 2. Key Libraries
- **Data fetching/caching**: SWR or TanStack Query
- **Client state**: Zustand (favorites, history, preferences) + `persist` middleware (localStorage)
- **Forms/validation**: Zod (input/query validation)
- **Icons**: Lucide React
- **Date/time**: date-fns
- **Charts (future)**: Recharts (historical trends)
- **HTTP client (backend)**: httpx (FastAPI async calls to providers)

## 3. API
- Primary provider: **OpenWeatherMap** (One Call API) or **WeatherAPI** — chosen at build time via env config, abstracted behind a single internal interface (`lib/api/weatherProvider.ts`) so providers can be swapped without touching UI code.
- AI: **Gemini API**, invoked only when user opens AI Assistant; requests include a compact JSON summary of current weather as context.
- All external API keys are server-side only (Next.js API routes / FastAPI), never exposed to the client bundle.

## 4. State Management
| State type | Tool | Persistence |
|---|---|---|
| Weather data (server state) | SWR/React Query | In-memory + short TTL cache |
| Favorites | Zustand | localStorage |
| Search history | Zustand | localStorage |
| User preferences (units, theme) | Zustand | localStorage |
| AI chat session | React local state | Session-only (not persisted) |

## 5. Security
- API keys stored in environment variables (`.env.local`, Vercel Environment Variables) — never committed or client-exposed.
- All external calls proxied through internal API routes to prevent key leakage and enable rate limiting.
- Input validation (city names, query params) via Zod before any external call.
- Rate limiting on `/api/*` routes (e.g., IP-based, via middleware or FastAPI dependency) to prevent abuse of paid AI/weather quotas.
- CORS restricted to Atmos's own domain for backend endpoints.
- No PII collected in MVP; geolocation used only client-side, not persisted server-side.

## 6. Performance
- **Caching**: short-TTL (5–15 min) cache per city for weather responses; stale-while-revalidate pattern via SWR.
- **Code splitting**: route-based automatic via Next.js; heavy components (AI panel, animated backgrounds) lazy-loaded.
- **Image/asset optimization**: Next.js `<Image>`, SVG/Lottie kept lightweight for background animations.
- **Animation performance**: CSS/GPU-accelerated transforms preferred; canvas animations throttled to 30fps where possible; `prefers-reduced-motion` respected.
- **Core Web Vitals target**: LCP < 2.5s, CLS < 0.1, INP < 200ms.
- **Edge/CDN**: static assets and pages served via Vercel Edge Network.
