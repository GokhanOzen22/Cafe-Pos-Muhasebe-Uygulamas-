const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron');
const path = require('path');
const http = require('http');
const fs = require('fs');

// Enable Kiosk Silent Printing in Chromium - automatically bypasses Windows Print Dialog
app.commandLine.appendSwitch('kiosk-printing');
app.commandLine.appendSwitch('disable-print-preview');

let mainWindow = null;
const PORT = process.env.PORT || 3000;

// Setup writable user data path for SQLite and settings
const userDataPath = app.getPath('userData');
const posDataDir = path.join(userDataPath, 'pos-data');
if (!fs.existsSync(posDataDir)) {
  try {
    fs.mkdirSync(posDataDir, { recursive: true });
  } catch (e) {
    console.error('Could not create posDataDir:', e);
  }
}
process.env.POS_DATA_DIR = posDataDir;
process.env.NODE_ENV = 'production';
process.env.PORT = String(PORT);

function startServer() {
  const serverPath = path.join(__dirname, '../dist/server.cjs');
  try {
    // Run Express server in-process in Electron's Node runtime
    require(serverPath);
    console.log('✅ Express POS Kasa sunucusu Electron bünyesinde başlatıldı.');
  } catch (err) {
    console.error('❌ Sunucu başlatma hatası:', err);
  }
}

function checkServerReady(callback, maxAttempts = 50, interval = 200) {
  let attempts = 0;
  const timer = setInterval(() => {
    attempts++;
    const req = http.get(`http://127.0.0.1:${PORT}/api/server-info`, (res) => {
      if (res.statusCode === 200) {
        clearInterval(timer);
        callback(true);
      }
    });

    req.on('error', () => {
      if (attempts >= maxAttempts) {
        clearInterval(timer);
        callback(false);
      }
    });

    req.setTimeout(500, () => {
      req.destroy();
    });
  }, interval);
}

function getLoadingHtml() {
  return `data:text/html;charset=utf-8,${encodeURIComponent(`
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="UTF-8">
      <title>Meriç POS & Kasa Başlatılıyor</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          background-color: #0c0a09;
          color: #fafaf9;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          user-select: none;
        }
        .container {
          text-align: center;
          max-width: 480px;
          padding: 32px;
        }
        .spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #292524;
          border-top-color: #f59e0b;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto 24px;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        h1 {
          font-size: 22px;
          font-weight: 700;
          margin-bottom: 8px;
          color: #f59e0b;
        }
        p {
          font-size: 14px;
          color: #a8a29e;
          line-height: 1.5;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="spinner"></div>
        <h1>Meriç POS & Kasa Sistemi</h1>
        <p>Yerel SQLite veritabanı ve kasa sunucusu başlatılıyor, lütfen bekleyiniz...</p>
      </div>
    </body>
    </html>
  `)}`;
}

