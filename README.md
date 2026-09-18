# Forge Control

[![MIT License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![GitHub Pages](https://img.shields.io/badge/site-live-brightgreen)](https://forgestudio-303.github.io/forge-control/)
[![API](https://img.shields.io/badge/api-vercel-black)](https://github.com/FORGESTUDIO-303/forge-control)
[![Neon Postgres](https://img.shields.io/badge/db-neon-00e699)](https://neon.tech)

Command your rig — monitoring, lighting, fans and games. Armoury-style control, rebuilt lighter, simpler and portable.

> Original UI inspired by device-control hubs. No ASUS assets or code. All design here is original.

## Live

- **Website:** https://forgestudio-303.github.io/forge-control/
- **API:** set `window.FORGE_API` in `config.js` to your Vercel URL, e.g. `https://forge-control.vercel.app`
- **Health:** `GET <api>/api/health` → `{ ok: true, db: "up" }`

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/FORGESTUDIO-303/forge-control)

## Features

| Area | What you get |
|---|---|
| Dashboard | Live CPU / GPU / fan / temp cards + sparkline |
| Devices | Neon Postgres (`/api/devices`) with offline demo fallback |
| Forge Glow | Color + Static / Breathing / Strobing / Rainbow / Wave + brightness |
| Fans | Silent / Balanced / Turbo / Manual, sliders, curve canvas |
| Library | Game cards with launch + optimize actions |
| Settings | Config export (JSON), portable USB mode |
| Auth | Google OAuth + GitHub OAuth (Passport), users in Neon |

## Quick start

**Online (recommended):** open the website link above. Set `window.FORGE_API` to your Vercel backend URL and redeploy — no localhost needed.

**Local USB portable:**
- Site only: double-click `run.bat` → http://localhost:8000 (or open `index.html`)
- Full stack: double-click `run-api.bat` → http://localhost:3000

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

## Deploy the API (Vercel, free)

1. Vercel → New Project → import `FORGESTUDIO-303/forge-control` → Deploy (`vercel.json` included)
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
3. Add the 2 callback URLs in Google Cloud Console + GitHub OAuth App, redeploy
4. `config.js`: `window.FORGE_API='https://<your-app>.vercel.app'`, push — site is fully online

Local dev keeps `http://localhost:3000/...` callbacks (see `api/.env.example`). Never commit `api/.env`.

## Roadmap

- [x] Website (GitHub Pages)
- [x] Neon Postgres + API (Vercel serverless)
- [x] Google login
- [x] GitHub login
- [ ] Desktop app (Electron / Tauri)
- [ ] Zero-budget ads (shorts pipeline — video generator paused)

## License

MIT — see [LICENSE](LICENSE).
