# Forge Control

Command your rig — monitoring, lighting, fans and games. Armoury-style control, rebuilt lighter, simpler and portable.

> Original UI inspired by device-control hubs. No ASUS assets or code. All design here is original.

Live demo (after Pages enable): `https://<your-user>.github.io/forge-control/`

## Features
- Dashboard with live CPU/GPU/fan/temp cards + sparkline
- Devices from Neon Postgres (`/api/devices`) with offline demo fallback
- Forge Glow lighting: color, Static/Breathing/Strobing/Rainbow/Wave, brightness
- Fans: Silent/Balanced/Turbo/Manual presets, sliders, curve canvas
- Game library cards, settings + config export (JSON)
- Auth: Google OAuth + GitHub OAuth via Passport, users stored in Neon

## Quick start (USB portable)
- Website only: double-click `run.bat` → `http://localhost:8000`, or open `index.html`
- Full stack: double-click `run-api.bat` → `http://localhost:3000`

## API
- `GET /api/health` — db check
- `GET /api/devices` / `POST /api/devices/seed`
- `GET /api/fans` / `POST /api/fans`
- `GET /api/auth/status` / `GET /api/auth/me` / `POST /api/auth/logout`
- `GET /api/auth/google` + `/callback`
- `GET /api/auth/github` + `/callback`

## Env setup (`api/.env`, never commit)
```
DATABASE_URL=postgresql://...neon.tech/neondb?sslmode=require
PORT=3000
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GITHUB_CALLBACK_URL=http://localhost:3000/api/auth/github/callback
SESSION_SECRET=long-random-hex
```
See `api/.env.example`. OAuth callbacks must match provider consoles exactly.

## Roadmap
- [x] Website
- [x] Neon Postgres + API
- [x] Google login
- [x] GitHub login
- [ ] Desktop app (Electron/Tauri)
- [ ] Ads with zero budget (shorts pipeline — paused video generator)

## License
MIT — see `LICENSE`.