function getErrorHtml(errMsg) {
  return `data:text/html;charset=utf-8,${encodeURIComponent(`
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="UTF-8">
      <title>Başlatma Hatası</title>
      <style>
        body {
          background-color: #0c0a09;
          color: #fafaf9;
          font-family: sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          margin: 0;
        }
        .box {
          background: #1c1917;
          border: 1px solid #dc2626;
          border-radius: 16px;
          padding: 32px;
          max-width: 500px;
          text-align: center;
        }
        h2 { color: #ef4444; margin-top: 0; }
        p { color: #a8a29e; font-size: 14px; margin-bottom: 20px; }
        button {
          background: #f59e0b;
          color: #000;
          border: none;
          padding: 10px 20px;
          font-weight: bold;
          border-radius: 8px;
          cursor: pointer;
        }
      </style>
    </head>
    <body>
      <div class="box">
        <h2>Kasa Sunucusu Başlatılamadı</h2>
        <p>${errMsg || 'Port 3000 meşgul olabilir veya sunucu dosyası okunamadı.'}</p>
        <button onclick="location.reload()">Yeniden Dene</button>
      </div>
    </body>
    </html>
  `)}`;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 650,
    title: 'Meriç Belediyesi Sosyal Tesisleri POS & Kasa',
    backgroundColor: '#0c0a09',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
    },
  });

  // Display clean branded loading UI immediately (prevent blank white flash)
  mainWindow.loadURL(getLoadingHtml());

  // Check when local server is ready, then load POS app
  checkServerReady((ready) => {
    if (ready && mainWindow) {
      mainWindow.loadURL(`http://127.0.0.1:${PORT}`);
    } else if (mainWindow) {
      mainWindow.loadURL(getErrorHtml('Sunucu yanıt vermedi. Lütfen uygulamayı yeniden başlatın veya F12 ile konsol hatalarını inceleyin.'));
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Setup IPC handlers for silent direct printing
ipcMain.handle('print-direct', async (event, options = {}) => {
  return new Promise(async (resolve) => {
    try {
      let targetDevice = options.deviceName || '';

      // Validate target device against installed printers to avoid invalid device errors
      if (mainWindow) {
        try {
          const printers = await mainWindow.webContents.getPrintersAsync();
          if (targetDevice) {
            const match = printers.find(
              (p) =>
                p.name.toLowerCase() === targetDevice.toLowerCase() ||
                (p.displayName && p.displayName.toLowerCase() === targetDevice.toLowerCase())
            );
            if (!match) {
              const defaultPrn = printers.find((p) => p.isDefault);
              console.log(`⚠️ Belirtilen yazıcı (${targetDevice}) bulunamadı. Varsayılan (${defaultPrn?.name || 'Sistem'}) kullanılacak.`);
              targetDevice = defaultPrn ? defaultPrn.name : '';
            } else {
              targetDevice = match.name;
            }
          } else {
            const defaultPrn = printers.find((p) => p.isDefault);
            if (defaultPrn) targetDevice = defaultPrn.name;
          }
        } catch (e) {
          console.warn('Yazıcılar kontrol edilemedi:', e);
        }
      }

      const printOptions = {
        silent: true, // PENCERE VE YAZICI SEÇİM DİYALOĞU AÇILMADAN DİREKT YAZDIR
        printBackground: true,
        deviceName: targetDevice,
        color: false,
        margins: { marginType: 'none' },
        copies: options.copies || 1,
      };

      // If isolated raw HTML is supplied, render in a dedicated hidden window (100% immune to UI race conditions)
      if (options.html) {
        const printWindow = new BrowserWindow({
          show: false,
          width: 320,
          height: 600,
          webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
          },
        });

        printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(options.html)}`);

        printWindow.webContents.on('did-finish-load', () => {
          setTimeout(() => {
            printWindow.webContents.print(printOptions, (success, failureReason) => {
              try {
                printWindow.close();
              } catch (e) {}
              if (!success) {
                console.warn('⚠️ HTML doğrudan yazdırma uyarısı:', failureReason);
              } else {
                console.log('✅ Fiş (HTML) başarıyla doğrudan yazıcıya iletildi.');
              }
              resolve({ success, failureReason });
            });
          }, 200);
        });

        printWindow.webContents.on('did-fail-load', () => {
          try {
            printWindow.close();
          } catch (e) {}
          resolve({ success: false, failureReason: 'HTML yüklenemedi' });
        });
        return;
      }

      // Fallback: print active mainWindow webContents
      if (!mainWindow) return resolve({ success: false, error: 'Ana pencere bulunamadı.' });

      mainWindow.webContents.print(printOptions, (success, failureReason) => {
        if (!success) {
          console.warn('⚠️ Doğrudan yazdırma uyarısı:', failureReason);
        } else {
          console.log('✅ Fiş başarıyla doğrudan yazıcıya iletildi.');
        }
        resolve({ success, failureReason });
      });
    } catch (err) {
      console.error('print-direct genel hata:', err);
      resolve({ success: false, failureReason: err?.message || 'Yazdırma hatası' });
    }
  });
});

ipcMain.handle('get-printers', async () => {
  if (!mainWindow) return [];
  try {
    const printers = await mainWindow.webContents.getPrintersAsync();
    return printers.map((p) => ({
      name: p.name,
      displayName: p.displayName || p.name,
      isDefault: p.isDefault,
      status: p.status,
    }));
  } catch (e) {
    console.error('Yazıcılar listelenirken hata:', e);
    return [];
  }
});

ipcMain.handle('toggle-fullscreen', () => {
  if (mainWindow) {
    mainWindow.setFullScreen(!mainWindow.isFullScreen());
  }
});

app.on('ready', () => {
  startServer();
  createWindow();

  // Register Developer shortcuts (F12, F5)
  globalShortcut.register('F12', () => {
    if (mainWindow) mainWindow.webContents.toggleDevTools();
  });
  globalShortcut.register('Ctrl+Shift+I', () => {
    if (mainWindow) mainWindow.webContents.toggleDevTools();
  });
  globalShortcut.register('F5', () => {
    if (mainWindow) mainWindow.reload();
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
