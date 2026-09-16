import express from 'express';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { createServer as createViteServer } from 'vite';
import initSqlJs, { Database } from 'sql.js';
import { initialOrders, initialPurchaseInvoices, initialExpenseInvoices } from './src/data/initialData';

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

// Initial Data Fallbacks
const initialZones = [
  { id: 'z1', name: 'Ana Salon', description: 'Giriş katı ve ana yemek alanı' },
  { id: 'z2', name: 'Bahçe', description: 'Açık hava ve sigara içilebilir alan' },
  { id: 'z3', name: 'Teras', description: 'Üst kat manzaralı teras' },
  { id: 'z4', name: 'VIP Salon', description: 'Özel davet ve toplantı odası' },
];

const initialTables = [
  { id: 't1', number: 'Masa 1', zoneId: 'z1', capacity: 4, status: 'empty' },
  { id: 't2', number: 'Masa 2', zoneId: 'z1', capacity: 4, status: 'empty' },
  { id: 't3', number: 'Masa 3', zoneId: 'z1', capacity: 2, status: 'empty' },
  { id: 't4', number: 'Masa 4', zoneId: 'z1', capacity: 6, status: 'empty' },
  { id: 't5', number: 'Masa 5', zoneId: 'z1', capacity: 4, status: 'empty' },
  { id: 't6', number: 'Masa 6', zoneId: 'z1', capacity: 8, status: 'empty' },
  { id: 't7', number: 'Bahçe 1', zoneId: 'z2', capacity: 4, status: 'empty' },
  { id: 't8', number: 'Bahçe 2', zoneId: 'z2', capacity: 4, status: 'empty' },
  { id: 't9', number: 'Bahçe 3', zoneId: 'z2', capacity: 6, status: 'empty' },
  { id: 't10', number: 'Bahçe 4', zoneId: 'z2', capacity: 2, status: 'empty' },
  { id: 't11', number: 'Teras 1', zoneId: 'z3', capacity: 4, status: 'empty' },
  { id: 't12', number: 'Teras 2', zoneId: 'z3', capacity: 4, status: 'empty' },
  { id: 't13', number: 'Teras 3', zoneId: 'z3', capacity: 6, status: 'empty' },
  { id: 't14', number: 'VIP 1', zoneId: 'z4', capacity: 10, status: 'empty' },
  { id: 't15', number: 'VIP 2', zoneId: 'z4', capacity: 12, status: 'empty' },
];

const initialCategories = [
  { id: 'c1', name: 'Ana Yemekler', iconName: 'UtensilsCrossed', color: 'bg-amber-500' },
  { id: 'c2', name: 'Çorbalar', iconName: 'Soup', color: 'bg-orange-500' },
  { id: 'c3', name: 'Izgara & Kebap', iconName: 'Flame', color: 'bg-red-500' },
  { id: 'c4', name: 'Salatalar & Meze', iconName: 'Salad', color: 'bg-emerald-500' },
  { id: 'c5', name: 'Tatlılar', iconName: 'Cake', color: 'bg-pink-500' },
  { id: 'c6', name: 'Sıcak İçecekler', iconName: 'Coffee', color: 'bg-amber-700' },
  { id: 'c7', name: 'Soğuk İçecekler', iconName: 'CupSoda', color: 'bg-blue-500' },
];

const initialMenuItems = [
  {
    id: 'm1',
    categoryId: 'c1',
    name: 'Meriç Köfte Porsiyon',
    description: 'Özel baharatlı Meriç usulü ızgara köfte, pilav ve közlenmiş biber ile',
    price: 240,
    costPrice: 95,
    unit: 'Porsiyon',
    stockQuantity: 45,
    minStockAlert: 10,
    isAvailable: true,
  },
  {
    id: 'm2',
    categoryId: 'c1',
    name: 'Tavuk Sote',
    description: 'Kremalı, mantarlı ve sebzeli tavuk sote, pirinç pilavı ile',
    price: 210,
    costPrice: 80,
    unit: 'Porsiyon',
    stockQuantity: 30,
    minStockAlert: 8,
    isAvailable: true,
  },
  {
    id: 'm3',
    categoryId: 'c2',
    name: 'Günün Çorbası (Mercimek)',
    description: 'Süzme mercimek çorbası, kruton ekmek ve tereyağlı sos ile',
    price: 75,
    costPrice: 20,
    unit: 'Kase',
    stockQuantity: 60,
    minStockAlert: 15,
    isAvailable: true,
  },
  {
    id: 'm4',
    categoryId: 'c3',
    name: 'Adana Kebap',
    description: 'Zırh kıyması, lavaş, közlenmiş domates ve biber ile',
    price: 280,
    costPrice: 110,
    unit: 'Porsiyon',
    stockQuantity: 25,
    minStockAlert: 5,
    isAvailable: true,
  },
  {
    id: 'm5',
    categoryId: 'c6',
    name: 'Taze Demleme Çay',
    description: 'Rize çayı, geleneksel ince belli bardakta',
    price: 20,
    costPrice: 3,
    unit: 'Bardak',
    stockQuantity: 300,
    minStockAlert: 50,
    isAvailable: true,
  },
  {
    id: 'm6',
    categoryId: 'c6',
    name: 'Türk Kahvesi',
    description: 'Köpüklü Türk kahvesi, çikolata ve su ile',
    price: 55,
    costPrice: 10,
    unit: 'Fincan',
    stockQuantity: 120,
    minStockAlert: 20,
    isAvailable: true,
  },
  {
    id: 'm7',
    categoryId: 'c7',
    name: 'Ev Yapımı Ayran',
    description: 'Yayık ayranı, naneli',
    price: 35,
    costPrice: 8,
    unit: 'Bardak',
    stockQuantity: 80,
    minStockAlert: 15,
    isAvailable: true,
  },
  {
    id: 'm8',
    categoryId: 'c5',
    name: 'Fırın Sütlaç',
    description: 'Geleneksel fırınlanmış sütlaç, fındık parçaları ile',
    price: 90,
    costPrice: 25,
    unit: 'Porsiyon',
    stockQuantity: 20,
    minStockAlert: 5,
    isAvailable: true,
  },
];

