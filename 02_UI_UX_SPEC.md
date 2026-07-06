# Atmos — UI/UX Specification

## 1. Design Philosophy
Premium, minimal, Apple-inspired. The weather is the hero — UI chrome recedes via glassmorphism so animated backgrounds and content take focus. Every screen should feel calm, spacious, and alive.

## 2. Design System

### 2.1 Core Principles
- **Glassmorphism**: frosted-glass cards (`backdrop-blur`, low-opacity fills, subtle borders) floating over dynamic backgrounds.
- **Dynamic gradients**: background gradient shifts based on time of day + weather condition.
- **Depth via blur & light**, not heavy shadows.
- **Motion with purpose**: animations reflect real conditions, never purely decorative.

### 2.2 Color Palette
Condition-driven gradient tokens (used as CSS variables, adapted per theme):

| Condition | Gradient (example) |
|---|---|
| Clear Day | `#4facfe → #00c6ff` |
| Clear Night | `#0f2027 → #2c5364` |
| Cloudy | `#757f9a → #d7dde8` |
| Rain | `#3a6073 → #16222a` |
| Thunderstorm | `#232526 → #414345` |
| Snow | `#e6dada → #274046` |
| Fog/Haze | `#bdc3c7 → #2c3e50` |

**Neutral / UI tokens:**
- Surface (glass): `rgba(255,255,255,0.10)` light border `rgba(255,255,255,0.25)`
- Text primary: `#FFFFFF` (on dark gradients) / `#0A0A0A` (on light)
- Text secondary: `rgba(255,255,255,0.7)`
- Accent (CTA/highlight): `#5EC8FA` (Atmos Blue)
- Alert/AQI-poor: `#FF6B6B`
- Success/Good score: `#4ADE80`

### 2.3 Typography
- Font family: **Inter** (or SF Pro fallback) — clean, geometric, highly legible.
- Scale:
  - Display (Temp hero): 64–96px, weight 300 (light)
  - H1: 32px / 600
  - H2: 24px / 600
  - Body: 16px / 400
  - Caption/meta: 13px / 400, secondary color
- Numerals use tabular/monospaced figures for stable alignment (temperature, hours).

### 2.4 Components
- **GlassCard** — base container: blurred glass, rounded-2xl (24px radius), soft border.
- **WeatherHero** — large temp, condition icon, animated background layer.
- **HourlyStrip** — horizontal scrollable glass chips (time, icon, temp).
- **WeeklyList** — vertical list rows (day, icon, min/max, precipitation %).
- **MetricTile** — small glass tile for AQI, UV, Humidity, Wind, Sunrise/Sunset.
- **WeatherScoreRing** — circular progress ring showing composite score 0–100.
- **RecommendationCard** — icon + short text (clothing/activity/travel).
- **SearchBar** — glass input with autocomplete dropdown.
- **FavoritesList** — chip/list of saved cities, swipe-to-remove on mobile.
- **AIAssistantPanel** — chat-style slide-over/drawer (optional feature).
- **NavBar/TabBar** — minimal icon nav (Home, Search, Favorites, AI, Settings).

### 2.5 Layout
- **Desktop**: 2–3 column grid — Hero (left/top, large), metrics grid (right), forecast rows below.
- **Tablet**: single column, stacked sections, metrics in 2-column grid.
- **Mobile**: single column, vertical scroll, sticky search bar on top, tab bar bottom.
- Max content width: 1200px, centered, generous padding (24–32px).
- Section spacing: 32–48px vertical rhythm.

### 2.6 Animations (Framer Motion)
- Page/section transitions: fade + slight upward slide (200–300ms, ease-out).
- Weather background: looping particle/canvas or layered SVG (rain drops, snowflakes, drifting clouds, lightning flicker) — subtle, low-CPU, respects reduced-motion.
- Card entrance: staggered fade-in on load (50–100ms stagger).
- Weather Score ring: animated fill on mount.
- Hover/tap: scale 1.02–1.04, soft glow on interactive cards.
- Loading state: skeleton shimmer on glass cards, not spinners.

### 2.7 Responsive Rules
- Breakpoints: `sm 640px`, `md 768px`, `lg 1024px`, `xl 1280px`.
- Touch targets ≥ 44px on mobile.
- Hourly/weekly lists become horizontally scrollable on small screens.
- Typography scales down ~20% below `md`.
- AI Assistant becomes full-screen sheet on mobile, side drawer on desktop.

### 2.8 Accessibility
- Minimum contrast ratio 4.5:1 for text over gradients (add scrim/overlay if needed).
- All icons paired with text labels or `aria-label`.
- Full keyboard navigation for search, favorites, and tab bar.
- `prefers-reduced-motion` disables/simplifies background animations.
- Focus states visible (outline ring) on all interactive elements.
- Screen-reader announcements for weather score and AQI category changes.
