# Atmos — Product Requirements Document

## 1. Vision
Atmos transforms raw weather data into meaningful, actionable insight through a premium, emotionally engaging interface — helping people decide what to wear, whether to travel, and how to plan their day, not just what the temperature is.

## 2. Goals
- Deliver accurate, real-time weather data with a best-in-class visual experience.
- Convert data into personalized, actionable recommendations (clothing, activity, travel).
- Make weather feel alive through dynamic, condition-based animated backgrounds.
- Offer an optional conversational AI layer for natural-language weather questions.
- Ship a fast, responsive, accessible app deployable on Vercel with minimal ops overhead.

## 3. Problem
Existing weather apps (native OS widgets, Weather.com, AccuWeather) present dense data grids — temperature, wind, humidity — but leave interpretation to the user. Users must manually decide: "Do I need a jacket?", "Is it safe to run outside?", "Should I delay my flight prep?" This creates friction, especially for students, travelers, and professionals planning their day around weather.

## 4. Solution
Atmos combines:
- Rich weather data (current, hourly, weekly, AQI, UV, sunrise/sunset).
- A **Weather Score** — a single composite number summarizing how "good" the day is.
- Context-aware **recommendations** (clothing, outdoor activity, travel advice).
- **Dynamic animated backgrounds** that visually reflect real conditions (rain, snow, clear, cloudy, storm, night).
- **Favorites & search history** for quick access to relevant cities.
- An **optional AI assistant** (Gemini API) for conversational queries like "Should I carry an umbrella tomorrow in Delhi?"

## 5. Target Users
| Persona | Need |
|---|---|
| General user | Quick, beautiful daily weather glance |
| Student | Simple guidance for commute/outdoor plans |
| Traveler | Multi-city forecasts, travel advice, AQI |
| Professional | Reliable planning data, minimal distraction |

## 6. MVP Scope
**In scope for MVP:**
- Current weather + hourly (24h) + weekly (7-day) forecast
- AQI, UV Index, sunrise/sunset
- Weather-based animated backgrounds
- Clothing & outdoor activity recommendations
- Weather Score
- City search + favorites + search history
- Responsive, glassmorphic UI
- Deployment on Vercel

**Out of scope for MVP (see Future Scope):**
- Gemini AI assistant (optional/phase 2)
- FastAPI backend (optional; MVP can call weather API directly from Next.js API routes)
- Push notifications / weather alerts
- User accounts & cloud sync

## 7. Features
### Core (MVP)
1. Current weather (temp, feels-like, condition, humidity, wind, pressure)
2. Hourly forecast (24h scrollable)
3. Weekly forecast (7-day)
4. AQI with health guidance
5. UV Index with exposure guidance
6. Sunrise / sunset with day-length
7. Dynamic weather animations (rain, snow, clear, clouds, thunderstorm, fog, night/day)
8. Clothing recommendation engine
9. Outdoor activity suggestions
10. Travel advice module
11. Weather Score (composite index)
12. City search with autocomplete
13. Favorite cities management
14. Search history

### Optional / Enhanced
15. AI Weather Assistant (Gemini API) — conversational Q&A
16. Unit preferences (°C/°F, km/h/mph)
17. Theme customization (auto/light/dark)

## 8. Future Scope
- Severe weather alerts & push notifications
- User accounts with cross-device sync
- Widget/PWA installable experience
- Historical weather trends & charts
- Multi-language support
- Apple Watch / wearable companion
- Location-based auto weather (geolocation)
- Social sharing of weather snapshots
