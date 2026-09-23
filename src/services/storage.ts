import { Zone, Table, Category, MenuItem, StockItem, Order, RestaurantSettings, AppUser, SystemLog, ServerInfo, PurchaseInvoice, ExpenseInvoice, KitchenNotification, DailyZReport } from '../types';
import { initialZones, initialTables, initialCategories, initialMenuItems, initialStockItems, initialOrders, defaultSettings, initialUsers, initialPurchaseInvoices, initialExpenseInvoices } from '../data/initialData';

const STORAGE_KEYS = {
  ZONES: 'adisyon_zones_v1',
  TABLES: 'adisyon_tables_v1',
  CATEGORIES: 'adisyon_categories_v1',
  MENU_ITEMS: 'adisyon_menu_items_v1',
  STOCK_ITEMS: 'adisyon_stock_items_v1',
  ORDERS: 'adisyon_orders_v1',
  SETTINGS: 'adisyon_settings_v1',
  USERS: 'adisyon_users_v1',
  LOGS: 'adisyon_logs_v1',
  PURCHASE_INVOICES: 'adisyon_purchase_invoices_v1',
  EXPENSE_INVOICES: 'adisyon_expense_invoices_v1',
  NOTIFICATIONS: 'adisyon_kitchen_notifications_v1',
  DAILY_Z_REPORTS: 'adisyon_daily_zreports_v1',
};

