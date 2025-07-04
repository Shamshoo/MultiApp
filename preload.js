const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send('minimize-app'),
  maximize: () => ipcRenderer.send('maximize-app'),
  close: () => ipcRenderer.send('close-app'),
  getChannels: () => ipcRenderer.invoke('get-channels'),
  saveChannels: (channels) => ipcRenderer.send('save-channels', channels),
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  saveFileDialog: (data) => ipcRenderer.invoke('save-file-dialog', data),
  getPasswordEntries: () => ipcRenderer.invoke('get-password-entries'),
  savePasswordEntries: (entries) => ipcRenderer.invoke('save-password-entries', entries)
});
