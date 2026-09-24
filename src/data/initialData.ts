import { Zone, Table, Category, MenuItem, StockItem, Order, RestaurantSettings, AppUser, PurchaseInvoice, ExpenseInvoice } from '../types';

export const initialUsers: AppUser[] = [
  {
    id: 'user-1',
    name: 'Ahmet Yılmaz',
    username: 'admin',
    role: 'admin',
    pinCode: '1234',
    isSystemAdmin: true,
    createdAt: new Date().toISOString(),
    permissions: {
      canTakeOrder: true,
      canApplyDiscount: true,
      canCancelItem: true,
      canTransferTable: true,
      canClosePayment: true,
      canAddTable: true,
      canManageInvoices: true,
      canViewReports: true,
      canCloseDay: true,
      canManageStock: true,
      canManageMenu: true,
      canManageUsers: true,
    }
  },
  {
    id: 'user-2',
    name: 'Mehmet Yılmaz (Garson)',
    username: 'mehmet',
    role: 'pos',
    pinCode: '1001',
    createdAt: new Date().toISOString(),
    permissions: {
      canTakeOrder: true,
      canApplyDiscount: true,
      canCancelItem: false,
      canTransferTable: true,
      canClosePayment: false, // Garson hesap kapatamaz, sadece hesap ister
      canAddTable: false,
      canManageInvoices: false,
      canViewReports: true, // Garsonlar için rapor alma yetkisi açık
      canCloseDay: true,    // Garsonlar için gün kapatma yetkisi açık
      canManageStock: false,
      canManageMenu: false,
      canManageUsers: false,
    }
  },
  {
    id: 'user-3',
    name: 'Ayşe Kaya (Garson)',
    username: 'ayse',
    role: 'pos',
    pinCode: '1002',
    createdAt: new Date().toISOString(),
    permissions: {
      canTakeOrder: true,
      canApplyDiscount: false,
      canCancelItem: false,
      canTransferTable: true,
      canClosePayment: false, // Garson hesap kapatamaz, sadece hesap ister
      canAddTable: false,
      canManageInvoices: false,
      canViewReports: true, // Garsonlar için rapor alma yetkisi açık
      canCloseDay: true,    // Garsonlar için gün kapatma yetkisi açık
      canManageStock: false,
      canManageMenu: false,
      canManageUsers: false,
    }
  },
  {
    id: 'user-4',
    name: 'Can Taş',
    username: 'can_mutfak',
    role: 'kitchen',
    pinCode: '2001',
    createdAt: new Date().toISOString(),
    permissions: {
      canTakeOrder: false,
      canApplyDiscount: false,
      canCancelItem: false,
      canTransferTable: false,
      canClosePayment: false,
      canAddTable: false,
      canManageInvoices: false,
      canViewReports: false,
      canCloseDay: false,
      canManageStock: true,
      canManageMenu: false,
      canManageUsers: false,
    }
  }
];


export const initialZones: Zone[] = [
  { id: 'zone-1', name: 'Ana Salon', description: 'Giriş katı kapalı alan' },
  { id: 'zone-2', name: 'Bahçe / Teras', description: 'Açık hava sigara içilebilir alan' },
  { id: 'zone-3', name: 'Üst Kat (VIP)', description: 'Sakin çalışma ve toplantı alanı' },
  { id: 'zone-4', name: 'Bar & Gel-Al', description: 'Hızlı paket ve bar servis masaları' },
];