export class StorageService {
  // Helper for background sync to Local Express SQLite Server
  private static async syncToServer(payload: Record<string, unknown>, logData?: { action: string; details?: string; category?: string; userId?: string; userName?: string; userRole?: string }) {
    try {
      await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, log: logData }),
      });
    } catch {
      // Offline mode or server unreachable, fallback silently to local storage
    }
  }

  // Fetch full dataset from local Express SQLite server
  static async fetchFullDataFromServer(): Promise<{
    zones: Zone[];
    tables: Table[];
    categories: Category[];
    menuItems: MenuItem[];
    stockItems: StockItem[];
    purchaseInvoices?: PurchaseInvoice[];
    expenseInvoices?: ExpenseInvoice[];
    orders: Order[];
    settings: RestaurantSettings;
    users: AppUser[];
    notifications?: KitchenNotification[];
    dailyZReports?: DailyZReport[];
  } | null> {
    try {
      const res = await fetch('/api/all-data');
      if (!res.ok) return null;
      const data = await res.json();
      
      // Update local cache
      if (data.zones) this.saveZones(data.zones, false);
      if (data.tables) this.saveTables(data.tables, false);
      if (data.categories) this.saveCategories(data.categories, false);
      if (data.menuItems) this.saveMenuItems(data.menuItems, false);
      if (data.stockItems) this.saveStockItems(data.stockItems, false);
      if (data.purchaseInvoices) this.savePurchaseInvoices(data.purchaseInvoices, false);
      if (data.expenseInvoices) this.saveExpenseInvoices(data.expenseInvoices, false);
      if (data.orders) this.saveOrders(data.orders, false);
      if (data.settings) this.saveSettings(data.settings, false);
      if (data.users) this.saveUsers(data.users, false);
      if (data.notifications) this.saveKitchenNotifications(data.notifications, false);
      if (data.dailyZReports) this.saveDailyZReports(data.dailyZReports, false);

      return data;
    } catch {
      return null;
    }
  }

  static async getServerInfo(): Promise<ServerInfo | null> {
    try {
      const res = await fetch('/api/server-info');
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  static async getSystemLogs(): Promise<SystemLog[]> {
    try {
      const res = await fetch('/api/logs');
      if (res.ok) {
        const logs = await res.json();
        localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
        return logs;
      }
    } catch {
      // Fallback to local
    }
    const local = localStorage.getItem(STORAGE_KEYS.LOGS);
    return local ? JSON.parse(local) : [];
  }

  static async addSystemLog(log: Omit<SystemLog, 'id' | 'timestamp'>): Promise<void> {
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(log),
      });
    } catch {
      const logs = await this.getSystemLogs();
      const newLog: SystemLog = {
        ...log,
        id: 'log-' + Date.now(),
        timestamp: new Date().toISOString(),
      };
      logs.unshift(newLog);
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs.slice(0, 200)));
    }
  }

  static getUsers(): AppUser[] {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : initialUsers;
  }

  static saveUsers(users: AppUser[], sync = true): void {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    if (sync) this.syncToServer({ users });
  }

  static getZones(): Zone[] {
    const data = localStorage.getItem(STORAGE_KEYS.ZONES);
    return data ? JSON.parse(data) : initialZones;
  }

  static saveZones(zones: Zone[], sync = true): void {
    localStorage.setItem(STORAGE_KEYS.ZONES, JSON.stringify(zones));
    if (sync) this.syncToServer({ zones });
  }

  static getTables(): Table[] {
    const data = localStorage.getItem(STORAGE_KEYS.TABLES);
    return data ? JSON.parse(data) : initialTables;
  }

  static saveTables(tables: Table[], sync = true, logDetails?: { action: string; details?: string; userName?: string; role?: string }): void {
    localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(tables));
    if (sync) {
      this.syncToServer({ tables }, logDetails ? {
        action: logDetails.action,
        details: logDetails.details,
        category: 'table',
        userName: logDetails.userName,
        userRole: logDetails.role
      } : undefined);
    }
  }

  static getCategories(): Category[] {
    const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return data ? JSON.parse(data) : initialCategories;
  }

  static saveCategories(categories: Category[], sync = true): void {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    if (sync) this.syncToServer({ categories });
  }

  static getMenuItems(): MenuItem[] {
    const data = localStorage.getItem(STORAGE_KEYS.MENU_ITEMS);
    return data ? JSON.parse(data) : initialMenuItems;
  }

  static saveMenuItems(items: MenuItem[], sync = true, logDetails?: { action: string; details?: string; userName?: string; role?: string }): void {
    localStorage.setItem(STORAGE_KEYS.MENU_ITEMS, JSON.stringify(items));
    if (sync) {
      this.syncToServer({ menuItems: items }, logDetails ? {
        action: logDetails.action,
        details: logDetails.details,
        category: 'menu',
        userName: logDetails.userName,
        userRole: logDetails.role
      } : undefined);
    }
  }

  static getStockItems(): StockItem[] {
    const data = localStorage.getItem(STORAGE_KEYS.STOCK_ITEMS);
    return data ? JSON.parse(data) : initialStockItems;
  }

  static saveStockItems(items: StockItem[], sync = true, logDetails?: { action: string; details?: string; userName?: string; role?: string }): void {
    localStorage.setItem(STORAGE_KEYS.STOCK_ITEMS, JSON.stringify(items));
    if (sync) {
      this.syncToServer({ stockItems: items }, logDetails ? {
        action: logDetails.action,
        details: logDetails.details,
        category: 'stock',
        userName: logDetails.userName,
        userRole: logDetails.role
      } : undefined);
    }
  }

  static getOrders(): Order[] {
    const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return data ? JSON.parse(data) : initialOrders;
  }

  static saveOrders(orders: Order[], sync = true, logDetails?: { action: string; details?: string; userName?: string; role?: string }): void {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    if (sync) {
      this.syncToServer({ orders }, logDetails ? {
        action: logDetails.action,
        details: logDetails.details,
        category: 'order',
        userName: logDetails.userName,
        userRole: logDetails.role
      } : undefined);
    }
  }

  static getSettings(): RestaurantSettings {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!data) return defaultSettings;
    try {
      const parsed = JSON.parse(data);
      const settings = { ...defaultSettings, ...parsed };
      if (!settings.name || settings.name.includes('Bistro') || settings.name === 'Meriç Belediyesi Restoran & Kafe') {
        settings.name = defaultSettings.name;
      }
      if (!settings.logoUrl) {
        settings.logoUrl = defaultSettings.logoUrl;
      }
      return settings;
    } catch {
      return defaultSettings;
    }
  }

  static saveSettings(settings: RestaurantSettings, sync = true): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    if (sync) this.syncToServer({ settings });
  }

  static getPurchaseInvoices(): PurchaseInvoice[] {
    const data = localStorage.getItem(STORAGE_KEYS.PURCHASE_INVOICES);
    return data ? JSON.parse(data) : initialPurchaseInvoices;
  }

  static savePurchaseInvoices(invoices: PurchaseInvoice[], sync = true): void {
    localStorage.setItem(STORAGE_KEYS.PURCHASE_INVOICES, JSON.stringify(invoices));
    if (sync) this.syncToServer({ purchaseInvoices: invoices });
  }

  static getExpenseInvoices(): ExpenseInvoice[] {
    const data = localStorage.getItem(STORAGE_KEYS.EXPENSE_INVOICES);
    return data ? JSON.parse(data) : initialExpenseInvoices;
  }

  static saveExpenseInvoices(expenses: ExpenseInvoice[], sync = true): void {
    localStorage.setItem(STORAGE_KEYS.EXPENSE_INVOICES, JSON.stringify(expenses));
    if (sync) this.syncToServer({ expenseInvoices: expenses });
  }

  static getKitchenNotifications(): KitchenNotification[] {
    const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return data ? JSON.parse(data) : [];
  }

  static saveKitchenNotifications(notifications: KitchenNotification[], sync = true): void {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('kitchen_notifications_updated', { detail: notifications }));
    }
    if (sync) {
      this.syncToServer({ notifications });
    }
  }

  static addKitchenNotification(notification: KitchenNotification): void {
    const existing = this.getKitchenNotifications();
    const updated = [notification, ...existing.filter((n) => n.id !== notification.id)].slice(0, 50);
    this.saveKitchenNotifications(updated, true);
  }

  static async clearKitchenNotifications(): Promise<void> {
    this.saveKitchenNotifications([], true);
    try {
      await fetch('/api/notifications/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch {
      // offline
    }
  }

  static async deleteKitchenNotification(id: string): Promise<void> {
    const existing = this.getKitchenNotifications();
    const updated = existing.filter((n) => n.id !== id);
    this.saveKitchenNotifications(updated, true);
    try {
      await fetch('/api/notifications/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
    } catch {
      // offline
    }
  }

  static async markNotificationRead(id?: string, all?: boolean): Promise<void> {
    const existing = this.getKitchenNotifications();
    let updated: KitchenNotification[];
    if (all) {
      updated = existing.map((n) => ({ ...n, read: true }));
    } else if (id) {
      updated = existing.map((n) => (n.id === id ? { ...n, read: true } : n));
    } else {
      updated = existing;
    }
    this.saveKitchenNotifications(updated, true);

    try {
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, all }),
      });
    } catch {
      // offline
    }
  }

  static getDailyZReports(): DailyZReport[] {
    const data = localStorage.getItem(STORAGE_KEYS.DAILY_Z_REPORTS);
    return data ? JSON.parse(data) : [];
  }

  static saveDailyZReports(dailyZReports: DailyZReport[], sync: boolean = true): void {
    localStorage.setItem(STORAGE_KEYS.DAILY_Z_REPORTS, JSON.stringify(dailyZReports));
    if (sync) {
      this.syncToServer({ dailyZReports });
    }
  }

  static async resetAllToDefaults(): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.ZONES, JSON.stringify(initialZones));
    localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(initialTables));
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(initialCategories));
    localStorage.setItem(STORAGE_KEYS.MENU_ITEMS, JSON.stringify(initialMenuItems));
    localStorage.setItem(STORAGE_KEYS.STOCK_ITEMS, JSON.stringify(initialStockItems));
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(initialOrders));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(defaultSettings));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(initialUsers));
    localStorage.setItem(STORAGE_KEYS.PURCHASE_INVOICES, JSON.stringify(initialPurchaseInvoices));
    localStorage.setItem(STORAGE_KEYS.EXPENSE_INVOICES, JSON.stringify(initialExpenseInvoices));
    localStorage.setItem(STORAGE_KEYS.DAILY_Z_REPORTS, JSON.stringify([]));

    try {
      await fetch('/api/reset-data', { method: 'POST' });
    } catch {
      // offline
    }
  }
}
