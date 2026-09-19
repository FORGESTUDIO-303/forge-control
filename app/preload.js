const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('forge', {
  version: '1.1.0',
  rgbList: () => ipcRenderer.invoke('rgb-list'),
  rgbSet: (o) => ipcRenderer.invoke('rgb-set', o),
  stats: () => ipcRenderer.invoke('stats'),
  fancontrol: (action) => ipcRenderer.invoke('fancontrol', action),
  fanRealList: () => ipcRenderer.invoke('fan-real-list'),
  fanRealSet: (o) => ipcRenderer.invoke('fan-real-set', o),
  openfan: (o) => ipcRenderer.invoke('openfan', o),
  openUrl: (url) => ipcRenderer.invoke('open-url', url),
});
