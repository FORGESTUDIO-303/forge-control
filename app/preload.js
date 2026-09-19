const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('forge', {
  version: '1.1.0',
  rgbList: () => ipcRenderer.invoke('rgb-list'),
  rgbSet: (o) => ipcRenderer.invoke('rgb-set', o),
  stats: () => ipcRenderer.invoke('stats'),
  fancontrol: (action) => ipcRenderer.invoke('fancontrol', action),
  openUrl: (url) => ipcRenderer.invoke('open-url', url),
});
