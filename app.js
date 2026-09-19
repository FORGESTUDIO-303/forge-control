// Forge Control landing - static, no backend.
const DL = 'https://github.com/FORGESTUDIO-303/forge-control/releases/download/v1.2.0/ForgeControl-Setup-1.2.0.exe';

let toastT;
function toast(m) {
  const t = document.getElementById('toast');
  t.textContent = m; t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2600);
}

// downloads -> release exe, direct
document.getElementById('dlApp').onclick = () => { toast('Downloading Forge Control…'); location.href = DL; };
document.getElementById('heroDl').onclick = () => { toast('Downloading Forge Control…'); location.href = DL; };
document.getElementById('dlApp2').onclick = () => { toast('Downloading Forge Control…'); location.href = DL; };

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
