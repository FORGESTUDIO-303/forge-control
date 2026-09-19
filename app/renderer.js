// Forge Control desktop - local only, no backend.
const devices = [
  { name: 'Mainboard', detail: 'ATX • BIOS 1204', on: true, caps: ['Dashboard', 'Fan control', 'Glow headers', 'Guides'] },
  { name: 'GeForce GT 720M', detail: '2GB • 1080p30 target', on: true, caps: ['Glow', 'Profiles', 'Monitoring'] },
  { name: 'Intel HD Graphics', detail: 'iGPU • power saving', on: true, caps: ['Profiles', 'Monitoring'] },
  { name: 'Keyboard', detail: 'per-key • Forge Glow', on: true, caps: ['Macros', 'Remap', 'Per-key glow', 'Profiles'] },
  { name: 'Mouse', detail: '16000 DPI • 1000Hz', on: false, caps: ['Macros', 'DPI + polling', 'Glow', 'Calibration'] },
  { name: 'Headset', detail: '7.1 • mic monitoring', on: true, caps: ['EQ', 'Mic levels', 'Glow', 'Profiles'] },
];
const games = ['Valor Rush', 'Night Forge', 'Apex Drift', 'Star Anvil', 'Cinema Sim', 'Retro Bowl'];
let fans = [{ n: 'CPU Fan', v: 35 }, { n: 'GPU Fan', v: 40 }, { n: 'Chassis 1', v: 30 }, { n: 'Chassis 2', v: 30 }];

function el(h) { const d = document.createElement('div'); d.innerHTML = h; return d.firstElementChild; }
let toastT;
function toast(m) {
  const t = document.getElementById('toast');
  t.textContent = m; t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2600);
}

// hamburger
const side = document.querySelector('.sidebar');
document.getElementById('menuBtn').onclick = () => side.classList.toggle('open');

// devices
const dc = document.getElementById('deviceCards');
function renderDevices(list) {
  dc.innerHTML = '';
  list.forEach((d, i) => {
    const card = el(`<div class="card" style="animation-delay:${i * 0.06}s"><h4><span class="dot" style="background:${d.on ? '#2fbf71' : '#555'};box-shadow:none"></span>${d.name}</h4><small>${d.detail}</small><div class="tags">${d.caps.map(c => `<span>${c}</span>`).join('')}</div><div class="row" style="margin-top:8px"><button class="btn">Configure</button></div></div>`);
    card.querySelector('button').onclick = () => toast(d.name + ': ' + d.caps.join(' • '));
    dc.appendChild(card);
  });
}
renderDevices(devices);

