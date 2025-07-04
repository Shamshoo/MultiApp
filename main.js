const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let store;

app.disableHardwareAcceleration();
app.whenReady().then(async () => {
  const { default: Store } = await import('electron-store');
  store = new Store();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

function createWindow () {
  const winState = store.get('windowBounds', { width: 800, height: 600 });

  const win = new BrowserWindow({
    ...winState,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false
    }
  });

  win.loadFile('index.html');

  if (!store.get('windowBounds')) {
    win.maximize();
  }

  win.on('resize', () => {
    store.set('windowBounds', win.getBounds());
  });

  win.on('move', () => {
    store.set('windowBounds', win.getBounds());
  });

  ipcMain.handle('get-channels', () => {
    return store.get('channels', {});
  });

  ipcMain.on('save-channels', (event, channels) => {
    store.set('channels', channels);
  });

  ipcMain.handle('get-password-entries', () => {
    return store.get('passwordEntries', {});
  });

  ipcMain.handle('save-password-entries', (event, entries) => {
    store.set('passwordEntries', entries);
  });

  ipcMain.handle('open-file-dialog', async () => {
    const { filePaths } = await dialog.showOpenDialog({
      properties: ['openFile']
    });
    return filePaths[0];
  });

  ipcMain.handle('save-file-dialog', async (event, data) => {
    const { filePath } = await dialog.showSaveDialog({
      defaultPath: 'channels-backup.json',
      filters: [
        { name: 'JSON Files', extensions: ['json'] }
      ]
    });
    if (filePath) {
      fs.writeFileSync(filePath, data);
    }
    return filePath;
  });

  ipcMain.handle('read-file', async (event, filePath) => {
    return fs.readFileSync(filePath, 'utf-8');
  });

  ipcMain.on('minimize-app', () => {
    win.minimize();
  });

  ipcMain.on('maximize-app', () => {
    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
  });

  ipcMain.on('close-app', () => {
    win.close();
  });
}


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
