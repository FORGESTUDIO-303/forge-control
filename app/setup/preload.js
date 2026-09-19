const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('setup', {
  pickDir: () => ipcRenderer.invoke('pick-dir'),
  defaultDir: () => ipcRenderer.invoke('default-dir'),
  homeDir: () => ipcRenderer.invoke('home-dir'),
  install: (target) => ipcRenderer.invoke('install', target),
  uninstall: (target) => ipcRenderer.invoke('uninstall', target),
  existing: () => ipcRenderer.invoke('existing'),
  shortcut: (o) => ipcRenderer.invoke('shortcut', o),
  launch: (target) => ipcRenderer.invoke('launch', target),
  onProgress: (cb) => ipcRenderer.on('install-progress', (_e, v) => cb(v)),
});
