const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

let win;
function createWindow() {
  win = new BrowserWindow({
    width: 720, height: 520, resizable: false,
    backgroundColor: '#08080d', title: 'Forge Control Setup',
    autoHideMenuBar: true,
    webPreferences: { preload: path.join(__dirname, 'preload.js') }
  });
  win.loadFile('index.html');
}

function payloadDir() {
  // dev: ../dist/win-unpacked | packaged portable: resources/payload
  const dev = path.join(__dirname, '..', 'dist', 'win-unpacked');
  if (fs.existsSync(dev)) return dev;
  return path.join(process.resourcesPath, 'payload');
}

ipcMain.handle('pick-dir', async () => {
  const r = await dialog.showOpenDialog(win, { properties: ['openDirectory', 'createDirectory'] });
  return r.canceled ? null : r.filePaths[0];
});

ipcMain.handle('default-dir', () => path.join(app.getPath('home'), 'AppData', 'Local', 'Forge Control'));
ipcMain.handle('home-dir', () => app.getPath('home'));

ipcMain.handle('install', async (_e, target) => {
  const src = payloadDir();
  fs.mkdirSync(target, { recursive: true });
  // copy payload with progress-ish feedback (two phases)
  win.webContents.send('install-progress', 15);
  await new Promise((res, rej) => {
    const ps = spawn('robocopy', [src, target, '/E', '/NFL', '/NDL', '/NJH', '/NJS'], { windowsHide: true });
    ps.on('close', () => res());
    ps.on('error', rej);
  });
  win.webContents.send('install-progress', 80);
  // shortcuts via PowerShell (Start Menu + optional Desktop handled by renderer flag)
  return true;
});

ipcMain.handle('shortcut', (_e, { target, name, loc }) => {
  const exe = path.join(target, 'Forge Control.exe');
  const link = path.join(loc, name + '.lnk');
  const ps = `$s=(New-Object -ComObject WScript.Shell).CreateShortcut('${link}');$s.TargetPath='${exe}';$s.WorkingDirectory='${target}';$s.Save()`;
  return new Promise((res, rej) => {
    const p = spawn('powershell', ['-NoProfile', '-Command', ps], { windowsHide: true });
    p.on('close', c => (c === 0 ? res(true) : rej(new Error('shortcut failed'))));
  });
});

ipcMain.handle('launch', (_e, target) => {
  shell.openPath(path.join(target, 'Forge Control.exe'));
  app.quit();
});

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
