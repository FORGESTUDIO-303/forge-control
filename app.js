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
  if (online) {
    pill.textContent = '● Live'; pill.classList.add('live'); pill.classList.remove('off');
    hero.classList.add('on'); hs.textContent = 'Welcome to Forge Control';
    foot.textContent = 'all systems live';
  } else {
    pill.textContent = 'Forge Control'; pill.classList.remove('off'); pill.classList.remove('live');
    hs.textContent = 'Welcome to Forge Control';
    foot.textContent = 'v1.0';
  }
}

// downloads -> source
document.getElementById('dlApp').onclick = () => window.open(REPO, '_blank');
document.getElementById('heroDl').onclick = () => window.open(REPO, '_blank');
// hamburger menu
const side = document.querySelector('.sidebar');
document.getElementById('menuBtn').onclick = () => side.classList.toggle('open');

// scroll reveal + nav spy
const io = new IntersectionObserver(es => es.forEach(x => x.isIntersecting && x.target.classList.add('vis')), { threshold: 0.12 });
document.querySelectorAll('section').forEach(s => { s.classList.add('reveal'); io.observe(s); });
const links = document.querySelectorAll('.sidebar nav a');
window.addEventListener('scroll', () => {
  let cur = 'top';
  document.querySelectorAll('section[id]').forEach(s => { if (scrollY >= s.offsetTop - 140) cur = s.id; });
  links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + cur));
});
document.querySelectorAll('.sidebar nav a').forEach(a => a.addEventListener('click', () => { side.classList.remove('open'); toast(a.textContent); }));

// auth - needs the API backend; probe it before redirecting to login
let apiUp = false;
async function loginWith(provider) {
  if (currentUser) { await fetch(api('/api/auth/logout'), { method: 'POST', credentials: 'include' }).catch(() => {}); currentUser = null; refreshAuth(); return; }
  try {
    const r = await fetch(api('/api/auth/status'), { credentials: 'include' });
    if (!r.ok) throw 0;
    location.href = api('/api/auth/' + provider);
  } catch {
    toast('Backend offline — double-click run-api.bat, open http://localhost:3000, then log in');
  }
}
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
document.getElementById('googleBtn').onclick = () => loginWith('google');
document.getElementById('githubBtn').onclick = () => loginWith('github');
if (location.hash.includes('login=ok')) toast('Welcome back ✓');

refreshAuth();
