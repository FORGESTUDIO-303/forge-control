// Forge Control landing - static, no backend.
const REPO = 'https://github.com/FORGESTUDIO-303/forge-control';

let toastT;
function toast(m) {
  const t = document.getElementById('toast');
  t.textContent = m; t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2600);
}

// hamburger menu
const side = document.querySelector('.sidebar');
document.getElementById('menuBtn').onclick = () => side.classList.toggle('open');

// downloads -> source
document.getElementById('dlApp').onclick = () => window.open(REPO, '_blank');
document.getElementById('heroDl').onclick = () => window.open(REPO, '_blank');

// scroll reveal + nav spy
const io = new IntersectionObserver(es => es.forEach(x => x.isIntersecting && x.target.classList.add('vis')), { threshold: 0.12 });
document.querySelectorAll('section').forEach(s => { s.classList.add('reveal'); io.observe(s); });
const links = document.querySelectorAll('.sidebar nav a');
window.addEventListener('scroll', () => {
  let cur = 'top';
  document.querySelectorAll('section[id]').forEach(s => { if (scrollY >= s.offsetTop - 140) cur = s.id; });
  links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + cur));
});
links.forEach(a => a.addEventListener('click', () => side.classList.remove('open')));
