// Forge Control landing - static, no backend.
const REPO = 'https://github.com/FORGESTUDIO-303/forge-control';

let toastT;
function toast(m) {
  const t = document.getElementById('toast');
  t.textContent = m; t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2600);
}

// downloads -> source
document.getElementById('dlApp').onclick = () => window.open(REPO, '_blank');
document.getElementById('heroDl').onclick = () => window.open(REPO, '_blank');
document.getElementById('dlApp2').onclick = () => window.open(REPO, '_blank');

// themes - live re-skin, remembered
try {
  const saved = localStorage.getItem('forge-theme');
  if (saved) document.documentElement.dataset.theme = saved;
} catch {}
document.querySelectorAll('[data-theme-set]').forEach(b => b.onclick = () => {
  const t = b.getAttribute('data-theme-set');
  if (t === 'crimson') delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = t;
  try { localStorage.setItem('forge-theme', t === 'crimson' ? '' : t); } catch {}
  toast(b.closest('.card').querySelector('h4').textContent + ' theme applied');
});

// scroll reveal + nav spy
const io = new IntersectionObserver(es => es.forEach(x => x.isIntersecting && x.target.classList.add('vis')), { threshold: 0.12 });
document.querySelectorAll('section').forEach(s => { s.classList.add('reveal'); io.observe(s); });
const links = document.querySelectorAll('.nav-links a');
window.addEventListener('scroll', () => {
  let cur = 'top';
  document.querySelectorAll('section[id]').forEach(s => { if (scrollY >= s.offsetTop - 140) cur = s.id; });
  links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + cur));
});
