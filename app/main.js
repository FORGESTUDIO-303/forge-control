const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawnSync, spawn } = require('child_process');

let si = null;
try { si = require('systeminformation'); } catch {}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200, height: 780,
    minWidth: 900, minHeight: 600,
    backgroundColor: '#08080d',
    title: 'Forge Control',
    autoHideMenuBar: true,
    webPreferences: { preload: path.join(__dirname, 'preload.js') }
  });
  win.loadFile('index.html');
}

// ---- open-source tool bridges ----
const PY = 'python';
const ctl = () => path.join(__dirname, 'tools', 'openrgb_ctl.py');

function runPy(args, timeout = 15000) {
  try {
    const r = spawnSync(PY, [ctl(), ...args], { encoding: 'utf8', timeout });
    const out = (r.stdout || '').trim().split('\n').pop() || '{}';
    return JSON.parse(out);
  } catch (e) {
    return { error: 'bridge-failed: ' + String(e.message || e).slice(0, 120) };
  }
}

ipcMain.handle('rgb-list', () => runPy(['list']));
ipcMain.handle('rgb-set', (_e, o) => runPy(['set', String(o.dev), o.mode || 'Direct', String(o.r), String(o.g), String(o.b)]));

ipcMain.handle('stats', async () => {
  if (!si) return { error: 'telemetry-offline' };
  try {
    const [temp, load, gfx] = await Promise.all([
      si.cpuTemperature().catch(() => ({})),
      si.currentLoad().catch(() => ({})),
      si.graphics().catch(() => ({ controllers: [] })),
    ]);
    return {
      cpuTemp: temp.main ?? null, cpuLoad: load.currentLoad ?? null,
      gpus: (gfx.controllers || []).map(g => ({ model: g.model, temp: g.temperatureGpu ?? null })),
    };
  } catch (e) { return { error: String(e.message || e).slice(0, 120) }; }
});

const FAN_PATHS = [
  'C:\\Program Files\\FanControl\\FanControl.exe',
  'C:\\Program Files (x86)\\FanControl\\FanControl.exe',
];
function findFanControl() {
  for (const p of FAN_PATHS) if (fs.existsSync(p)) return p;
  const local = path.join(app.getPath('home'), 'AppData', 'Local', 'FanControl', 'FanControl.exe');
  if (fs.existsSync(local)) return local;
  return null;
}
ipcMain.handle('fancontrol', (_e, action) => {
  const exe = findFanControl();
  if (action === 'status') return { installed: Boolean(exe), path: exe };
  if (!exe) return { error: 'not-installed', hint: 'Get it free: https://github.com/Rem0o/FanControl.Releases' };
  if (action === 'launch') { spawn(exe, { detached: true, stdio: 'ignore' }).unref(); return { ok: true }; }
  return { error: 'bad-action' };
});

ipcMain.handle('open-url', (_e, url) => { shell.openExternal(url); return true; });

// ---- real fan control (LibreHardwareMonitor, free OSS) ----
const fanCtl = () => path.join(__dirname, 'tools', 'lhm', 'FanCtl.exe');
function fanRun(args) {
  try {
    if (!fs.existsSync(fanCtl())) return { error: 'fan-helper-missing' };
    const r = spawnSync(fanCtl(), args, { encoding: 'utf8', timeout: 20000 });
    const out = (r.stdout || '').trim().split('\n').pop() || '[]';
    return JSON.parse(out);
  } catch (e) { return { error: String(e.message || e).slice(0, 120) }; }
}
ipcMain.handle('fan-real-list', () => fanRun(['list']));
ipcMain.handle('fan-real-set', (_e, o) => fanRun(['set', String(o.id), String(o.value)]));

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