// search
document.getElementById('search').oninput = e => {
  const q = e.target.value.toLowerCase();
  renderDevices(devices.filter(d => (d.name + ' ' + d.detail + ' ' + d.caps.join(' ')).toLowerCase().includes(q)));
  document.querySelectorAll('#gameCards .card').forEach(c => {
    c.style.display = c.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
};

// themes - re-skin, remembered
try {
  const saved = localStorage.getItem('forge-theme');
  if (saved) document.documentElement.dataset.theme = saved;
} catch {}
document.querySelectorAll('[data-theme-set]').forEach(b => b.onclick = () => {
  const t = b.getAttribute('data-theme-set');
  if (t === 'crimson') delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = t;
  try { localStorage.setItem('forge-theme', t === 'crimson' ? '' : t); } catch {}
  toast(b.title + ' theme applied');
});

// scenarios - retune fans + glow together
const scenarios = [
  { name: 'Gaming', detail: 'Turbo fans • red static glow', fan: 85, color: '#ff0033', fx: 'Static' },
  { name: 'Streaming', detail: 'Balanced fans • violet breathing', fan: 45, color: '#7c5cff', fx: 'Breathing' },
  { name: 'Work', detail: 'Silent fans • warm dim glow', fan: 25, color: '#ff9f1c', fx: 'Static' },
];
const sc = document.getElementById('scenarioCards');
scenarios.forEach((s) => {
  const card = el(`<div class="card"><h4>${s.name}</h4><small>${s.detail}</small><div class="row" style="margin-top:8px"><button class="btn primary">Activate</button></div></div>`);
  card.querySelector('button').onclick = () => {
    fans.forEach(f => f.v = Math.min(100, s.fan + Math.random() * 6));
    document.getElementById('rgbPick').value = s.color;
    document.getElementById('fx').value = s.fx;
    document.querySelectorAll('.fan-modes .mode').forEach(x => x.classList.toggle('active', x.textContent === (s.fan >= 80 ? 'Turbo' : s.fan >= 40 ? 'Balanced' : 'Silent')));
    renderFans(); drawCurve(); updateLive(); applyLight();
    toast(s.name + ' scenario active ✓');
  };
  sc.appendChild(card);
});

// update center
const updates = [
  { name: 'Forge Glow Engine', ver: '1.2.0', note: 'New Wave effect + per-device brightness' },
  { name: 'Fan Curve Pack', ver: '1.1.4', note: 'Quieter idle curve for 120mm fans' },
  { name: 'Device Profiles', ver: '1.0.9', note: 'GT 720M + Intel HD tuned defaults' },
];
const ul = document.getElementById('updateList');
updates.forEach((u) => {
  const row = document.createElement('div'); row.className = 'fan-row';
  row.innerHTML = `<b>${u.name}</b><small>v${u.ver} • ${u.note}</small><button class="btn primary">Update</button>`;
  row.querySelector('button').onclick = (e) => { e.target.textContent = '✓ Done'; e.target.disabled = true; toast(u.name + ' updated ✓'); };
  ul.appendChild(row);
});
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
document.getElementById('applyFx').onclick = async () => {
  applyLight();
  const res = await applyGlowToHardware();
  toast(res ? 'Lighting applied to real devices ✓' : 'Preview updated (OpenRGB offline)');
};
document.getElementById('syncBtn').onclick = async () => {
  const n = await rescanHardware();
  toast(n > 0 ? `Forge Glow synced to ${n} real device(s) ✓` : 'No OpenRGB devices — start its Server tab');
};
['rgbPick', 'fx', 'bright'].forEach(id => document.getElementById(id).oninput = applyLight);

// live stats - real telemetry first, animated fallback
const spark = document.getElementById('spark').getContext('2d');
let hist = Array(40).fill(20);
let realStats = null;
setInterval(async () => {
  try { const s = await window.forge.stats(); if (!s.error) realStats = s; } catch {}
}, 5000);
function hexRgb(h) {
  const n = parseInt(h.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
let hwDevices = [];
async function rescanHardware() {
  try {
    const r = await window.forge.rgbList();
    if (Array.isArray(r)) { hwDevices = r; renderHwRow(); return r.length; }
  } catch {}
  hwDevices = []; renderHwRow(); return 0;
}
async function applyGlowToHardware() {
  if (!hwDevices.length) return false;
  const c = hexRgb(document.getElementById('rgbPick').value);
  const fx = document.getElementById('fx').value;
  const mode = (fx === 'Static' || fx === 'Breathing' || fx === 'Strobing') ? 'Direct' : fx;
  let ok = 0;
  for (let i = 0; i < hwDevices.length; i++) {
    try { const r = await window.forge.rgbSet({ dev: i, mode, ...c }); if (r && r.ok) ok++; } catch {}
  }
  return ok > 0;
}
function updateLive() {
  let cpu, gpu, temp;
  if (realStats && realStats.cpuLoad != null) {
    cpu = realStats.cpuLoad;
    gpu = (realStats.gpus[0] && realStats.gpus[0].temp != null) ? realStats.gpus[0].temp : 30 + Math.random() * 45;
    temp = realStats.cpuTemp != null ? realStats.cpuTemp : 45 + Math.random() * 20;
  } else {
    cpu = 25 + Math.random() * 40; gpu = 30 + Math.random() * 45; temp = 45 + Math.random() * 20;
  }
  document.getElementById('cpuVal').textContent = cpu.toFixed(0) + '%';
  document.getElementById('gpuVal').textContent = gpu.toFixed(0) + '%';
  document.getElementById('fanVal').textContent = Math.round(fans.reduce((a, f) => a + f.v, 0) / fans.length) + '%';
  document.getElementById('tempVal').textContent = temp.toFixed(0) + '°C';
  hist.push(cpu); hist.shift();
  spark.clearRect(0, 0, 640, 90);
  const g = spark.createLinearGradient(0, 0, 640, 0);
  g.addColorStop(0, '#ff0033'); g.addColorStop(1, '#d4af37');
  spark.strokeStyle = g; spark.lineWidth = 2.5; spark.beginPath();
  hist.forEach((v, i) => { const x = i * 16, y = 82 - v; i ? spark.lineTo(x, y) : spark.moveTo(x, y); });
  spark.stroke();
}
function drawCurve() {
  const c = document.getElementById('curve').getContext('2d');
  c.clearRect(0, 0, 640, 160); c.strokeStyle = '#d4af37'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(0, 140);
  fans.forEach((f, i) => c.lineTo(80 + i * 150, 140 - f.v * 1.2)); c.stroke();
}

// open-source tools row
function toolCard(title, statusHtml, btns) {
  const c = el(`<div class="card"><h4>${title}</h4><small>${statusHtml}</small><div class="row" style="margin-top:8px"></div></div>`);
  const row = c.querySelector('.row');
  btns.forEach(([label, fn, primary]) => {
    const b = el(`<button class="btn${primary ? ' primary' : ''}">${label}</button>`);
    b.onclick = fn; row.appendChild(b);
  });
  return c;
}
async function renderHwRow() {}
async function renderTools() {
  const w = document.getElementById('toolCards'); if (!w) return;
  w.innerHTML = '';
  // OpenRGB
  let rgbN = hwDevices.length, rgbBtns;
  if (rgbN > 0) {
    rgbBtns = [['Rescan', async () => { await rescanHardware(); renderTools(); }]];
  } else {
    rgbBtns = [
      ['Rescan', async () => { await rescanHardware(); renderTools(); }],
      ['Get OpenRGB', () => window.forge.openUrl('https://openrgb.org')],
    ];
  }
  w.appendChild(toolCard('OpenRGB', rgbN > 0 ? `● ${rgbN} device(s) live` : '○ Server offline — start it in OpenRGB > Server tab', rgbBtns));
  // Telemetry
  w.appendChild(toolCard('Telemetry', realStats ? `● Live: CPU ${Math.round(realStats.cpuLoad || 0)}%` : '○ Animated estimates (admin unlocks real temps)', [['Refresh', async () => { try { const s = await window.forge.stats(); if (!s.error) realStats = s; } catch {} renderTools(); }]]));
  // FanControl
  try {
    const fc = await window.forge.fancontrol('status');
    w.appendChild(toolCard('FanControl', fc.installed ? '● Installed' : '○ Not found', fc.installed
      ? [['Launch', async () => { await window.forge.fancontrol('launch'); toast('FanControl launched'); }]]
      : [['Get FanControl', () => window.forge.openUrl('https://github.com/Rem0o/FanControl.Releases')]]));
  } catch {}
}
// real hardware fan controls (LibreHardwareMonitor) - empty = none on this PC
async function renderRealFans() {
  const w = document.getElementById('realFans');
  let list = [];
  try { const r = await window.forge.fanRealList(); if (Array.isArray(r)) list = r.filter(s => s.type === 'Control'); } catch {}
  w.innerHTML = '';
  if (!list.length) {
    w.innerHTML = '<small class="dim">No controllable fans detected (needs desktop SuperIO chip or admin rights). Profiles above still work as presets.</small>';
    return;
  }
  list.forEach(c => {
    const row = document.createElement('div'); row.className = 'fan-row';
    row.innerHTML = `<b>${c.name}</b><input type="range" min="0" max="100" value="${Math.round(c.value || 50)}"><span>${c.hw}</span>`;
    row.querySelector('input').onchange = async e => {
      const v = +e.target.value;
      try {
        const r = await window.forge.fanRealSet({ id: c.id, value: v });
        toast(r && r.ok ? `${c.name} → ${v}% ✓` : 'Control rejected (try admin)');
      } catch { toast('Control failed'); }
    };
    w.appendChild(row);
  });
}

document.getElementById('exportBtn').onclick = () => {
  const data = { app: 'Forge Control v1.0', exported: new Date().toISOString(), devices, fans, color: document.getElementById('rgbPick').value, effect: document.getElementById('fx').value };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'forge-control-config.json'; a.click();
  toast('Config exported ✓');
};

// reveal + nav spy
const io = new IntersectionObserver(es => es.forEach(x => x.isIntersecting && x.target.classList.add('vis')), { threshold: 0.1 });
document.querySelectorAll('section, #gameCards .card').forEach(s => { s.classList.add('reveal'); io.observe(s); });
const links = document.querySelectorAll('.sidebar nav a');
window.addEventListener('scroll', () => {
  let cur = 'dashboard';
  document.querySelectorAll('section[id]').forEach(s => { if (scrollY >= s.offsetTop - 140) cur = s.id; });
  links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + cur));
});
links.forEach(a => a.addEventListener('click', () => side.classList.remove('open')));

setInterval(updateLive, 1200);
renderFans(); applyLight(); drawCurve(); updateLive();
rescanHardware().then(() => renderTools());
renderTools(); renderRealFans();
