# Atmos — Project Structure

## 1. Folder Structure

```
atmos/
├── app/                          # Next.js App Router
│   ├── (main)/
│   │   ├── page.tsx              # Home / current weather
│   │   ├── search/page.tsx       # Search results
│   │   ├── favorites/page.tsx    # Favorites list
│   │   └── settings/page.tsx     # Settings
│   ├── api/                      # Next.js API routes (BFF)
│   │   ├── weather/route.ts
│   │   ├── forecast/route.ts
│   │   ├── aqi/route.ts
│   │   ├── search/route.ts
│   │   └── ai/route.ts           # Gemini proxy (optional)
│   ├── layout.tsx
│   └── globals.css
│
├── components/
│   ├── ui/                       # Base primitives (GlassCard, Button, Input)
│   ├── weather/                  # WeatherHero, HourlyStrip, WeeklyList, MetricTile
│   ├── recommendations/          # RecommendationCard, ScoreRing
│   ├── search/                   # SearchBar, Autocomplete, HistoryList
│   ├── favorites/                # FavoritesList, FavoriteChip
│   ├── ai/                       # AIAssistantPanel, ChatBubble
│   ├── backgrounds/              # Animated weather background layers
│   └── layout/                   # NavBar, TabBar, PageShell
│
├── lib/
│   ├── api/                      # Weather provider client, Gemini client
│   ├── recommendation-engine/    # Clothing/activity/travel/score logic
│   ├── hooks/                    # useWeather, useFavorites, useHistory
│   ├── store/                    # Zustand stores
│   ├── utils/                    # Formatters, unit conversion, date/time
│   └── constants/                # Gradient tokens, condition mappings
│
├── types/
│   └── weather.d.ts              # Shared TypeScript types/interfaces
│
├── backend/                      # Optional FastAPI service
│   ├── main.py
│   ├── routers/
│   │   ├── weather.py
│   │   ├── forecast.py
│   │   └── ai.py
│   ├── services/
│   │   ├── weather_provider.py
│   │   ├── recommendation_engine.py
│   │   └── gemini_client.py
│   ├── schemas/
│   └── core/ (config, caching, security)
│
├── public/
│   ├── icons/                    # Weather condition icons
│   └── animations/               # Lottie/SVG assets
│
├── docs/                         # This documentation set
│
├── .env.local                    # API keys (gitignored)
├── tailwind.config.ts
├── next.config.js
├── package.json
└── README.md
```

## 2. File Organization Principles
- **Feature-first components**: grouped by domain (`weather/`, `search/`, `ai/`) not by type, for scalability.
- **Separation of concerns**: UI components never call external APIs directly — always through `lib/api` or `lib/hooks`.
- **Recommendation logic isolated** in `lib/recommendation-engine/` so it can run client-side (MVP) or move server-side (FastAPI) without UI changes.
- **Types centralized** in `types/` and shared between frontend and any backend contract (mirrored in FastAPI Pydantic schemas).
- **Backend is fully optional/isolated** — MVP can ship with only `app/api/*` routes; `backend/` added only when needed.