const initialStockItems = [
  { id: 's1', name: 'Dana Kıyma (Köftelik)', category: 'Et & Şarküteri', quantity: 24.5, unit: 'kg', minThreshold: 5, costPerUnit: 380, lastUpdated: new Date().toISOString() },
  { id: 's2', name: 'Tavuk Göğsü', category: 'Et & Şarküteri', quantity: 18, unit: 'kg', minThreshold: 4, costPerUnit: 160, lastUpdated: new Date().toISOString() },
  { id: 's3', name: 'Rize Çayı (Kuru)', category: 'Kuru Gıda', quantity: 12, unit: 'kg', minThreshold: 3, costPerUnit: 180, lastUpdated: new Date().toISOString() },
  { id: 's4', name: 'Süt (Tam Yağlı)', category: 'Süt Ürünleri', quantity: 45, unit: 'lt', minThreshold: 10, costPerUnit: 32, lastUpdated: new Date().toISOString() },
  { id: 's5', name: 'Pirinç (Baldo)', category: 'Kuru Gıda', quantity: 35, unit: 'kg', minThreshold: 8, costPerUnit: 75, lastUpdated: new Date().toISOString() },
];

const defaultSettings = {
  name: 'Meriç Belediyesi Sosyal Tesisleri',
  logoUrl: '/logo.svg',
  address: 'Meriç Sosyal Tesisleri, Edirne',
  phone: '0 (284) 513 10 10',
  taxNumber: '6180054321',
  taxRatePercent: 10,
  receiptHeaderNote: 'Meriç Belediyesi Sosyal Tesislerine Hoş Geldiniz',
  receiptFooterNote: 'Afiyet olsun, yine bekleriz!',
  currencySymbol: '₺',
  serverIp: '192.168.1.100',
  serverPort: 3000,
};

const initialUsers = [
  {
    id: 'u1',
    name: 'Ahmet Yılmaz',
    username: 'admin',
    role: 'admin' as const,
    pinCode: '1234',
    isSystemAdmin: true,
    createdAt: new Date().toISOString(),
    permissions: {
      canTakeOrder: true,
      canApplyDiscount: true,
      canCancelItem: true,
      canTransferTable: true,
      canClosePayment: true,
      canViewReports: true,
      canManageStock: true,
      canManageMenu: true,
      canManageUsers: true,
    },
  },
  {
    id: 'u2',
    name: 'Mehmet Demir',
    username: 'garson1',
    role: 'pos' as const,
    pinCode: '0000',
    createdAt: new Date().toISOString(),
    permissions: {
      canTakeOrder: true,
      canApplyDiscount: false,
      canCancelItem: false,
      canTransferTable: true,
      canClosePayment: true,
      canViewReports: false,
      canManageStock: false,
      canManageMenu: false,
      canManageUsers: false,
    },
  },
  {
    id: 'u3',
    name: 'Mutfak Ekibi',
    username: 'mutfak',
    role: 'kitchen' as const,
    pinCode: '5555',
    createdAt: new Date().toISOString(),
    permissions: {
      canTakeOrder: false,
      canApplyDiscount: false,
      canCancelItem: false,
      canTransferTable: false,
      canClosePayment: false,
      canViewReports: false,
      canManageStock: true,
      canManageMenu: false,
      canManageUsers: false,
    },
  },
];

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
    let orders = getKV<any[]>('orders', initialOrders);
    if (!orders || orders.length === 0) {
      orders = initialOrders;
      setKV('orders', orders);
    } else {
      // Ensure closed order history is present if none exists
      const hasClosed = orders.some((o: any) => o.status === 'closed');
      if (!hasClosed) {
        const closedInitial = initialOrders.filter((o: any) => o.status === 'closed');
        orders = [...orders, ...closedInitial];
        setKV('orders', orders);
      }
    }
    const settings = getKV('settings', defaultSettings);
    const users = getKV('users', initialUsers);
    const notifications = getKV('kitchen_notifications', []);

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
    setKV('tables', initialTables);
    setKV('categories', initialCategories);
    setKV('menu_items', initialMenuItems);
    setKV('stock_items', initialStockItems);
    setKV('orders', []);
    setKV('settings', defaultSettings);
    setKV('users', initialUsers);

    addSystemLog({
      userId: req.body.userId || 'admin',
      userName: req.body.userName || 'Yönetici',
      userRole: 'admin',
      action: 'Sistem Sıfırlandı',
      details: 'Tüm adisyon, masa ve stok verileri varsayılan fabrika ayarlarına sıfırlandı.',
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
📁 Yerel SQLite Veritabanı: ${DB_FILE}
📁 JSON Yedek Dosyası: ${JSON_FILE}
------------------------------------------------
    `);
  });
}

startServer().catch((err) => {
  console.error('Kasa sunucusu başlatılamadı:', err);
});
