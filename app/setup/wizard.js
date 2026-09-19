let target = '';
function show(n) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('on'));
  document.getElementById('p' + n).classList.add('on');
  document.querySelectorAll('.steps span').forEach(s => s.classList.toggle('on', +s.dataset.s <= n));
}
document.querySelectorAll('[data-go]').forEach(b => b.onclick = () => show(+b.dataset.go));
document.getElementById('agree').onchange = e => document.getElementById('toLoc').disabled = !e.target.checked;
document.getElementById('toLoc').onclick = async () => {
  target = await window.setup.defaultDir();
  document.getElementById('loc').value = target;
  show(2);
};
document.getElementById('browse').onclick = async () => {
  const d = await window.setup.pickDir();
  if (d) { target = d; document.getElementById('loc').value = d; }
};
window.setup.onProgress(v => {
  document.getElementById('fill').style.width = v + '%';
  if (v >= 80) document.getElementById('phase').textContent = 'Creating shortcuts…';
});
document.getElementById('doInstall').onclick = async () => {
  target = document.getElementById('loc').value || target;
  show(3);
  try {
    await window.setup.install(target);
    const home = await window.setup.homeDir();
    const startMenu = home + '\\AppData\\Roaming\\Microsoft\\Windows\\Start Menu\\Programs';
    await window.setup.shortcut({ target, name: 'Forge Control', loc: startMenu });
    if (document.getElementById('desk').checked) {
      const desk = home + '\\Desktop';
      await window.setup.shortcut({ target, name: 'Forge Control', loc: desk }).catch(() => {});
    }
    document.getElementById('fill').style.width = '100%';
    show(4);
  } catch (e) {
    document.getElementById('phase').textContent = 'Install failed: ' + e.message;
  }
};
document.getElementById('finish').onclick = () => window.setup.launch(target);
