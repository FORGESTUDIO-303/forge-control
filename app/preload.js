const { contextBridge } = require('electron');
contextBridge.exposeInMainWorld('forge', { version: '1.0.0' });
