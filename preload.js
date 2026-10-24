const { contextBridge, ipcRenderer } = require('electron');

// Lets the website know it is running inside the desktop app
// (used to hide the "Download app" button there).
contextBridge.exposeInMainWorld('vionodeDesktop', { isDesktop: true });

// Small banner when a new version was published in Lovable.
ipcRenderer.on('vionode:new-version', () => {
  if (document.getElementById('vionode-update')) return;

  const box = document.createElement('div');
  box.id = 'vionode-update';
  box.style.cssText =
    'position:fixed;right:20px;bottom:20px;z-index:2147483647;display:flex;align-items:center;gap:12px;' +
    'padding:12px 14px 12px 16px;border-radius:10px;background:#111827;color:#fff;' +
    'font:14px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.25);';

  const text = document.createElement('span');
  text.textContent = 'A new version of Vionode is available.';

  const reload = document.createElement('button');
  reload.textContent = 'Reload';
  reload.style.cssText =
    'border:0;border-radius:6px;padding:6px 12px;background:#fff;color:#111827;font:inherit;font-weight:600;cursor:pointer;';
  reload.onclick = () => ipcRenderer.send('vionode:reload');

  const close = document.createElement('button');
  close.textContent = '×';
  close.setAttribute('aria-label', 'Later');
  close.style.cssText = 'border:0;background:none;color:#9ca3af;font-size:18px;cursor:pointer;padding:0 2px;';
  close.onclick = () => box.remove();

  box.append(text, reload, close);
  document.body.appendChild(box);
});
