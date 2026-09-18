// Forge Control landing - animated, live status.
const API = (window.FORGE_API || '').replace(/\/$/, '');
const api = (p) => (API || '') + p;
const REPO = 'https://github.com/FORGESTUDIO-303/forge-control';

let toastT;
function toast(m) {
  const t = document.getElementById('toast');
  t.textContent = m; t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2600);
}
function setStatus(online) {
  const pill = document.getElementById('apiPill');
  const hero = document.getElementById('heroStatus');
  const foot = document.getElementById('footStatus');
  const hs = document.getElementById('heroStatusTxt');
  const badge = document.getElementById('gpuBadge');
  if (online) {
    pill.textContent = '● Live'; pill.classList.add('live'); pill.classList.remove('off');
    hero.classList.add('on'); hs.textContent = 'Forge Cloud connected';
    foot.textContent = 'all systems live'; badge.textContent = 'Cloud synced';
  } else {
    pill.textContent = '● Connecting…'; pill.classList.add('off'); pill.classList.remove('live');
    hs.textContent = 'Connecting to Forge Cloud…';
    foot.textContent = 'connecting…'; badge.textContent = 'Syncing…';
  }
}

// hero live stats animation
const spark = document.getElementById('spark').getContext('2d');
let hist = Array(40).fill(20);
function updateLive() {
  const cpu = 25 + Math.random() * 40, gpu = 30 + Math.random() * 45;
  document.getElementById('cpuVal').textContent = cpu.toFixed(0) + '%';
  document.getElementById('gpuVal').textContent = gpu.toFixed(0) + '%';
  document.getElementById('fanVal').textContent = (30 + Math.random() * 30).toFixed(0) + '%';
  document.getElementById('tempVal').textContent = (45 + Math.random() * 20).toFixed(0) + '°C';
  hist.push(cpu); hist.shift();
  spark.clearRect(0, 0, 320, 90);
  const g = spark.createLinearGradient(0, 0, 320, 0);
  g.addColorStop(0, '#ff0033'); g.addColorStop(1, '#d4af37');
  spark.strokeStyle = g; spark.lineWidth = 2.5; spark.beginPath();
  hist.forEach((v, i) => { const x = i * 8, y = 82 - v; i ? spark.lineTo(x, y) : spark.moveTo(x, y); });
  spark.stroke();
}

// downloads -> source
document.getElementById('dlApp').onclick = () => window.open(REPO, '_blank');
document.getElementById('heroDl').onclick = () => window.open(REPO, '_blank');
document.getElementById('resetBtn').onclick = () => toast('Settings reset');

// scroll reveal + nav spy
const io = new IntersectionObserver(es => es.forEach(x => x.isIntersecting && x.target.classList.add('vis')), { threshold: 0.12 });
document.querySelectorAll('section, .hero-card').forEach(s => { s.classList.add('reveal'); io.observe(s); });
const links = document.querySelectorAll('.nav-links a');
window.addEventListener('scroll', () => {
  let cur = 'top';
  document.querySelectorAll('section[id]').forEach(s => { if (scrollY >= s.offsetTop - 140) cur = s.id; });
  links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + cur));
});
document.querySelectorAll('.nav-links a').forEach(a => a.addEventListener('click', () => toast(a.textContent)));

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
      setStatus(Boolean(API));
    }
  } catch { document.getElementById('userPill').textContent = 'Sign in to sync'; setStatus(false); }
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
updateLive(); refreshAuth();
