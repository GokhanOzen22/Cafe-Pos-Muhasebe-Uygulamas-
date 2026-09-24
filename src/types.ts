export type TableStatus = 'empty' | 'occupied' | 'bill_requested' | 'reserved';

export type UserRole = 'pos' | 'kitchen' | 'admin';

export interface Zone {
  id: string;
  name: string;
  description?: string;
}

export interface Table {
  id: string;
  number: string;
  zoneId: string;
  capacity: number;
  status: TableStatus;
  currentOrderId?: string;
  reservedTime?: string;
  customerName?: string;
  openedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  iconName: string;
  color: string;
}

export interface RecipeItem {
  stockItemId: string;
  amount: number; // e.g. 0.05 for 50g
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  price: number;
  costPrice: number;
  unit: string; // 'Porsiyon', 'Adet', 'Bardak', 'Fincan'
  stockQuantity: number;
  minStockAlert: number;
  isAvailable: boolean;
  image?: string;
  recipe?: RecipeItem[];
}

export interface PrinterDevice {
  id: string;
  name: string;
  type: 'receipt' | 'kitchen' | 'barcode'; // Adisyon / Mutfak / Barkod & Etiket
  connectionType: 'network' | 'usb' | 'serial';
  ipAddress?: string;
  port?: number; // e.g. 9100
  comPort?: string; // e.g. "COM1", "COM3"
  usbPort?: string; // e.g. "USB001", "USB002", "Direct USB"
  usbDeviceName?: string; // e.g. "POS-80 Thermal Printer", "Epson TM-T20"
  vendorId?: string; // e.g. "0x0416"
  productId?: string; // e.g. "0x5011"
  baudRate?: number; // e.g. 9600, 115200 (serial only)
  paperWidth?: '80mm' | '58mm' | 'etiket';
  autoCut?: boolean;
  isDefault?: boolean;
}

export interface BarcodeScannerConfig {
  enabled: boolean;
  mode: 'usb_hid' | 'com_serial';
  comPort?: string;
  baudRate?: number;
  prefix?: string;
  suffix?: string; // 'ENTER', 'TAB'
  beepAlert?: boolean;
}

export interface StockItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string; // 'kg', 'lt', 'adet', 'paket'
  minThreshold: number;
  costPerUnit: number;
  lastUpdated: string;
  unitBarcode?: string;    // Birim Ürün Barkodu (e.g. 8690000111111)
  boxBarcode?: string;     // Koli / Kasa Barkodu (e.g. 8690000999999)
  itemsPerBox?: number;    // Koli İçi Adet (e.g. 24)
  boxUnitName?: string;    // e.g. "Koli", "Kasa", "Paket"
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  costPrice: number;
  quantity: number;
  note?: string;
  timestamp: string;
  status: 'pending' | 'preparing' | 'served' | 'cancelled';
  sentToKitchen?: boolean;
}

export interface PaymentBreakdown {
  type: 'nakit' | 'kredi_karti' | 'yemek_karti';
  amount: number;
}

export interface Order {
  id: string; // e.g., #ADS-1082
  tableId: string;
  tableName: string;
  zoneId: string;
  zoneName: string;
  status: 'open' | 'closed' | 'cancelled' | 'unpaid_debt';
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  discountPercent: number;
  taxAmount: number; // KDV
  totalAmount: number;
  paymentType?: 'nakit' | 'kredi_karti' | 'yemek_karti' | 'parcali';
  payments?: PaymentBreakdown[];
  waiterName: string;
  customerNotes?: string;
  createdAt: string;
  closedAt?: string;
  ticketTitle?: string;
  zReportId?: string; // Hangi gün sonu Z-raporuna dahil edildiği
  businessDate?: string; // "YYYY-MM-DD" Mali Gün
  debtOriginDate?: string; // Borcun ilk oluştuğu gün ("YYYY-MM-DD")
  isCarriedOverDebt?: boolean; // Önceki günden devreden borç mu
  debtCollectedAt?: string; // Borcun tahsil edildiği an (ISO)
}

export interface DailyZReport {
  id: string; // e.g. "zrep-20260923-0001"
  zNumber: number; // 1, 2, 3...
  zReportNo: string; // e.g. "Z-0001"
  date: string; // "YYYY-MM-DD"
  openedAt: string; // ISO
  closedAt: string; // ISO
  closedByUserId?: string;
  closedByUserName: string;
  totalRevenue: number;
  ordersCount: number;
  paymentBreakdown: {
    nakit: number;
    kredi_karti: number;
    yemek_karti: number;
  };
  totalTax: number;
  totalDiscounts: number;
  totalCost: number;
  estimatedProfit: number;
  devredenMasaSayisi?: number;
  devredenTutar?: number;
  devredenBorcluSayisi?: number; // Tahsil edilene kadar sonraki günlere devreden borçlu adisyon sayısı
  devredenBorcTutari?: number; // Tahsil edilene kadar sonraki günlere devreden toplam borç tutarı
  devredenBorclular?: {
    orderId: string;
    customerName: string;
    tableName: string;
    amount: number;
    createdAt: string;
  }[];
  itemsSold: {
    name: string;
    qty: number;
    revenue: number;
  }[];
  ordersSnapshot: Order[];
}

