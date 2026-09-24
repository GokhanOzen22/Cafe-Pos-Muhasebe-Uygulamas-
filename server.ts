import express from 'express';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { createServer as createViteServer } from 'vite';
import initSqlJs, { Database } from 'sql.js';
import {
  initialZones,
  initialTables,
  initialCategories,
  initialUsers,
  defaultSettings,
  initialMenuItems,
  initialStockItems,
  initialOrders,
  initialPurchaseInvoices,
  initialExpenseInvoices,
} from './src/data/initialData';

interface LogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  details: string;
  category: 'order' | 'table' | 'payment' | 'stock' | 'menu' | 'system';
  ipAddress?: string;
}

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const DATA_DIR = process.env.POS_DATA_DIR || (
  process.env.APPDATA 
    ? path.join(process.env.APPDATA, 'meric-pos-data') 
    : path.join(process.cwd(), 'data')
);
const DB_FILE = path.join(DATA_DIR, 'database.sqlite');
const JSON_FILE = path.join(DATA_DIR, 'pos_store.json');

// Helper to get local network IP address
function getLocalNetworkIp(): string {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name] || []) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return '127.0.0.1';
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // Enable CORS for external access (No-IP DDNS / remote devices / tablets)
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Ensure data directory exists
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // Initialize SQLite WASM
  const SQL = await initSqlJs();
  let db: Database;

  if (fs.existsSync(DB_FILE)) {
    try {
      const fileBuffer = fs.readFileSync(DB_FILE);
      db = new SQL.Database(fileBuffer);
      console.log('✅ SQLite veritabanı başarıyla yüklendi:', DB_FILE);
    } catch (err) {
      console.error('⚠️ SQLite dosyası okunamadı, yeni oluşturuluyor:', err);
      db = new SQL.Database();
    }
  } else {
    console.log('📝 Yeni SQLite veritabanı oluşturuluyor...');
    db = new SQL.Database();
  }

  // Initialize SQLite tables
  db.run(`
    CREATE TABLE IF NOT EXISTS kv_store (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS system_logs (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      userId TEXT,
      userName TEXT,
      userRole TEXT,
      action TEXT NOT NULL,
      details TEXT,
      category TEXT NOT NULL,
      ipAddress TEXT
    );
  `);

  // Helper to persist SQLite db and JSON backup to disk
  function saveToDisk() {
    try {
      const data = db.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(DB_FILE, buffer);

      // Also create JSON snapshot
      const storeObj: Record<string, unknown> = {};
      const stmt = db.prepare('SELECT key, value FROM kv_store');
      while (stmt.step()) {
        const row = stmt.getAsObject();
        try {
          storeObj[row.key as string] = JSON.parse(row.value as string);
        } catch {
          storeObj[row.key as string] = row.value;
        }
      }
      stmt.free();

      fs.writeFileSync(JSON_FILE, JSON.stringify(storeObj, null, 2), 'utf-8');
    } catch (err) {
      console.error('❌ Disk kaydetme hatası:', err);
    }
  }

  // Helper to get KV
  function getKV<T>(key: string, defaultValue: T): T {
    try {
      const stmt = db.prepare('SELECT value FROM kv_store WHERE key = ?');
      stmt.bind([key]);
      if (stmt.step()) {
        const row = stmt.getAsObject();
        stmt.free();
        return JSON.parse(row.value as string) as T;
      }
      stmt.free();
    } catch (err) {
      console.error(`KV get error for ${key}:`, err);
    }
    return defaultValue;
  }

  // Helper to set KV
  function setKV(key: string, value: unknown) {
    const valStr = JSON.stringify(value);
    const now = new Date().toISOString();
    db.run(
      'INSERT OR REPLACE INTO kv_store (key, value, updated_at) VALUES (?, ?, ?)',
      [key, valStr, now]
    );
    saveToDisk();
  }

  // Seed default data if not present
  if (!getKV('zones', null)) {
    console.log('🌱 Varsayılan veriler SQLite veritabanına aktarılıyor...');
    setKV('zones', initialZones);
    setKV('tables', initialTables);
    setKV('categories', initialCategories);
    setKV('menu_items', initialMenuItems);
    setKV('stock_items', initialStockItems);
    setKV('purchase_invoices', initialPurchaseInvoices);
    setKV('expense_invoices', initialExpenseInvoices);
    setKV('orders', initialOrders);
    setKV('settings', defaultSettings);
    setKV('users', initialUsers);

    // Initial system log
    const initialLog: LogEntry = {
      id: 'log-' + Date.now(),
      timestamp: new Date().toISOString(),
      userId: 'system',
      userName: 'Kasa Sunucusu',
      userRole: 'admin',
      action: 'Veritabanı Başlatıldı',
      details: 'Lokal SQLite veritabanı başarıyla oluşturuldu ve hazır hale getirildi.',
      category: 'system',
      ipAddress: '127.0.0.1',
    };
    db.run(
      `INSERT INTO system_logs (id, timestamp, userId, userName, userRole, action, details, category, ipAddress)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        initialLog.id,
        initialLog.timestamp,
        initialLog.userId,
        initialLog.userName,
        initialLog.userRole,
        initialLog.action,
        initialLog.details,
        initialLog.category,
        initialLog.ipAddress || '',
      ]
    );
    saveToDisk();
  }

  // Helper to append log
  function addSystemLog(log: Omit<LogEntry, 'id' | 'timestamp'>) {
    const logId = 'log-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    const timestamp = new Date().toISOString();
    try {
      db.run(
        `INSERT INTO system_logs (id, timestamp, userId, userName, userRole, action, details, category, ipAddress)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          logId,
          timestamp,
          log.userId || 'system',
          log.userName || 'Bilinmeyen Kullanıcı',
          log.userRole || 'pos',
          log.action,
          log.details || '',
          log.category,
          log.ipAddress || '',
        ]
      );
      saveToDisk();
    } catch (err) {
      console.error('Log kaydetme hatası:', err);
    }
  }

  // API Endpoints
  app.get('/api/ping', (req, res) => {
    res.json({
      status: 'ok',
      message: 'Meriç Belediyesi Kasa Sunucusu Aktif',
      wanDomain: 'adisyonkasa.ddns.net',
      port: PORT,
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/api/server-info', (req, res) => {
    const localIp = getLocalNetworkIp();
    let logCount = 0;
    try {
      const stmt = db.prepare('SELECT COUNT(*) as cnt FROM system_logs');
      if (stmt.step()) {
        logCount = (stmt.getAsObject().cnt as number) || 0;
      }
      stmt.free();
    } catch {
      logCount = 0;
    }

    res.json({
      status: 'online',
      localIp,
      port: PORT,
      localUrl: `http://${localIp}:${PORT}`,
      wanDomain: 'adisyonkasa.ddns.net',
      wanUrl: `http://adisyonkasa.ddns.net:${PORT}`,
      dbPath: DB_FILE,
      jsonPath: JSON_FILE,
      totalLogs: logCount,
      serverTime: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
    });
  });

  app.get('/api/all-data', (req, res) => {
    const zones = getKV('zones', initialZones);
    const tables = getKV('tables', initialTables);
    const categories = getKV('categories', initialCategories);
    const menuItems = getKV('menu_items', initialMenuItems);
    const stockItems = getKV('stock_items', initialStockItems);
    const purchaseInvoices = getKV('purchase_invoices', initialPurchaseInvoices);
    const expenseInvoices = getKV('expense_invoices', initialExpenseInvoices);
    const orders = getKV<any[]>('orders', initialOrders);
    const settings = getKV('settings', defaultSettings);
    const users = getKV('users', initialUsers);
    const notifications = getKV('kitchen_notifications', []);

    const dailyZReports = getKV<any[]>('daily_zreports', []);

    res.json({
      zones,
      tables,
      categories,
      menuItems,
      stockItems,
      purchaseInvoices,
      expenseInvoices,
      orders,
      settings,
      users,
      notifications,
      dailyZReports,
      serverTime: new Date().toISOString(),
    });
  });

  app.post('/api/sync', (req, res) => {
    const {
      zones,
      tables,
      categories,
      menuItems,
      stockItems,
      purchaseInvoices,
      expenseInvoices,
      orders,
      settings,
      users,
      notifications,
      dailyZReports,
      log,
    } = req.body;

    if (zones !== undefined) setKV('zones', zones);
    if (tables !== undefined) setKV('tables', tables);
    if (categories !== undefined) setKV('categories', categories);
    if (menuItems !== undefined) setKV('menu_items', menuItems);
    if (stockItems !== undefined) setKV('stock_items', stockItems);
    if (purchaseInvoices !== undefined) setKV('purchase_invoices', purchaseInvoices);
    if (expenseInvoices !== undefined) setKV('expense_invoices', expenseInvoices);
    if (orders !== undefined) setKV('orders', orders);
    if (settings !== undefined) setKV('settings', settings);
    if (users !== undefined) setKV('users', users);
    if (notifications !== undefined) setKV('kitchen_notifications', notifications);
    if (dailyZReports !== undefined) setKV('daily_zreports', dailyZReports);

    if (log) {
      addSystemLog({
        userId: log.userId,
        userName: log.userName,
        userRole: log.userRole,
        action: log.action,
        details: log.details,
        category: log.category || 'system',
        ipAddress: req.ip,
      });
    }

    res.json({ success: true, timestamp: new Date().toISOString() });
  });

  app.get('/api/notifications', (req, res) => {
    const notifications = getKV('kitchen_notifications', []);
    res.json(notifications);
  });

  app.post('/api/notifications/clear', (req, res) => {
    setKV('kitchen_notifications', []);
    res.json({ success: true, notifications: [] });
  });

  app.post('/api/notifications/delete', (req, res) => {
    const { id } = req.body;
    let notifications = getKV('kitchen_notifications', []);
    if (id) {
      notifications = notifications.filter((n: Record<string, unknown>) => n.id !== id);
    }
    setKV('kitchen_notifications', notifications);
    res.json({ success: true, notifications });
  });

  app.post('/api/notifications/mark-read', (req, res) => {
    const { id, all } = req.body;
    let notifications = getKV('kitchen_notifications', []);
    if (all) {
      notifications = notifications.map((n: Record<string, unknown>) => ({ ...n, read: true }));
    } else if (id) {
      notifications = notifications.map((n: Record<string, unknown>) => (n.id === id ? { ...n, read: true } : n));
    }
    setKV('kitchen_notifications', notifications);
    res.json({ success: true, notifications });
  });

  app.get('/api/logs', (req, res) => {
    const logs: LogEntry[] = [];
    try {
      const stmt = db.prepare(
        'SELECT * FROM system_logs ORDER BY timestamp DESC LIMIT 300'
      );
      while (stmt.step()) {
        const row = stmt.getAsObject();
        logs.push({
          id: row.id as string,
          timestamp: row.timestamp as string,
          userId: row.userId as string,
          userName: row.userName as string,
          userRole: row.userRole as string,
          action: row.action as string,
          details: row.details as string,
          category: row.category as LogEntry['category'],
          ipAddress: row.ipAddress as string,
        });
      }
      stmt.free();
    } catch (err) {
      console.error('Log getirme hatası:', err);
    }
    res.json(logs);
  });

  app.post('/api/logs', (req, res) => {
    const { userId, userName, userRole, action, details, category } = req.body;
    addSystemLog({
      userId,
      userName,
      userRole,
      action,
      details,
      category: category || 'system',
      ipAddress: req.ip,
    });
    res.json({ success: true });
  });

  app.post('/api/reset-data', (req, res) => {
    setKV('zones', initialZones);
    setKV('tables', initialTables.map(t => ({ ...t, status: 'empty', currentOrderId: undefined, openedAt: undefined, customerName: undefined, reservedTime: undefined })));
    setKV('categories', initialCategories);
    setKV('menu_items', initialMenuItems);
    setKV('stock_items', initialStockItems);
    setKV('orders', initialOrders);
    setKV('settings', defaultSettings);
    setKV('users', initialUsers);
    setKV('purchase_invoices', initialPurchaseInvoices);
    setKV('expense_invoices', initialExpenseInvoices);
    setKV('kitchen_notifications', []);
    setKV('daily_zreports', []);

    addSystemLog({
      userId: req.body.userId || 'admin',
      userName: req.body.userName || 'Yönetici',
      userRole: 'admin',
      action: 'Temiz Kuruluma Sıfırlandı',
      details: 'Masalar ve örnek kullanıcılar korunarak; adisyonlar, alım-gider faturaları, ürünler ve stoklar sıfırlandı.',
      category: 'system',
      ipAddress: req.ip,
    });

    res.json({ success: true, message: 'Veritabanı sıfırlandı.' });
  });

  // Vite middleware for development vs Static in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Robustly resolve dist folder in both standalone and packaged environments
    let distPath = path.join(process.cwd(), 'dist');
    if (!fs.existsSync(path.join(distPath, 'index.html'))) {
      if (fs.existsSync(path.join(__dirname, 'index.html'))) {
        distPath = __dirname;
      } else if (fs.existsSync(path.join(__dirname, '../dist/index.html'))) {
        distPath = path.join(__dirname, '../dist');
      }
    }
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    const localIp = getLocalNetworkIp();
    console.log(`
🚀 MERİÇ BELEDİYESİ KASA SUNUCUSU AKTİF!
------------------------------------------------
📍 Yerel Bilgisayar (Kasa): http://localhost:${PORT}
🌐 Yerel Wi-Fi Ağı (Tabletler): http://${localIp}:${PORT}
🌍 Uzaktan Dış Ağ (No-IP DDNS): http://adisyonkasa.ddns.net:${PORT}
📁 Yerel SQLite Veritabanı: ${DB_FILE}
📁 JSON Yedek Dosyası: ${JSON_FILE}
------------------------------------------------
💡 İpucu: Dışarıdan veya telefondan erişmek için modeminizde 3000 portunu
   bu bilgisayarın yerel IP adresine (${localIp}) yönlendirin.
------------------------------------------------
    `);
  });
}

startServer().catch((err) => {
  console.error('Kasa sunucusu başlatılamadı:', err);
});
