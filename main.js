const { app, BrowserWindow, Menu, ipcMain, net, session, shell } = require('electron');
const path = require('path');
const crypto = require('crypto');
const { autoUpdater } = require('electron-updater');
const { APP_URL, ALLOWED_HOSTS, CHECK_EVERY_MINUTES } = require('./config');

const appOrigin = new URL(APP_URL).origin;
let win = null;
let loadedVersion = null;

// Look like normal Chrome, so Google sign-in does not block the app.
app.userAgentFallback = app.userAgentFallback.replace(/\s(Electron|vionode-desktop|Vionode)\/\S+/g, '');

// Only one copy of the app at a time.
if (!app.requestSingleInstanceLock()) app.quit();
app.on('second-instance', () => {
  if (!win) return;
  if (win.isMinimized()) win.restore();
  win.focus();
});

function isInsideApp(url) {
  try {
    const u = new URL(url);
    if (u.origin === appOrigin) return true;
    return ALLOWED_HOSTS.some((h) => u.hostname === h || u.hostname.endsWith('.' + h));
  } catch {
    return false;
  }
}

// Throw away cached files so the newest published version always loads.
// Logins stay, because cookies and local storage are not touched.
async function clearCachedVersion() {
  await session.defaultSession.clearCache();
  await session.defaultSession.clearStorageData({ storages: ['serviceworkers', 'cachestorage'] });
}

// Fingerprint of the published version: the script files the site loads.
// Lovable gives them new names on every publish.
async function publishedVersion() {
  const res = await net.fetch(APP_URL, { cache: 'no-store' });
  const html = await res.text();
  const scripts = html.match(/src="[^"]+\.js"/g);
  if (!scripts) return null;
  return crypto.createHash('sha1').update(scripts.join('|')).digest('hex');
}

async function checkForNewVersion() {
  try {
    const current = await publishedVersion();
    if (!current) return;
    if (!loadedVersion) loadedVersion = current;
    else if (current !== loadedVersion && win) win.webContents.send('vionode:new-version');
  } catch {
    // Offline or site unreachable: try again next time.
  }
}

async function createWindow() {
  await clearCachedVersion();

  win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 650,
    title: 'Vionode',
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
    },
  });

  win.once('ready-to-show', () => win.show());
  win.on('closed', () => { win = null; });

  // Links to other sites open in the normal browser.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (isInsideApp(url)) return { action: 'allow' };
    shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (event, url) => {
    if (!isInsideApp(url)) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  // No internet: show the offline page instead of a blank window.
  win.webContents.on('did-fail-load', (_e, code, _desc, url, isMainFrame) => {
    if (!isMainFrame || code === -3 || url.startsWith('file:')) return;
    win.loadFile(path.join(__dirname, 'offline.html'), { query: { url: APP_URL } });
  });

  loadedVersion = null;
  win.loadURL(APP_URL);
  checkForNewVersion();
}

// "Reload" button in the update banner.
ipcMain.on('vionode:reload', async () => {
  if (!win) return;
  await clearCachedVersion();
  loadedVersion = null;
  win.webContents.reloadIgnoringCache();
  checkForNewVersion();
});

const menu = [
  ...(process.platform === 'darwin' ? [{ role: 'appMenu' }] : []),
  { role: 'fileMenu' },
  { role: 'editMenu' },
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' },
    ],
  },
  { role: 'windowMenu' },
];

app.whenReady().then(() => {
  Menu.setApplicationMenu(Menu.buildFromTemplate(menu));
  createWindow();
  setInterval(checkForNewVersion, CHECK_EVERY_MINUTES * 60 * 1000);

  // Updates of the desktop app itself (only needed when you change these files).
  if (app.isPackaged) {
    autoUpdater.on('error', () => {});
    autoUpdater.checkForUpdatesAndNotify().catch(() => {});
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