export interface KitchenNotification {
  id: string;
  orderId: string;
  tableId: string;
  tableName: string;
  zoneName?: string;
  waiterName?: string;
  items: {
    id: string;
    name: string;
    quantity: number;
    note?: string;
  }[];
  timestamp: string;
  read: boolean;
  type: 'item_ready' | 'table_ready';
}

export interface RestaurantSettings {
  name: string;
  logoUrl?: string;
  address: string;
  phone: string;
  taxNumber: string;
  taxOffice?: string; // Vergi Dairesi
  taxRatePercent: number; // Default 10%
  receiptHeaderNote: string;
  receiptFooterNote: string;
  currencySymbol: string;
  serverIp?: string;
  serverPort?: number;
  remoteWanUrl?: string;
  remoteWanPort?: number;
  printers?: PrinterDevice[];
  barcodeScanner?: BarcodeScannerConfig;
  silentPrinting?: boolean; // Doğrudan sessiz yazdırma (yazıcı seçim diyaloğunu atlar)
  selectedPrinterName?: string; // Tercih edilen yazıcı adı (örn: POS-80C)
}

declare global {
  interface Window {
    electronAPI?: {
      isElectron: boolean;
      printDirect: (options?: {
        silent?: boolean;
        deviceName?: string;
        copies?: number;
      }) => Promise<{ success: boolean; failureReason?: string }>;
      getPrinters: () => Promise<
        Array<{
          name: string;
          displayName?: string;
          isDefault?: boolean;
          status?: number;
        }>
      >;
      toggleFullScreen?: () => Promise<void>;
    };
  }
}

export interface UserPermissions {
  canTakeOrder: boolean;       // Sipariş Alma / Masa İşlemleri
  canApplyDiscount: boolean;   // İskonto Yapabilme
  canCancelItem: boolean;      // Ürün / İptal Yetkisi
  canTransferTable: boolean;   // Masa Aktarma
  canClosePayment?: boolean;   // Hesabı Kapatma & Ödeme Alma Yetkisi
  canAddTable?: boolean;       // Yeni Masa Ekleme Yetkisi
  canManageInvoices?: boolean; // Fiş / Fatura & Gider Kaydı Yetkisi
  canViewReports: boolean;     // Rapor & Z-Raporu Görebilme
  canCloseDay?: boolean;       // Günü Kapatma & Z-Raporu Kesme Yetkisi
  canManageStock: boolean;     // Stok & Hammadde Yönetimi
  canManageMenu: boolean;      // Menü & Fiyat Güncelleme
  canManageUsers: boolean;     // Kullanıcı & Yetki Yönetimi
}

export interface AppUser {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  pinCode: string;
  permissions: UserPermissions;
  createdAt: string;
  isSystemAdmin?: boolean;
}

export interface SystemLog {
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

export interface ServerInfo {
  status: string;
  localIp: string;
  port: number;
  localUrl: string;
  wanDomain?: string;
  wanUrl?: string;
  dbPath: string;
  jsonPath: string;
  totalLogs: number;
  serverTime: string;
  uptimeSeconds: number;
}

export interface PurchaseInvoice {
  id: string;
  invoiceNo: string; // Fiş/Fatura No
  supplierName: string; // Tedarikçi / Firma Adı
  date: string; // Tarih (YYYY-MM-DD)
  stockItemId?: string; // İlgili Stok Malzemesi ID
  stockItemName: string; // Malzeme Adı
  quantity: number; // Miktar
  unit: string; // Birim
  unitPrice: number; // Birim Alış Fiyatı (₺)
  totalAmount: number; // Ödenen Toplam Fiş Tutarı (₺)
  paymentType: 'nakit' | 'kredi_karti' | 'havale' | 'veresiye'; // Ödeme Tipi
  createdByName: string; // Girişi Yapan Personel (Kasa Sorumlusu)
  notes?: string; // Notlar
  createdAt: string; // Oluşturulma Zamanı
}

export interface ExpenseInvoice {
  id: string;
  title: string; // Fatura / Gider Adı (örn: Elektrik Faturası, İnternet Faturası, Dükkan Kirası)
  category: 'elektrik' | 'su' | 'dogalgaz' | 'internet' | 'kira' | 'personel' | 'temizlik' | 'tamirat' | 'diger'; // Gider Kategorisi
  invoiceNo?: string; // Abone / Fatura / Makbuz No
  amount: number; // Ödenen Tutar (₺)
  date: string; // Ödeme Tarihi (YYYY-MM-DD)
  paymentType: 'nakit' | 'kredi_karti' | 'havale' | 'veresiye'; // Ödeme Yöntemi
  paidByName: string; // Ödemeyi Kaydeden Sorumlu
  notes?: string; // Notlar / Açıklama
  createdAt: string; // Kayıt Zamanı
}


