# Vionode desktop app

A thin Mac/Windows app that opens the live Vionode site (vionode.com) in its own window with the Vionode icon.
Everything inside the app is edited in Lovable: publish there and installed apps pick it up (banner within 10 minutes, always on next launch).

- `config.js`: start URL and sites allowed inside the window.
- `build/icon.png`: 1024x1024 app icon (Dock / taskbar).
- Actions → "Build desktop app" → Run workflow builds `Vionode-mac.dmg` and `Vionode-Setup.exe` into a draft release.
