// Forge Control app - live-first, animated.
const API = (window.FORGE_API || '').replace(/\/$/, '');
const api = (p) => (API || '') + p;
let devices = [];
let fans = [{ n: 'CPU Fan', v: 35 }, { n: 'GPU Fan', v: 40 }, { n: 'Chassis 1', v: 30 }, { n: 'Chassis 2', v: 30 }];
const games = ['Valor Rush', 'Night Forge', 'Apex Drift', 'Star Anvil', 'Cinema Sim', 'Retro Bowl'];

function el(h) { const d = document.createElement('div'); d.innerHTML = h; return d.firstElementChild; }
let toastT;
function toast(m) {
  const t = document.getElementById('toast');
  t.textContent = m; t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2600);
}
function setStatus(online) {
  const pill = document.getElementById('apiPill');
  const hero = document.getElementById('heroStatus');
  const side = document.getElementById('sideStatus');
  const foot = document.getElementById('footStatus');
  const hs = document.getElementById('heroStatusTxt');
  if (online) {
    pill.textContent = '● Live'; pill.classList.add('live'); pill.classList.remove('off');
    hero.classList.add('on'); hs.textContent = 'Forge Cloud connected';
    side.classList.add('on'); document.getElementById('sideStatusTxt').textContent = 'v1.0 • live';
    foot.textContent = 'all systems live';
  } else {
    pill.textContent = '● Connecting…'; pill.classList.add('off'); pill.classList.remove('live');
    hs.textContent = API ? 'Connecting to Forge Cloud…' : 'Set FORGE_API in config.js to go live';
    foot.textContent = 'connecting…';
  }
}

// devices
const dc = document.getElementById('deviceCards');
function renderDevices(list) {
  dc.innerHTML = '';
  if (!list.length) { dc.innerHTML = '<div class="card"><h4>No devices yet</h4><small>Sign in and add your first rig.</small></div>'; return; }
  list.forEach((d, i) => {
    const on = d.is_on ?? d.on ?? true;
    const card = el(`<div class="card" style="animation-delay:${i * 0.06}s"><h4><span class="dot" style="background:${on ? '#2fbf71' : '#555'};box-shadow:none"></span>${d.name}</h4><small>${d.detail || ''}</small><div class="row" style="margin-top:8px"><button class="btn">Configure</button></div></div>`);
    card.querySelector('button').onclick = () => toast(d.name + ' opened');
    dc.appendChild(card);
  });
}
async function loadDevices() {
  setStatus(false);
  try {
    const rows = await fetch(api('/api/devices')).then(r => { if (!r.ok) throw 0; return r.json(); });
    if (Array.isArray(rows) && rows.length) { devices = rows; setStatus(true); }
    else { devices = []; }
  } catch { devices = []; }
  renderDevices(devices);
  document.getElementById('gpuBadge').textContent = devices.length
    ? devices.length + ' devices synced' : 'Backend syncing…';
}

// games
const gc = document.getElementById('gameCards');
games.forEach((g, i) => {
  const c = el(`<div class="card reveal" style="transition-delay:${i * 0.05}s"><h4>${g}</h4><small>Ready to play • optimized profile</small><div class="row" style="margin-top:8px"><button class="btn primary">Launch</button><button class="btn">Optimize</button></div></div>`);
  const [l, o] = c.querySelectorAll('button');
  l.onclick = () => toast('Launching ' + g + '…');
  o.onclick = () => toast(g + ' optimized ✓');
  gc.appendChild(c);
});

// fans
function renderFans() {
  const w = document.getElementById('fanSliders'); w.innerHTML = '';
  fans.forEach((f) => {
    const row = document.createElement('div'); row.className = 'fan-row';
    row.innerHTML = `<b>${f.n}</b><input type="range" min="0" max="100" value="${f.v}"><span>${Math.round(f.v * 24)} RPM</span>`;
    row.querySelector('input').oninput = e => { f.v = +e.target.value; row.querySelector('span').textContent = Math.round(f.v * 24) + ' RPM'; drawCurve(); updateLive(); };
    w.appendChild(row);
  });
}
document.querySelectorAll('.fan-modes .mode').forEach(b => b.onclick = () => {
  document.querySelectorAll('.fan-modes .mode').forEach(x => x.classList.remove('active'));
  b.classList.add('active');
  const preset = { Silent: 25, Balanced: 45, Turbo: 85, Manual: 50 }[b.textContent] ?? 40;
  fans.forEach(f => f.v = Math.min(100, preset + Math.random() * 8));
  renderFans(); drawCurve(); updateLive();
  toast(b.textContent + ' profile applied');
});

// lighting
const prev = document.getElementById('lightPreview');
function applyLight() {
  const c = document.getElementById('rgbPick').value, fx = document.getElementById('fx').value, br = document.getElementById('bright').value;
  prev.style.opacity = br / 100;
  if (fx === 'Rainbow') prev.style.background = 'linear-gradient(90deg,red,orange,yellow,green,blue,violet)';
  else if (fx === 'Wave') prev.style.background = `repeating-linear-gradient(90deg,${c} 0 20px,#111 20px 40px)`;
  else prev.style.background = c;
  prev.style.boxShadow = `0 0 34px ${c}`;
}
document.getElementById('applyFx').onclick = () => { applyLight(); toast('Lighting applied to all devices'); };
document.getElementById('syncBtn').onclick = () => toast('Forge Glow synced ✓');
['rgbPick', 'fx', 'bright'].forEach(id => document.getElementById(id).oninput = applyLight);