export const initialTables: Table[] = [
  // Ana Salon
  { id: 'tbl-1', number: 'Masa 1', zoneId: 'zone-1', capacity: 2, status: 'occupied', currentOrderId: 'ord-101', openedAt: new Date(Date.now() - 42 * 60000).toISOString() },
  { id: 'tbl-2', number: 'Masa 2', zoneId: 'zone-1', capacity: 4, status: 'bill_requested', currentOrderId: 'ord-102', openedAt: new Date(Date.now() - 75 * 60000).toISOString() },
  { id: 'tbl-3', number: 'Masa 3', zoneId: 'zone-1', capacity: 4, status: 'empty' },
  { id: 'tbl-4', number: 'Masa 4', zoneId: 'zone-1', capacity: 6, status: 'occupied', currentOrderId: 'ord-103', openedAt: new Date(Date.now() - 20 * 60000).toISOString() },
  { id: 'tbl-5', number: 'Masa 5', zoneId: 'zone-1', capacity: 2, status: 'reserved', customerName: 'Ahmet Bey (19:30)', reservedTime: '19:30' },
  { id: 'tbl-6', number: 'Masa 6', zoneId: 'zone-1', capacity: 8, status: 'empty' },

  // Bahçe / Teras
  { id: 'tbl-7', number: 'Teras 1', zoneId: 'zone-2', capacity: 4, status: 'occupied', currentOrderId: 'ord-104', openedAt: new Date(Date.now() - 15 * 60000).toISOString() },
  { id: 'tbl-8', number: 'Teras 2', zoneId: 'zone-2', capacity: 4, status: 'empty' },
  { id: 'tbl-9', number: 'Teras 3', zoneId: 'zone-2', capacity: 2, status: 'empty' },
  { id: 'tbl-10', number: 'Teras 4', zoneId: 'zone-2', capacity: 6, status: 'bill_requested', currentOrderId: 'ord-105', openedAt: new Date(Date.now() - 90 * 60000).toISOString() },

  // Üst Kat
  { id: 'tbl-11', number: 'VIP 1', zoneId: 'zone-3', capacity: 6, status: 'empty' },
  { id: 'tbl-12', number: 'VIP 2', zoneId: 'zone-3', capacity: 10, status: 'empty' },

  // Bar
  { id: 'tbl-13', number: 'Bar 1', zoneId: 'zone-4', capacity: 1, status: 'empty' },
  { id: 'tbl-14', number: 'Bar 2', zoneId: 'zone-4', capacity: 1, status: 'empty' },
];

