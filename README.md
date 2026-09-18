# Forge Control

[![MIT License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![Site](https://img.shields.io/badge/site-live-brightgreen)](https://forgestudio-303.github.io/forge-control/)
[![API](https://img.shields.io/badge/api-vercel-black)](https://github.com/FORGESTUDIO-303/forge-control)
[![Neon Postgres](https://img.shields.io/badge/db-neon-00e699)](https://neon.tech)

Command your rig — monitoring, lighting, fans and games. A hand-built control hub, fast and online.

> Hand-crafted UI inspired by device-control hubs. No ASUS assets or code. Everything here is original.

## Live

- **App:** https://forgestudio-303.github.io/forge-control/
- **API health:** `https://<your-app>.vercel.app/api/health` → `{ ok: true, db: "up" }`

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/FORGESTUDIO-303/forge-control)

## Features

| Area | What you get |
|---|---|
| Dashboard | Live CPU / GPU / fan / temp cards + sparkline |
| Devices | Live device list backed by Neon Postgres |
| Forge Glow | Color + Static / Breathing / Strobing / Rainbow / Wave + brightness |
| Fans | Silent / Balanced / Turbo / Manual, sliders, curve canvas |
| Library | Game cards with launch + optimize actions |
| Settings | Config export (JSON) |
| Auth | Sign in with Google or GitHub, users stored in Neon |

## How it works

```
Browser (GitHub Pages)
   │  https://forgestudio-303.github.io/forge-control/
   ▼
API (Vercel serverless, Express)
   │  https://<your-app>.vercel.app/api/*
   ▼
Neon Postgres (devices, fans, lighting, users, sessions)
```

The site calls the API via `window.FORGE_API` in `config.js`. Auth is Passport OAuth (Google + GitHub) with Postgres-backed sessions, so login survives serverless restarts.

## API

| Method | Route | Notes |
|---|---|---|
| GET | `/api/health` | DB check |
| GET / POST | `/api/devices`, `/api/devices/seed` | Device list + seed |
| GET / POST | `/api/fans` | Fan profiles |
| GET | `/api/auth/status`, `/api/auth/me` | Auth state |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/google`, `/callback` | Google OAuth |
| GET | `/api/auth/github`, `/callback` | GitHub OAuth |

## Deploy your own

1. Vercel → New Project → import `FORGESTUDIO-303/forge-control` → Deploy
2. Settings → Environment Variables:
   ```
   DATABASE_URL=postgresql://...neon.tech/neondb?sslmode=require
   SESSION_SECRET=long-random-hex
   FRONTEND_URL=https://forgestudio-303.github.io/forge-control
   GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET
   GOOGLE_CALLBACK_URL=https://<your-app>.vercel.app/api/auth/google/callback
   GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET
   GITHUB_CALLBACK_URL=https://<your-app>.vercel.app/api/auth/github/callback
   ```
3. Add the callback URLs in Google Cloud Console + your GitHub OAuth App, redeploy
4. Point the site at it: `window.FORGE_API='https://<your-app>.vercel.app'` in `config.js`

## Tech

Hand-built with vanilla HTML / CSS / JS, Node + Express, Passport (Google + GitHub), Neon Postgres, hosted on GitHub Pages + Vercel.

## Roadmap

- [x] Website
- [x] Neon Postgres + API
- [x] Google login
- [x] GitHub login
- [ ] Desktop app (Electron / Tauri)
- [ ] Zero-budget launch shorts (video generator paused)

## License

MIT — see [LICENSE](LICENSE).