// live spark
const spark = document.getElementById('spark').getContext('2d');
let hist = Array(40).fill(20);
function updateLive() {
  const cpu = 25 + Math.random() * 40, gpu = 30 + Math.random() * 45;
  document.getElementById('cpuVal').textContent = cpu.toFixed(0) + '%';
  document.getElementById('gpuVal').textContent = gpu.toFixed(0) + '%';
  document.getElementById('fanVal').textContent = Math.round(fans.reduce((a, f) => a + f.v, 0) / fans.length) + '%';
  document.getElementById('tempVal').textContent = (45 + Math.random() * 20).toFixed(0) + '°C';
  hist.push(cpu); hist.shift();
  spark.clearRect(0, 0, 320, 90);
  const g = spark.createLinearGradient(0, 0, 320, 0);
  g.addColorStop(0, '#ff0033'); g.addColorStop(1, '#d4af37');
  spark.strokeStyle = g; spark.lineWidth = 2.5; spark.beginPath();
  hist.forEach((v, i) => { const x = i * 8, y = 82 - v; i ? spark.lineTo(x, y) : spark.moveTo(x, y); });
  spark.stroke();
}
function drawCurve() {
  const c = document.getElementById('curve').getContext('2d');
  c.clearRect(0, 0, 520, 160); c.strokeStyle = '#d4af37'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(0, 140);
  fans.forEach((f, i) => c.lineTo(60 + i * 120, 140 - f.v * 1.2)); c.stroke();
}

// download
function downloadConfig() {
  const data = { app: 'Forge Control v1.0', exported: new Date().toISOString(), devices, fans, color: document.getElementById('rgbPick').value, effect: document.getElementById('fx').value };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'forge-control-config.json'; a.click();
  toast('Config downloaded ✓');
}
document.getElementById('exportBtn').onclick = downloadConfig;
const dlAll = () => { downloadConfig(); setTimeout(() => window.open('https://github.com/FORGESTUDIO-303/forge-control', '_blank'), 400); };
document.getElementById('dlApp').onclick = dlAll;
document.getElementById('heroDl').onclick = dlAll;
document.getElementById('resetBtn').onclick = () => { renderFans(); applyLight(); drawCurve(); toast('Settings reset'); };

// search
document.getElementById('search').oninput = e => {
  const q = e.target.value.toLowerCase();
  renderDevices(devices.filter(d => (d.name + ' ' + (d.detail || '')).toLowerCase().includes(q)));
  document.querySelectorAll('#gameCards .card').forEach(c => {
    c.style.display = c.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
};

// scroll reveal + nav
const io = new IntersectionObserver(es => es.forEach(x => x.isIntersecting && x.target.classList.add('vis')), { threshold: 0.12 });
document.querySelectorAll('section, .hero-card').forEach(s => { s.classList.add('reveal'); io.observe(s); });
document.querySelectorAll('#gameCards .card').forEach(c => io.observe(c));
const links = document.querySelectorAll('.sidebar nav a');
window.addEventListener('scroll', () => {
  let cur = 'dashboard';
  document.querySelectorAll('section[id]').forEach(s => { if (scrollY >= s.offsetTop - 140) cur = s.id; });
  links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + cur));
});

// auth
let currentUser = null;
async function refreshAuth() {
  try {
    const s = await fetch(api('/api/auth/status'), { credentials: 'include' }).then(r => r.json());
    const pill = document.getElementById('userPill');
    currentUser = s.user || null;
    if (currentUser) {
      pill.textContent = (currentUser.email || currentUser.name || 'logged in') + ` (${currentUser.provider})`;
      document.getElementById('googleBtn').textContent = 'Logout';
      document.getElementById('githubBtn').textContent = 'Logout';
      setStatus(true);
    } else {
      pill.textContent = 'Sign in to sync';
      document.getElementById('googleBtn').textContent = 'Google login';
      document.getElementById('githubBtn').textContent = 'GitHub login';
    }
  } catch { document.getElementById('userPill').textContent = 'Sign in to sync'; }
}
document.getElementById('googleBtn').onclick = async () => {
  if (currentUser) { await fetch(api('/api/auth/logout'), { method: 'POST', credentials: 'include' }).catch(() => {}); currentUser = null; refreshAuth(); return; }
  location.href = api('/api/auth/google');
};
document.getElementById('githubBtn').onclick = async () => {
  if (currentUser) { await fetch(api('/api/auth/logout'), { method: 'POST', credentials: 'include' }).catch(() => {}); currentUser = null; refreshAuth(); return; }
  location.href = api('/api/auth/github');
};
if (location.hash.includes('login=ok')) toast('Welcome back ✓');

setInterval(updateLive, 1200);
renderFans(); applyLight(); drawCurve(); updateLive(); loadDevices(); refreshAuth();
