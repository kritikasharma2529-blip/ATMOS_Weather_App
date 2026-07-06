# Atmos — API Specification

Internal API layer (Next.js API routes, optionally proxied to FastAPI). All external provider calls happen server-side.

## 1. `GET /api/weather`
Fetch current weather + derived metrics for a city or coordinates.

**Query params:**
| Param | Type | Required | Description |
|---|---|---|---|
| `city` | string | one of city/lat+lon required | City name |
| `lat`, `lon` | number | one of city/lat+lon required | Coordinates (geolocation) |
| `units` | string | no | `metric` (default) or `imperial` |

**Response 200:**
```json
{
  "city": "Agra",
  "country": "IN",
  "coords": { "lat": 27.18, "lon": 78.02 },
  "current": {
    "temp": 34.5,
    "feels_like": 37.2,
    "condition": "Clear",
    "icon": "clear-day",
    "humidity": 41,
    "wind_speed": 12.4,
    "pressure": 1008
  },
  "aqi": { "value": 3, "category": "Moderate" },
  "uv_index": { "value": 7, "category": "High" },
  "sun": { "sunrise": "05:42", "sunset": "19:18" },
  "weather_score": 78
}
```

## 2. `GET /api/forecast`
Fetch hourly (24h) and weekly (7-day) forecast.

**Query params:** same as `/api/weather`, plus:
| Param | Type | Description |
|---|---|---|
| `type` | string | `hourly` or `weekly` (default: both) |

**Response 200:**
```json
{
  "hourly": [
    { "time": "14:00", "temp": 35.1, "icon": "clear-day", "precip_chance": 0 }
  ],
  "weekly": [
    { "date": "2026-07-07", "temp_min": 27.0, "temp_max": 36.0, "icon": "clear-day", "precip_chance": 5 }
  ]
}
```

## 3. `GET /api/recommendations`
Returns derived clothing/activity/travel recommendations for a city (computed from `/api/weather` + `/api/forecast` data).

**Query params:** `city` or `lat`/`lon`

**Response 200:**
```json
{
  "clothing": "Light cotton clothing recommended; carry sunglasses.",
  "activity": "Great conditions for outdoor sports before noon.",
  "travel": "Clear skies — no travel disruptions expected.",
  "weather_score": 78
}
```

## 4. `GET /api/search`
City autocomplete/search.

**Query params:** `q` (string, required, min 2 chars)

**Response 200:**
```json
{
  "results": [
    { "city": "Agra", "country": "IN", "lat": 27.18, "lon": 78.02 }
  ]
}
```

## 5. `POST /api/ai` (Optional — Gemini Assistant)
Conversational weather Q&A, contextualized with current weather data.

**Request body:**
```json
{
  "city": "Agra",
  "weather_context": { "...": "compact current+forecast summary" },
  "message": "Will I need an umbrella tomorrow?"
}
```

**Response 200:**
```json
{
  "reply": "Unlikely — tomorrow in Agra looks clear with low rain chance."
}
```

## 6. Error Handling
Consistent error envelope across all endpoints:

```json
{
  "error": {
    "code": "CITY_NOT_FOUND",
    "message": "No matching city found for the given query.",
    "status": 404
  }
}
```

**Standard error codes:**
| Code | HTTP Status | Meaning |
|---|---|---|
| `INVALID_PARAMS` | 400 | Missing/invalid query params |
| `CITY_NOT_FOUND` | 404 | No city match |
| `PROVIDER_ERROR` | 502 | Upstream weather/AI provider failure |
| `RATE_LIMITED` | 429 | Too many requests |
| `AI_UNAVAILABLE` | 503 | Gemini API disabled/unreachable |
| `INTERNAL_ERROR` | 500 | Unhandled server error |

- All errors logged server-side with request ID for traceability.
- Client displays friendly fallback UI (e.g., "Couldn't load weather — retry") rather than raw error codes.
