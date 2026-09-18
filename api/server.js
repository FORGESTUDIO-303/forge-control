require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const path = require('path');
const { query, getPool } = require('./db');

const app = express();
app.set('trust proxy', 1);
const FRONTEND_URL = (process.env.FRONTEND_URL || '').replace(/\/$/, '');
const isProd = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    const allowed = [FRONTEND_URL, 'http://localhost:3000', 'http://localhost:8000', 'http://127.0.0.1:3000']
      .filter(Boolean);
    if (allowed.some(a => origin.startsWith(a))) return cb(null, true);
    return cb(null, true); // open demo; tighten by setting ALLOWED_ORIGINS if needed
  },
  credentials: true,
}));
app.use(express.json());
// Serverless-safe sessions: Postgres store on Vercel/prod, memory locally
let sessionStore;
if (process.env.DATABASE_URL && (process.env.VERCEL || isProd)) {
  const pgSession = require('connect-pg-simple')(session);
  sessionStore = new pgSession({ pool: getPool(), tableName: 'session' });
}
app.use(session({
  store: sessionStore,
  secret: process.env.SESSION_SECRET || 'forge-dev',
  resave: false, saveUninitialized: false,
  cookie: isProd ? { secure: true, sameSite: 'none', maxAge: 7 * 24 * 3600 * 1000 } : { sameSite: 'lax' },
}));
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser((u, done) => done(null, u));
passport.deserializeUser((u, done) => done(null, u));

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback',
  }, async (_at, _rt, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value || null;
      const name = profile.displayName || 'Google User';
      await query(
        `insert into users (email, name, provider, provider_id)
         values ($1,$2,'google',$3)
         on conflict (email) do update set name=excluded.name, provider='google', provider_id=excluded.provider_id`,
        [email, name, profile.id]
      ).catch(() => {});
      return done(null, { id: profile.id, email, name, provider: 'google' });
    } catch (e) { return done(null, { id: profile.id, provider: 'google' }); }
  }));
}
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:3000/api/auth/github/callback',
  }, async (_at, _rt, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value || null;
      const name = profile.displayName || profile.username || 'GitHub User';
      await query(
        `insert into users (email, name, provider, provider_id)
         values ($1,$2,'github',$3)
         on conflict (email) do update set name=excluded.name, provider='github', provider_id=excluded.provider_id`,
        [email, name, profile.id]
      ).catch(() => {});
      return done(null, { id: profile.id, email, name, provider: 'github' });
    } catch (e) { return done(null, { id: profile.id, provider: 'github' }); }
  }));
}
// serve frontend from parent folder (portable USB: api + site together)
app.use(express.static(path.join(__dirname, '..')));

app.get('/api/health', async (_req, res) => {
  try { await query('select 1 as ok'); res.json({ ok: true, db: 'up' }); }
  catch (e) { res.status(500).json({ ok: false, db: 'down', error: e.message }); }
});
app.get('/api/devices', async (_req, res) => {
  try {
    const r = await query('select * from devices order by id');
    res.json(r.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.post('/api/devices/seed', async (_req, res) => {
  try {
    const count = await query('select count(*)::int as c from devices');
    if (count.rows[0].c === 0) {
      await query(`insert into devices (name, detail, is_on) values
        ('Mainboard','ATX - BIOS 1204',true),
        ('GeForce GT 720M','2GB - 1080p30 target',true),
        ('Intel HD Graphics','iGPU - power saving',true),
        ('Keyboard','per-key - Forge Glow',true),
        ('Mouse','16000 DPI - 1000Hz',false),
        ('Headset','7.1 - mic monitoring',true)`);
    }
    const r = await query('select * from devices order by id');
    res.json(r.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.get('/api/fans', async (_req, res) => {
  try { const r = await query('select * from fan_profiles order by id desc limit 5'); res.json(r.rows); }
  catch (e) { res.status(500).json({ error: e.message }); }
});
app.post('/api/fans', async (req, res) => {
  const { name = 'Custom', cpu_fan = 40, gpu_fan = 40, chassis1 = 30, chassis2 = 30 } = req.body || {};
  try {
    const r = await query('insert into fan_profiles (name,cpu_fan,gpu_fan,chassis1,chassis2) values ($1,$2,$3,$4,$5) returning *',
      [name, cpu_fan, gpu_fan, chassis1, chassis2]);
    res.json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
// auth - Google + GitHub
const googleOn = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
const githubOn = Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET);
app.get('/api/auth/status', (req, res) => res.json({
  google: googleOn, github: githubOn,
  user: req.user || null,
  note: !googleOn && !githubOn ? 'set GOOGLE_*/GITHUB_* in .env' : 'auth ready',
}));
app.get('/api/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
const afterLogin = (_req, res) => res.redirect((FRONTEND_URL || '') + '/#dashboard?login=ok');
const afterFail = '/#dashboard?login=fail';
app.get('/api/auth/google/callback',
  passport.authenticate('google', { failureRedirect: FRONTEND_URL ? FRONTEND_URL + afterFail : afterFail }),
  afterLogin);
app.get('/api/auth/github', passport.authenticate('github', { scope: ['user:email'] }));
app.get('/api/auth/github/callback',
  passport.authenticate('github', { failureRedirect: FRONTEND_URL ? FRONTEND_URL + afterFail : afterFail }),
  afterLogin);
app.get('/api/auth/me', (req, res) => req.user ? res.json(req.user) : res.status(401).json({ error: 'not logged in' }));
app.post('/api/auth/logout', (req, res) => req.logout(() => res.json({ ok: true })));

// Vercel serverless: export app, only listen locally
module.exports = app;
if (!process.env.VERCEL && require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Forge Control API on http://localhost:${PORT}`));
}
