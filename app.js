// Forge Control - tries live API, falls back to demo (portable USB).
let devices = [
  { name: 'Mainboard', detail: 'ATX • BIOS 1204', is_on: true },
  { name: 'GeForce GT 720M', detail: '2GB • 1080p30 target', is_on: true },
  { name: 'Intel HD Graphics', detail: 'iGPU • power saving', is_on: true },
  { name: 'Keyboard', detail: 'per-key • Forge Glow', is_on: true },
  { name: 'Mouse', detail: '16000 DPI • 1000Hz', is_on: false },
  { name: 'Headset', detail: '7.1 • mic monitoring', is_on: true },
];
const games = ['Valor Rush', 'Night Forge', 'Apex Drift', 'Star Anvil', 'Cinema Sim', 'Retro Bowl'];
let fans = [{ n: 'CPU Fan', v: 35 }, { n: 'GPU Fan', v: 40 }, { n: 'Chassis 1', v: 30 }, { n: 'Chassis 2', v: 30 }];

function el(h) { const d = document.createElement('div'); d.innerHTML = h; return d.firstElementChild; }

// devices - render fn + live API attempt (online-ready: uses window.FORGE_API when set)
const API = (window.FORGE_API || '').replace(/\/$/, '');
const api = (p) => (API || '') + p;
const dc = document.getElementById('deviceCards');
function renderDevices(list) {
  dc.innerHTML = '';
  list.forEach(d => {
    const on = d.is_on ?? d.on ?? true;
    dc.appendChild(el(`<div class="card"><h4><span class="dot" style="background:${on ? '#2fbf71' : '#555'}"></span>${d.name}</h4><small>${d.detail}</small><div class="row" style="margin-top:8px"><button class="btn">Configure</button></div></div>`));
  });
}
renderDevices(devices);
fetch(api('/api/devices')).then(r => r.ok ? r.json() : Promise.reject()).then(rows => {
  if (Array.isArray(rows) && rows.length) { devices = rows; renderDevices(devices); }
}).catch(() => { /* offline demo mode - USB without API */ });
// games
const gc = document.getElementById('gameCards');
games.forEach((g, i) => {
  gc.appendChild(el(`<div class="card"><h4>${g}</h4><small>played ${3 + i * 2}h • ${(60 + i * 7) % 120} FPS avg</small><div class="row" style="margin-top:8px"><button class="btn primary">Launch</button><button class="btn">Optimize</button></div></div>`));
});
// fans
function renderFans() {
  const w = document.getElementById('fanSliders'); w.innerHTML = '';
  fans.forEach((f, i) => {
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
  fans.forEach(f => f.v = preset + Math.random() * 8); renderFans(); drawCurve(); updateLive();
});
// lighting
const prev = document.getElementById('lightPreview');
function applyLight() {
  const c = document.getElementById('rgbPick').value, fx = document.getElementById('fx').value, br = document.getElementById('bright').value;
  prev.style.opacity = br / 100;
  if (fx === 'Rainbow') prev.style.background = 'linear-gradient(90deg,red,orange,yellow,green,blue,violet)';
  else if (fx === 'Wave') prev.style.background = `repeating-linear-gradient(90deg,${c} 0 20px,#111 20px 40px)`;
  else prev.style.background = c;
  prev.style.boxShadow = `0 0 30px ${c}`;
}
document.getElementById('applyFx').onclick = applyLight;
document.getElementById('syncBtn').onclick = () => alert('Forge Glow synced to 6 devices (demo).');
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
  document.getElementById('gpuBadge').textContent = 'GPU: GT 720M + Intel HD • libx264 1080p30 (demo)';
  hist.push(cpu); hist.shift();
  spark.clearRect(0, 0, 320, 90); spark.strokeStyle = '#ff0033'; spark.lineWidth = 2; spark.beginPath();
  hist.forEach((v, i) => { const x = i * 8, y = 80 - v; i ? spark.lineTo(x, y) : spark.moveTo(x, y); });
  spark.stroke();
}
function drawCurve() {
  const c = document.getElementById('curve').getContext('2d');
  c.clearRect(0, 0, 520, 160); c.strokeStyle = '#d4af37'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, 140);
  fans.forEach((f, i) => { c.lineTo(60 + i * 120, 140 - f.v * 1.2); }); c.stroke();
}
document.getElementById('exportBtn').onclick = () => {
  const blob = new Blob([JSON.stringify({ devices, fans, color: document.getElementById('rgbPick').value }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'forge-control-config.json'; a.click();
};
document.getElementById('resetBtn').onclick = () => location.reload();
document.getElementById('dlApp').onclick = () => alert('Desktop app comes last — website + DB + API + Google done, send GitHub keys, then app.');
// Auth (Google + GitHub)
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
    } else {
      pill.textContent = (s.google || s.github) ? 'Click Google or GitHub to login' : 'API offline (demo)';
      document.getElementById('googleBtn').textContent = s.google ? 'Google login' : 'Google — need keys';
      document.getElementById('githubBtn').textContent = s.github ? 'GitHub login' : 'GitHub — need keys';
    }
  } catch { document.getElementById('userPill').textContent = 'API offline (demo)'; }
}
document.getElementById('googleBtn').onclick = async () => {
  if (currentUser) { await fetch(api('/api/auth/logout'), { method: 'POST', credentials: 'include' }).catch(() => {}); currentUser = null; refreshAuth(); return; }
  location.href = api('/api/auth/google');
};
document.getElementById('githubBtn').onclick = async () => {
  if (currentUser) { await fetch(api('/api/auth/logout'), { method: 'POST', credentials: 'include' }).catch(() => {}); currentUser = null; refreshAuth(); return; }
  location.href = api('/api/auth/github');
};
if (location.hash.includes('login=ok')) refreshAuth().then(() => alert('Login OK'));
setInterval(updateLive, 1200);
renderFans(); applyLight(); drawCurve(); updateLive(); refreshAuth();
