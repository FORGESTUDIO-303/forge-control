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

// like the fix guides: kill leftovers, detect previous install
function killApp() {
  return new Promise((res) => {
    const p = spawn('taskkill', ['/F', '/IM', 'Forge Control.exe'], { windowsHide: true });
    p.on('close', () => res());
    p.on('error', () => res());
  });
}
ipcMain.handle('existing', async () => {
  const dir = path.join(app.getPath('home'), 'AppData', 'Local', 'Forge Control');
  return fs.existsSync(path.join(dir, 'Forge Control.exe')) ? dir : null;
});

const UNINSTALL_BAT = `@echo off
title Forge Control Uninstall
taskkill /F /IM "Forge Control.exe" 2>nul
timeout /t 2 /nobreak >nul
del "%APPDATA%\\Microsoft\\Windows\\Start Menu\\Programs\\Forge Control.lnk" 2>nul
del "%USERPROFILE%\\Desktop\\Forge Control.lnk" 2>nul
reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\ForgeControl" /f 2>nul
cd /d "%TEMP%"
rmdir /s /q "{TARGET}"
echo Uninstalled. Press any key...
pause >nul
(goto) 2>nul & del "%~f0"
`;

function psRun(ps) {
  return new Promise((res, rej) => {
    const p = spawn('powershell', ['-NoProfile', '-Command', ps], { windowsHide: true });
    p.on('close', c => (c === 0 ? res(true) : rej(new Error('ps failed'))));
    p.on('error', rej);
  });
}

ipcMain.handle('install', async (_e, target) => {
  const src = payloadDir();
  await killApp(); // stop running copy first (fix-guide style)
  fs.mkdirSync(target, { recursive: true });
  win.webContents.send('install-progress', 15);
  await new Promise((res, rej) => {
    const ps = spawn('robocopy', [src, target, '/E', '/NFL', '/NDL', '/NJH', '/NJS'], { windowsHide: true });
    ps.on('close', () => res());
    ps.on('error', rej);
  });
  win.webContents.send('install-progress', 60);
  // uninstaller batch (self-deleting) + Add/Remove Programs entry (HKCU, no admin)
  fs.writeFileSync(path.join(target, 'Uninstall.bat'), UNINSTALL_BAT.replace('{TARGET}', target));
  const un = path.join(target, 'Uninstall.bat').replace(/'/g, "''");
  await psRun(`New-Item -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\ForgeControl' -Force | Out-Null; ` +
    `Set-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\ForgeControl' -Name DisplayName -Value 'Forge Control'; ` +
    `Set-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\ForgeControl' -Name DisplayVersion -Value '1.2.0'; ` +
    `Set-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\ForgeControl' -Name Publisher -Value 'FORGESTUDIO-303'; ` +
    `Set-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\ForgeControl' -Name UninstallString -Value '${un}'; ` +
    `Set-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\ForgeControl' -Name InstallLocation -Value '${target.replace(/'/g, "''")}'; ` +
    `Set-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\ForgeControl' -Name NoModify -Value 1 -Type DWord; ` +
    `Set-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\ForgeControl' -Name NoRepair -Value 1 -Type DWord`).catch(() => false);
  win.webContents.send('install-progress', 80);
  return true;
});

// full uninstall from inside the wizard (repair-guide style cleanup)
ipcMain.handle('uninstall', async (_e, target) => {
  await killApp();
  const home = app.getPath('home');
  const del = (p) => { try { if (p && fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true }); } catch {} };
  del(path.join(home, 'AppData', 'Roaming', 'Microsoft', 'Windows', 'Start Menu', 'Programs', 'Forge Control.lnk'));
  del(path.join(home, 'Desktop', 'Forge Control.lnk'));
  await psRun(`Remove-Item -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\ForgeControl' -Recurse -Force`).catch(() => false);
  win.webContents.send('install-progress', 60);
  del(target);
  win.webContents.send('install-progress', 100);
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