export const initialCategories: Category[] = [
  { id: 'cat-1', name: 'Sıcak İçecekler', iconName: 'Coffee', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' },
  { id: 'cat-2', name: 'Soğuk İçecekler', iconName: 'CupSoda', color: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300' },
  { id: 'cat-3', name: 'Kahvaltılıklar', iconName: 'Egg', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300' },
  { id: 'cat-4', name: 'Ana Yemekler', iconName: 'UtensilsCrossed', color: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300' },
  { id: 'cat-5', name: 'Burger & Atıştırmalık', iconName: 'HamBurger', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300' },
  { id: 'cat-6', name: 'Tatlılar & Pastalar', iconName: 'Cake', color: 'bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300' },
];

export const initialMenuItems: MenuItem[] = [
  // Sıcak İçecekler
  { id: 'item-1', categoryId: 'cat-1', name: 'Demleme Çay', description: 'Taze Karadeniz demleme çayı', price: 35, costPrice: 4, unit: 'Bardak', stockQuantity: 350, minStockAlert: 50, isAvailable: true, recipe: [{ stockItemId: 'stk-2', amount: 0.005 }] },
  { id: 'item-2', categoryId: 'cat-1', name: 'Türk Kahvesi', description: 'Geleneksel közde Türk kahvesi, lokum ile', price: 75, costPrice: 12, unit: 'Fincan', stockQuantity: 120, minStockAlert: 20, isAvailable: true, recipe: [{ stockItemId: 'stk-1', amount: 0.01 }] },
  { id: 'item-3', categoryId: 'cat-1', name: 'Espresso', description: 'Tek shot yoğun %100 Arabica espresso', price: 80, costPrice: 15, unit: 'Fincan', stockQuantity: 200, minStockAlert: 30, isAvailable: true, recipe: [{ stockItemId: 'stk-1', amount: 0.008 }] },
  { id: 'item-4', categoryId: 'cat-1', name: 'Caffè Latte', description: 'Espresso, buharla ısıtılmış taze süt ve kadifemsi köpük', price: 110, costPrice: 22, unit: 'Bardak', stockQuantity: 85, minStockAlert: 15, isAvailable: true, recipe: [{ stockItemId: 'stk-1', amount: 0.008 }, { stockItemId: 'stk-3', amount: 0.15 }] },
  { id: 'item-5', categoryId: 'cat-1', name: 'Salep', description: 'Tarçın ikramlı sıcak hakiki salep', price: 95, costPrice: 18, unit: 'Fincan', stockQuantity: 40, minStockAlert: 10, isAvailable: true, recipe: [{ stockItemId: 'stk-3', amount: 0.18 }] },

  // Soğuk İçecekler
  { id: 'item-6', categoryId: 'cat-2', name: 'Ev Yapımı Limonata', description: 'Taze nane yaprakları ile buzlu limonata', price: 90, costPrice: 15, unit: 'Bardak', stockQuantity: 65, minStockAlert: 15, isAvailable: true },
  { id: 'item-7', categoryId: 'cat-2', name: 'Iced Latte', description: 'Buzlu sütlü espresso soğuk kahve', price: 120, costPrice: 24, unit: 'Bardak', stockQuantity: 90, minStockAlert: 20, isAvailable: true, recipe: [{ stockItemId: 'stk-1', amount: 0.008 }, { stockItemId: 'stk-3', amount: 0.15 }] },
  { id: 'item-8', categoryId: 'cat-2', name: 'Taze Sıkma Portakal Suyu', description: '%100 doğal sıkma portakal suyu', price: 110, costPrice: 30, unit: 'Bardak', stockQuantity: 30, minStockAlert: 10, isAvailable: true },
  { id: 'item-9', categoryId: 'cat-2', name: 'Kutu İçecekler (Cola/Fanta/Gazoz)', description: '330ml kutu gazlı içecek', price: 65, costPrice: 25, unit: 'Kutu', stockQuantity: 140, minStockAlert: 25, isAvailable: true, recipe: [{ stockItemId: 'stk-10', amount: 1 }] },

  // Kahvaltılıklar
  { id: 'item-10', categoryId: 'cat-3', name: 'Serpme Serpme Serpme Kahvaltı (2 Kişilik)', description: 'Peynir çeşitleri, zeytin, reçeller, bal-kaymak, menemen, patates kızartması ve sınırsız çay', price: 650, costPrice: 180, unit: 'Porsiyon', stockQuantity: 25, minStockAlert: 5, isAvailable: true, recipe: [{ stockItemId: 'stk-9', amount: 4 }, { stockItemId: 'stk-6', amount: 0.08 }, { stockItemId: 'stk-7', amount: 0.2 }, { stockItemId: 'stk-2', amount: 0.02 }] },
  { id: 'item-11', categoryId: 'cat-3', name: 'Kaşarlı Sucuklu Menemen', description: 'Köy yumurtası, taze domates, biber, kaşar ve kasap sucuk', price: 185, costPrice: 45, unit: 'Porsiyon', stockQuantity: 45, minStockAlert: 10, isAvailable: true, recipe: [{ stockItemId: 'stk-9', amount: 2 }, { stockItemId: 'stk-6', amount: 0.04 }] },
  { id: 'item-12', categoryId: 'cat-3', name: 'Fırınlanmış Kaşarlı Tost', description: 'Ekşi mayalı ekmekte bol kaşar ve patates cipsi ile', price: 140, costPrice: 32, unit: 'Adet', stockQuantity: 60, minStockAlert: 12, isAvailable: true, recipe: [{ stockItemId: 'stk-6', amount: 0.05 }] },

  // Ana Yemekler
  { id: 'item-13', categoryId: 'cat-4', name: 'Izgara Kasap Köfte', description: 'Pirinç pilavı, ızgara domates, biber ve elma dilim patates ile', price: 340, costPrice: 95, unit: 'Porsiyon', stockQuantity: 35, minStockAlert: 8, isAvailable: true, recipe: [{ stockItemId: 'stk-4', amount: 0.18 }, { stockItemId: 'stk-7', amount: 0.1 }] },
  { id: 'item-14', categoryId: 'cat-4', name: 'Kremalı Mantarlı Tavuk Sote', description: 'Jülyen tavuk pirzola, taze kültür mantarı, krema ve penne makarna', price: 290, costPrice: 75, unit: 'Porsiyon', stockQuantity: 28, minStockAlert: 6, isAvailable: true, recipe: [{ stockItemId: 'stk-5', amount: 0.15 }] },
  { id: 'item-15', categoryId: 'cat-4', name: 'Penne Arrabbiata', description: 'Acılı domates sos, siyah zeytin, fesleğen ve parmesan peyniri', price: 220, costPrice: 50, unit: 'Porsiyon', stockQuantity: 50, minStockAlert: 10, isAvailable: true },

  // Burger & Atıştırmalık
  { id: 'item-16', categoryId: 'cat-5', name: 'Cheeseburger Menü', description: '150g dana köfte, cheddar peyniri, karamelize soğan, patates kızartması ve içecek', price: 320, costPrice: 85, unit: 'Porsiyon', stockQuantity: 40, minStockAlert: 10, isAvailable: true, recipe: [{ stockItemId: 'stk-4', amount: 0.15 }, { stockItemId: 'stk-6', amount: 0.03 }, { stockItemId: 'stk-7', amount: 0.12 }] },
  { id: 'item-17', categoryId: 'cat-5', name: 'Çıtır Tavuk Sepeti', description: 'Panko kaplı tavuk parçaları, soğan halkaları, sosis ve özel soslar', price: 260, costPrice: 65, unit: 'Porsiyon', stockQuantity: 32, minStockAlert: 8, isAvailable: true, recipe: [{ stockItemId: 'stk-5', amount: 0.18 }, { stockItemId: 'stk-7', amount: 0.1 }] },
  { id: 'item-18', categoryId: 'cat-5', name: 'Baharatlı Patates Kızartması', description: 'Özel baharat çeşnili büyük boy patates', price: 110, costPrice: 20, unit: 'Porsiyon', stockQuantity: 80, minStockAlert: 15, isAvailable: true, recipe: [{ stockItemId: 'stk-7', amount: 0.2 }] },

  // Tatlılar
  { id: 'item-19', categoryId: 'cat-6', name: 'San Sebastian Cheesecake', description: 'Eritilmiş Belçika çikolatası sosu eşliğinde', price: 195, costPrice: 50, unit: 'Dilim', stockQuantity: 18, minStockAlert: 5, isAvailable: true, recipe: [{ stockItemId: 'stk-8', amount: 0.05 }] },
  { id: 'item-20', categoryId: 'cat-6', name: 'Sıcak Fırın Soufflé', description: 'Vanilyalı dondurma topu ile taze pişmiş çikolatalı sufle', price: 175, costPrice: 42, unit: 'Adet', stockQuantity: 14, minStockAlert: 4, isAvailable: true, recipe: [{ stockItemId: 'stk-8', amount: 0.04 }] },
  { id: 'item-21', categoryId: 'cat-6', name: 'Fıstıklı Havuç Dilim Baklava', description: 'Gaziantep fıstıklı havuç dilimi baklava (1 Adet)', price: 210, costPrice: 70, unit: 'Dilim', stockQuantity: 8, minStockAlert: 5, isAvailable: true },
];

export const initialStockItems: StockItem[] = [
  { id: 'stk-1', name: 'Çekirdek Espresso Kahve', category: 'Kahve & Çay', quantity: 18.5, unit: 'kg', minThreshold: 5.0, costPerUnit: 480, lastUpdated: new Date().toISOString(), unitBarcode: '869000100101', boxBarcode: '869000100199', itemsPerBox: 10, boxUnitName: 'Koli (10kg)' },
  { id: 'stk-2', name: 'Siyah Dökme Çay (Rize)', category: 'Kahve & Çay', quantity: 12.0, unit: 'kg', minThreshold: 3.0, costPerUnit: 180, lastUpdated: new Date().toISOString(), unitBarcode: '869000100201', boxBarcode: '869000100299', itemsPerBox: 12, boxUnitName: 'Çuval (12kg)' },
  { id: 'stk-3', name: 'Taze Tam Yağlı Süt (1L)', category: 'Süt & Şarküteri', quantity: 8.0, unit: 'lt', minThreshold: 15.0, costPerUnit: 34, lastUpdated: new Date().toISOString(), unitBarcode: '869000100301', boxBarcode: '869000100399', itemsPerBox: 12, boxUnitName: 'Koli (12 Adet)' },
  { id: 'stk-4', name: 'Kasap Kıymalı Dana Eti', category: 'Et & Tavuk', quantity: 24.0, unit: 'kg', minThreshold: 8.0, costPerUnit: 420, lastUpdated: new Date().toISOString(), unitBarcode: '869000100401', boxBarcode: '869000100499', itemsPerBox: 10, boxUnitName: 'Kasa (10kg)' },
  { id: 'stk-5', name: 'Taze Tavuk Göğsü', category: 'Et & Tavuk', quantity: 15.0, unit: 'kg', minThreshold: 6.0, costPerUnit: 190, lastUpdated: new Date().toISOString(), unitBarcode: '869000100501', boxBarcode: '869000100599', itemsPerBox: 15, boxUnitName: 'Kutu (15kg)' },
  { id: 'stk-6', name: 'Rendelenmiş Kaşar Peyniri', category: 'Süt & Şarküteri', quantity: 6.5, unit: 'kg', minThreshold: 4.0, costPerUnit: 260, lastUpdated: new Date().toISOString(), unitBarcode: '869000100601', boxBarcode: '869000100699', itemsPerBox: 6, boxUnitName: 'Koli (6x1kg)' },
  { id: 'stk-7', name: 'Patates (Dondurulmuş 9mm)', category: 'Sebze & Donuk', quantity: 45.0, unit: 'kg', minThreshold: 15.0, costPerUnit: 55, lastUpdated: new Date().toISOString(), unitBarcode: '869000100701', boxBarcode: '869000100799', itemsPerBox: 5, boxUnitName: 'Paket (5kg)' },
  { id: 'stk-8', name: 'Belçika Çikolatası Sosu', category: 'Tatlı Malzemeleri', quantity: 2.2, unit: 'kg', minThreshold: 3.0, costPerUnit: 390, lastUpdated: new Date().toISOString(), unitBarcode: '869000100801', boxBarcode: '869000100899', itemsPerBox: 4, boxUnitName: 'Koli (4 Bidon)' },
  { id: 'stk-9', name: 'Köy Yumurtası (30Lı Viyol)', category: 'Kahvaltılık', quantity: 180, unit: 'adet', minThreshold: 60, costPerUnit: 4.5, lastUpdated: new Date().toISOString(), unitBarcode: '869000100901', boxBarcode: '869000100999', itemsPerBox: 30, boxUnitName: 'Viyol (30 Adet)' },
  { id: 'stk-10', name: 'Kutu İçecekler (Cola/Fanta/Gazoz)', category: 'Soğuk İçecekler', quantity: 140, unit: 'kutu', minThreshold: 25, costPerUnit: 25, lastUpdated: new Date().toISOString(), unitBarcode: '869000101001', boxBarcode: '869000101099', itemsPerBox: 24, boxUnitName: 'Koli (24 Kutu)' },
];

export const initialOrders: Order[] = [
  // Active orders
  {
    id: 'ord-101',
    tableId: 'tbl-1',
    tableName: 'Masa 1',
    zoneId: 'zone-1',
    zoneName: 'Ana Salon',
    status: 'open',
    waiterName: 'Mehmet Y.',
    createdAt: new Date(Date.now() - 42 * 60000).toISOString(),
    subtotal: 300,
    discountAmount: 0,
    discountPercent: 0,
    taxAmount: 27.27,
    totalAmount: 300,
    items: [
      { id: 'oi-1', menuItemId: 'item-2', name: 'Türk Kahvesi', price: 75, costPrice: 12, quantity: 2, note: 'Orta şekerli', timestamp: new Date(Date.now() - 40 * 60000).toISOString(), status: 'served' },
      { id: 'oi-2', menuItemId: 'item-12', name: 'Fırınlanmış Kaşarlı Tost', price: 140, costPrice: 32, quantity: 1, note: 'Bol kaşarlı olsun', timestamp: new Date(Date.now() - 38 * 60000).toISOString(), status: 'served' },
      { id: 'oi-3', menuItemId: 'item-1', name: 'Demleme Çay', price: 35, costPrice: 4, quantity: 1, timestamp: new Date(Date.now() - 10 * 60000).toISOString(), status: 'served' },
    ]
  },
  {
    id: 'ord-102',
    tableId: 'tbl-2',
    tableName: 'Masa 2',
    zoneId: 'zone-1',
    zoneName: 'Ana Salon',
    status: 'open',
    waiterName: 'Ayşe K.',
    createdAt: new Date(Date.now() - 75 * 60000).toISOString(),
    subtotal: 685,
    discountAmount: 35,
    discountPercent: 5,
    taxAmount: 59.09,
    totalAmount: 650,
    items: [
      { id: 'oi-4', menuItemId: 'item-13', name: 'Izgara Kasap Köfte', price: 340, costPrice: 95, quantity: 1, note: 'Pişkin olsun', timestamp: new Date(Date.now() - 70 * 60000).toISOString(), status: 'served' },
      { id: 'oi-5', menuItemId: 'item-16', name: 'Cheeseburger Menü', price: 320, costPrice: 85, quantity: 1, timestamp: new Date(Date.now() - 68 * 60000).toISOString(), status: 'served' },
      { id: 'oi-6', menuItemId: 'item-1', name: 'Demleme Çay', price: 35, costPrice: 4, quantity: 2, timestamp: new Date(Date.now() - 20 * 60000).toISOString(), status: 'served' },
    ]
  },
  {
    id: 'ord-103',
    tableId: 'tbl-4',
    tableName: 'Masa 4',
    zoneId: 'zone-1',
    zoneName: 'Ana Salon',
    status: 'open',
    waiterName: 'Mehmet Y.',
    createdAt: new Date(Date.now() - 20 * 60000).toISOString(),
    subtotal: 510,
    discountAmount: 0,
    discountPercent: 0,
    taxAmount: 46.36,
    totalAmount: 510,
    items: [
      { id: 'oi-7', menuItemId: 'item-14', name: 'Kremalı Mantarlı Tavuk Sote', price: 290, costPrice: 75, quantity: 1, timestamp: new Date(Date.now() - 18 * 60000).toISOString(), status: 'preparing' },
      { id: 'oi-8', menuItemId: 'item-15', name: 'Penne Arrabbiata', price: 220, costPrice: 50, quantity: 1, note: 'Az acılı', timestamp: new Date(Date.now() - 18 * 60000).toISOString(), status: 'preparing' },
    ]
  },
  {
    id: 'ord-104',
    tableId: 'tbl-7',
    tableName: 'Teras 1',
    zoneId: 'zone-2',
    zoneName: 'Bahçe / Teras',
    status: 'open',
    waiterName: 'Can T.',
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
    subtotal: 210,
    discountAmount: 0,
    discountPercent: 0,
    taxAmount: 19.09,
    totalAmount: 210,
    items: [
      { id: 'oi-9', menuItemId: 'item-7', name: 'Iced Latte', price: 120, costPrice: 24, quantity: 1, timestamp: new Date(Date.now() - 12 * 60000).toISOString(), status: 'served' },
      { id: 'oi-10', menuItemId: 'item-6', name: 'Ev Yapımı Limonata', price: 90, costPrice: 15, quantity: 1, timestamp: new Date(Date.now() - 12 * 60000).toISOString(), status: 'served' },
    ]
  },
  {
    id: 'ord-105',
    tableId: 'tbl-10',
    tableName: 'Teras 4',
    zoneId: 'zone-2',
    zoneName: 'Bahçe / Teras',
    status: 'open',
    waiterName: 'Can T.',
    createdAt: new Date(Date.now() - 90 * 60000).toISOString(),
    subtotal: 1020,
    discountAmount: 100,
    discountPercent: 10,
    taxAmount: 83.63,
    totalAmount: 920,
    items: [
      { id: 'oi-11', menuItemId: 'item-10', name: 'Serpme Kahvaltı (2 Kişilik)', price: 650, costPrice: 180, quantity: 1, timestamp: new Date(Date.now() - 85 * 60000).toISOString(), status: 'served' },
      { id: 'oi-12', menuItemId: 'item-19', name: 'San Sebastian Cheesecake', price: 195, costPrice: 50, quantity: 1, timestamp: new Date(Date.now() - 30 * 60000).toISOString(), status: 'served' },
      { id: 'oi-13', menuItemId: 'item-2', name: 'Türk Kahvesi', price: 75, costPrice: 12, quantity: 2, timestamp: new Date(Date.now() - 25 * 60000).toISOString(), status: 'served' },
    ]
  },

  // Historical completed orders (Bugünkü Kapanan Adisyonlar Raporlar için)
  {
    id: 'ord-090',
    tableId: 'tbl-3',
    tableName: 'Masa 3',
    zoneId: 'zone-1',
    zoneName: 'Ana Salon',
    status: 'closed',
    waiterName: 'Ayşe K.',
    createdAt: new Date(Date.now() - 210 * 60000).toISOString(),
    closedAt: new Date(Date.now() - 150 * 60000).toISOString(),
    subtotal: 450,
    discountAmount: 0,
    discountPercent: 0,
    taxAmount: 40.9,
    totalAmount: 450,
    paymentType: 'kredi_karti',
    items: [
      { id: 'oi-101', menuItemId: 'item-13', name: 'Izgara Kasap Köfte', price: 340, costPrice: 95, quantity: 1, timestamp: '', status: 'served' },
      { id: 'oi-102', menuItemId: 'item-8', name: 'Taze Sıkma Portakal Suyu', price: 110, costPrice: 30, quantity: 1, timestamp: '', status: 'served' },
    ]
  },
  {
    id: 'ord-091',
    tableId: 'tbl-8',
    tableName: 'Teras 2',
    zoneId: 'zone-2',
    zoneName: 'Bahçe / Teras',
    status: 'closed',
    waiterName: 'Mehmet Y.',
    createdAt: new Date(Date.now() - 180 * 60000).toISOString(),
    closedAt: new Date(Date.now() - 110 * 60000).toISOString(),
    subtotal: 825,
    discountAmount: 25,
    discountPercent: 3,
    taxAmount: 72.72,
    totalAmount: 800,
    paymentType: 'nakit',
    items: [
      { id: 'oi-103', menuItemId: 'item-10', name: 'Serpme Kahvaltı (2 Kişilik)', price: 650, costPrice: 180, quantity: 1, timestamp: '', status: 'served' },
      { id: 'oi-104', menuItemId: 'item-20', name: 'Sıcak Fırın Soufflé', price: 175, costPrice: 42, quantity: 1, timestamp: '', status: 'served' },
    ]
  },
  {
    id: 'ord-092',
    tableId: 'tbl-11',
    tableName: 'VIP 1',
    zoneId: 'zone-3',
    zoneName: 'Üst Kat (VIP)',
    status: 'closed',
    waiterName: 'Can T.',
    createdAt: new Date(Date.now() - 300 * 60000).toISOString(),
    closedAt: new Date(Date.now() - 220 * 60000).toISOString(),
    subtotal: 1450,
    discountAmount: 100,
    discountPercent: 7,
    taxAmount: 122.72,
    totalAmount: 1350,
    paymentType: 'yemek_karti',
    items: [
      { id: 'oi-105', menuItemId: 'item-16', name: 'Cheeseburger Menü', price: 320, costPrice: 85, quantity: 3, timestamp: '', status: 'served' },
      { id: 'oi-106', menuItemId: 'item-17', name: 'Çıtır Tavuk Sepeti', price: 260, costPrice: 65, quantity: 1, timestamp: '', status: 'served' },
      { id: 'oi-107', menuItemId: 'item-21', name: 'Fıstıklı Havuç Dilim Baklava', price: 210, costPrice: 70, quantity: 1, timestamp: '', status: 'served' },
      { id: 'oi-108', menuItemId: 'item-1', name: 'Demleme Çay', price: 35, costPrice: 4, quantity: 8, timestamp: '', status: 'served' },
    ]
  },
  {
    id: 'ord-093',
    tableId: 'tbl-13',
    tableName: 'Bar 1',
    zoneId: 'zone-4',
    zoneName: 'Bar & Gel-Al',
    status: 'closed',
    waiterName: 'Ayşe K.',
    createdAt: new Date(Date.now() - 95 * 60000).toISOString(),
    closedAt: new Date(Date.now() - 85 * 60000).toISOString(),
    subtotal: 195,
    discountAmount: 0,
    discountPercent: 0,
    taxAmount: 17.72,
    totalAmount: 195,
    paymentType: 'nakit',
    items: [
      { id: 'oi-109', menuItemId: 'item-19', name: 'San Sebastian Cheesecake', price: 195, costPrice: 50, quantity: 1, timestamp: '', status: 'served' },
    ]
  }
];

export const defaultSettings: RestaurantSettings = {
  name: 'Meriç Belediyesi Sosyal Tesisleri',
  logoUrl: '/logo.svg',
  address: 'Büyük Altunhan Mah., Atatürk Caddesi No:1, Meriç / Edirne',
  phone: '+90 (284) 811 70 05',
  taxNumber: '6180054321',
  taxOffice: 'Meriç Vergi Dairesi',
  taxRatePercent: 10,
  receiptHeaderNote: 'Meriç Belediyesi Sosyal Tesisleri — Hoş Geldiniz',
  receiptFooterNote: 'Meriç Belediyesi Tesisleri — Bizi Tercih Ettiğiniz İçin Teşekkür Ederiz',
  currencySymbol: '₺',
  serverPort: 3000,
  remoteWanUrl: 'adisyonkasa.ddns.net',
  remoteWanPort: 3000,
  printers: [
    {
      id: 'prn-1',
      name: 'Kasa Adisyon Yazıcısı (Thermal 80mm)',
      type: 'receipt',
      connectionType: 'usb',
      usbPort: 'USB001',
      usbDeviceName: 'POS-80 Thermal USB Printer',
      paperWidth: '80mm',
      autoCut: true,
      isDefault: true,
    },
    {
      id: 'prn-2',
      name: 'Mutfak Sipariş Yazıcısı (Network IP)',
      type: 'kitchen',
      connectionType: 'network',
      ipAddress: '192.168.1.200',
      port: 9100,
      paperWidth: '80mm',
      autoCut: true,
      isDefault: false,
    },
    {
      id: 'prn-3',
      name: 'Barkod & Etiket Yazıcısı (Zebra / Xprinter)',
      type: 'barcode',
      connectionType: 'usb',
      usbPort: 'USB002',
      usbDeviceName: 'Xprinter Barcode USB',
      paperWidth: 'etiket',
      autoCut: false,
      isDefault: false,
    }
  ],
  barcodeScanner: {
    enabled: true,
    mode: 'usb_hid',
    prefix: '',
    suffix: 'ENTER',
    beepAlert: true,
  },
  silentPrinting: true,
  selectedPrinterName: 'POS-80C',
};

export const initialPurchaseInvoices: PurchaseInvoice[] = [
  {
    id: 'inv-1',
    invoiceNo: 'F-2026-0881',
    supplierName: 'Meriç Kasap & Şarküteri A.Ş.',
    date: new Date().toISOString().slice(0, 10),
    stockItemId: 'stk-3',
    stockItemName: 'Dana Kıyması (%10 Yağlı)',
    quantity: 10,
    unit: 'kg',
    unitPrice: 420,
    totalAmount: 4200,
    paymentType: 'nakit',
    createdByName: 'Fatma Kaya (Kasa Sorumlusu)',
    notes: 'Kasa Nakit Ödendi, irsaliye teslim edildi',
    createdAt: new Date().toISOString()
  },
  {
    id: 'inv-2',
    invoiceNo: 'F-2026-0892',
    supplierName: 'Edirne Süt & Peynir Dünyası',
    date: new Date().toISOString().slice(0, 10),
    stockItemId: 'stk-5',
    stockItemName: 'Taze Tam Yağlı Süt',
    quantity: 40,
    unit: 'lt',
    unitPrice: 32,
    totalAmount: 1280,
    paymentType: 'kredi_karti',
    createdByName: 'Fatma Kaya (Kasa Sorumlusu)',
    notes: 'Şirket POS Kartından ödendi',
    createdAt: new Date().toISOString()
  }
];

export const initialExpenseInvoices: ExpenseInvoice[] = [
  {
    id: 'exp-1',
    title: 'Ağustos Ayı Elektrik Faturası',
    category: 'elektrik' as const,
    invoiceNo: 'TREDAŞ-8829102',
    amount: 3450,
    date: new Date().toISOString().slice(0, 10),
    paymentType: 'nakit' as const,
    paidByName: 'Fatma Kaya (Kasa Sorumlusu)',
    notes: 'Kasadan nakit ödendi',
    createdAt: new Date().toISOString()
  },
  {
    id: 'exp-2',
    title: 'İnternet & Telefon Faturası',
    category: 'internet' as const,
    invoiceNo: 'TTNET-9021482',
    amount: 680,
    date: new Date().toISOString().slice(0, 10),
    paymentType: 'kredi_karti' as const,
    paidByName: 'Ahmet Yılmaz (Yönetici)',
    notes: 'Şirket kredi kartı ile ödendi',
    createdAt: new Date().toISOString()
  },
  {
    id: 'exp-3',
    title: 'Şebeke Su Faturası',
    category: 'su' as const,
    invoiceNo: 'SU-2026-1102',
    amount: 920,
    date: new Date().toISOString().slice(0, 10),
    paymentType: 'havale' as const,
    paidByName: 'Ahmet Yılmaz (Yönetici)',
    notes: 'Banka hesabından havale yapıldı',
    createdAt: new Date().toISOString()
  }
];

