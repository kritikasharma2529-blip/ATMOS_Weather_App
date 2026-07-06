# Atmos — User Flow

## 1. Complete User Journey

### First-time User
1. Lands on Atmos → prompted to allow geolocation (or skip).
2. If allowed → current location weather loads automatically with animated background matching real conditions.
3. If skipped → default/sample city shown, search bar prominent.
4. User explores: scrolls through hourly forecast, weekly forecast, metric tiles (AQI, UV, sunrise/sunset).
5. User views Weather Score and reads clothing/activity/travel recommendations.
6. User searches another city → views its weather → optionally adds to Favorites.
7. (Optional) User opens AI Assistant, asks a natural-language question ("Will it rain later?").

### Returning User
1. Lands on Atmos → last-viewed or geolocated city loads instantly (cached).
2. Favorites bar visible → quick switch between saved cities.
3. Search history available for quick re-access.
4. User checks Weather Score / recommendations for daily planning.

## 2. Navigation Flow

```
[Landing / Home]
   │
   ├── Geolocation prompt → Current City Weather View
   │
   ├── Search Bar
   │      └── Autocomplete → Select City → City Weather View
   │
   ├── City Weather View
   │      ├── Current Conditions (Hero)
   │      ├── Hourly Forecast (scroll)
   │      ├── Weekly Forecast (list)
   │      ├── Metric Tiles: AQI, UV, Sunrise/Sunset
   │      ├── Weather Score Ring
   │      ├── Recommendations (Clothing / Activity / Travel)
   │      ├── Add to Favorites (icon action)
   │      └── Open AI Assistant (drawer)
   │
   ├── Favorites Tab
   │      └── List of saved cities → tap → City Weather View
   │
   ├── History (within Search)
   │      └── Recent searches → tap → City Weather View
   │
   ├── AI Assistant (optional, drawer/sheet)
   │      └── Chat interface (context = currently viewed city's weather)
   │
   └── Settings
          ├── Units (°C/°F, km/h/mph)
          ├── Theme (Auto/Light/Dark)
          └── Clear History
```

## 3. Key Interaction Notes
- Switching cities updates the animated background and gradient theme with a smooth cross-fade (Framer Motion), no jarring reload.
- Favoriting a city is a single-tap action (star/heart icon) with haptic-style micro animation.
- AI Assistant is always contextual — it knows which city/weather the user is currently viewing.
- Search history is capped (e.g., last 10) and de-duplicated by city.
