import React, { useState } from 'react';
import {
  Category, MenuItem, StockItem, Order, Zone, Table, RestaurantSettings, AppUser, PurchaseInvoice, ExpenseInvoice
} from '../types';
import {
  TrendingUp, BarChart3, Package, Utensils, Settings, History, Plus,
  Trash2, Edit3, Save, Printer, AlertTriangle, ShieldCheck, DollarSign,
  PieChart as PieChartIcon, Search, Check, RefreshCw, Users, Key,
  Percent, Coins, ArrowUpDown, Tag, X, LayoutGrid, Layers, Coffee,
  CupSoda, Egg, UtensilsCrossed, Hamburger, Cake, Upload, Image as ImageIcon, Building2, Link as LinkIcon,
  FileText, PlusCircle, FilePlus, Zap, Receipt, Eye, CheckCircle2, Calendar, Clock, Filter, AlertCircle
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { formatCurrency, formatDate, formatTime } from '../utils/formatters';
import { UserManagement } from './UserManagement';
import { HardwareSettings } from './HardwareSettings';
import { BoxStockIntake } from './BoxStockIntake';
import { LocalDatabaseManager } from './LocalDatabaseManager';
import { StorageService } from '../services/storage';
import { Server as ServerIcon, Database as DatabaseIcon } from 'lucide-react';

interface AdminPanelProps {
  categories: Category[];
  menuItems: MenuItem[];
  stockItems: StockItem[];
  purchaseInvoices?: PurchaseInvoice[];
  expenseInvoices?: ExpenseInvoice[];
  orders: Order[];
  zones: Zone[];
  tables: Table[];
  settings: RestaurantSettings;
  users: AppUser[];
  currentUser?: AppUser | null;
  onUpdateCategories: (categories: Category[]) => void;
  onUpdateMenuItems: (items: MenuItem[]) => void;
  onUpdateStockItems: (items: StockItem[]) => void;
  onUpdatePurchaseInvoices?: (invoices: PurchaseInvoice[]) => void;
  onAddPurchaseInvoice?: (invoice: PurchaseInvoice) => void;
  onUpdateExpenseInvoices?: (expenses: ExpenseInvoice[]) => void;
  onAddExpenseInvoice?: (expense: ExpenseInvoice) => void;
  onOpenAddInvoiceModal?: () => void;
  onUpdateZones: (zones: Zone[]) => void;
  onUpdateTables: (tables: Table[]) => void;
  onUpdateSettings: (settings: RestaurantSettings) => void;
  onUpdateUsers: (users: AppUser[]) => void;
  onUpdateOrders?: (orders: Order[]) => void;
  onOpenPrintTicket: (order: Order) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  categories,
  menuItems,
  stockItems,
  purchaseInvoices = [],
  expenseInvoices = [],
  orders,
  zones,
  tables,
  settings,
  users,
  currentUser,
  onUpdateCategories,
  onUpdateMenuItems,
  onUpdateStockItems,
  onUpdatePurchaseInvoices,
  onAddPurchaseInvoice,
  onUpdateExpenseInvoices,
  onAddExpenseInvoice,
  onOpenAddInvoiceModal,
  onUpdateZones,
  onUpdateTables,
  onUpdateSettings,
  onUpdateUsers,
  onUpdateOrders,
  onOpenPrintTicket,
}) => {
  // Determine sub-tab permissions
  const canViewReports = currentUser ? currentUser.permissions.canViewReports || currentUser.role === 'admin' : true;
  const canManageInvoices = currentUser ? currentUser.permissions.canManageInvoices || currentUser.role === 'admin' : true;
  const canManageMenu = currentUser ? currentUser.permissions.canManageMenu || currentUser.role === 'admin' : true;
  const canManageStock = currentUser ? currentUser.permissions.canManageStock || currentUser.role === 'admin' : true;
  const canManageUsers = currentUser ? currentUser.permissions.canManageUsers || currentUser.role === 'admin' : true;
  const canManageSettings = currentUser ? currentUser.role === 'admin' || currentUser.isSystemAdmin : true;
  const canManageServer = currentUser ? currentUser.role === 'admin' || currentUser.isSystemAdmin : true;
  const canAddTable = currentUser ? currentUser.permissions?.canAddTable || currentUser.role === 'admin' || currentUser.isSystemAdmin : true;

  // Initial tab selection
  const defaultTab = canViewReports
    ? 'reports'
    : canManageInvoices
    ? 'invoices'
    : canManageMenu
    ? 'menu'
    : canManageStock
    ? 'stock'
    : canManageUsers
    ? 'users'
    : canManageSettings
    ? 'settings'
    : 'stock';

  const [activeTab, setActiveTab] = useState<'reports' | 'invoices' | 'menu' | 'stock' | 'tables' | 'users' | 'history' | 'settings' | 'server'>(defaultTab);

  // Sub tab states
  const [stockSubTab, setStockSubTab] = useState<'list' | 'box_intake'>('list');
  const [menuSubTab, setMenuSubTab] = useState<'items' | 'categories'>('items');
  const [settingsSubTab, setSettingsSubTab] = useState<'hardware' | 'general' | 'zones'>('hardware');

  // Category Management State
  const [showAddCategoryModal, setShowAddCategoryModal] = useState<boolean>(false);
  const [newCategoryName, setNewCategoryName] = useState<string>('');
  const [newCategoryIcon, setNewCategoryIcon] = useState<string>('Utensils');
  const [newCategoryColor, setNewCategoryColor] = useState<string>('amber');

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editCategoryName, setEditCategoryName] = useState<string>('');
  const [editCategoryIcon, setEditCategoryIcon] = useState<string>('Utensils');
  const [editCategoryColor, setEditCategoryColor] = useState<string>('amber');

  // Zone / Salon Management State
  const [showAddZoneModal, setShowAddZoneModal] = useState<boolean>(false);
  const [newZoneName, setNewZoneName] = useState<string>('');
  const [newZoneDesc, setNewZoneDesc] = useState<string>('');

  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [editZoneName, setEditZoneName] = useState<string>('');
  const [editZoneDesc, setEditZoneDesc] = useState<string>('');

  // Table Management State
  const [addTableZoneId, setAddTableZoneId] = useState<string | null>(null);
  const [addTableNum, setAddTableNum] = useState<string>('');
  const [addTableCap, setAddTableCap] = useState<string>('4');

  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [editTableNum, setEditTableNum] = useState<string>('');
  const [editTableCap, setEditTableCap] = useState<string>('4');
  const [editTableZoneId, setEditTableZoneId] = useState<string>('');

  const [showBulkAddTablesModal, setShowBulkAddTablesModal] = useState<boolean>(false);
  const [bulkPrefix, setBulkPrefix] = useState<string>('Masa ');
  const [bulkStartNum, setBulkStartNum] = useState<number>(1);
  const [bulkCount, setBulkCount] = useState<number>(5);
  const [bulkZoneId, setBulkZoneId] = useState<string>('');
  const [bulkCapacity, setBulkCapacity] = useState<number>(4);

  // Table Search and Filtering State
  const [tableSearchQuery, setTableSearchQuery] = useState<string>('');
  const [selectedZoneFilter, setSelectedZoneFilter] = useState<string>('all');
  const [tableStatusFilter, setTableStatusFilter] = useState<'all' | 'empty' | 'occupied' | 'bill_requested' | 'reserved'>('all');

  // Z-Report, Detailed Report & Invoice Report Modal States
  const [showZReportModal, setShowZReportModal] = useState<boolean>(false);
  const [showDetailedReportModal, setShowDetailedReportModal] = useState<boolean>(false);
  const [showInvoiceReportModal, setShowInvoiceReportModal] = useState<boolean>(false);

  const handleOpenZReport = () => {
    setShowDetailedReportModal(false);
    setShowInvoiceReportModal(false);
    setShowZReportModal(true);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const handleOpenDetailedReport = () => {
    setShowZReportModal(false);
    setShowInvoiceReportModal(false);
    setShowDetailedReportModal(true);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const handleOpenInvoiceReport = () => {
    setShowZReportModal(false);
    setShowDetailedReportModal(false);
    setShowInvoiceReportModal(true);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  // Selected Date Filter State
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));

  // New Menu Item State
  const [showAddMenuModal, setShowAddMenuModal] = useState<boolean>(false);
  const [newItemName, setNewItemName] = useState<string>('');
  const [newItemPrice, setNewItemPrice] = useState<string>('');
  const [newItemCost, setNewItemCost] = useState<string>('');
  const [newItemCategory, setNewItemCategory] = useState<string>(categories[0]?.id || '');
  const [newItemUnit, setNewItemUnit] = useState<string>('Porsiyon');
  const [newItemStock, setNewItemStock] = useState<string>('50');

  // Edit Menu Item State
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [editItemName, setEditItemName] = useState<string>('');
  const [editItemPrice, setEditItemPrice] = useState<string>('');
  const [editItemCost, setEditItemCost] = useState<string>('');
  const [editItemCategory, setEditItemCategory] = useState<string>('');
  const [editItemUnit, setEditItemUnit] = useState<string>('Porsiyon');
  const [editItemStock, setEditItemStock] = useState<string>('50');

  // New Stock Item State
  const [showAddStockModal, setShowAddStockModal] = useState<boolean>(false);
  const [newStockName, setNewStockName] = useState<string>('');
  const [newStockQty, setNewStockQty] = useState<string>('');
  const [newStockUnit, setNewStockUnit] = useState<string>('kg');
  const [newStockMin, setNewStockMin] = useState<string>('5');
  const [newStockCost, setNewStockCost] = useState<string>('');

  // Edit Stock Item State
  const [editingStockItem, setEditingStockItem] = useState<StockItem | null>(null);
  const [editStockName, setEditStockName] = useState<string>('');
  const [editStockQty, setEditStockQty] = useState<string>('');
  const [editStockUnit, setEditStockUnit] = useState<string>('kg');
  const [editStockMinThreshold, setEditStockMinThreshold] = useState<string>('5');
  const [editStockCostPerUnit, setEditStockCostPerUnit] = useState<string>('');

  // Product Profit Report Search & Sort
  const [productReportSearch, setProductReportSearch] = useState<string>('');
  const [productReportSort, setProductReportSort] = useState<'profit_desc' | 'qty_desc' | 'revenue_desc' | 'margin_desc' | 'name_asc'>('profit_desc');

  // Edit Settings State
  const [editSettingsForm, setEditSettingsForm] = useState<RestaurantSettings>({ ...settings });

  React.useEffect(() => {
    setEditSettingsForm({ ...settings });
  }, [settings]);

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        showToast('Logo görsel boyutu en fazla 3MB olabilir.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditSettingsForm((prev) => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Editing Expense Invoice State
  const [editingExpenseInvoice, setEditingExpenseInvoice] = useState<ExpenseInvoice | null>(null);

  // Editing Purchase Invoice State
  const [editingPurchaseInvoice, setEditingPurchaseInvoice] = useState<PurchaseInvoice | null>(null);

  // Custom in-app Confirmation Dialog State (replacing blocked window.confirm)
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    type: 'menu_item' | 'category' | 'stock_item' | 'expense_invoice' | 'purchase_invoice' | 'order' | 'zone' | 'table';
    id: string;
    title: string;
    message: string;
    warning?: string;
    confirmText?: string;
    onConfirm: () => void;
  } | null>(null);

  // Viewing Order Detail Modal (for Geçmiş Adisyonlar)
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

  // Past Orders Filter & Search State
  const [historyStatusFilter, setHistoryStatusFilter] = useState<'all' | 'closed' | 'unpaid_debt' | 'open'>('all');
  const [historySearchQuery, setHistorySearchQuery] = useState<string>('');
  const [historyDateFilter, setHistoryDateFilter] = useState<'all' | 'today' | 'yesterday' | 'week'>('all');

  // In-app Toast Notification State (replacing blocked window.alert)
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  // Filter closed completed orders for reports
  const closedOrders = orders.filter((o) => o.status === 'closed');

  // Report Metrics Calculations
  const totalRevenue = closedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalDiscounts = closedOrders.reduce((sum, o) => sum + o.discountAmount, 0);
  const totalTax = closedOrders.reduce((sum, o) => sum + o.taxAmount, 0);

  // Cost calculation
  const totalCost = closedOrders.reduce((sum, o) => {
    return (
      sum +
      o.items.reduce((itemSum, item) => {
        const matchedMenuItem = menuItems.find((m) => m.id === item.menuItemId || m.name === item.name);
        const unitCost = item.costPrice > 0 ? item.costPrice : (matchedMenuItem?.costPrice || 0);
        return itemSum + unitCost * item.quantity;
      }, 0)
    );
  }, 0);

  const estimatedProfit = Math.max(0, totalRevenue - totalCost);
  const profitMarginPercent = totalRevenue > 0 ? (estimatedProfit / totalRevenue) * 100 : 0;

  // Product-by-Product Profit Breakdown for Reports Table
  const productProfitMap = new Map<string, {
    menuItemId: string;
    name: string;
    categoryName: string;
    quantity: number;
    unitPrice: number;
    unitCost: number;
    totalRevenue: number;
    totalCost: number;
    totalProfit: number;
    marginPercent: number;
  }>();

  closedOrders.forEach((o) => {
    o.items.forEach((item) => {
      const matchedMenuItem = menuItems.find((m) => m.id === item.menuItemId || m.name === item.name);
      const unitCost = item.costPrice > 0 ? item.costPrice : (matchedMenuItem?.costPrice || 0);
      const category = categories.find((c) => c.id === matchedMenuItem?.categoryId);
      const categoryName = category?.name || 'Genel';

      const rev = item.price * item.quantity;
      const cost = unitCost * item.quantity;
      const profit = rev - cost;

      const existing = productProfitMap.get(item.name);
      if (existing) {
        const newQty = existing.quantity + item.quantity;
        const newRev = existing.totalRevenue + rev;
        const newCost = existing.totalCost + cost;
        const newProfit = newRev - newCost;
        const newMargin = newRev > 0 ? (newProfit / newRev) * 100 : 0;

        productProfitMap.set(item.name, {
          ...existing,
          quantity: newQty,
          totalRevenue: newRev,
          totalCost: newCost,
          totalProfit: newProfit,
          marginPercent: newMargin,
        });
      } else {
        const margin = rev > 0 ? (profit / rev) * 100 : 0;
        productProfitMap.set(item.name, {
          menuItemId: item.menuItemId,
          name: item.name,
          categoryName,
          quantity: item.quantity,
          unitPrice: item.price,
          unitCost,
          totalRevenue: rev,
          totalCost: cost,
          totalProfit: profit,
          marginPercent: margin,
        });
      }
    });
  });

  let productProfitList = Array.from(productProfitMap.values());

  if (productReportSearch.trim()) {
    const query = productReportSearch.toLowerCase();
    productProfitList = productProfitList.filter(
      (p) => p.name.toLowerCase().includes(query) || p.categoryName.toLowerCase().includes(query)
    );
  }

  productProfitList.sort((a, b) => {
    if (productReportSort === 'profit_desc') return b.totalProfit - a.totalProfit;
    if (productReportSort === 'qty_desc') return b.quantity - a.quantity;
    if (productReportSort === 'revenue_desc') return b.totalRevenue - a.totalRevenue;
    if (productReportSort === 'margin_desc') return b.marginPercent - a.marginPercent;
    if (productReportSort === 'name_asc') return a.name.localeCompare(b.name);
    return 0;
  });

  const grandTotalReportQty = productProfitList.reduce((s, p) => s + p.quantity, 0);
  const grandTotalReportRev = productProfitList.reduce((s, p) => s + p.totalRevenue, 0);
  const grandTotalReportCost = productProfitList.reduce((s, p) => s + p.totalCost, 0);
  const grandTotalReportProfit = productProfitList.reduce((s, p) => s + p.totalProfit, 0);

  // Payment Types Breakdown
  const paymentMethodStats = {
    kredi_karti: closedOrders.filter((o) => o.paymentType === 'kredi_karti').reduce((s, o) => s + o.totalAmount, 0),
    nakit: closedOrders.filter((o) => o.paymentType === 'nakit').reduce((s, o) => s + o.totalAmount, 0),
    yemek_karti: closedOrders.filter((o) => o.paymentType === 'yemek_karti').reduce((s, o) => s + o.totalAmount, 0),
  };

  // Stock & Inventory Calculations for Reports
  const totalStockValuation = stockItems.reduce((acc, item) => acc + ((item.quantity || 0) * (item.costPerUnit || 0)), 0);
  const lowStockCount = stockItems.filter(s => (s.quantity || 0) <= (s.minThreshold || 0)).length;
  const openOrdersTotal = orders.filter(o => o.status === 'open' || o.status === 'unpaid_debt' || o.status === 'active').reduce((sum, o) => sum + o.totalAmount, 0);
  const tChartTotalAmount = totalRevenue + openOrdersTotal + totalCost + totalDiscounts + totalStockValuation;

  const pieData = [
    { name: 'Kredi Kartı', value: paymentMethodStats.kredi_karti, color: '#f59e0b' },
    { name: 'Nakit', value: paymentMethodStats.nakit, color: '#10b981' },
    { name: 'Yemek Çeki', value: paymentMethodStats.yemek_karti, color: '#3b82f6' },
  ].filter((d) => d.value > 0);

  // Top Selling Items
  const itemSalesMap = new Map<string, { name: string; qty: number; revenue: number }>();
  closedOrders.forEach((o) => {
    o.items.forEach((i) => {
      const existing = itemSalesMap.get(i.name) || { name: i.name, qty: 0, revenue: 0 };
      itemSalesMap.set(i.name, {
        name: i.name,
        qty: existing.qty + i.quantity,
        revenue: existing.revenue + i.price * i.quantity,
      });
    });
  });

  const topSellingItems = Array.from(itemSalesMap.values())
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  // Staff / Personel Performance Calculation
  const staffPerformanceMap = new Map<string, {
    name: string;
    closedOrdersCount: number;
    openOrdersCount: number;
    totalRevenue: number;
  }>();

  closedOrders.forEach((ord) => {
    const waiter = ord.waiterName?.trim() || 'Kasa / Belirtilmedi';
    const curr = staffPerformanceMap.get(waiter) || {
      name: waiter,
      closedOrdersCount: 0,
      openOrdersCount: 0,
      totalRevenue: 0,
    };
    staffPerformanceMap.set(waiter, {
      ...curr,
      closedOrdersCount: curr.closedOrdersCount + 1,
      totalRevenue: curr.totalRevenue + ord.totalAmount,
    });
  });

  orders.filter((o) => o.status === 'active').forEach((ord) => {
    const waiter = ord.waiterName?.trim() || 'Kasa / Belirtilmedi';
    const curr = staffPerformanceMap.get(waiter) || {
      name: waiter,
      closedOrdersCount: 0,
      openOrdersCount: 0,
      totalRevenue: 0,
    };
    staffPerformanceMap.set(waiter, {
      ...curr,
      openOrdersCount: curr.openOrdersCount + 1,
    });
  });

  const staffPerformanceList = Array.from(staffPerformanceMap.values()).map((s) => {
    const avgVal = s.closedOrdersCount > 0 ? s.totalRevenue / s.closedOrdersCount : 0;
    const sharePct = totalRevenue > 0 ? (s.totalRevenue / totalRevenue) * 100 : 0;
    return {
      ...s,
      avgOrderValue: avgVal,
      sharePercent: sharePct,
    };
  }).sort((a, b) => b.totalRevenue - a.totalRevenue);

  const hourlyDataPrepared = Array.from({ length: 14 }, (_, i) => {
    const h = i + 9; // 09:00 - 22:00
    const label = `${h.toString().padStart(2, '0')}:00`;
    const rev = closedOrders
      .filter((o) => {
        const t = o.closedAt || o.createdAt;
        if (!t) return false;
        const d = new Date(t);
        return !isNaN(d.getTime()) && d.getHours() === h;
      })
      .reduce((sum, o) => sum + o.totalAmount, 0);
    return { hour: label, revenue: rev };
  });
  const maxHourlyRev = Math.max(...hourlyDataPrepared.map((h) => h.revenue), 1);

  // Sample hourly chart data
  const hourlyData = [
    { hour: '09:00', ciro: 450 },
    { hour: '11:00', ciro: 1200 },
    { hour: '13:00', ciro: 3450 },
    { hour: '15:00', ciro: 2100 },
    { hour: '17:00', ciro: 1800 },
    { hour: '19:00', ciro: 4200 },
    { hour: '21:00', ciro: 2900 },
  ];

  // Add New Menu Item Handler
  const handleCreateMenuItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || !newItemPrice) return;

    const newItem: MenuItem = {
      id: 'item-' + Date.now(),
      categoryId: newItemCategory || categories[0]?.id || 'cat-1',
      name: newItemName,
      price: parseFloat(newItemPrice) || 0,
      costPrice: parseFloat(newItemCost) || 0,
      unit: newItemUnit,
      stockQuantity: parseInt(newItemStock) || 0,
      minStockAlert: 10,
      isAvailable: true,
    };

    onUpdateMenuItems([...menuItems, newItem]);
    setShowAddMenuModal(false);
    setNewItemName('');
    setNewItemPrice('');
    setNewItemCost('');
  };

  // Open Edit Menu Item Modal
  const handleOpenEditMenuItem = (item: MenuItem) => {
    setEditingMenuItem(item);
    setEditItemName(item.name);
    setEditItemPrice(String(item.price));
    setEditItemCost(String(item.costPrice || 0));
    setEditItemCategory(item.categoryId);
    setEditItemUnit(item.unit || 'Porsiyon');
    setEditItemStock(String(item.stockQuantity || 0));
  };

  // Save Edit Menu Item
  const handleSaveEditedMenuItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMenuItem || !editItemName) return;

    const updatedList = menuItems.map((m) => {
      if (m.id === editingMenuItem.id) {
        return {
          ...m,
          name: editItemName,
          price: parseFloat(editItemPrice) || 0,
          costPrice: parseFloat(editItemCost) || 0,
          categoryId: editItemCategory,
          unit: editItemUnit,
          stockQuantity: parseInt(editItemStock) || 0,
        };
      }
      return m;
    });

    onUpdateMenuItems(updatedList);
    setEditingMenuItem(null);
  };

  // Add New Stock Item Handler
  const handleCreateStockItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStockName || !newStockQty) return;

    const newItem: StockItem = {
      id: 'stk-' + Date.now(),
      name: newStockName,
      category: 'Genel',
      quantity: parseFloat(newStockQty) || 0,
      unit: newStockUnit,
      minThreshold: parseFloat(newStockMin) || 5,
      costPerUnit: parseFloat(newStockCost) || 0,
      lastUpdated: new Date().toISOString(),
    };

    onUpdateStockItems([...stockItems, newItem]);
    setShowAddStockModal(false);
    setNewStockName('');
    setNewStockQty('');
    setNewStockCost('');
    setNewStockMin('5');
  };

  // Open Edit Stock Item Modal
  const handleOpenEditStockItem = (stock: StockItem) => {
    setEditingStockItem(stock);
    setEditStockName(stock.name);
    setEditStockQty(String(stock.quantity));
    setEditStockUnit(stock.unit || 'kg');
    setEditStockMinThreshold(String(stock.minThreshold || 5));
    setEditStockCostPerUnit(String(stock.costPerUnit || 0));
  };

  // Save Edit Stock Item
  const handleSaveEditedStockItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStockItem || !editStockName) return;

    const updatedList = stockItems.map((s) => {
      if (s.id === editingStockItem.id) {
        return {
          ...s,
          name: editStockName,
          quantity: parseFloat(editStockQty) || 0,
          unit: editStockUnit,
          minThreshold: parseFloat(editStockMinThreshold) || 5,
          costPerUnit: parseFloat(editStockCostPerUnit) || 0,
          lastUpdated: new Date().toISOString(),
        };
      }
      return s;
    });

    onUpdateStockItems(updatedList);
    setEditingStockItem(null);
  };

  // Category Handlers
  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    const newCat: Category = {
      id: 'cat-' + Date.now(),
      name: newCategoryName.trim(),
      iconName: newCategoryIcon,
      color: newCategoryColor,
    };

    onUpdateCategories([...categories, newCat]);
    setShowAddCategoryModal(false);
    setNewCategoryName('');
  };

  const handleOpenEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setEditCategoryName(cat.name);
    setEditCategoryIcon(cat.iconName || 'Utensils');
    setEditCategoryColor(cat.color || 'amber');
  };

  const handleSaveEditedCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editCategoryName.trim()) return;

    const updated = categories.map((c) =>
      c.id === editingCategory.id
        ? { ...c, name: editCategoryName.trim(), iconName: editCategoryIcon, color: editCategoryColor }
        : c
    );

    onUpdateCategories(updated);
    setEditingCategory(null);
  };

  const handleDeleteCategory = (catId: string, catName: string) => {
    const linkedItems = menuItems.filter((m) => m.categoryId === catId);
    const count = linkedItems.length;
    const fallbackCat = categories.find((c) => c.id !== catId);

    setDeleteConfirm({
      isOpen: true,
      type: 'category',
      id: catId,
      title: 'Kategoriyi Sil',
      message: `"${catName}" kategorisini silmek istediğinize emin misiniz?`,
      warning: count > 0
        ? `Bu kategoriye ait ${count} adet ürün bulunmaktadır. Kategori silindiğinde bu ürünler otomatik olarak "${fallbackCat ? fallbackCat.name : 'Genel'}" kategorisine aktarılacaktır.`
        : undefined,
      confirmText: count > 0 ? 'Kategoriyi Sil ve Ürünleri Taşı' : 'Evet, Kategoriyi Sil',
      onConfirm: () => {
        if (count > 0 && fallbackCat) {
          const updatedItems = menuItems.map((m) =>
            m.categoryId === catId ? { ...m, categoryId: fallbackCat.id } : m
          );
          onUpdateMenuItems(updatedItems);
        }
        onUpdateCategories(categories.filter((c) => c.id !== catId));
        showToast(`"${catName}" kategorisi başarıyla silindi.`);
      },
    });
  };

  const handleDeleteMenuItem = (item: MenuItem) => {
    setDeleteConfirm({
      isOpen: true,
      type: 'menu_item',
      id: item.id,
      title: 'Ürünü Menüden Sil',
      message: `"${item.name}" ürününü menüden kaldırmak istediğinize emin misiniz? Bu işlem geri alınamaz.`,
      confirmText: 'Evet, Ürünü Sil',
      onConfirm: () => {
        onUpdateMenuItems(menuItems.filter((m) => m.id !== item.id));
        showToast(`"${item.name}" menüden silindi.`);
      },
    });
  };

  const handleDeleteStockItem = (stock: StockItem) => {
    setDeleteConfirm({
      isOpen: true,
      type: 'stock_item',
      id: stock.id,
      title: 'Hammadde / Stok Kaydını Sil',
      message: `"${stock.name}" hammadde ve stok kartını silmek istediğinize emin misiniz?`,
      warning: 'Bu hammaddeye bağlı geçmiş fiş kayıtları etkilenebilir.',
      confirmText: 'Evet, Stoğu Sil',
      onConfirm: () => {
        onUpdateStockItems(stockItems.filter((s) => s.id !== stock.id));
        showToast(`"${stock.name}" stok kaydı silindi.`);
      },
    });
  };

  const handleDeleteExpense = (exp: ExpenseInvoice) => {
    setDeleteConfirm({
      isOpen: true,
      type: 'expense_invoice',
      id: exp.id,
      title: 'Fatura / Gider Kaydını Sil',
      message: `"${exp.title}" (${formatCurrency(exp.amount, settings.currencySymbol)}) gider faturası kaydını silmek istediğinize emin misiniz?`,
      confirmText: 'Evet, Faturayı Sil',
      onConfirm: () => {
        const updated = expenseInvoices.filter((e) => e.id !== exp.id);
        if (onUpdateExpenseInvoices) onUpdateExpenseInvoices(updated);
        showToast(`"${exp.title}" faturası silindi.`);
      },
    });
  };

  const handleSaveEditedExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpenseInvoice) return;
    const updated = expenseInvoices.map((exp) =>
      exp.id === editingExpenseInvoice.id ? editingExpenseInvoice : exp
    );
    if (onUpdateExpenseInvoices) onUpdateExpenseInvoices(updated);
    setEditingExpenseInvoice(null);
    showToast(`"${editingExpenseInvoice.title}" faturası güncellendi.`);
  };

  const handleDeletePurchase = (inv: PurchaseInvoice) => {
    setDeleteConfirm({
      isOpen: true,
      type: 'purchase_invoice',
      id: inv.id,
      title: 'Mal Alım Fişini Sil',
      message: `"${inv.invoiceNo}" nolu (${inv.supplierName} - ${inv.stockItemName}) fiş kaydını silmek istediğinize emin misiniz?`,
      confirmText: 'Evet, Fişi Sil',
      onConfirm: () => {
        const updated = purchaseInvoices.filter((p) => p.id !== inv.id);
        if (onUpdatePurchaseInvoices) onUpdatePurchaseInvoices(updated);
        showToast(`"${inv.invoiceNo}" nolu mal alım fişi silindi.`);
      },
    });
  };

  const handleSaveEditedPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPurchaseInvoice) return;
    const qty = Number(editingPurchaseInvoice.quantity) || 0;
    const price = Number(editingPurchaseInvoice.unitPrice) || 0;
    const updatedInvoice: PurchaseInvoice = {
      ...editingPurchaseInvoice,
      quantity: qty,
      unitPrice: price,
      totalAmount: qty * price,
    };
    const updated = purchaseInvoices.map((inv) =>
      inv.id === updatedInvoice.id ? updatedInvoice : inv
    );
    if (onUpdatePurchaseInvoices) onUpdatePurchaseInvoices(updated);
    setEditingPurchaseInvoice(null);
    showToast(`"${updatedInvoice.invoiceNo}" mal alım fişi güncellendi.`);
  };

  const handleDeleteOrder = (ord: Order) => {
    setDeleteConfirm({
      isOpen: true,
      type: 'order',
      id: ord.id,
      title: 'Adisyonu Sil',
      message: `"${ord.id}" nolu (${ord.tableName} - ${formatCurrency(ord.totalAmount, settings.currencySymbol)}) adisyon kaydını geçmişten silmek istediğinize emin misiniz?`,
      warning: 'Bu işlem raporlanan satış ve ciro toplamlarını etkileyecektir.',
      confirmText: 'Evet, Adisyonu Sil',
      onConfirm: () => {
        if (onUpdateOrders) {
          onUpdateOrders(orders.filter((o) => o.id !== ord.id));
        }
        showToast(`"${ord.id}" adisyon kaydı silindi.`);
      },
    });
  };

  // Zone Handlers
  const handleCreateZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZoneName.trim()) return;

    const newZone: Zone = {
      id: 'zone-' + Date.now(),
      name: newZoneName.trim(),
      description: newZoneDesc.trim() || undefined,
    };

    onUpdateZones([...zones, newZone]);
    setShowAddZoneModal(false);
    setNewZoneName('');
    setNewZoneDesc('');
    showToast(`"${newZone.name}" salonu oluşturuldu.`);
  };

  const handleOpenEditZone = (z: Zone) => {
    setEditingZone(z);
    setEditZoneName(z.name);
    setEditZoneDesc(z.description || '');
  };

  const handleSaveEditedZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingZone || !editZoneName.trim()) return;

    const updatedZones = zones.map((z) =>
      z.id === editingZone.id
        ? { ...z, name: editZoneName.trim(), description: editZoneDesc.trim() || undefined }
        : z
    );

    onUpdateZones(updatedZones);
    setEditingZone(null);
    showToast('Salon bilgileri güncellendi.');
  };

  const handleDeleteZone = (zoneId: string, zoneName: string) => {
    const zoneTables = tables.filter((t) => t.zoneId === zoneId);
    const occupiedTables = zoneTables.filter(
      (t) => t.status === 'occupied' || t.status === 'bill_requested'
    );

    if (occupiedTables.length > 0) {
      setDeleteConfirm({
        isOpen: true,
        type: 'zone',
        id: zoneId,
        title: 'Salon Silinemez',
        message: `"${zoneName}" salonundaki ${occupiedTables.length} masada şu anda açık bir adisyon bulunmaktadır.`,
        warning: 'Salonu silebilmek için önce açık hesapları kapatmalı veya masaları boşaltmalısınız.',
        confirmText: 'Tamam',
        onConfirm: () => {},
      });
      return;
    }

    if (zoneTables.length > 0) {
      setDeleteConfirm({
        isOpen: true,
        type: 'zone',
        id: zoneId,
        title: 'Salonu ve Masalarını Sil',
        message: `"${zoneName}" salonu ile bu salona ait ${zoneTables.length} adet boş masa silinecektir.`,
        warning: 'Bu salondaki tüm masa tanımları kaldırılacaktır. Devam etmek istiyor musunuz?',
        confirmText: 'Evet, Salonu ve Masaları Sil',
        onConfirm: () => {
          onUpdateZones(zones.filter((z) => z.id !== zoneId));
          onUpdateTables(tables.filter((t) => t.zoneId !== zoneId));
          showToast(`"${zoneName}" salonu ve ${zoneTables.length} masası silindi.`);
        },
      });
      return;
    }

    setDeleteConfirm({
      isOpen: true,
      type: 'zone',
      id: zoneId,
      title: 'Salonu Sil',
      message: `"${zoneName}" salon/bölgesini silmek istediğinize emin misiniz?`,
      confirmText: 'Evet, Salonu Sil',
      onConfirm: () => {
        onUpdateZones(zones.filter((z) => z.id !== zoneId));
        showToast(`"${zoneName}" salonu silindi.`);
      },
    });
  };

  const handleAddTableToZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canAddTable) {
      showToast('Masa ekleme yetkiniz bulunmamaktadır.');
      return;
    }
    const targetZoneId = addTableZoneId || zones[0]?.id;
    if (!targetZoneId || !addTableNum.trim()) {
      showToast('Lütfen masa numarasını ve geçerli bir salonu seçiniz.');
      return;
    }

    const newTable: Table = {
      id: 'tbl-' + Date.now(),
      number: addTableNum.trim(),
      zoneId: targetZoneId,
      capacity: parseInt(addTableCap) || 4,
      status: 'empty',
    };

    onUpdateTables([...tables, newTable]);
    setAddTableZoneId(null);
    setAddTableNum('');
    setAddTableCap('4');
    showToast(`Masa "${newTable.number}" başarıyla eklendi.`);
  };

  const handleOpenEditTable = (tbl: Table) => {
    setEditingTable(tbl);
    setEditTableNum(tbl.number);
    setEditTableCap(String(tbl.capacity || 4));
    setEditTableZoneId(tbl.zoneId);
  };

  const handleSaveEditedTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTable || !editTableNum.trim()) return;

    const updatedTables = tables.map((t) =>
      t.id === editingTable.id
        ? {
            ...t,
            number: editTableNum.trim(),
            capacity: parseInt(editTableCap) || 4,
            zoneId: editTableZoneId || t.zoneId,
          }
        : t
    );

    onUpdateTables(updatedTables);
    setEditingTable(null);
    showToast(`Masa "${editTableNum.trim()}" güncellendi.`);
  };

  const handleBulkAddTables = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canAddTable) {
      showToast('Masa ekleme yetkiniz bulunmamaktadır.');
      return;
    }
    const targetZoneId = bulkZoneId || zones[0]?.id;
    if (!targetZoneId) {
      showToast('Lütfen önce bir salon seçiniz veya oluşturunuz.');
      return;
    }

    const count = Math.min(Math.max(Number(bulkCount) || 1, 1), 50);
    const start = Number(bulkStartNum) || 1;
    const prefix = bulkPrefix;
    const cap = Number(bulkCapacity) || 4;

    const newCreatedTables: Table[] = [];
    for (let i = 0; i < count; i++) {
      const numVal = start + i;
      newCreatedTables.push({
        id: 'tbl-' + Date.now() + '-' + i,
        number: `${prefix}${numVal}`.trim(),
        zoneId: targetZoneId,
        capacity: cap,
        status: 'empty',
      });
    }

    onUpdateTables([...tables, ...newCreatedTables]);
    setShowBulkAddTablesModal(false);
    showToast(`${newCreatedTables.length} adet masa başarıyla eklendi.`);
  };

  const handleDeleteTable = (tblId: string, tblNum: string) => {
    const tbl = tables.find((t) => t.id === tblId);
    if (tbl?.status === 'occupied' || tbl?.status === 'bill_requested') {
      setDeleteConfirm({
        isOpen: true,
        type: 'table',
        id: tblId,
        title: 'Masa Silinemez',
        message: `"${tblNum}" masasında şu anda açık bir adisyon bulunmaktadır.`,
        warning: 'Lütfen önce masanın hesabını kapatınız veya masayı boşaltınız.',
        confirmText: 'Tamam',
        onConfirm: () => {},
      });
      return;
    }

    setDeleteConfirm({
      isOpen: true,
      type: 'table',
      id: tblId,
      title: 'Masayı Sil',
      message: `"${tblNum}" masasını silmek istediğinize emin misiniz?`,
      confirmText: 'Evet, Masayı Sil',
      onConfirm: () => {
        onUpdateTables(tables.filter((t) => t.id !== tblId));
        showToast(`Masa "${tblNum}" silindi.`);
      },
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Admin Panel Sub Navigation Tabs */}
      <div className="bg-white dark:bg-stone-900 p-3 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full text-xs font-semibold">
          {canViewReports && (
            <button
              onClick={() => setActiveTab('reports')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                activeTab === 'reports'
                  ? 'bg-amber-500 text-stone-950 shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Raporlar & Z-Raporu</span>
            </button>
          )}

          {canManageInvoices && (
            <button
              onClick={() => setActiveTab('invoices')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                activeTab === 'invoices'
                  ? 'bg-amber-500 text-stone-950 shadow-xs font-bold'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>Fiş, Fatura & Giderler ({(purchaseInvoices?.length || 0) + (expenseInvoices?.length || 0)})</span>
            </button>
          )}

          {canManageMenu && (
            <button
              onClick={() => setActiveTab('menu')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                activeTab === 'menu'
                  ? 'bg-amber-500 text-stone-950 shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
              }`}
            >
              <Utensils className="w-4 h-4" />
              <span>Menü & Ürünler ({menuItems.length})</span>
            </button>
          )}

          {canManageStock && (
            <button
              onClick={() => setActiveTab('stock')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                activeTab === 'stock'
                  ? 'bg-amber-500 text-stone-950 shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Stok & Hammadde ({stockItems.length})</span>
            </button>
          )}

          {canAddTable && (
            <button
              onClick={() => setActiveTab('tables')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                activeTab === 'tables'
                  ? 'bg-amber-500 text-stone-950 shadow-xs font-bold'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Salon & Masalar ({zones.length} Salon, {tables.length} Masa)</span>
            </button>
          )}

          {canManageUsers && (
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                activeTab === 'users'
                  ? 'bg-amber-500 text-stone-950 shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Kullanıcı & Yetki Yönetimi ({users.length})</span>
            </button>
          )}

          {canViewReports && (
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                activeTab === 'history'
                  ? 'bg-amber-500 text-stone-950 shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Geçmiş Adisyonlar</span>
            </button>
          )}


          {canManageSettings && (
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                activeTab === 'settings'
                  ? 'bg-amber-500 text-stone-950 shadow-xs font-bold'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Restoran Ayarları</span>
            </button>
          )}

          {canManageServer && (
            <button
              onClick={() => setActiveTab('server')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                activeTab === 'server'
                  ? 'bg-amber-500 text-stone-950 shadow-xs font-bold'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
              }`}
            >
              <ServerIcon className="w-4 h-4 text-emerald-500" />
              <span>Kasa Sunucusu & Yerel SQLite ({orders.length} Adisyon)</span>
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: REPORTING & ANALYTICS */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          
          {/* Branded Official Report Header Banner */}
          <div className="bg-white dark:bg-stone-900 p-5 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-stone-100 dark:bg-stone-800 p-2 border border-stone-200 dark:border-stone-700 flex items-center justify-center shrink-0 shadow-inner">
                <img
                  src={settings.logoUrl || '/logo.svg'}
                  onError={(e) => { e.currentTarget.src = '/logo.svg'; }}
                  alt={settings.name || 'Logo'}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h2 className="font-black text-lg sm:text-xl text-stone-900 dark:text-stone-100 uppercase tracking-tight">
                  {settings.name || 'MERİÇ BELEDİYESİ SOSYAL TESİSLERİ'}
                </h2>
                <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                  GÜNLÜK SATIŞ, FİNANSAL CİRO & Z-RAPORU ANALİZ MERKEZİ
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px] text-stone-500 dark:text-stone-400">
                  <span>📍 {settings.address}</span>
                  {settings.phone && <span>• 📞 {settings.phone}</span>}
                  {settings.taxNumber && <span>• 🏢 VKN: {settings.taxNumber}</span>}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-center">
              <button
                type="button"
                onClick={handleOpenZReport}
                className="flex-1 sm:flex-initial py-2.5 px-4 bg-purple-600 hover:bg-amber-500 text-white hover:text-stone-950 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg"
              >
                <Printer className="w-4 h-4" />
                <span>Z-Raporu (Termal)</span>
              </button>
              <button
                type="button"
                onClick={handleOpenDetailedReport}
                className="flex-1 sm:flex-initial py-2.5 px-4 bg-emerald-600 hover:bg-amber-500 text-white hover:text-stone-950 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Detaylı Rapor (A4)</span>
              </button>
            </div>
          </div>

          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            
            <div className="p-4 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                <span>BUGÜNKÜ TOPLAM CİRO</span>
                <DollarSign className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-black text-stone-900 dark:text-amber-400">
                {formatCurrency(totalRevenue, settings.currencySymbol)}
              </p>
              <p className="text-[11px] text-stone-400">{closedOrders.length} Kapanan Adisyon</p>
            </div>

            <div className="p-4 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                <span>TAHMİNİ NET KAR</span>
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {formatCurrency(estimatedProfit, settings.currencySymbol)}
              </p>
              <p className="text-[11px] text-stone-400">
                Maliyet: {formatCurrency(totalCost, settings.currencySymbol)} • Marj: %{profitMarginPercent.toFixed(1)}
              </p>
            </div>

            <div className="p-4 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                <span>TOPLAM KDV (%{settings.taxRatePercent})</span>
                <BarChart3 className="w-4 h-4 text-sky-500" />
              </div>
              <p className="text-2xl font-black text-stone-900 dark:text-stone-100">
                {formatCurrency(totalTax, settings.currencySymbol)}
              </p>
              <p className="text-[11px] text-stone-400">İskonto: {formatCurrency(totalDiscounts, settings.currencySymbol)}</p>
            </div>

            <div className="p-4 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xs space-y-2 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs font-semibold text-stone-500 dark:text-stone-400">
                <span>Z-RAPORU (TERMAL)</span>
                <Printer className="w-4 h-4 text-purple-500" />
              </div>
              <button
                type="button"
                onClick={handleOpenZReport}
                className="w-full py-2.5 px-3 bg-purple-600 hover:bg-amber-500 text-white hover:text-stone-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 group"
              >
                <Printer className="w-4 h-4 transition-transform group-hover:rotate-12" />
                <span>Z-Raporu Yazdır</span>
              </button>
            </div>

            <div className="p-4 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xs space-y-2 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs font-semibold text-stone-500 dark:text-stone-400">
                <span>DETAYLI RAPOR (A4)</span>
                <BarChart3 className="w-4 h-4 text-emerald-500" />
              </div>
              <button
                type="button"
                onClick={handleOpenDetailedReport}
                className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-amber-500 text-white hover:text-stone-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 group"
              >
                <BarChart3 className="w-4 h-4 transition-transform group-hover:scale-110" />
                <span>Detaylı Rapor Yazdır</span>
              </button>
            </div>

          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Hourly Sales Area Chart */}
            <div className="lg:col-span-2 bg-white dark:bg-stone-900 p-5 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xs space-y-4">
              <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-amber-500" />
                Gün İçi Saatlik Ciro Dağılımı
              </h3>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="hour" stroke="#888888" fontSize={12} />
                    <YAxis stroke="#888888" fontSize={12} />
                    <Tooltip
                      formatter={(val: number) => [`${val} ₺`, 'Ciro']}
                      contentStyle={{ backgroundColor: '#1c1917', borderRadius: '12px', border: 'none', color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="ciro" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Payment Method Pie Chart */}
            <div className="bg-white dark:bg-stone-900 p-5 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xs space-y-4">
              <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-emerald-500" />
                Ödeme Yöntemi Dağılımı
              </h3>

              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val: number) => [`${val} ₺`, 'Tutar']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2 text-xs">
                {pieData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                      <span className="text-stone-600 dark:text-stone-300">{item.name}</span>
                    </span>
                    <span className="font-bold text-stone-900 dark:text-stone-100">
                      {formatCurrency(item.value, settings.currencySymbol)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Detailed Product Sales & Net Profit Report Table */}
          <div className="bg-white dark:bg-stone-900 p-5 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xs space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3 border-b border-stone-100 dark:border-stone-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Coins className="w-5 h-5 text-emerald-500" />
                  Gün Sonu Ürün Bazlı Satış, Maliyet & Net Kâr Analizi
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">Hangi üründen kaç adet satıldığı, geliş fiyatı (maliyeti) ve toplam elde edilen kâr</p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Ürün veya kategori ara..."
                    value={productReportSearch}
                    onChange={(e) => setProductReportSearch(e.target.value)}
                    className="pl-9 pr-3 py-1.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs"
                  />
                </div>

                <select
                  value={productReportSort}
                  onChange={(e) => setProductReportSort(e.target.value as any)}
                  className="px-3 py-1.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-semibold text-stone-700 dark:text-stone-200"
                >
                  <option value="profit_desc">Sıralama: En Yüksek Net Kâr (₺)</option>
                  <option value="qty_desc">Sıralama: En Çok Satılan Adet</option>
                  <option value="revenue_desc">Sıralama: En Yüksek Ciro (₺)</option>
                  <option value="margin_desc">Sıralama: En Yüksek Kâr Marjı (%)</option>
                  <option value="name_asc">Sıralama: Ürün Adı (A-Z)</option>
                </select>
              </div>
            </div>

            {productProfitList.length === 0 ? (
              <div className="text-center py-8 text-stone-400 text-sm">
                Bugün kapatılmış adisyonlarda henüz satılmış ürün bulunmuyor.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-stone-50 dark:bg-stone-800/80 text-stone-500 dark:text-stone-400 text-xs font-semibold uppercase">
                    <tr>
                      <th className="p-3">Ürün Adı</th>
                      <th className="p-3">Kategori</th>
                      <th className="p-3 text-center">Satılan Miktar</th>
                      <th className="p-3 text-right">Satış Fiyatı</th>
                      <th className="p-3 text-right text-amber-600 dark:text-amber-400">Geliş / Alış (Maliyet)</th>
                      <th className="p-3 text-right">Toplam Ciro</th>
                      <th className="p-3 text-right">Toplam Maliyet</th>
                      <th className="p-3 text-right text-emerald-600 dark:text-emerald-400">Net Kâr</th>
                      <th className="p-3 text-center">Kâr Marjı</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                    {productProfitList.map((item) => (
                      <tr key={item.name} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/50 transition-colors">
                        <td className="p-3 font-bold text-stone-900 dark:text-stone-100">{item.name}</td>
                        <td className="p-3">
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                            {item.categoryName}
                          </span>
                        </td>
                        <td className="p-3 text-center font-bold text-stone-900 dark:text-stone-200">
                          {item.quantity} Adet
                        </td>
                        <td className="p-3 text-right font-medium text-stone-700 dark:text-stone-300">
                          {formatCurrency(item.unitPrice, settings.currencySymbol)}
                        </td>
                        <td className="p-3 text-right font-semibold text-amber-600 dark:text-amber-400">
                          {formatCurrency(item.unitCost, settings.currencySymbol)}
                        </td>
                        <td className="p-3 text-right font-bold text-stone-900 dark:text-stone-100">
                          {formatCurrency(item.totalRevenue, settings.currencySymbol)}
                        </td>
                        <td className="p-3 text-right font-medium text-stone-500">
                          {formatCurrency(item.totalCost, settings.currencySymbol)}
                        </td>
                        <td className="p-3 text-right font-black text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(item.totalProfit, settings.currencySymbol)}
                        </td>
                        <td className="p-3 text-center">
                          <span className={`text-xs px-2 py-0.5 rounded-md font-extrabold ${
                            item.marginPercent >= 50
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : item.marginPercent >= 20
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          }`}>
                            %{item.marginPercent.toFixed(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-stone-50 dark:bg-stone-800/90 font-extrabold border-t-2 border-stone-200 dark:border-stone-700">
                    <tr>
                      <td className="p-3 text-stone-900 dark:text-stone-100">GENEL TOPLAM</td>
                      <td className="p-3 text-stone-400 text-xs font-normal">{productProfitList.length} Çeşit Ürün</td>
                      <td className="p-3 text-center text-stone-900 dark:text-amber-400">{grandTotalReportQty} Adet</td>
                      <td className="p-3 text-right text-stone-400">-</td>
                      <td className="p-3 text-right text-stone-400">-</td>
                      <td className="p-3 text-right text-stone-900 dark:text-stone-100">{formatCurrency(grandTotalReportRev, settings.currencySymbol)}</td>
                      <td className="p-3 text-right text-stone-500">{formatCurrency(grandTotalReportCost, settings.currencySymbol)}</td>
                      <td className="p-3 text-right text-emerald-600 dark:text-emerald-400 text-base">{formatCurrency(grandTotalReportProfit, settings.currencySymbol)}</td>
                      <td className="p-3 text-center">
                        <span className="text-xs px-2 py-0.5 rounded-md bg-amber-500 text-stone-950">
                          %{grandTotalReportRev > 0 ? ((grandTotalReportProfit / grandTotalReportRev) * 100).toFixed(1) : '0'}
                        </span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB: INVOICES & EXPENSES MANAGEMENT */}
      {activeTab === 'invoices' && (
        <div className="space-y-6">
          
          {/* Header Summary & Quick Action */}
          <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 p-5 rounded-3xl border border-stone-800 shadow-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <FileText className="w-6 h-6" />
                </span>
                <h2 className="font-black text-white text-lg sm:text-xl">Fatura, Gider & Mal Alım Fişi Yönetimi</h2>
              </div>
              <p className="text-xs text-stone-400">
                Ödenen elektrik, su, internet, kira faturaları ve tedarikçilerden alınan mal alım fişleri kayıtları
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleOpenInvoiceReport}
                className="bg-stone-800 hover:bg-stone-700 text-stone-100 font-bold px-4 py-3 rounded-2xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border border-stone-700 shadow-md hover:scale-[1.02] active:scale-95"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                <span>🖨️ Fiş & Gider Raporu Yazdır (A4)</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenAddInvoiceModal && onOpenAddInvoiceModal()}
                className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-black px-5 py-3 rounded-2xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg hover:scale-[1.02] active:scale-95"
              >
                <PlusCircle className="w-5 h-5" />
                <span>➕ Fiş / Fatura Ödemesi Ekle</span>
              </button>
            </div>
          </div>

          {/* KPI Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-stone-900 p-4 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-stone-500">
                <span>💡 ÖDENEN İŞLETME FATURALARI</span>
                <Zap className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
                {formatCurrency(expenseInvoices.reduce((acc, e) => acc + (e.amount || 0), 0), settings.currencySymbol)}
              </div>
              <div className="text-[11px] text-stone-400 font-medium">
                {expenseInvoices.length} Adet Ödenmiş Fatura Kaydı
              </div>
            </div>

            <div className="bg-white dark:bg-stone-900 p-4 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-stone-500">
                <span>📦 MAL ALIM FİŞLERİ (DEPO)</span>
                <Receipt className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {formatCurrency(purchaseInvoices.reduce((acc, p) => acc + (p.totalAmount || 0), 0), settings.currencySymbol)}
              </div>
              <div className="text-[11px] text-stone-400 font-medium">
                {purchaseInvoices.length} Adet Mal Alım Fişi
              </div>
            </div>

            <div className="bg-white dark:bg-stone-900 p-4 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-stone-500">
                <span>💰 GENEL TOPLAM ÇIKIŞ (GİDER)</span>
                <Building2 className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
                {formatCurrency(
                  expenseInvoices.reduce((acc, e) => acc + (e.amount || 0), 0) +
                  purchaseInvoices.reduce((acc, p) => acc + (p.totalAmount || 0), 0),
                  settings.currencySymbol
                )}
              </div>
              <div className="text-[11px] text-stone-400 font-medium">
                Kasa / Banka Toplam Çıkışı
              </div>
            </div>
          </div>

          {/* Section 1: Ödenen İşletme Faturaları */}
          <div className="bg-white dark:bg-stone-900 p-5 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-500/20 text-amber-500 font-bold">
                  <Zap className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-extrabold text-base text-stone-900 dark:text-stone-100">
                    Ödenen İşletme Faturaları & Giderler
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Elektrik, Su, Doğalgaz, İnternet, İşyeri Kirası ve diğer ödenmiş fatura kayıtları
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onOpenAddInvoiceModal && onOpenAddInvoiceModal()}
                className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Yeni Fatura Ödemesi Ekle</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-extrabold uppercase border-y border-stone-200 dark:border-stone-700">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">Fatura / Gider Adı</th>
                    <th className="p-3">Kategori</th>
                    <th className="p-3">Abone / Fatura No</th>
                    <th className="p-3 text-right">Ödenen Tutar</th>
                    <th className="p-3 text-center">Ödeme Tarihi</th>
                    <th className="p-3 text-center">Ödeme Şekli</th>
                    <th className="p-3">Ödeyen / Sorumlu</th>
                    <th className="p-3">Açıklama / Not</th>
                    <th className="p-3 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {expenseInvoices.length > 0 ? (
                    expenseInvoices.map((exp, idx) => (
                      <tr key={exp.id || idx} className="hover:bg-stone-50 dark:hover:bg-stone-800/50">
                        <td className="p-3 font-bold text-stone-400">{idx + 1}</td>
                        <td className="p-3 font-extrabold text-stone-900 dark:text-stone-100">{exp.title}</td>
                        <td className="p-3">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50">
                            {exp.category === 'elektrik' ? '⚡ Elektrik' :
                             exp.category === 'su' ? '💧 Şebeke Su' :
                             exp.category === 'dogalgaz' ? '🔥 Doğalgaz' :
                             exp.category === 'internet' ? '🌐 İnternet' :
                             exp.category === 'kira' ? '🏢 İşyeri Kirası' :
                             exp.category === 'personel' ? '👥 Personel' :
                             exp.category === 'temizlik' ? '🧹 Temizlik' :
                             exp.category === 'tamirat' ? '🛠️ Bakım Onarım' : '📦 Genel Gider'}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-stone-600 dark:text-stone-400 font-bold">{exp.invoiceNo || '-'}</td>
                        <td className="p-3 text-right font-black text-rose-600 dark:text-rose-400 text-sm">
                          {formatCurrency(exp.amount, settings.currencySymbol)}
                        </td>
                        <td className="p-3 text-center font-bold text-stone-700 dark:text-stone-300">{exp.date}</td>
                        <td className="p-3 text-center">
                          {exp.paymentType === 'nakit' ? (
                            <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold px-2 py-0.5 rounded text-[10px] border border-emerald-200">Nakit Kasa</span>
                          ) : exp.paymentType === 'kredi_karti' ? (
                            <span className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold px-2 py-0.5 rounded text-[10px] border border-amber-200">POS / Kart</span>
                          ) : exp.paymentType === 'havale' ? (
                            <span className="bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 font-bold px-2 py-0.5 rounded text-[10px] border border-sky-200">Banka EFT</span>
                          ) : (
                            <span className="bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-bold px-2 py-0.5 rounded text-[10px] border border-purple-200">Veresiye</span>
                          )}
                        </td>
                        <td className="p-3 text-stone-700 dark:text-stone-300 font-medium">{exp.paidByName}</td>
                        <td className="p-3 text-stone-500 italic">{exp.notes || '-'}</td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => setEditingExpenseInvoice(exp)}
                              className="p-1.5 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition-colors cursor-pointer"
                              title="Faturayı Düzenle"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteExpense(exp)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                              title="Faturayı Sil"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={10} className="p-6 text-center text-stone-500 italic">
                        Henüz ödenmiş bir işletme fatura / gider kaydı bulunmamaktadır.
                      </td>
                    </tr>
                  )}
                </tbody>
                {expenseInvoices.length > 0 && (
                  <tfoot className="bg-stone-100 dark:bg-stone-800/80 font-bold border-t-2 border-stone-300 dark:border-stone-700">
                    <tr>
                      <td colSpan={4} className="p-3 text-stone-900 dark:text-stone-100 font-extrabold uppercase">TOPLAM ÖDENEN İŞLETME FATURALARI:</td>
                      <td className="p-3 text-right font-black text-rose-600 dark:text-rose-400 text-sm">
                        {formatCurrency(expenseInvoices.reduce((sum, e) => sum + (e.amount || 0), 0), settings.currencySymbol)}
                      </td>
                      <td colSpan={5}></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>

          {/* Section 2: Mal Alım Fişleri */}
          <div className="bg-white dark:bg-stone-900 p-5 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-500 font-bold">
                  <Receipt className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-extrabold text-base text-stone-900 dark:text-stone-100">
                    Gelen Mal Alım Fişleri & Depo Stok Girişleri
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Tedarikçilerden alınan et, sebze, içecek ve hammadde alım fişleri
                  </p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-extrabold uppercase border-y border-stone-200 dark:border-stone-700">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">Fiş / Fatura No</th>
                    <th className="p-3">Tedarikçi / Firma</th>
                    <th className="p-3">Alınan Ürün / Malzeme</th>
                    <th className="p-3 text-center">Gelen Miktar</th>
                    <th className="p-3 text-right">Birim Alış Fiyatı</th>
                    <th className="p-3 text-right">Toplam Fiş Tutarı</th>
                    <th className="p-3 text-center">Ödeme Şekli</th>
                    <th className="p-3">Giriş Yapan</th>
                    <th className="p-3 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {purchaseInvoices.length > 0 ? (
                    purchaseInvoices.map((inv, idx) => (
                      <tr key={inv.id || idx} className="hover:bg-stone-50 dark:hover:bg-stone-800/50">
                        <td className="p-3 font-bold text-stone-400">{idx + 1}</td>
                        <td className="p-3 font-mono font-bold text-amber-600 dark:text-amber-400">{inv.invoiceNo}</td>
                        <td className="p-3 font-extrabold text-stone-900 dark:text-stone-100">{inv.supplierName}</td>
                        <td className="p-3 font-bold text-stone-800 dark:text-stone-200">{inv.stockItemName}</td>
                        <td className="p-3 text-center font-extrabold text-stone-800 dark:text-stone-200">
                          {inv.quantity} {inv.unit}
                        </td>
                        <td className="p-3 text-right text-stone-700 dark:text-stone-300">
                          {formatCurrency(inv.unitPrice, settings.currencySymbol)}
                        </td>
                        <td className="p-3 text-right font-black text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(inv.totalAmount, settings.currencySymbol)}
                        </td>
                        <td className="p-3 text-center">
                          {inv.paymentType === 'nakit' ? (
                            <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold px-2 py-0.5 rounded text-[10px] border border-emerald-200">Nakit Kasa</span>
                          ) : inv.paymentType === 'kredi_karti' ? (
                            <span className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold px-2 py-0.5 rounded text-[10px] border border-amber-200">POS / Kart</span>
                          ) : inv.paymentType === 'havale' ? (
                            <span className="bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 font-bold px-2 py-0.5 rounded text-[10px] border border-sky-200">Banka EFT</span>
                          ) : (
                            <span className="bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-bold px-2 py-0.5 rounded text-[10px] border border-purple-200">Veresiye</span>
                          )}
                        </td>
                        <td className="p-3 text-stone-700 dark:text-stone-300">{inv.createdByName}</td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => setEditingPurchaseInvoice(inv)}
                              className="p-1.5 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition-colors cursor-pointer"
                              title="Fişi Düzenle"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeletePurchase(inv)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                              title="Fişi Sil"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={10} className="p-6 text-center text-stone-500 italic">
                        Henüz kayıtlı bir mal alım fişi bulunmamaktadır.
                      </td>
                    </tr>
                  )}
                </tbody>
                {purchaseInvoices.length > 0 && (
                  <tfoot className="bg-stone-100 dark:bg-stone-800/80 font-bold border-t-2 border-stone-300 dark:border-stone-700">
                    <tr>
                      <td colSpan={6} className="p-3 text-stone-900 dark:text-stone-100 font-extrabold uppercase">TOPLAM MAL ALIM FİŞLERİ TUTARI:</td>
                      <td className="p-3 text-right font-black text-emerald-600 dark:text-emerald-400 text-sm">
                        {formatCurrency(purchaseInvoices.reduce((sum, p) => sum + (p.totalAmount || 0), 0), settings.currencySymbol)}
                      </td>
                      <td colSpan={3}></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: MENU MANAGEMENT */}
      {activeTab === 'menu' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-stone-900 p-3 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-xs font-bold">
              <button
                onClick={() => setMenuSubTab('items')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                  menuSubTab === 'items'
                    ? 'bg-amber-500 text-stone-950 shadow-xs'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                }`}
              >
                <Utensils className="w-4 h-4" />
                <span>Ürün Listesi ({menuItems.length})</span>
              </button>

              <button
                onClick={() => setMenuSubTab('categories')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                  menuSubTab === 'categories'
                    ? 'bg-amber-500 text-stone-950 shadow-xs'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                }`}
              >
                <Tag className="w-4 h-4" />
                <span>Kategori Yönetimi ({categories.length})</span>
              </button>
            </div>

            {menuSubTab === 'items' ? (
              <button
                onClick={() => setShowAddMenuModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-stone-950 font-bold rounded-xl text-xs shadow-xs hover:bg-amber-400"
              >
                <Plus className="w-4 h-4" />
                <span>Yeni Ürün Ekle</span>
              </button>
            ) : (
              <button
                onClick={() => setShowAddCategoryModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-stone-950 font-bold rounded-xl text-xs shadow-xs hover:bg-amber-400"
              >
                <Plus className="w-4 h-4" />
                <span>Yeni Kategori Ekle</span>
              </button>
            )}
          </div>

          {menuSubTab === 'items' && (
            <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-2xs">
              <table className="w-full text-left text-sm">
                <thead className="bg-stone-50 dark:bg-stone-800/80 text-stone-500 dark:text-stone-400 text-xs font-semibold uppercase">
                  <tr>
                    <th className="p-4">Ürün Adı</th>
                    <th className="p-4">Kategori</th>
                    <th className="p-4">Satış Fiyatı</th>
                    <th className="p-4">Maliyet</th>
                    <th className="p-4">Mevcut Stok</th>
                    <th className="p-4 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {menuItems.map((item) => {
                    const cat = categories.find((c) => c.id === item.categoryId);
                    return (
                      <tr key={item.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/50">
                        <td className="p-4 font-bold text-stone-900 dark:text-stone-100">{item.name}</td>
                        <td className="p-4">
                          <span className="text-xs px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                            {cat?.name || 'Genel'}
                          </span>
                        </td>
                        <td className="p-4 font-extrabold text-amber-600 dark:text-amber-400">
                          {formatCurrency(item.price, settings.currencySymbol)}
                        </td>
                        <td className="p-4 text-stone-500">
                          {formatCurrency(item.costPrice, settings.currencySymbol)}
                        </td>
                        <td className="p-4">
                          <span className={`text-xs px-2 py-1 rounded-lg font-bold ${
                            item.stockQuantity <= item.minStockAlert ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {item.stockQuantity} {item.unit}
                          </span>
                        </td>
                        <td className="p-4 text-right flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEditMenuItem(item)}
                            className="p-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-xl transition-colors"
                            title="Ürün & Geliş Fiyatı Düzenle"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteMenuItem(item)}
                            className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
                            title="Ürünü Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {menuSubTab === 'categories' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => {
                const count = menuItems.filter((m) => m.categoryId === cat.id).length;
                return (
                  <div key={cat.id} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 shadow-2xs flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl">
                        <Tag className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-stone-900 dark:text-stone-100">{cat.name}</h4>
                        <p className="text-xs text-stone-500">{count} Çeşit Ürün Bağlı</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditCategory(cat)}
                        className="p-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-xl transition-colors"
                        title="Kategoriyi Düzenle"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                        className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
                        title="Kategoriyi Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: STOCK & INVENTORY */}
      {activeTab === 'stock' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4 bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800">
            <div>
              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">Hammadde ve Stok Takibi</h3>
              <p className="text-xs text-stone-500">Otomatik düşüm, kritik seviye uyarıları ve barkodlu koli stok girişi</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="bg-stone-100 dark:bg-stone-800 p-1 rounded-xl flex items-center gap-1 text-xs font-bold">
                <button
                  onClick={() => setStockSubTab('list')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    stockSubTab === 'list'
                      ? 'bg-amber-500 text-stone-950 shadow-xs'
                      : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
                  }`}
                >
                  Mevcut Stok Listesi ({stockItems.length})
                </button>
                <button
                  onClick={() => setStockSubTab('box_intake')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    stockSubTab === 'box_intake'
                      ? 'bg-amber-500 text-stone-950 shadow-xs'
                      : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
                  }`}
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>Koli Bazlı Stok Girişi</span>
                </button>
              </div>

              {stockSubTab === 'list' && (
                <button
                  onClick={() => setShowAddStockModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-stone-950 font-bold rounded-xl text-xs shadow-xs hover:bg-amber-400"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tekli Stok Girişi</span>
                </button>
              )}
            </div>
          </div>

          {stockSubTab === 'box_intake' ? (
            <BoxStockIntake
              stockItems={stockItems}
              onUpdateStockItems={onUpdateStockItems}
            />
          ) : (
            <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-2xs">
              <table className="w-full text-left text-sm">
                <thead className="bg-stone-50 dark:bg-stone-800/80 text-stone-500 dark:text-stone-400 text-xs font-semibold uppercase">
                  <tr>
                    <th className="p-4">Hammadde Adı</th>
                    <th className="p-4">Miktar</th>
                    <th className="p-4">Koli İçi Adet</th>
                    <th className="p-4">Koli Barkod</th>
                    <th className="p-4">Kritik Eşik</th>
                    <th className="p-4">Birim Maliyet</th>
                    <th className="p-4">Durum</th>
                    <th className="p-4 text-right">Sil</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {stockItems.map((stock) => {
                    const isCritical = stock.quantity <= stock.minThreshold;
                    return (
                      <tr key={stock.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/50">
                        <td className="p-4 font-bold text-stone-900 dark:text-stone-100">{stock.name}</td>
                        <td className="p-4 font-bold text-base">{stock.quantity} {stock.unit}</td>
                        <td className="p-4 text-xs font-semibold text-stone-600 dark:text-stone-300">
                          {stock.itemsPerBox ? `1 ${stock.boxUnitName || 'Koli'} = ${stock.itemsPerBox} ${stock.unit}` : '-'}
                        </td>
                        <td className="p-4 font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                          {stock.boxBarcode || '-'}
                        </td>
                        <td className="p-4 text-stone-500">{stock.minThreshold} {stock.unit}</td>
                        <td className="p-4">{formatCurrency(stock.costPerUnit, settings.currencySymbol)} / {stock.unit}</td>
                        <td className="p-4">
                          {isCritical ? (
                            <span className="text-xs font-bold px-2.5 py-1 bg-rose-500/10 text-rose-600 rounded-full border border-rose-500/20 flex items-center gap-1 w-fit">
                              <AlertTriangle className="w-3 h-3" />
                              Kritik Stok!
                            </span>
                          ) : (
                            <span className="text-xs font-bold px-2.5 py-1 bg-emerald-500/10 text-emerald-600 rounded-full border border-emerald-500/20 w-fit">
                              Yeterli
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEditStockItem(stock)}
                            className="p-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-xl transition-colors"
                            title="Stok & Geliş Fiyatı Düzenle"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteStockItem(stock)}
                            className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
                            title="Hammaddeyi Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: ORDER HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          {/* Header & Metrics */}
          <div className="flex items-center justify-between flex-wrap gap-4 bg-white dark:bg-stone-900 p-5 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xs">
            <div>
              <h3 className="text-lg font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <History className="w-5 h-5 text-amber-500" />
                <span>Geçmiş Adisyonlar ve Hesap Kayıtları</span>
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Kapanan hesaplar, tahsil edilen adisyonlar ve borç/veresiye kapatma kayıtları
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-stone-100 dark:bg-stone-800/80 px-3.5 py-2 rounded-2xl border border-stone-200 dark:border-stone-700/60 text-right">
                <div className="text-[10px] uppercase font-bold text-stone-400">Listelenen Kayıt</div>
                <div className="text-base font-black text-stone-900 dark:text-stone-100">
                  {orders.filter((o) => {
                    if (historyStatusFilter === 'closed' && o.status !== 'closed') return false;
                    if (historyStatusFilter === 'unpaid_debt' && o.status !== 'unpaid_debt') return false;
                    if (historyStatusFilter === 'open' && o.status !== 'open') return false;
                    if (historySearchQuery.trim()) {
                      const q = historySearchQuery.toLowerCase().trim();
                      const matchId = o.id.toLowerCase().includes(q);
                      const matchTable = o.tableName.toLowerCase().includes(q);
                      const matchZone = o.zoneName.toLowerCase().includes(q);
                      const matchWaiter = o.waiterName.toLowerCase().includes(q);
                      const matchItem = o.items.some((i) => i.name.toLowerCase().includes(q));
                      if (!matchId && !matchTable && !matchZone && !matchWaiter && !matchItem) return false;
                    }
                    if (historyDateFilter !== 'all') {
                      const orderDateStr = (o.closedAt || o.createdAt).slice(0, 10);
                      const todayStr = new Date().toISOString().slice(0, 10);
                      if (historyDateFilter === 'today') {
                        if (orderDateStr !== todayStr) return false;
                      } else if (historyDateFilter === 'yesterday') {
                        const yDate = new Date();
                        yDate.setDate(yDate.getDate() - 1);
                        if (orderDateStr !== yDate.toISOString().slice(0, 10)) return false;
                      } else if (historyDateFilter === 'week') {
                        const weekAgo = new Date();
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        if (new Date(o.closedAt || o.createdAt) < weekAgo) return false;
                      }
                    }
                    return true;
                  }).length} Adet
                </div>
              </div>

              <div className="bg-emerald-500/10 dark:bg-emerald-950/40 px-4 py-2 rounded-2xl border border-emerald-500/20 text-right">
                <div className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">Toplam Tutar</div>
                <div className="text-base font-black text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(
                    orders
                      .filter((o) => {
                        if (historyStatusFilter === 'closed' && o.status !== 'closed') return false;
                        if (historyStatusFilter === 'unpaid_debt' && o.status !== 'unpaid_debt') return false;
                        if (historyStatusFilter === 'open' && o.status !== 'open') return false;
                        if (historySearchQuery.trim()) {
                          const q = historySearchQuery.toLowerCase().trim();
                          const matchId = o.id.toLowerCase().includes(q);
                          const matchTable = o.tableName.toLowerCase().includes(q);
                          const matchZone = o.zoneName.toLowerCase().includes(q);
                          const matchWaiter = o.waiterName.toLowerCase().includes(q);
                          const matchItem = o.items.some((i) => i.name.toLowerCase().includes(q));
                          if (!matchId && !matchTable && !matchZone && !matchWaiter && !matchItem) return false;
                        }
                        if (historyDateFilter !== 'all') {
                          const orderDateStr = (o.closedAt || o.createdAt).slice(0, 10);
                          const todayStr = new Date().toISOString().slice(0, 10);
                          if (historyDateFilter === 'today') {
                            if (orderDateStr !== todayStr) return false;
                          } else if (historyDateFilter === 'yesterday') {
                            const yDate = new Date();
                            yDate.setDate(yDate.getDate() - 1);
                            if (orderDateStr !== yDate.toISOString().slice(0, 10)) return false;
                          } else if (historyDateFilter === 'week') {
                            const weekAgo = new Date();
                            weekAgo.setDate(weekAgo.getDate() - 7);
                            if (new Date(o.closedAt || o.createdAt) < weekAgo) return false;
                          }
                        }
                        return true;
                      })
                      .reduce((sum, o) => sum + o.totalAmount, 0),
                    settings.currencySymbol
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Filters Bar: Search, Status Tabs, and Date Filter */}
          <div className="bg-white dark:bg-stone-900 p-4 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Adisyon No, Masa, Garson veya Ürün Ara..."
                  value={historySearchQuery}
                  onChange={(e) => setHistorySearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl text-xs font-semibold text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
                {historySearchQuery && (
                  <button
                    onClick={() => setHistorySearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-0.5 rounded-full"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Status Segmented Buttons */}
              <div className="bg-stone-100 dark:bg-stone-800 p-1 rounded-2xl flex items-center gap-1 text-xs font-bold">
                <button
                  onClick={() => setHistoryStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    historyStatusFilter === 'all'
                      ? 'bg-amber-500 text-stone-950 shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                  }`}
                >
                  Tümü ({orders.length})
                </button>
                <button
                  onClick={() => setHistoryStatusFilter('closed')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    historyStatusFilter === 'closed'
                      ? 'bg-amber-500 text-stone-950 shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                  }`}
                >
                  Ödenenler ({orders.filter((o) => o.status === 'closed').length})
                </button>
                <button
                  onClick={() => setHistoryStatusFilter('unpaid_debt')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    historyStatusFilter === 'unpaid_debt'
                      ? 'bg-amber-500 text-stone-950 shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                  }`}
                >
                  Ödemeden Gitti ({orders.filter((o) => o.status === 'unpaid_debt').length})
                </button>
                <button
                  onClick={() => setHistoryStatusFilter('open')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    historyStatusFilter === 'open'
                      ? 'bg-amber-500 text-stone-950 shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                  }`}
                >
                  Açık Masalar ({orders.filter((o) => o.status === 'open').length})
                </button>
              </div>

              {/* Date Filter Dropdown */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-3 py-2 rounded-2xl text-xs font-semibold">
                  <Calendar className="w-3.5 h-3.5 text-stone-400" />
                  <select
                    value={historyDateFilter}
                    onChange={(e: any) => setHistoryDateFilter(e.target.value)}
                    className="bg-transparent text-stone-800 dark:text-stone-200 focus:outline-none cursor-pointer"
                  >
                    <option value="all">Tüm Tarihler</option>
                    <option value="today">Bugün</option>
                    <option value="yesterday">Dün</option>
                    <option value="week">Son 7 Gün</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-100 dark:bg-stone-800/80 text-stone-700 dark:text-stone-300 font-extrabold uppercase border-b border-stone-200 dark:border-stone-700">
                  <tr>
                    <th className="p-3.5">Adisyon No</th>
                    <th className="p-3.5">Masa & Salon</th>
                    <th className="p-3.5">Garson</th>
                    <th className="p-3.5 text-center">Tarih / Saat</th>
                    <th className="p-3.5 text-center">İçerik</th>
                    <th className="p-3.5 text-center">Durum</th>
                    <th className="p-3.5 text-center">Ödeme Yöntemi</th>
                    <th className="p-3.5 text-right">Tutar</th>
                    <th className="p-3.5 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {orders
                    .filter((o) => {
                      if (historyStatusFilter === 'closed' && o.status !== 'closed') return false;
                      if (historyStatusFilter === 'unpaid_debt' && o.status !== 'unpaid_debt') return false;
                      if (historyStatusFilter === 'open' && o.status !== 'open') return false;
                      if (historySearchQuery.trim()) {
                        const q = historySearchQuery.toLowerCase().trim();
                        const matchId = o.id.toLowerCase().includes(q);
                        const matchTable = o.tableName.toLowerCase().includes(q);
                        const matchZone = o.zoneName.toLowerCase().includes(q);
                        const matchWaiter = o.waiterName.toLowerCase().includes(q);
                        const matchItem = o.items.some((i) => i.name.toLowerCase().includes(q));
                        if (!matchId && !matchTable && !matchZone && !matchWaiter && !matchItem) return false;
                      }
                      if (historyDateFilter !== 'all') {
                        const orderDateStr = (o.closedAt || o.createdAt).slice(0, 10);
                        const todayStr = new Date().toISOString().slice(0, 10);
                        if (historyDateFilter === 'today') {
                          if (orderDateStr !== todayStr) return false;
                        } else if (historyDateFilter === 'yesterday') {
                          const yDate = new Date();
                          yDate.setDate(yDate.getDate() - 1);
                          if (orderDateStr !== yDate.toISOString().slice(0, 10)) return false;
                        } else if (historyDateFilter === 'week') {
                          const weekAgo = new Date();
                          weekAgo.setDate(weekAgo.getDate() - 7);
                          if (new Date(o.closedAt || o.createdAt) < weekAgo) return false;
                        }
                      }
                      return true;
                    })
                    .map((ord) => {
                      const totalItemCount = ord.items.reduce((s, i) => s + i.quantity, 0);
                      return (
                        <tr key={ord.id} className="hover:bg-stone-50/70 dark:hover:bg-stone-800/40 transition-colors">
                          <td className="p-3.5 font-mono font-bold text-amber-600 dark:text-amber-400">
                            {ord.id}
                          </td>
                          <td className="p-3.5">
                            <div className="font-extrabold text-stone-900 dark:text-stone-100">{ord.tableName}</div>
                            <div className="text-[10px] text-stone-400">{ord.zoneName}</div>
                          </td>
                          <td className="p-3.5 font-medium text-stone-700 dark:text-stone-300">
                            {ord.waiterName}
                          </td>
                          <td className="p-3.5 text-center text-stone-500 font-medium">
                            <div>{formatTime(ord.closedAt || ord.createdAt)}</div>
                            <div className="text-[10px] text-stone-400">{formatDate(ord.closedAt || ord.createdAt)}</div>
                          </td>
                          <td className="p-3.5 text-center">
                            <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 font-semibold text-stone-600 dark:text-stone-300 text-[11px]">
                              {totalItemCount} Kalem
                            </span>
                          </td>
                          <td className="p-3.5 text-center">
                            {ord.status === 'closed' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Ödendi (Kapalı)</span>
                              </span>
                            ) : ord.status === 'unpaid_debt' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60">
                                <AlertTriangle className="w-3 h-3" />
                                <span>Ödemeden Gitti (Borç)</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                                <Clock className="w-3 h-3" />
                                <span>Açık Masa</span>
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 text-center">
                            {ord.paymentType === 'nakit' ? (
                              <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold px-2 py-0.5 rounded text-[10px] border border-emerald-200">Nakit</span>
                            ) : ord.paymentType === 'kredi_karti' ? (
                              <span className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold px-2 py-0.5 rounded text-[10px] border border-amber-200">POS / Kredi Kartı</span>
                            ) : ord.paymentType === 'havale' ? (
                              <span className="bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 font-bold px-2 py-0.5 rounded text-[10px] border border-sky-200">Havale / EFT</span>
                            ) : (
                              <span className="text-stone-500 font-semibold">{ord.paymentType || '-'}</span>
                            )}
                          </td>
                          <td className="p-3.5 text-right font-black text-emerald-600 dark:text-emerald-400 text-sm">
                            {formatCurrency(ord.totalAmount, settings.currencySymbol)}
                          </td>
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => setViewingOrder(ord)}
                                className="p-1.5 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
                                title="Adisyon Detaylarını İncele"
                              >
                                <Eye className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                              </button>
                              <button
                                type="button"
                                onClick={() => onOpenPrintTicket(ord)}
                                className="p-1.5 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
                                title="Yeniden Yazdır"
                              >
                                <Printer className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteOrder(ord)}
                                className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                                title="Adisyonu Sil"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>

              {orders.filter((o) => {
                if (historyStatusFilter === 'closed' && o.status !== 'closed') return false;
                if (historyStatusFilter === 'unpaid_debt' && o.status !== 'unpaid_debt') return false;
                if (historyStatusFilter === 'open' && o.status !== 'open') return false;
                if (historySearchQuery.trim()) {
                  const q = historySearchQuery.toLowerCase().trim();
                  const matchId = o.id.toLowerCase().includes(q);
                  const matchTable = o.tableName.toLowerCase().includes(q);
                  const matchZone = o.zoneName.toLowerCase().includes(q);
                  const matchWaiter = o.waiterName.toLowerCase().includes(q);
                  const matchItem = o.items.some((i) => i.name.toLowerCase().includes(q));
                  if (!matchId && !matchTable && !matchZone && !matchWaiter && !matchItem) return false;
                }
                if (historyDateFilter !== 'all') {
                  const orderDateStr = (o.closedAt || o.createdAt).slice(0, 10);
                  const todayStr = new Date().toISOString().slice(0, 10);
                  if (historyDateFilter === 'today') {
                    if (orderDateStr !== todayStr) return false;
                  } else if (historyDateFilter === 'yesterday') {
                    const yDate = new Date();
                    yDate.setDate(yDate.getDate() - 1);
                    if (orderDateStr !== yDate.toISOString().slice(0, 10)) return false;
                  } else if (historyDateFilter === 'week') {
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    if (new Date(o.closedAt || o.createdAt) < weekAgo) return false;
                  }
                }
                return true;
              }).length === 0 && (
                <div className="p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-400 flex items-center justify-center mx-auto">
                    <History className="w-6 h-6" />
                  </div>
                  <div className="font-bold text-stone-700 dark:text-stone-300">
                    Aramanıza Uygun Adisyon Bulunamadı
                  </div>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto">
                    Arama kriterlerinizi veya tarih / durum filtrelerini değiştirerek tekrar deneyebilirsiniz.
                  </p>
                  {(historySearchQuery || historyStatusFilter !== 'all' || historyDateFilter !== 'all') && (
                    <button
                      onClick={() => {
                        setHistorySearchQuery('');
                        setHistoryStatusFilter('all');
                        setHistoryDateFilter('all');
                      }}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
                    >
                      Filtreleri Temizle
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: RESTAURANT SETTINGS */}
      {activeTab === 'settings' && canManageSettings && (
        <div className="space-y-6">
          {/* Sub Navigation Bar for Settings */}
          <div className="bg-white dark:bg-stone-900 p-3 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-xs font-bold">
              <button
                onClick={() => setSettingsSubTab('hardware')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                  settingsSubTab === 'hardware'
                    ? 'bg-amber-500 text-stone-950 shadow-xs'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                }`}
              >
                <Printer className="w-4 h-4" />
                <span>Yazıcı, Port & Barkod Okuyucu Donanımları</span>
              </button>

              <button
                onClick={() => setSettingsSubTab('general')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                  settingsSubTab === 'general'
                    ? 'bg-amber-500 text-stone-950 shadow-xs'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Genel İşletme & Fiş Ayarları</span>
              </button>

              <button
                onClick={() => setSettingsSubTab('zones')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                  settingsSubTab === 'zones'
                    ? 'bg-amber-500 text-stone-950 shadow-xs'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span>Salon, Bölge & Masa Düzeni ({zones.length} Bölge, {tables.length} Masa)</span>
              </button>
            </div>

            {settingsSubTab === 'zones' && (
              <button
                onClick={() => setShowAddZoneModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-stone-950 font-bold rounded-xl text-xs shadow-xs hover:bg-amber-400"
              >
                <Plus className="w-4 h-4" />
                <span>Yeni Salon/Bölge Ekle</span>
              </button>
            )}
          </div>

          {/* Sub Content 1: Hardware Settings */}
          {settingsSubTab === 'hardware' && (
            <HardwareSettings
              settings={settings}
              onUpdateSettings={onUpdateSettings}
            />
          )}

          {/* Sub Content 2: General Settings */}
          {settingsSubTab === 'general' && (
            <div className="bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xs max-w-2xl space-y-5">
              <div className="border-b border-stone-200 dark:border-stone-800 pb-3">
                <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-amber-500" />
                  <span>Genel İşletme, Logo & Fiş Ayarları</span>
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  İşletme adı ve logosu; ana giriş ekranında, üst navigasyon menüsünde ve adisyon fişlerinde doğrudan görünür.
                </p>
              </div>

              <div className="space-y-4 text-sm">
                {/* Business Name Field */}
                <div>
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center justify-between gap-1.5">
                    <span className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-amber-500" />
                      <span>İşletme / Restoran Adı (Uygulama & Menü Başlığı):</span>
                    </span>
                    <span className="text-[10px] font-normal text-stone-400">
                      {editSettingsForm.name.length}/100 Karakter
                    </span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    placeholder="Örn: Meriç Belediyesi Sosyal Tesisleri"
                    value={editSettingsForm.name}
                    onChange={(e) => setEditSettingsForm({ ...editSettingsForm, name: e.target.value })}
                    className="w-full mt-1.5 p-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl font-bold text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 outline-hidden"
                  />
                  <p className="text-[11px] text-stone-500 mt-1">
                    Bu isim giriş ekranında, sol/üst logoda ve fiş başlığında yer alır (Maksimum 100 karakter izin verilmektedir).
                  </p>
                </div>

                {/* Logo Management Field */}
                <div className="bg-stone-50 dark:bg-stone-800/60 p-4 rounded-2xl border border-stone-200 dark:border-stone-700 space-y-3">
                  <label className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-amber-500" />
                    <span>İşletme Logosu (Ana Giriş, Üst Menü & Adisyon Fişi):</span>
                  </label>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    {/* Logo Preview Box */}
                    <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 flex items-center justify-center overflow-hidden shrink-0 shadow-inner relative group">
                      {editSettingsForm.logoUrl ? (
                        <img
                          src={editSettingsForm.logoUrl}
                          alt="İşletme Logosu"
                          className="w-full h-full object-contain p-2"
                        />
                      ) : (
                        <div className="text-center p-2">
                          <Utensils className="w-8 h-8 text-stone-400 mx-auto mb-1" />
                          <span className="text-[10px] text-stone-400 font-medium block">Logo Yok</span>
                        </div>
                      )}
                    </div>

                    {/* Logo Upload & URL Options */}
                    <div className="flex-1 space-y-2.5 w-full">
                      <div className="flex flex-wrap items-center gap-2">
                        <label className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-xs transition-colors">
                          <Upload className="w-4 h-4" />
                          <span>Cihazdan Görsel / Logo Seç</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoFileUpload}
                            className="hidden"
                          />
                        </label>

                        {editSettingsForm.logoUrl && (
                          <button
                            type="button"
                            onClick={() => setEditSettingsForm((prev) => ({ ...prev, logoUrl: '' }))}
                            className="px-3 py-2 bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/60 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Logoyu Kaldır</span>
                          </button>
                        )}
                      </div>

                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-stone-400">
                          <LinkIcon className="w-3.5 h-3.5" />
                        </div>
                        <input
                          type="text"
                          placeholder="Veya İnternet Görsel URL Adresi (https://...)"
                          value={editSettingsForm.logoUrl || ''}
                          onChange={(e) => setEditSettingsForm({ ...editSettingsForm, logoUrl: e.target.value })}
                          className="w-full pl-8 pr-3 py-2 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl"
                        />
                      </div>
                      <p className="text-[10px] text-stone-500">
                        * PNG, JPG, SVG veya WebP formatında görsel yükleyebilirsiniz.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-500">Adres:</label>
                  <input
                    type="text"
                    value={editSettingsForm.address}
                    onChange={(e) => setEditSettingsForm({ ...editSettingsForm, address: e.target.value })}
                    className="w-full mt-1 p-2.5 bg-stone-50 dark:bg-stone-800 border rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-stone-500">Telefon:</label>
                    <input
                      type="text"
                      value={editSettingsForm.phone}
                      onChange={(e) => setEditSettingsForm({ ...editSettingsForm, phone: e.target.value })}
                      className="w-full mt-1 p-2.5 bg-stone-50 dark:bg-stone-800 border rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-500">KDV Oranı (%):</label>
                    <input
                      type="number"
                      value={editSettingsForm.taxRatePercent}
                      onChange={(e) => setEditSettingsForm({ ...editSettingsForm, taxRatePercent: parseFloat(e.target.value) || 10 })}
                      className="w-full mt-1 p-2.5 bg-stone-50 dark:bg-stone-800 border rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-500">Fiş Üst Notu:</label>
                  <input
                    type="text"
                    value={editSettingsForm.receiptHeaderNote || ''}
                    onChange={(e) => setEditSettingsForm({ ...editSettingsForm, receiptHeaderNote: e.target.value })}
                    className="w-full mt-1 p-2.5 bg-stone-50 dark:bg-stone-800 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-500">Fiş Altı Notu:</label>
                  <input
                    type="text"
                    value={editSettingsForm.receiptFooterNote}
                    onChange={(e) => setEditSettingsForm({ ...editSettingsForm, receiptFooterNote: e.target.value })}
                    className="w-full mt-1 p-2.5 bg-stone-50 dark:bg-stone-800 border rounded-xl"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onUpdateSettings(editSettingsForm);
                    alert('Ayarlar ve İşletme Logosu başarıyla kaydedildi!');
                  }}
                  className="mt-4 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-md w-full transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>İşletme Bilgilerini & Logoyu Kaydet</span>
                </button>
              </div>
            </div>
          )}

          {/* Sub Content 3: Zone & Table Layout Settings */}
          {settingsSubTab === 'zones' && (
            <div className="space-y-6">
              {zones.map((zone) => {
                const zoneTables = tables.filter((t) => t.zoneId === zone.id);
                return (
                  <div key={zone.id} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
                      <div>
                        <h4 className="font-extrabold text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
                          <span>{zone.name}</span>
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500">
                            {zoneTables.length} Masa
                          </span>
                        </h4>
                        {zone.description && (
                          <p className="text-xs text-stone-500 mt-0.5">{zone.description}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {canAddTable && (
                          <button
                            onClick={() => setAddTableZoneId(zone.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Masa Ekle</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenEditZone(zone)}
                          className="p-1.5 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-xl"
                          title="Salonu Düzenle"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteZone(zone.id, zone.name)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl"
                          title="Salonu Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Zone Tables Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {zoneTables.map((tbl) => (
                        <div
                          key={tbl.id}
                          className="bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60 rounded-2xl p-3 flex items-center justify-between"
                        >
                          <div>
                            <span className="font-bold text-sm text-stone-900 dark:text-stone-100 block">{tbl.number}</span>
                            <span className="text-[10px] text-stone-500 font-medium">{tbl.capacity} Kişilik</span>
                          </div>
                          <button
                            onClick={() => handleDeleteTable(tbl.id, tbl.number)}
                            className="p-1 text-stone-400 hover:text-rose-500 rounded-lg transition-colors"
                            title="Masayı Sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}

                      {zoneTables.length === 0 && (
                        <div className="col-span-full py-4 text-center text-xs text-stone-400 italic">
                          Bu salonda henüz masa eklenmedi. "Masa Ekle" butonuna tıklayarak masa ekleyebilirsiniz.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB: SALON & MASA YÖNETİMİ */}
      {activeTab === 'tables' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl">
                  <LayoutGrid className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-xl text-stone-900 dark:text-stone-100">
                  Salon, Bölge & Masa Yönetimi
                </h3>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 max-w-2xl">
                Restoranınızın alanlarını (Ana Salon, Bahçe, Teras, VIP vb.) tanımlayın, masa numaraları ve kapasitelerini ekleyin, düzenleyin veya silin.
              </p>
            </div>

            <div className="flex items-center flex-wrap gap-2 w-full md:w-auto">
              <button
                type="button"
                onClick={() => setShowAddZoneModal(true)}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold rounded-xl text-xs transition-colors shadow-xs"
              >
                <Building2 className="w-4 h-4 text-amber-500" />
                <span>+ Yeni Salon/Bölge Ekle</span>
              </button>

              {canAddTable && (
                <>
                  <button
                    type="button"
                    onClick={() => setAddTableZoneId(zones[0]?.id || '')}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold rounded-xl text-xs transition-colors shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Masa Ekle</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setBulkZoneId(zones[0]?.id || '');
                      setShowBulkAddTablesModal(true);
                    }}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3.5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
                    title="Aynı anda birden çok masayı sıralı ekleyin"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Toplu Masa Ekle</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 shadow-2xs">
              <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">Toplam Salon / Alan</span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-2xl font-black text-stone-900 dark:text-stone-100">{zones.length}</span>
                <Building2 className="w-5 h-5 text-amber-500/70" />
              </div>
            </div>

            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 shadow-2xs">
              <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">Toplam Masa</span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-2xl font-black text-stone-900 dark:text-stone-100">{tables.length}</span>
                <LayoutGrid className="w-5 h-5 text-blue-500/70" />
              </div>
            </div>

            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 shadow-2xs">
              <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">Boş Masalar</span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {tables.filter((t) => t.status === 'empty').length}
                </span>
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 shadow-2xs">
              <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">Dolu / Açık Hesap</span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-2xl font-black text-rose-600 dark:text-rose-400">
                  {tables.filter((t) => t.status === 'occupied' || t.status === 'bill_requested').length}
                </span>
                <span className="w-3 h-3 rounded-full bg-rose-500" />
              </div>
            </div>
          </div>

          {/* Search and Filter Controls */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-3 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Masa no veya salon ara..."
                  value={tableSearchQuery}
                  onChange={(e) => setTableSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-800 dark:text-stone-200 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
                {tableSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setTableSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs font-semibold">
                <span className="text-stone-400 text-[11px] mr-1 hidden md:inline">Durum:</span>
                {(
                  [
                    { id: 'all', label: `Tümü (${tables.length})` },
                    { id: 'empty', label: `Boş (${tables.filter((t) => t.status === 'empty').length})`, dot: 'bg-emerald-500' },
                    { id: 'occupied', label: `Dolu (${tables.filter((t) => t.status === 'occupied').length})`, dot: 'bg-rose-500' },
                    { id: 'bill_requested', label: `Hesap (${tables.filter((t) => t.status === 'bill_requested').length})`, dot: 'bg-amber-500' },
                    { id: 'reserved', label: `Rezerve (${tables.filter((t) => t.status === 'reserved').length})`, dot: 'bg-purple-500' },
                  ] as const
                ).map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setTableStatusFilter(st.id)}
                    className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 ${
                      tableStatusFilter === st.id
                        ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-950 font-bold'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                    }`}
                  >
                    {'dot' in st && <span className={`w-2 h-2 rounded-full ${st.dot}`} />}
                    <span>{st.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Salon / Zone Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pt-1 border-t border-stone-100 dark:border-stone-800 pb-1">
              <span className="text-stone-400 text-[11px] font-semibold whitespace-nowrap">Salon Filtresi:</span>
              <button
                type="button"
                onClick={() => setSelectedZoneFilter('all')}
                className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedZoneFilter === 'all'
                    ? 'bg-amber-500 text-stone-950 shadow-2xs'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                }`}
              >
                Tüm Salonlar ({tables.length})
              </button>
              {zones.map((z) => {
                const count = tables.filter((t) => t.zoneId === z.id).length;
                return (
                  <button
                    key={z.id}
                    type="button"
                    onClick={() => setSelectedZoneFilter(z.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      selectedZoneFilter === z.id
                        ? 'bg-amber-500 text-stone-950 shadow-2xs'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                    }`}
                  >
                    {z.name} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Zones & Tables List */}
          {zones.length === 0 ? (
            <div className="bg-white dark:bg-stone-900 border border-dashed border-stone-300 dark:border-stone-700 rounded-3xl p-12 text-center space-y-4">
              <div className="w-14 h-14 mx-auto bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center">
                <Building2 className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-lg text-stone-900 dark:text-stone-100">
                  Henüz Salon veya Bölge Tanımlanmadı
                </h4>
                <p className="text-xs text-stone-500 max-w-md mx-auto">
                  Masa ekleyebilmek için öncelikle en az bir salon veya bölge (örn: Ana Salon, Bahçe, Teras) oluşturmalısınız.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddZoneModal(true)}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-xs rounded-xl shadow-xs inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>İlk Salonu Oluştur</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {zones
                .filter((z) => selectedZoneFilter === 'all' || z.id === selectedZoneFilter)
                .map((zone) => {
                  const allZoneTables = tables.filter((t) => t.zoneId === zone.id);
                  const filteredZoneTables = allZoneTables.filter((t) => {
                    const matchesSearch =
                      !tableSearchQuery.trim() ||
                      t.number.toLowerCase().includes(tableSearchQuery.trim().toLowerCase()) ||
                      zone.name.toLowerCase().includes(tableSearchQuery.trim().toLowerCase());
                    const matchesStatus =
                      tableStatusFilter === 'all' || t.status === tableStatusFilter;
                    return matchesSearch && matchesStatus;
                  });

                  const occupiedCount = allZoneTables.filter(
                    (t) => t.status === 'occupied' || t.status === 'bill_requested'
                  ).length;
                  const emptyCount = allZoneTables.filter((t) => t.status === 'empty').length;

                  return (
                    <div
                      key={zone.id}
                      className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-2xs space-y-4"
                    >
                      {/* Zone Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-4">
                        <div>
                          <div className="flex items-center gap-2.5">
                            <h4 className="font-extrabold text-lg text-stone-900 dark:text-stone-100 flex items-center gap-2">
                              <span>{zone.name}</span>
                            </h4>
                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                              {allZoneTables.length} Masa
                            </span>
                            {occupiedCount > 0 && (
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                                {occupiedCount} Dolu
                              </span>
                            )}
                            {emptyCount > 0 && (
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                {emptyCount} Boş
                              </span>
                            )}
                          </div>
                          {zone.description && (
                            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                              {zone.description}
                            </p>
                          )}
                        </div>

                        {/* Zone Actions */}
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          {canAddTable && (
                            <button
                              type="button"
                              onClick={() => setAddTableZoneId(zone.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold text-xs rounded-xl border border-amber-500/30 transition-colors"
                              title="Bu salona yeni masa ekle"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Masa Ekle</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleOpenEditZone(zone)}
                            className="p-1.5 text-stone-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-xl transition-colors"
                            title="Salon Bilgilerini Düzenle"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteZone(zone.id, zone.name)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
                            title="Salonu ve Masalarını Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Zone Tables Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {filteredZoneTables.map((tbl) => {
                          const statusConfig = {
                            empty: {
                              bg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
                              label: 'Boş',
                              dot: 'bg-emerald-500',
                            },
                            occupied: {
                              bg: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20',
                              label: 'Dolu',
                              dot: 'bg-rose-500',
                            },
                            bill_requested: {
                              bg: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
                              label: 'Hesap İstendi',
                              dot: 'bg-amber-500',
                            },
                            reserved: {
                              bg: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
                              label: 'Rezerve',
                              dot: 'bg-purple-500',
                            },
                          }[tbl.status] || {
                            bg: 'bg-stone-100 text-stone-600 border-stone-200',
                            label: 'Boş',
                            dot: 'bg-stone-400',
                          };

                          return (
                            <div
                              key={tbl.id}
                              className="bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60 rounded-2xl p-3.5 flex flex-col justify-between gap-3 hover:border-amber-500/40 transition-colors shadow-2xs group"
                            >
                              <div className="flex items-start justify-between gap-1">
                                <div>
                                  <span className="font-extrabold text-sm text-stone-900 dark:text-stone-100 block">
                                    {tbl.number}
                                  </span>
                                  <div className="flex items-center gap-1 text-[11px] text-stone-500 font-medium mt-0.5">
                                    <Users className="w-3 h-3 text-stone-400" />
                                    <span>{tbl.capacity} Kişilik</span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditTable(tbl)}
                                    className="p-1 text-stone-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition-colors"
                                    title="Masayı Düzenle"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteTable(tbl.id, tbl.number)}
                                    className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                                    title="Masayı Sil"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              <div className="flex items-center justify-between pt-1 border-t border-stone-200/60 dark:border-stone-700/40 text-[10px]">
                                <span
                                  className={`px-2 py-0.5 rounded-full font-bold border flex items-center gap-1 ${statusConfig.bg}`}
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                                  <span>{statusConfig.label}</span>
                                </span>
                              </div>
                            </div>
                          );
                        })}

                        {filteredZoneTables.length === 0 && (
                          <div className="col-span-full py-8 text-center text-xs text-stone-400 italic bg-stone-50/50 dark:bg-stone-800/30 rounded-2xl border border-dashed border-stone-200 dark:border-stone-800 space-y-2">
                            <p>
                              {allZoneTables.length === 0
                                ? 'Bu salonda henüz masa eklenmedi.'
                                : 'Arama veya filtre kriterine uygun masa bulunamadı.'}
                            </p>
                            {allZoneTables.length === 0 && canAddTable && (
                              <button
                                type="button"
                                onClick={() => setAddTableZoneId(zone.id)}
                                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs shadow-xs inline-flex items-center gap-1.5"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>+ Bu Salona İlk Masayı Ekle</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* TAB: USER MANAGEMENT & PERMISSIONS */}
      {activeTab === 'users' && (
        <UserManagement users={users} onUpdateUsers={onUpdateUsers} />
      )}

      {/* TAB: KASA SUNUCUSU & YEREL SQLITE VERİTABANI */}
      {activeTab === 'server' && canManageServer && (
        <LocalDatabaseManager onResetData={() => {
          if (confirm('Tüm veritabanı fabrika ayarlarına sıfırlansın mı?')) {
            StorageService.resetAllToDefaults().then(() => window.location.reload());
          }
        }} />
      )}


      {/* Add Menu Item Modal */}
      {showAddMenuModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateMenuItem} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100">Yeni Menü Ürünü Ekle</h3>
              <button
                type="button"
                onClick={() => setShowAddMenuModal(false)}
                className="p-1 text-stone-400 hover:text-stone-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-500">Ürün Adı:</label>
              <input
                type="text"
                required
                placeholder="Örn: Serpe Kahvaltı, Latte, Tost..."
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="w-full mt-1 p-2.5 bg-stone-50 dark:bg-stone-800 border rounded-xl text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-stone-500">Satış Fiyatı (₺):</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  placeholder="0.00"
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-stone-50 dark:bg-stone-800 border rounded-xl text-sm font-bold text-amber-600 dark:text-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-amber-600 dark:text-amber-400">Geliş / Alış Fiyatı (₺):</label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="0.00"
                  value={newItemCost}
                  onChange={(e) => setNewItemCost(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-stone-50 dark:bg-stone-800 border border-amber-300 dark:border-amber-700/50 rounded-xl text-sm font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-stone-500">Kategori:</label>
                <select
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-stone-50 dark:bg-stone-800 border rounded-xl text-sm"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-500">Birim:</label>
                <select
                  value={newItemUnit}
                  onChange={(e) => setNewItemUnit(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-stone-50 dark:bg-stone-800 border rounded-xl text-sm"
                >
                  <option value="Porsiyon">Porsiyon</option>
                  <option value="Adet">Adet</option>
                  <option value="Bardak">Bardak</option>
                  <option value="Dilim">Dilim</option>
                  <option value="Kutu">Kutu</option>
                  <option value="Şişe">Şişe</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-500">Başlangıç Stok Miktarı:</label>
              <input
                type="number"
                value={newItemStock}
                onChange={(e) => setNewItemStock(e.target.value)}
                className="w-full mt-1 p-2.5 bg-stone-50 dark:bg-stone-800 border rounded-xl text-sm"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setShowAddMenuModal(false)}
                className="px-4 py-2 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-xl text-sm font-semibold"
              >
                İptal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-sm shadow-xs"
              >
                Ürünü Kaydet
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Menu Item Modal */}
      {editingMenuItem && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSaveEditedMenuItem} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100">Menü Ürününü Düzenle</h3>
              <button
                type="button"
                onClick={() => setEditingMenuItem(null)}
                className="p-1 text-stone-400 hover:text-stone-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-500">Ürün Adı:</label>
              <input
                type="text"
                required
                value={editItemName}
                onChange={(e) => setEditItemName(e.target.value)}
                className="w-full mt-1 p-2.5 bg-stone-50 dark:bg-stone-800 border rounded-xl text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-stone-500">Satış Fiyatı (₺):</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={editItemPrice}
                  onChange={(e) => setEditItemPrice(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-stone-50 dark:bg-stone-800 border rounded-xl text-sm font-bold text-amber-600 dark:text-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-amber-600 dark:text-amber-400">Geliş / Alış Fiyatı (₺):</label>
                <input
                  type="number"
                  step="0.5"
                  value={editItemCost}
                  onChange={(e) => setEditItemCost(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-stone-50 dark:bg-stone-800 border border-amber-300 dark:border-amber-700/50 rounded-xl text-sm font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-stone-500">Kategori:</label>
                <select
                  value={editItemCategory}
                  onChange={(e) => setEditItemCategory(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-stone-50 dark:bg-stone-800 border rounded-xl text-sm"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-500">Birim:</label>
                <select
                  value={editItemUnit}
                  onChange={(e) => setEditItemUnit(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-stone-50 dark:bg-stone-800 border rounded-xl text-sm"
                >
                  <option value="Porsiyon">Porsiyon</option>
                  <option value="Adet">Adet</option>
                  <option value="Bardak">Bardak</option>
                  <option value="Dilim">Dilim</option>
                  <option value="Kutu">Kutu</option>
                  <option value="Şişe">Şişe</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-500">Stok Miktarı:</label>
              <input
                type="number"
                value={editItemStock}
                onChange={(e) => setEditItemStock(e.target.value)}
                className="w-full mt-1 p-2.5 bg-stone-50 dark:bg-stone-800 border rounded-xl text-sm"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setEditingMenuItem(null)}
                className="px-4 py-2 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-xl text-sm font-semibold"
              >
                İptal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-sm shadow-xs"
              >
                Değişiklikleri Kaydet
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Stock Item Modal */}
      {showAddStockModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateStockItem} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100">Yeni Hammadde / Stok Girişi</h3>
              <button
                type="button"
                onClick={() => setShowAddStockModal(false)}
                className="p-1 text-stone-400 hover:text-stone-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-500">Malzeme / Hammadde Adı:</label>
              <input
                type="text"
                required
                placeholder="Örn: Çekirdek Kahve, Süt, Dondurulmuş Patates..."
                value={newStockName}
                onChange={(e) => setNewStockName(e.target.value)}
                className="w-full mt-1 p-2.5 bg-stone-50 dark:bg-stone-800 border rounded-xl text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-stone-500">Mevcut Miktar:</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  placeholder="0.0"
                  value={newStockQty}
                  onChange={(e) => setNewStockQty(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-stone-50 dark:bg-stone-800 border rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-500">Birim:</label>
                <select
                  value={newStockUnit}
                  onChange={(e) => setNewStockUnit(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-stone-50 dark:bg-stone-800 border rounded-xl text-sm"
                >
                  <option value="kg">kg</option>
                  <option value="lt">lt</option>
                  <option value="adet">adet</option>
                  <option value="paket">paket</option>
                  <option value="koli">koli</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-amber-600 dark:text-amber-400">Birim Geliş / Alış Fiyatı (₺):</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="0.00"
                  value={newStockCost}
                  onChange={(e) => setNewStockCost(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-stone-50 dark:bg-stone-800 border border-amber-300 dark:border-amber-700/50 rounded-xl text-sm font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-500">Kritik Stok Uyarısı (Eşik):</label>
                <input
                  type="number"
                  step="0.1"
                  value={newStockMin}
                  onChange={(e) => setNewStockMin(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-stone-50 dark:bg-stone-800 border rounded-xl text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setShowAddStockModal(false)}
                className="px-4 py-2 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-xl text-sm font-semibold"
              >
                İptal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-sm shadow-xs"
              >
                Stoku Kaydet
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Stock Item Modal */}
      {editingStockItem && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSaveEditedStockItem} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100">Hammadde & Stok Bilgisi Düzenle</h3>
              <button
                type="button"
                onClick={() => setEditingStockItem(null)}
                className="p-1 text-stone-400 hover:text-stone-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-500">Malzeme Adı:</label>
              <input
                type="text"
                required
                value={editStockName}
                onChange={(e) => setEditStockName(e.target.value)}
                className="w-full mt-1 p-2.5 bg-stone-50 dark:bg-stone-800 border rounded-xl text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-stone-500">Mevcut Miktar:</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={editStockQty}
                  onChange={(e) => setEditStockQty(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-stone-50 dark:bg-stone-800 border rounded-xl text-sm font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-500">Birim:</label>
                <select
                  value={editStockUnit}
                  onChange={(e) => setEditStockUnit(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-stone-50 dark:bg-stone-800 border rounded-xl text-sm"
                >
                  <option value="kg">kg</option>
                  <option value="lt">lt</option>
                  <option value="adet">adet</option>
                  <option value="paket">paket</option>
                  <option value="koli">koli</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-amber-600 dark:text-amber-400">Birim Geliş / Alış Fiyatı (₺):</label>
                <input
                  type="number"
                  step="0.1"
                  value={editStockCostPerUnit}
                  onChange={(e) => setEditStockCostPerUnit(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-stone-50 dark:bg-stone-800 border border-amber-300 dark:border-amber-700/50 rounded-xl text-sm font-bold text-amber-600 dark:text-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-500">Kritik Stok Uyarısı (Eşik):</label>
                <input
                  type="number"
                  step="0.1"
                  value={editStockMinThreshold}
                  onChange={(e) => setEditStockMinThreshold(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-stone-50 dark:bg-stone-800 border rounded-xl text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setEditingStockItem(null)}
                className="px-4 py-2 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-xl text-sm font-semibold"
              >
                İptal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-sm shadow-xs"
              >
                Değişiklikleri Kaydet
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Category Modal */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateCategory} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100">Yeni Kategori Ekle</h3>
              <button
                type="button"
                onClick={() => setShowAddCategoryModal(false)}
                className="p-1 text-stone-400 hover:text-stone-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-500">Kategori Adı:</label>
              <input
                type="text"
                required
                placeholder="Örn: Sıcak İçecekler, Tatlılar..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="w-full mt-1 p-2.5 bg-stone-50 dark:bg-stone-800 border rounded-xl text-sm"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setShowAddCategoryModal(false)}
                className="px-4 py-2 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-xl text-sm font-semibold"
              >
                İptal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-sm shadow-xs"
              >
                Kategori Oluştur
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Category Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSaveEditedCategory} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100">Kategoriyi Düzenle</h3>
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                className="p-1 text-stone-400 hover:text-stone-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-500">Kategori Adı:</label>
              <input
                type="text"
                required
                value={editCategoryName}
                onChange={(e) => setEditCategoryName(e.target.value)}
                className="w-full mt-1 p-2.5 bg-stone-50 dark:bg-stone-800 border rounded-xl text-sm font-bold"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                className="px-4 py-2 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-xl text-sm font-semibold"
              >
                İptal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-sm shadow-xs"
              >
                Değişiklikleri Kaydet
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Zone Modal */}
      {showAddZoneModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateZone} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100">Yeni Salon / Bölge Ekle</h3>
              <button
                type="button"
                onClick={() => setShowAddZoneModal(false)}
                className="p-1 text-stone-400 hover:text-stone-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-500">Salon / Bölge Adı:</label>
              <input
                type="text"
                required
                placeholder="Örn: Teras, İç Salon, Bahçe..."
                value={newZoneName}
                onChange={(e) => setNewZoneName(e.target.value)}
                className="w-full mt-1 p-2.5 bg-stone-50 dark:bg-stone-800 border rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-500">Açıklama (Opsiyonel):</label>
              <input
                type="text"
                placeholder="Örn: Sigara içilebilir alan"
                value={newZoneDesc}
                onChange={(e) => setNewZoneDesc(e.target.value)}
                className="w-full mt-1 p-2.5 bg-stone-50 dark:bg-stone-800 border rounded-xl text-sm"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setShowAddZoneModal(false)}
                className="px-4 py-2 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-xl text-sm font-semibold"
              >
                İptal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-sm shadow-xs"
              >
                Salon Oluştur
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Zone Modal */}
      {editingZone && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSaveEditedZone} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100">Salon / Bölgeyi Düzenle</h3>
              <button
                type="button"
                onClick={() => setEditingZone(null)}
                className="p-1 text-stone-400 hover:text-stone-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-500">Salon / Bölge Adı:</label>
              <input
                type="text"
                required
                value={editZoneName}
                onChange={(e) => setEditZoneName(e.target.value)}
                className="w-full mt-1 p-2.5 bg-stone-50 dark:bg-stone-800 border rounded-xl text-sm font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-500">Açıklama:</label>
              <input
                type="text"
                value={editZoneDesc}
                onChange={(e) => setEditZoneDesc(e.target.value)}
                className="w-full mt-1 p-2.5 bg-stone-50 dark:bg-stone-800 border rounded-xl text-sm"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setEditingZone(null)}
                className="px-4 py-2 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-xl text-sm font-semibold"
              >
                İptal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-sm shadow-xs"
              >
                Değişiklikleri Kaydet
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Table Modal */}
      {addTableZoneId && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleAddTableToZone} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-500" />
                <span>Yeni Masa Ekle</span>
              </h3>
              <button
                type="button"
                onClick={() => setAddTableZoneId(null)}
                className="p-1 text-stone-400 hover:text-stone-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-500">Salon / Bölge Seçin:</label>
              <select
                required
                value={addTableZoneId}
                onChange={(e) => setAddTableZoneId(e.target.value)}
                className="w-full mt-1 p-2.5 bg-stone-50 dark:bg-stone-800 border rounded-xl text-sm font-semibold text-stone-900 dark:text-stone-100"
              >
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-500">Masa Numarası / Adı:</label>
              <input
                type="text"
                required
                placeholder="Örn: M-12, Teras-3, Bahçe-1, VIP-2..."
                value={addTableNum}
                onChange={(e) => setAddTableNum(e.target.value)}
                className="w-full mt-1 p-2.5 bg-stone-50 dark:bg-stone-800 border rounded-xl text-sm font-bold text-stone-900 dark:text-stone-100"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-500">Kapasite (Kişilik):</label>
              <input
                type="number"
                min="1"
                required
                value={addTableCap}
                onChange={(e) => setAddTableCap(e.target.value)}
                className="w-full mt-1 p-2.5 bg-stone-50 dark:bg-stone-800 border rounded-xl text-sm text-stone-900 dark:text-stone-100"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setAddTableZoneId(null)}
                className="px-4 py-2 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-xl text-sm font-semibold"
              >
                İptal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-sm shadow-xs"
              >
                Masa Ekle
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Table Modal */}
      {editingTable && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSaveEditedTable} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-500" />
                <span>Masayı Düzenle ({editingTable.number})</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingTable(null)}
                className="p-1 text-stone-400 hover:text-stone-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-500">Ait Olduğu Salon / Bölge:</label>
              <select
                required
                value={editTableZoneId}
                onChange={(e) => setEditTableZoneId(e.target.value)}
                className="w-full mt-1 p-2.5 bg-stone-50 dark:bg-stone-800 border rounded-xl text-sm font-semibold text-stone-900 dark:text-stone-100"
              >
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-500">Masa Numarası / Adı:</label>
              <input
                type="text"
                required
                value={editTableNum}
                onChange={(e) => setEditTableNum(e.target.value)}
                className="w-full mt-1 p-2.5 bg-stone-50 dark:bg-stone-800 border rounded-xl text-sm font-bold text-stone-900 dark:text-stone-100"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-500">Kapasite (Kişilik):</label>
              <input
                type="number"
                min="1"
                required
                value={editTableCap}
                onChange={(e) => setEditTableCap(e.target.value)}
                className="w-full mt-1 p-2.5 bg-stone-50 dark:bg-stone-800 border rounded-xl text-sm text-stone-900 dark:text-stone-100"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setEditingTable(null)}
                className="px-4 py-2 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-xl text-sm font-semibold"
              >
                İptal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-sm shadow-xs"
              >
                Değişiklikleri Kaydet
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bulk Add Tables Modal */}
      {showBulkAddTablesModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleBulkAddTables} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                <span>Hızlı Toplu Masa Ekle</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowBulkAddTablesModal(false)}
                className="p-1 text-stone-400 hover:text-stone-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-500">Eklenecek Salon / Bölge:</label>
              <select
                required
                value={bulkZoneId || zones[0]?.id || ''}
                onChange={(e) => setBulkZoneId(e.target.value)}
                className="w-full mt-1 p-2.5 bg-stone-50 dark:bg-stone-800 border rounded-xl text-sm font-semibold text-stone-900 dark:text-stone-100"
              >
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-stone-500">Masa Ön Eki:</label>
                <input
                  type="text"
                  value={bulkPrefix}
                  onChange={(e) => setBulkPrefix(e.target.value)}
                  placeholder="Örn: Masa , B-, T-"
                  className="w-full mt-1 p-2.5 bg-stone-50 dark:bg-stone-800 border rounded-xl text-sm text-stone-900 dark:text-stone-100"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-500">Başlangıç No:</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={bulkStartNum}
                  onChange={(e) => setBulkStartNum(parseInt(e.target.value) || 1)}
                  className="w-full mt-1 p-2.5 bg-stone-50 dark:bg-stone-800 border rounded-xl text-sm text-stone-900 dark:text-stone-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-stone-500">Masa Sayısı (Adet):</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  required
                  value={bulkCount}
                  onChange={(e) => setBulkCount(parseInt(e.target.value) || 1)}
                  className="w-full mt-1 p-2.5 bg-stone-50 dark:bg-stone-800 border rounded-xl text-sm text-stone-900 dark:text-stone-100"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-500">Kişi Kapasitesi:</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={bulkCapacity}
                  onChange={(e) => setBulkCapacity(parseInt(e.target.value) || 4)}
                  className="w-full mt-1 p-2.5 bg-stone-50 dark:bg-stone-800 border rounded-xl text-sm text-stone-900 dark:text-stone-100"
                />
              </div>
            </div>

            {/* Preview */}
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400 block mb-1">
                Oluşturulacak Masalar Önizleme:
              </span>
              <div className="text-xs text-stone-700 dark:text-stone-300 flex flex-wrap gap-1">
                {Array.from({ length: Math.min(bulkCount, 8) }).map((_, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-white dark:bg-stone-800 rounded-md font-mono text-[11px] border border-stone-200 dark:border-stone-700"
                  >
                    {bulkPrefix}
                    {bulkStartNum + i}
                  </span>
                ))}
                {bulkCount > 8 && (
                  <span className="text-[11px] text-stone-500 self-center">
                    ... ve {bulkCount - 8} adet daha
                  </span>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setShowBulkAddTablesModal(false)}
                className="px-4 py-2 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-xl text-sm font-semibold"
              >
                İptal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-sm shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>{bulkCount} Masayı Ekle</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Z-Report Modal Overlay & Thermal Receipt */}
      {showZReportModal && (
        <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-md w-full p-6 text-stone-100 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-stone-800 pb-4">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-lg">Gün Sonu Z-Raporu</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowZReportModal(false)}
                className="p-1 hover:bg-stone-800 rounded-lg text-stone-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Thermal Area */}
            <div className="print-area bg-white text-black p-5 rounded-xl font-mono text-xs space-y-3 shadow-inner max-h-[60vh] overflow-y-auto border border-stone-300">
              <div className="text-center border-b border-black/20 pb-3 space-y-1">
                <div className="flex justify-center mb-2">
                  <img
                    src={settings.logoUrl || '/logo.svg'}
                    onError={(e) => { e.currentTarget.src = '/logo.svg'; }}
                    alt={settings.name || 'Logo'}
                    className="max-h-20 max-w-[180px] object-contain mx-auto print:max-h-24 print:max-w-[200px]"
                  />
                </div>
                <h2 className="font-bold text-base uppercase tracking-tight">{settings.name || 'MERİÇ BELEDİYESİ SOSYAL TESİSLERİ'}</h2>
                <p className="text-[11px] font-bold text-stone-800">GÜN SONU MÜHÜR VE Z-RAPORU</p>
                <p className="text-[10px] text-stone-600">Rapor Tarihi: {formatDate(new Date().toISOString())}</p>
                <p className="text-[10px] text-stone-600">Yazdırılma: {formatTime(new Date().toISOString())}</p>
              </div>

              {/* Financial Summary */}
              <div className="border-b border-black/20 pb-3 space-y-1.5 text-xs">
                <div className="flex justify-between font-bold text-sm border-b border-dashed border-black/30 pb-1">
                  <span>TOPLAM CİRO:</span>
                  <span>{formatCurrency(totalRevenue, settings.currencySymbol)}</span>
                </div>
                <div className="flex justify-between text-stone-700">
                  <span>Kapanan Adisyon:</span>
                  <span className="font-bold">{closedOrders.length} Adet</span>
                </div>
                <div className="flex justify-between text-stone-700">
                  <span>Nakit Tahsilat:</span>
                  <span className="font-bold">{formatCurrency(paymentMethodStats.nakit, settings.currencySymbol)}</span>
                </div>
                <div className="flex justify-between text-stone-700">
                  <span>Kredi Kartı:</span>
                  <span className="font-bold">{formatCurrency(paymentMethodStats.kredi_karti, settings.currencySymbol)}</span>
                </div>
                <div className="flex justify-between text-stone-700">
                  <span>Yemek Çeki / Kartı:</span>
                  <span className="font-bold">{formatCurrency(paymentMethodStats.yemek_karti, settings.currencySymbol)}</span>
                </div>
                <div className="flex justify-between text-stone-600 pt-1 border-t border-dashed border-black/20">
                  <span>Hesaplanan KDV (%{settings.taxRatePercent || 10}):</span>
                  <span>{formatCurrency(totalTax, settings.currencySymbol)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Toplam İskonto:</span>
                  <span>{formatCurrency(totalDiscounts, settings.currencySymbol)}</span>
                </div>
                <div className="flex justify-between text-emerald-800 font-bold pt-1 border-t border-black/10">
                  <span>Tahmini Net Kar:</span>
                  <span>{formatCurrency(estimatedProfit, settings.currencySymbol)}</span>
                </div>
              </div>

              {/* Open Orders */}
              <div className="border-b border-black/20 pb-2 space-y-1 text-xs">
                <div className="flex justify-between text-stone-800 font-bold">
                  <span>Devreden Açık Masalar ({orders.filter(o => o.status === 'active').length}):</span>
                  <span>{formatCurrency(orders.filter(o => o.status === 'active').reduce((s, o) => s + o.totalAmount, 0), settings.currencySymbol)}</span>
                </div>
              </div>

              {/* Product Breakdown */}
              {topSellingItems.length > 0 && (
                <div className="space-y-1 pt-1">
                  <p className="font-bold text-[11px] uppercase border-b border-black/20 pb-1">En Çok Satılan Ürünler Listesi</p>
                  <div className="space-y-1 text-[11px]">
                    {topSellingItems.map((item, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span className="truncate pr-2">{item.qty}x {item.name}</span>
                        <span className="font-bold shrink-0">{formatCurrency(item.revenue, settings.currencySymbol)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-[10px] text-center pt-3 border-t border-black/30 font-bold uppercase tracking-wider">
                *** Z-RAPORU RESMİ KAYDI ***
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm transition-all cursor-pointer shadow-lg"
              >
                <Printer className="w-4 h-4" />
                <span>Yazdır (Termal Fiş & Yazıcı)</span>
              </button>
              <button
                type="button"
                onClick={() => setShowZReportModal(false)}
                className="bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold py-3 px-4 rounded-xl text-sm transition-all cursor-pointer"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Report Modal Overlay for Standard A4 Paper */}
      {showDetailedReportModal && (
        <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-2 sm:p-6 overflow-y-auto">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-5xl w-full p-4 sm:p-8 text-stone-100 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-xl text-stone-100">Gün Sonu Detaylı Satış, Maliyet, Kâr & Personel Analiz Raporu</h3>
                  <p className="text-xs text-stone-400">A4 Standart Yazıcı Uyumlu Resmi Rapor Çıktısı</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDetailedReportModal(false)}
                className="p-2 hover:bg-stone-800 rounded-xl text-stone-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Printable Area for A4 Paper */}
            <div className="print-detailed-area bg-white text-stone-900 p-6 sm:p-8 rounded-2xl font-sans text-xs space-y-6 shadow-inner border border-stone-200">
              
              {/* Header Title Section */}
              <div className="border-b-2 border-stone-900 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={settings.logoUrl || '/logo.svg'}
                    onError={(e) => { e.currentTarget.src = '/logo.svg'; }}
                    alt={settings.name || 'Logo'}
                    className="h-16 max-w-[180px] object-contain print:h-20 print:max-w-[220px] shrink-0"
                  />
                  <div>
                    <h1 className="text-xl font-black uppercase tracking-tight text-stone-950">{settings.name || 'MERİÇ BELEDİYESİ SOSYAL TESİSLERİ'}</h1>
                    <p className="text-xs font-bold text-amber-600 uppercase tracking-wide">GÜN SONU ÜRÜN BAZLI SATIŞ, MALİYET, NET KÂR VE PERSONEL PERFORMANS ANALİZ RAPORU</p>
                  </div>
                </div>
                <div className="text-right text-[11px] text-stone-600 space-y-0.5">
                  <p><span className="font-bold">Rapor Tarihi:</span> {formatDate(selectedDate || new Date().toISOString())}</p>
                  <p><span className="font-bold">Rapor Saati:</span> {formatTime(new Date().toISOString())}</p>
                  <p><span className="font-bold">Rapor Alan:</span> {currentUser?.name || 'Kasa Yöneticisi'}</p>
                </div>
              </div>

              {/* Financial KPI Summary Cards */}
              <div>
                <h2 className="font-bold text-sm uppercase tracking-wider text-stone-800 border-b border-stone-200 pb-1 mb-3">
                  1. Özet Finansal Göstergeler
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-stone-100 p-3 rounded-xl border border-stone-200">
                    <span className="text-[10px] font-bold text-stone-500 uppercase">TOPLAM BRÜT CİRO</span>
                    <p className="text-lg font-black text-stone-900">{formatCurrency(totalRevenue, settings.currencySymbol)}</p>
                    <span className="text-[10px] text-stone-500">{closedOrders.length} Kapanan Adisyon</span>
                  </div>
                  <div className="bg-stone-100 p-3 rounded-xl border border-stone-200">
                    <span className="text-[10px] font-bold text-stone-500 uppercase">TOPLAM ÜRÜN MALİYETİ</span>
                    <p className="text-lg font-black text-rose-700">{formatCurrency(totalCost, settings.currencySymbol)}</p>
                    <span className="text-[10px] text-stone-500">Maliyet Oranı: %{(totalRevenue > 0 ? (totalCost / totalRevenue) * 100 : 0).toFixed(1)}</span>
                  </div>
                  <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase">NET BRÜT KÂR</span>
                    <p className="text-lg font-black text-emerald-700">{formatCurrency(estimatedProfit, settings.currencySymbol)}</p>
                    <span className="text-[10px] font-bold text-emerald-800">Net Kâr Marjı: %{profitMarginPercent.toFixed(1)}</span>
                  </div>
                  <div className="bg-stone-100 p-3 rounded-xl border border-stone-200">
                    <span className="text-[10px] font-bold text-stone-500 uppercase">KDV & İSKONTO</span>
                    <p className="text-lg font-black text-stone-800">{formatCurrency(totalTax, settings.currencySymbol)}</p>
                    <span className="text-[10px] text-stone-500">İskonto: {formatCurrency(totalDiscounts, settings.currencySymbol)}</span>
                  </div>
                </div>

                {/* Visual Profit / Cost Breakdown Bar */}
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-stone-700">
                    <span>Maliyet / Net Kâr Payı Oranı:</span>
                    <span>Net Kâr: %{profitMarginPercent.toFixed(1)} | Maliyet: %{(100 - profitMarginPercent).toFixed(1)}</span>
                  </div>
                  <div className="w-full h-3 bg-rose-200 rounded-full overflow-hidden flex">
                    <div className="bg-emerald-500 h-full transition-all" style={{ width: `${Math.min(100, Math.max(0, profitMarginPercent))}%` }}></div>
                    <div className="bg-rose-500 h-full transition-all" style={{ width: `${Math.min(100, Math.max(0, 100 - profitMarginPercent))}%` }}></div>
                  </div>
                </div>
              </div>

              {/* 2. Muhasebe T-Cetveli (T-Account Diagram) */}
              <div>
                <h2 className="font-bold text-sm uppercase tracking-wider text-stone-800 border-b border-stone-200 pb-1 mb-3 flex items-center justify-between">
                  <span>2. Gün Sonu Muhasebe T-Cetveli (Satılanlar & Gelen Mal Fişleri Bilanço Mizanı)</span>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-md border border-emerald-300 font-mono">
                    Tek Düzen Hesap Planı Mizanı (Çift Taraflı Kayıt)
                  </span>
                </h2>

                <div className="border-2 border-stone-900 rounded-xl overflow-hidden shadow-sm bg-stone-50">
                  {/* T-Chart Title Bar */}
                  <div className="grid grid-cols-2 bg-stone-950 text-white font-bold text-xs uppercase text-center border-b-2 border-stone-900 divide-x-2 divide-stone-700">
                    <div className="py-2.5 bg-stone-900 text-amber-400 tracking-wide flex items-center justify-center gap-2">
                      <span>BORÇ (DEBİT)</span>
                      <span className="text-[10px] font-normal text-stone-300">| Girişler, Varlıklar & Giderler</span>
                    </div>
                    <div className="py-2.5 bg-stone-900 text-emerald-400 tracking-wide flex items-center justify-center gap-2">
                      <span>ALACAK (CREDIT)</span>
                      <span className="text-[10px] font-normal text-stone-300">| Gelirler, Kaynaklar & Kâr</span>
                    </div>
                  </div>

                  {/* T-Chart Main Body with Heavy Center Divider (T-Stem) */}
                  <div className="grid grid-cols-2 divide-x-2 divide-stone-900 text-[11px] bg-white">
                    {/* BORÇ / DEBIT SIDE */}
                    <div className="p-3 space-y-2">
                      <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider border-b border-stone-200 pb-1">
                        1. TAHSİLATLAR VE SATIŞ VARLIKLARI
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-stone-800 font-medium">
                          <strong className="font-mono bg-stone-100 text-stone-900 px-1 rounded border border-stone-300 mr-1.5 font-bold">100</strong> 
                          KASA HESABI (Nakit Satış Tahsilatı)
                        </span>
                        <span className="font-black text-stone-900">{formatCurrency(paymentMethodStats.nakit, settings.currencySymbol)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-stone-800 font-medium">
                          <strong className="font-mono bg-stone-100 text-stone-900 px-1 rounded border border-stone-300 mr-1.5 font-bold">102</strong> 
                          BANKA / POS (Kredi Kartı Tahsilatı)
                        </span>
                        <span className="font-black text-stone-900">{formatCurrency(paymentMethodStats.kredi_karti, settings.currencySymbol)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-stone-800 font-medium">
                          <strong className="font-mono bg-stone-100 text-stone-900 px-1 rounded border border-stone-300 mr-1.5 font-bold">108</strong> 
                          DİĞER HAZIR DEĞERLER (Yemek Kartı)
                        </span>
                        <span className="font-black text-stone-900">{formatCurrency(paymentMethodStats.yemek_karti, settings.currencySymbol)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-stone-800 font-medium">
                          <strong className="font-mono bg-stone-100 text-stone-900 px-1 rounded border border-stone-300 mr-1.5 font-bold">120</strong> 
                          ALICILAR (Devreden Açık Masalar)
                        </span>
                        <span className="font-black text-amber-700">{formatCurrency(openOrdersTotal, settings.currencySymbol)}</span>
                      </div>

                      <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider border-b border-stone-200 pt-2 pb-1">
                        2. GELEN ÜRÜNLER & MALİYET GİDERLERİ
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-stone-800 font-medium">
                          <strong className="font-mono bg-stone-100 text-stone-900 px-1 rounded border border-stone-300 mr-1.5 font-bold">153</strong> 
                          TİCARİ MALLAR (Depodaki Stok Varlığı)
                        </span>
                        <span className="font-black text-indigo-700">{formatCurrency(totalStockValuation, settings.currencySymbol)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-stone-800 font-medium">
                          <strong className="font-mono bg-stone-100 text-stone-900 px-1 rounded border border-stone-300 mr-1.5 font-bold">621</strong> 
                          STMM (Satılan Malın Reçete Maliyeti)
                        </span>
                        <span className="font-black text-rose-700">{formatCurrency(totalCost, settings.currencySymbol)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-stone-800 font-medium">
                          <strong className="font-mono bg-stone-100 text-stone-900 px-1 rounded border border-stone-300 mr-1.5 font-bold">611</strong> 
                          SATIŞ İSKONTOLARI (-)
                        </span>
                        <span className="font-black text-stone-800">{formatCurrency(totalDiscounts, settings.currencySymbol)}</span>
                      </div>
                    </div>

                    {/* ALACAK / CREDIT SIDE */}
                    <div className="p-3 space-y-2">
                      <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider border-b border-stone-200 pb-1">
                        1. BRÜT GELİRLER VE VERGİ YÜKÜMLÜLÜĞÜ
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-stone-800 font-medium">
                          <strong className="font-mono bg-stone-100 text-stone-900 px-1 rounded border border-stone-300 mr-1.5 font-bold">600</strong> 
                          YURTİÇİ SATIŞLAR (Net Satış Geliri)
                        </span>
                        <span className="font-black text-stone-900">{formatCurrency(Math.max(0, totalRevenue - totalTax), settings.currencySymbol)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-stone-800 font-medium">
                          <strong className="font-mono bg-stone-100 text-stone-900 px-1 rounded border border-stone-300 mr-1.5 font-bold">391</strong> 
                          HESAPLANAN KDV (%{settings.taxRatePercent || 10})
                        </span>
                        <span className="font-black text-stone-900">{formatCurrency(totalTax, settings.currencySymbol)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-stone-800 font-medium">
                          <strong className="font-mono bg-stone-100 text-stone-900 px-1 rounded border border-stone-300 mr-1.5 font-bold">120</strong> 
                          ALICILAR MAHSUBU (Açık Masa Devri)
                        </span>
                        <span className="font-black text-amber-700">{formatCurrency(openOrdersTotal, settings.currencySymbol)}</span>
                      </div>

                      <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider border-b border-stone-200 pt-2 pb-1">
                        2. STOK ÇIKIŞI & NET KÂR DENGESİ
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-stone-800 font-medium">
                          <strong className="font-mono bg-stone-100 text-stone-900 px-1 rounded border border-stone-300 mr-1.5 font-bold">153</strong> 
                          STOK ÇIKIŞI (Satılan Mal Maliyet Çıkışı)
                        </span>
                        <span className="font-black text-rose-700">{formatCurrency(totalCost, settings.currencySymbol)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-stone-800 font-medium">
                          <strong className="font-mono bg-stone-100 text-stone-900 px-1 rounded border border-stone-300 mr-1.5 font-bold">153</strong> 
                          DEPO MEVCUDU (Kalan Stok Değeri)
                        </span>
                        <span className="font-black text-indigo-700">{formatCurrency(totalStockValuation, settings.currencySymbol)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-stone-800 font-medium">
                          <strong className="font-mono bg-stone-100 text-stone-900 px-1 rounded border border-stone-300 mr-1.5 font-bold">690</strong> 
                          DÖNEM NET KÂRI (Bilanço Denge Karı)
                        </span>
                        <span className="font-black text-emerald-700">{formatCurrency(estimatedProfit, settings.currencySymbol)}</span>
                      </div>
                    </div>
                  </div>

                  {/* T-Chart Footer Balance */}
                  <div className="grid grid-cols-2 bg-stone-200 border-t-2 border-stone-900 p-2.5 font-bold text-xs text-stone-900 divide-x-2 divide-stone-400">
                    <div className="flex justify-between px-3">
                      <span className="uppercase text-stone-800">GENEL TOPLAM BORÇ:</span>
                      <span className="font-black text-amber-950 text-sm">
                        {formatCurrency(tChartTotalAmount, settings.currencySymbol)}
                      </span>
                    </div>
                    <div className="flex justify-between px-3 items-center">
                      <div className="flex items-center gap-1.5 text-emerald-800 font-black text-[11px]">
                        <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                        <span>MİZAN DENGEDE (B = A)</span>
                      </div>
                      <span className="font-black text-emerald-950 text-sm">
                        {formatCurrency(tChartTotalAmount, settings.currencySymbol)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Gelen Ürün Alım Fişleri & Depo Stok Girişleri */}
              <div>
                <h2 className="font-bold text-sm uppercase tracking-wider text-stone-800 border-b border-stone-200 pb-1 mb-3 flex items-center justify-between">
                  <span>3. Kayıtlı Gelen Ürün Alım Fişleri & Depo Giriş Fişleri</span>
                  <span className="text-xs font-normal text-stone-500">
                    Toplam Fiş Tutarı: {formatCurrency(purchaseInvoices.reduce((acc, i) => acc + (i.totalAmount || 0), 0), settings.currencySymbol)}
                  </span>
                </h2>
                
                <div className="overflow-x-auto border border-stone-200 rounded-xl overflow-hidden">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="bg-stone-100 border-b border-stone-300 font-bold text-stone-800">
                        <th className="py-2 px-3">#</th>
                        <th className="py-2 px-3">Fiş / Fatura No</th>
                        <th className="py-2 px-3">Tedarikçi / Firma</th>
                        <th className="py-2 px-3">Alınan Ürün / Malzeme</th>
                        <th className="py-2 px-3 text-center">Gelen Miktar</th>
                        <th className="py-2 px-3 text-right">Birim Alış Fiyatı</th>
                        <th className="py-2 px-3 text-right">Toplam Fiş Tutarı</th>
                        <th className="py-2 px-3 text-center">Ödeme Şekli</th>
                        <th className="py-2 px-3 text-center">Giriş Yapan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200">
                      {purchaseInvoices.length > 0 ? (
                        purchaseInvoices.map((inv, idx) => {
                          return (
                            <tr key={inv.id || idx} className="hover:bg-stone-50">
                              <td className="py-2 px-3 font-semibold text-stone-400">{idx + 1}</td>
                              <td className="py-2 px-3 font-mono font-bold text-amber-700">{inv.invoiceNo}</td>
                              <td className="py-2 px-3 font-bold text-stone-900">{inv.supplierName}</td>
                              <td className="py-2 px-3 font-semibold text-stone-800">{inv.stockItemName}</td>
                              <td className="py-2 px-3 text-center font-bold text-stone-800">
                                {inv.quantity} {inv.unit}
                              </td>
                              <td className="py-2 px-3 text-right text-stone-700">{formatCurrency(inv.unitPrice, settings.currencySymbol)}</td>
                              <td className="py-2 px-3 text-right font-black text-emerald-700">{formatCurrency(inv.totalAmount, settings.currencySymbol)}</td>
                              <td className="py-2 px-3 text-center">
                                {inv.paymentType === 'nakit' ? (
                                  <span className="bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded text-[10px] border border-emerald-200">Nakit Kasa</span>
                                ) : inv.paymentType === 'kredi_karti' ? (
                                  <span className="bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded text-[10px] border border-amber-200">POS / Kart</span>
                                ) : inv.paymentType === 'havale' ? (
                                  <span className="bg-sky-100 text-sky-800 font-bold px-1.5 py-0.5 rounded text-[10px] border border-sky-200">Banka EFT</span>
                                ) : (
                                  <span className="bg-purple-100 text-purple-800 font-bold px-1.5 py-0.5 rounded text-[10px] border border-purple-200">Veresiye</span>
                                )}
                              </td>
                              <td className="py-2 px-3 text-center text-[10px] text-stone-600">
                                {inv.createdByName}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={9} className="py-3 text-center text-stone-500 italic">Sistemde kaydedilmiş herhangi bir mal alım fişi bulunmamaktadır.</td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot>
                      <tr className="bg-stone-100 border-t-2 border-stone-300 font-bold text-stone-900 text-xs">
                        <td colSpan={4} className="py-2 px-3 uppercase text-stone-950">GELEN FİŞ VE FATURA TOPLAMI</td>
                        <td className="py-2 px-3 text-center font-black text-stone-900">{purchaseInvoices.length} Adet Fiş</td>
                        <td></td>
                        <td className="py-2 px-3 text-right font-black text-emerald-900">
                          {formatCurrency(purchaseInvoices.reduce((acc, i) => acc + (i.totalAmount || 0), 0), settings.currencySymbol)}
                        </td>
                        <td colSpan={2}></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Staff Performance Section */}
              <div>
                <h2 className="font-bold text-sm uppercase tracking-wider text-stone-800 border-b border-stone-200 pb-1 mb-3 flex items-center justify-between">
                  <span>4. Personel Satış & Adisyon Performans Analizi (Çalışanlar)</span>
                  <span className="text-xs font-normal text-stone-500">Kapanan ve Devreden Adisyon Dağılımı</span>
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="bg-stone-100 border-y border-stone-300 font-bold text-stone-700">
                        <th className="py-2 px-3">#</th>
                        <th className="py-2 px-3">Personel / Çalışan Adı</th>
                        <th className="py-2 px-3 text-center">Kapanan Adisyon</th>
                        <th className="py-2 px-3 text-center">Açık Masa (Devreden)</th>
                        <th className="py-2 px-3 text-right">Toplam Ciro (₺)</th>
                        <th className="py-2 px-3 text-right">Ort. Adisyon Tutarı</th>
                        <th className="py-2 px-3 text-right">Ciro Payı (%)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200">
                      {staffPerformanceList.length > 0 ? (
                        staffPerformanceList.map((st, idx) => (
                          <tr key={idx} className="hover:bg-stone-50">
                            <td className="py-2 px-3 font-bold text-stone-400">{idx + 1}</td>
                            <td className="py-2 px-3 font-bold text-stone-900">{st.name}</td>
                            <td className="py-2 px-3 text-center font-semibold text-stone-800">{st.closedOrdersCount} Adet</td>
                            <td className="py-2 px-3 text-center text-amber-700 font-semibold">{st.openOrdersCount > 0 ? `${st.openOrdersCount} Masa` : '-'}</td>
                            <td className="py-2 px-3 text-right font-black text-emerald-700">{formatCurrency(st.totalRevenue, settings.currencySymbol)}</td>
                            <td className="py-2 px-3 text-right font-semibold text-stone-700">{formatCurrency(st.avgOrderValue, settings.currencySymbol)}</td>
                            <td className="py-2 px-3 text-right font-bold text-stone-800">
                              <div className="flex items-center justify-end gap-2">
                                <span>%{st.sharePercent.toFixed(1)}</span>
                                <div className="w-12 h-2 bg-stone-200 rounded-full overflow-hidden">
                                  <div className="bg-amber-500 h-full" style={{ width: `${Math.min(100, st.sharePercent)}%` }}></div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="py-3 text-center text-stone-500 italic">Bugün henüz kapanan adisyon kaydı bulunmamaktadır.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Graphical Representation Section */}
              <div>
                <h2 className="font-bold text-sm uppercase tracking-wider text-stone-800 border-b border-stone-200 pb-1 mb-3">
                  5. Görsel Grafikler & Saatlik Ciro Dağılımı
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Hourly Revenue Bar Chart Visualization */}
                  <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-3">
                    <h3 className="font-bold text-xs text-stone-800">Saatlik Ciro Yoğunluk Grafiği</h3>
                    <div className="space-y-1.5">
                      {hourlyDataPrepared.map((h, idx) => {
                        const pct = (h.revenue / maxHourlyRev) * 100;
                        return (
                          <div key={idx} className="flex items-center gap-2 text-[11px]">
                            <span className="w-10 text-stone-600 font-mono text-[10px]">{h.hour}</span>
                            <div className="flex-1 h-3 bg-stone-200 rounded-full overflow-hidden">
                              <div className="bg-amber-500 h-full transition-all" style={{ width: `${pct}%` }}></div>
                            </div>
                            <span className="w-16 text-right font-bold text-stone-800">{formatCurrency(h.revenue, settings.currencySymbol)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Payment Method Distribution */}
                  <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-3">
                    <h3 className="font-bold text-xs text-stone-800">Ödeme Yöntemi Dağılımı</h3>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-[11px] font-bold text-stone-700">
                          <span>Nakit Tahsilat:</span>
                          <span>{formatCurrency(paymentMethodStats.nakit, settings.currencySymbol)} (%{(totalRevenue > 0 ? (paymentMethodStats.nakit / totalRevenue) * 100 : 0).toFixed(1)})</span>
                        </div>
                        <div className="w-full h-2.5 bg-stone-200 rounded-full overflow-hidden mt-1">
                          <div className="bg-emerald-500 h-full" style={{ width: `${totalRevenue > 0 ? (paymentMethodStats.nakit / totalRevenue) * 100 : 0}%` }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-bold text-stone-700">
                          <span>Kredi Kartı:</span>
                          <span>{formatCurrency(paymentMethodStats.kredi_karti, settings.currencySymbol)} (%{(totalRevenue > 0 ? (paymentMethodStats.kredi_karti / totalRevenue) * 100 : 0).toFixed(1)})</span>
                        </div>
                        <div className="w-full h-2.5 bg-stone-200 rounded-full overflow-hidden mt-1">
                          <div className="bg-amber-500 h-full" style={{ width: `${totalRevenue > 0 ? (paymentMethodStats.kredi_karti / totalRevenue) * 100 : 0}%` }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-bold text-stone-700">
                          <span>Yemek Çeki / Kartı:</span>
                          <span>{formatCurrency(paymentMethodStats.yemek_karti, settings.currencySymbol)} (%{(totalRevenue > 0 ? (paymentMethodStats.yemek_karti / totalRevenue) * 100 : 0).toFixed(1)})</span>
                        </div>
                        <div className="w-full h-2.5 bg-stone-200 rounded-full overflow-hidden mt-1">
                          <div className="bg-sky-500 h-full" style={{ width: `${totalRevenue > 0 ? (paymentMethodStats.yemek_karti / totalRevenue) * 100 : 0}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Detailed Product Sales & Profitability Breakdown Table */}
              <div>
                <h2 className="font-bold text-sm uppercase tracking-wider text-stone-800 border-b border-stone-200 pb-1 mb-3 flex items-center justify-between">
                  <span>6. Gün Sonu Ürün Bazlı Satış, Maliyet & Net Kâr Analizi</span>
                  <span className="text-xs font-normal text-stone-500">{productProfitList.length} Çeşit Ürün Satıldı</span>
                </h2>
                <div className="overflow-x-auto border border-stone-200 rounded-xl overflow-hidden">
                  <table className="w-full border-collapse text-left text-[11px]">
                    <thead>
                      <tr className="bg-stone-100 border-b border-stone-300 font-bold text-stone-800">
                        <th className="py-2 px-2">#</th>
                        <th className="py-2 px-2">Ürün Adı</th>
                        <th className="py-2 px-2">Kategori</th>
                        <th className="py-2 px-2 text-center">Satılan Adet</th>
                        <th className="py-2 px-2 text-right">Birim Satış</th>
                        <th className="py-2 px-2 text-right">Birim Maliyet</th>
                        <th className="py-2 px-2 text-right">Toplam Ciro (₺)</th>
                        <th className="py-2 px-2 text-right">Toplam Maliyet (₺)</th>
                        <th className="py-2 px-2 text-right">Net Kâr (₺)</th>
                        <th className="py-2 px-2 text-right">Kâr Marjı (%)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200">
                      {productProfitList.length > 0 ? (
                        productProfitList.map((p, idx) => (
                          <tr key={idx} className="hover:bg-stone-50">
                            <td className="py-1.5 px-2 text-stone-400 font-semibold">{idx + 1}</td>
                            <td className="py-1.5 px-2 font-bold text-stone-900">{p.name}</td>
                            <td className="py-1.5 px-2 text-stone-600">{p.categoryName}</td>
                            <td className="py-1.5 px-2 text-center font-bold text-stone-800">{p.quantity} Adet</td>
                            <td className="py-1.5 px-2 text-right text-stone-700">{formatCurrency(p.unitPrice, settings.currencySymbol)}</td>
                            <td className="py-1.5 px-2 text-right text-rose-700">{formatCurrency(p.unitCost, settings.currencySymbol)}</td>
                            <td className="py-1.5 px-2 text-right font-bold text-stone-900">{formatCurrency(p.totalRevenue, settings.currencySymbol)}</td>
                            <td className="py-1.5 px-2 text-right text-rose-700">{formatCurrency(p.totalCost, settings.currencySymbol)}</td>
                            <td className="py-1.5 px-2 text-right font-black text-emerald-700">{formatCurrency(p.totalProfit, settings.currencySymbol)}</td>
                            <td className="py-1.5 px-2 text-right font-bold text-emerald-800">%{p.marginPercent.toFixed(1)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={10} className="py-3 text-center text-stone-500 italic">Seçili tarihte herhangi bir ürün satışı kaydedilmemiştir.</td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot>
                      <tr className="bg-stone-200 border-t-2 border-stone-400 font-bold text-stone-900 text-xs">
                        <td colSpan={3} className="py-2.5 px-2 uppercase text-stone-950">GENEL TOPLAM</td>
                        <td className="py-2.5 px-2 text-center">{grandTotalReportQty} Adet</td>
                        <td colSpan={2}></td>
                        <td className="py-2.5 px-2 text-right text-stone-950">{formatCurrency(grandTotalReportRev, settings.currencySymbol)}</td>
                        <td className="py-2.5 px-2 text-right text-rose-800">{formatCurrency(grandTotalReportCost, settings.currencySymbol)}</td>
                        <td className="py-2.5 px-2 text-right text-emerald-800">{formatCurrency(grandTotalReportProfit, settings.currencySymbol)}</td>
                        <td className="py-2.5 px-2 text-right text-emerald-900">
                          %{grandTotalReportRev > 0 ? ((grandTotalReportProfit / grandTotalReportRev) * 100).toFixed(1) : '0.0'}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* 7. Comprehensive Stock & Inventory Analysis Section */}
              <div>
                <h2 className="font-bold text-sm uppercase tracking-wider text-stone-800 border-b border-stone-200 pb-1 mb-3 flex items-center justify-between">
                  <span>7. Güncel Depo Stok Durumu & Kritik Stok Analizi</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${
                    lowStockCount > 0 ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  }`}>
                    {lowStockCount > 0 ? `⚠️ ${lowStockCount} Kalem Kritik Seviyede` : '✅ Tüm Stok Seviyeleri Yeterli'}
                  </span>
                </h2>

                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="bg-stone-100 p-2.5 rounded-xl border border-stone-200">
                    <span className="text-[10px] font-bold text-stone-500 uppercase">TOPLAM DEPO STOK DEĞERİ</span>
                    <p className="text-base font-black text-indigo-900">{formatCurrency(totalStockValuation, settings.currencySymbol)}</p>
                  </div>
                  <div className="bg-stone-100 p-2.5 rounded-xl border border-stone-200">
                    <span className="text-[10px] font-bold text-stone-500 uppercase">KAYITLI STOK KALEMİ</span>
                    <p className="text-base font-black text-stone-900">{stockItems.length} Çeşit Malzeme</p>
                  </div>
                  <div className={`${lowStockCount > 0 ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'} p-2.5 rounded-xl border`}>
                    <span className="text-[10px] font-bold text-stone-500 uppercase">KRİTİK / TÜKENEN STOK</span>
                    <p className={`text-base font-black ${lowStockCount > 0 ? 'text-amber-800' : 'text-emerald-800'}`}>{lowStockCount} Kalem Ürün</p>
                  </div>
                </div>

                <div className="overflow-x-auto border border-stone-200 rounded-xl overflow-hidden">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="bg-stone-100 border-b border-stone-300 font-bold text-stone-800">
                        <th className="py-2 px-3">#</th>
                        <th className="py-2 px-3">Stok / Malzeme Adı</th>
                        <th className="py-2 px-3">Kategori</th>
                        <th className="py-2 px-3 text-center">Mevcut Miktar</th>
                        <th className="py-2 px-3 text-center">Min. Kritik Sınır</th>
                        <th className="py-2 px-3 text-right">Birim Maliyet</th>
                        <th className="py-2 px-3 text-right">Toplam Stok Değeri</th>
                        <th className="py-2 px-3 text-center">Stok Durumu</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200">
                      {stockItems.length > 0 ? (
                        stockItems.map((st, idx) => {
                          const isOut = (st.quantity || 0) <= 0;
                          const isLow = (st.quantity || 0) <= (st.minThreshold || 0);
                          const totalVal = (st.quantity || 0) * (st.costPerUnit || 0);

                          return (
                            <tr key={st.id || idx} className="hover:bg-stone-50">
                              <td className="py-2 px-3 text-stone-400 font-semibold">{idx + 1}</td>
                              <td className="py-2 px-3 font-bold text-stone-900">{st.name}</td>
                              <td className="py-2 px-3 text-stone-600">{st.category || 'Genel'}</td>
                              <td className="py-2 px-3 text-center font-bold text-stone-900">
                                {st.quantity} {st.unit}
                              </td>
                              <td className="py-2 px-3 text-center text-stone-600">
                                {st.minThreshold} {st.unit}
                              </td>
                              <td className="py-2 px-3 text-right text-stone-700">
                                {formatCurrency(st.costPerUnit, settings.currencySymbol)}
                              </td>
                              <td className="py-2 px-3 text-right font-black text-indigo-800">
                                {formatCurrency(totalVal, settings.currencySymbol)}
                              </td>
                              <td className="py-2 px-3 text-center">
                                {isOut ? (
                                  <span className="bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded text-[10px] border border-rose-200">❌ Stok Tükendi</span>
                                ) : isLow ? (
                                  <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[10px] border border-amber-200">⚠️ Kritik Seviye</span>
                                ) : (
                                  <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px] border border-emerald-200">✅ Yeterli</span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={8} className="py-3 text-center text-stone-500 italic">Depoda listelenecek stok malzemesi bulunamamıştır.</td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot>
                      <tr className="bg-stone-200 border-t-2 border-stone-400 font-bold text-stone-900 text-xs">
                        <td colSpan={3} className="py-2.5 px-3 uppercase text-stone-950">GENEL DEPO TOPLAMI</td>
                        <td className="py-2.5 px-3 text-center font-black text-stone-950">{stockItems.reduce((acc, s) => acc + (s.quantity || 0), 0)} Kalem</td>
                        <td colSpan={2}></td>
                        <td className="py-2.5 px-3 text-right font-black text-indigo-950">{formatCurrency(totalStockValuation, settings.currencySymbol)}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Official Signatures & Approval Footer */}
              <div className="pt-6 border-t-2 border-stone-800 grid grid-cols-2 text-center text-xs text-stone-700 font-semibold">
                <div className="space-y-8">
                  <p className="uppercase font-bold">Raporu Düzenleyen / Kasa Sorumlusu</p>
                  <p className="text-stone-400 italic">İmza / Mühür</p>
                </div>
                <div className="space-y-8">
                  <p className="uppercase font-bold">Tesis Müdürü / Onaylayan</p>
                  <p className="text-stone-400 italic">İmza / Mühür</p>
                </div>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 bg-emerald-600 hover:bg-amber-500 text-white hover:text-stone-950 font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 text-sm transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl hover:scale-[1.01] group"
              >
                <Printer className="w-5 h-5 transition-transform group-hover:scale-110" />
                <span>A4 / Normal Yazıcıya Gönder (Yazdır)</span>
              </button>
              <button
                type="button"
                onClick={() => setShowDetailedReportModal(false)}
                className="bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold py-3.5 px-6 rounded-xl text-sm transition-all cursor-pointer"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INVOICE & EXPENSES PRINTABLE REPORT MODAL (A4) */}
      {showInvoiceReportModal && (
        <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-4xl w-full p-4 sm:p-6 text-stone-100 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-xl text-stone-100">Fiş, Fatura & Gider Döküm Raporu</h3>
                  <p className="text-xs text-stone-400">A4 Standart Yazıcı Uyumlu Resmi İdari Rapor Çıktısı</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowInvoiceReportModal(false)}
                className="p-2 hover:bg-stone-800 rounded-xl text-stone-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Printable Area for A4 Paper */}
            <div className="print-detailed-area bg-white text-stone-900 p-6 sm:p-8 rounded-2xl font-sans text-xs space-y-6 shadow-inner border border-stone-200">
              
              {/* Header Title Section with Logo */}
              <div className="border-b-2 border-stone-900 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={settings.logoUrl || '/logo.svg'}
                    onError={(e) => { e.currentTarget.src = '/logo.svg'; }}
                    alt={settings.name || 'Logo'}
                    className="h-16 max-w-[180px] object-contain print:h-20 print:max-w-[220px] shrink-0"
                  />
                  <div>
                    <h1 className="text-xl font-black uppercase tracking-tight text-stone-950">{settings.name || 'MERİÇ BELEDİYESİ SOSYAL TESİSLERİ'}</h1>
                    <p className="text-xs font-bold text-amber-600 uppercase tracking-wide">İŞLETME FİŞ, FATURA VE GİDER ÖDEMELERİ RESMİ DÖKÜM RAPORU</p>
                  </div>
                </div>
                <div className="text-right text-[11px] text-stone-600 space-y-0.5">
                  <p><span className="font-bold">Rapor Tarihi:</span> {formatDate(new Date().toISOString())}</p>
                  <p><span className="font-bold">Rapor Saati:</span> {formatTime(new Date().toISOString())}</p>
                  <p><span className="font-bold">Rapor Sorumlusu:</span> {currentUser?.name || 'Kasa Yöneticisi'}</p>
                </div>
              </div>

              {/* KPI Summaries */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-stone-100 p-3 rounded-xl border border-stone-200">
                  <span className="text-[10px] font-bold text-stone-500 uppercase">ÖDENEN İŞLETME FATURALARI</span>
                  <p className="text-base font-black text-amber-700">{formatCurrency(expenseInvoices.reduce((a, b) => a + (b.amount || 0), 0), settings.currencySymbol)}</p>
                  <span className="text-[10px] text-stone-500">{expenseInvoices.length} Kayıt</span>
                </div>
                <div className="bg-stone-100 p-3 rounded-xl border border-stone-200">
                  <span className="text-[10px] font-bold text-stone-500 uppercase">MAL ALIM FİŞLERİ (GELEN)</span>
                  <p className="text-base font-black text-emerald-700">{formatCurrency(purchaseInvoices.reduce((a, b) => a + (b.totalAmount || 0), 0), settings.currencySymbol)}</p>
                  <span className="text-[10px] text-stone-500">{purchaseInvoices.length} Kayıt</span>
                </div>
                <div className="bg-rose-50 p-3 rounded-xl border border-rose-200">
                  <span className="text-[10px] font-bold text-rose-800 uppercase">GENEL TOPLAM GİDER ÇIKIŞI</span>
                  <p className="text-base font-black text-rose-700">
                    {formatCurrency(
                      expenseInvoices.reduce((a, b) => a + (b.amount || 0), 0) +
                      purchaseInvoices.reduce((a, b) => a + (b.totalAmount || 0), 0),
                      settings.currencySymbol
                    )}
                  </p>
                  <span className="text-[10px] font-bold text-rose-800">Kasa Çıkış Toplamı</span>
                </div>
              </div>

              {/* Section 1: Operating Expense Invoices */}
              <div>
                <h2 className="font-bold text-xs uppercase tracking-wider text-stone-800 border-b border-stone-300 pb-1 mb-2">
                  1. Ödenen İşletme Faturaları (Elektrik, Su, Kira, vb.)
                </h2>
                <table className="w-full text-left text-xs border border-stone-200 rounded-lg overflow-hidden">
                  <thead className="bg-stone-100 font-bold border-b border-stone-300 text-stone-800">
                    <tr>
                      <th className="p-2">#</th>
                      <th className="p-2">Fatura / Gider Adı</th>
                      <th className="p-2">Fatura / Abone No</th>
                      <th className="p-2 text-right">Tutar</th>
                      <th className="p-2 text-center">Tarih</th>
                      <th className="p-2 text-center">Ödeme Türü</th>
                      <th className="p-2">Ödeyen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {expenseInvoices.length > 0 ? (
                      expenseInvoices.map((exp, idx) => (
                        <tr key={exp.id || idx}>
                          <td className="p-2 text-stone-400 font-bold">{idx + 1}</td>
                          <td className="p-2 font-bold text-stone-900">{exp.title}</td>
                          <td className="p-2 font-mono text-stone-600">{exp.invoiceNo || '-'}</td>
                          <td className="p-2 text-right font-black text-rose-700">{formatCurrency(exp.amount, settings.currencySymbol)}</td>
                          <td className="p-2 text-center">{exp.date}</td>
                          <td className="p-2 text-center uppercase text-[10px] font-bold">{exp.paymentType}</td>
                          <td className="p-2 text-stone-700">{exp.paidByName}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={7} className="p-3 text-center italic text-stone-500">Ödenmiş fatura kaydı bulunmuyor.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Section 2: Purchase Invoices */}
              <div>
                <h2 className="font-bold text-xs uppercase tracking-wider text-stone-800 border-b border-stone-300 pb-1 mb-2">
                  2. Tedarikçi Mal Alım Fişleri & Depo Girişleri
                </h2>
                <table className="w-full text-left text-xs border border-stone-200 rounded-lg overflow-hidden">
                  <thead className="bg-stone-100 font-bold border-b border-stone-300 text-stone-800">
                    <tr>
                      <th className="p-2">#</th>
                      <th className="p-2">Fiş No</th>
                      <th className="p-2">Tedarikçi</th>
                      <th className="p-2">Ürün / Malzeme</th>
                      <th className="p-2 text-center">Miktar</th>
                      <th className="p-2 text-right">Birim Fiyat</th>
                      <th className="p-2 text-right">Toplam Fiş Tutarı</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {purchaseInvoices.length > 0 ? (
                      purchaseInvoices.map((inv, idx) => (
                        <tr key={inv.id || idx}>
                          <td className="p-2 text-stone-400 font-bold">{idx + 1}</td>
                          <td className="p-2 font-mono font-bold text-amber-700">{inv.invoiceNo}</td>
                          <td className="p-2 font-bold text-stone-900">{inv.supplierName}</td>
                          <td className="p-2">{inv.stockItemName}</td>
                          <td className="p-2 text-center font-bold">{inv.quantity} {inv.unit}</td>
                          <td className="p-2 text-right">{formatCurrency(inv.unitPrice, settings.currencySymbol)}</td>
                          <td className="p-2 text-right font-black text-emerald-700">{formatCurrency(inv.totalAmount, settings.currencySymbol)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={7} className="p-3 text-center italic text-stone-500">Mal alım fişi kaydı bulunmuyor.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Official Signatures */}
              <div className="pt-6 border-t-2 border-stone-800 grid grid-cols-2 text-center text-xs text-stone-700 font-semibold">
                <div className="space-y-8">
                  <p className="uppercase font-bold">Raporu Düzenleyen / Muhasebe</p>
                  <p className="text-stone-400 italic">İmza / Mühür</p>
                </div>
                <div className="space-y-8">
                  <p className="uppercase font-bold">Tesis Müdürü / Onaylayan</p>
                  <p className="text-stone-400 italic">İmza / Mühür</p>
                </div>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 text-sm transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl group"
              >
                <Printer className="w-5 h-5 transition-transform group-hover:scale-110" />
                <span>Yazdır (A4 / Normal Yazıcı)</span>
              </button>
              <button
                type="button"
                onClick={() => setShowInvoiceReportModal(false)}
                className="bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold py-3.5 px-6 rounded-xl text-sm transition-all cursor-pointer"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 max-w-md w-full rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-500/10 text-rose-500 rounded-2xl">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
                  {deleteConfirm.title}
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Bu işlem geri alınamaz.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed bg-stone-50 dark:bg-stone-800/50 p-4 rounded-2xl border border-stone-200 dark:border-stone-800">
                {deleteConfirm.message}
              </p>
              {deleteConfirm.warning && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-200 rounded-xl text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>{deleteConfirm.warning}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              {deleteConfirm.confirmText !== 'Tamam' && (
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  Vazgeç
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  deleteConfirm.onConfirm();
                  setDeleteConfirm(null);
                }}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  deleteConfirm.confirmText === 'Tamam'
                    ? 'bg-stone-800 hover:bg-stone-700 text-white'
                    : 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20'
                }`}
              >
                {deleteConfirm.confirmText || 'Evet, Sil'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Expense Invoice Modal */}
      {editingExpenseInvoice && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 max-w-lg w-full rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-500" />
                <span>Gider Faturasını Düzenle</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingExpenseInvoice(null)}
                className="text-stone-400 hover:text-stone-600 text-sm font-bold p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditedExpense} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Fatura / Gider Başlığı
                </label>
                <input
                  type="text"
                  required
                  value={editingExpenseInvoice.title}
                  onChange={(e) => setEditingExpenseInvoice({ ...editingExpenseInvoice, title: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl font-bold text-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Kategori
                  </label>
                  <select
                    value={editingExpenseInvoice.category}
                    onChange={(e) => setEditingExpenseInvoice({ ...editingExpenseInvoice, category: e.target.value as any })}
                    className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl font-semibold text-stone-900 dark:text-stone-100"
                  >
                    <option value="elektrik">Elektrik</option>
                    <option value="su">Su</option>
                    <option value="dogalgaz">Doğalgaz</option>
                    <option value="internet">İnternet / Telefon</option>
                    <option value="kira">Kira</option>
                    <option value="personel">Personel Maaş / Avans</option>
                    <option value="temizlik">Temizlik & Hijyen</option>
                    <option value="tamirat">Bakım & Onarım</option>
                    <option value="diger">Diğer İşletme Gideri</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Fatura / Abone No
                  </label>
                  <input
                    type="text"
                    value={editingExpenseInvoice.invoiceNo || ''}
                    onChange={(e) => setEditingExpenseInvoice({ ...editingExpenseInvoice, invoiceNo: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl font-mono text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Ödenen Tutar ({settings.currencySymbol})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingExpenseInvoice.amount}
                    onChange={(e) => setEditingExpenseInvoice({ ...editingExpenseInvoice, amount: Number(e.target.value) || 0 })}
                    className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl font-bold text-rose-600 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Ödeme Tarihi
                  </label>
                  <input
                    type="date"
                    required
                    value={editingExpenseInvoice.date}
                    onChange={(e) => setEditingExpenseInvoice({ ...editingExpenseInvoice, date: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl font-medium text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Ödeme Şekli
                  </label>
                  <select
                    value={editingExpenseInvoice.paymentType}
                    onChange={(e) => setEditingExpenseInvoice({ ...editingExpenseInvoice, paymentType: e.target.value as any })}
                    className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl font-semibold text-stone-900 dark:text-stone-100"
                  >
                    <option value="nakit">Nakit Kasa</option>
                    <option value="kredi_karti">Banka / Kredi Kartı</option>
                    <option value="havale">Banka Havalesi / EFT</option>
                    <option value="veresiye">Veresiye / Açık Hesap</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Ödeyen / İşlemi Yapan
                  </label>
                  <input
                    type="text"
                    value={editingExpenseInvoice.paidByName || ''}
                    onChange={(e) => setEditingExpenseInvoice({ ...editingExpenseInvoice, paidByName: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl font-medium text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Not / Açıklama
                </label>
                <input
                  type="text"
                  value={editingExpenseInvoice.notes || ''}
                  onChange={(e) => setEditingExpenseInvoice({ ...editingExpenseInvoice, notes: e.target.value })}
                  placeholder="İsteğe bağlı not..."
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl font-medium text-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setEditingExpenseInvoice(null)}
                  className="px-4 py-2 rounded-xl font-bold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Değişiklikleri Kaydet</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Purchase Invoice Modal */}
      {editingPurchaseInvoice && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 max-w-lg w-full rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-500" />
                <span>Mal Alım Fişini Düzenle</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingPurchaseInvoice(null)}
                className="text-stone-400 hover:text-stone-600 text-sm font-bold p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditedPurchase} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Tedarikçi / Firma Adı
                  </label>
                  <input
                    type="text"
                    required
                    value={editingPurchaseInvoice.supplierName}
                    onChange={(e) => setEditingPurchaseInvoice({ ...editingPurchaseInvoice, supplierName: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl font-bold text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Fiş / Fatura No
                  </label>
                  <input
                    type="text"
                    required
                    value={editingPurchaseInvoice.invoiceNo}
                    onChange={(e) => setEditingPurchaseInvoice({ ...editingPurchaseInvoice, invoiceNo: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl font-mono font-bold text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Alınan Hammadde / Malzeme Adı
                </label>
                <input
                  type="text"
                  required
                  value={editingPurchaseInvoice.stockItemName}
                  onChange={(e) => setEditingPurchaseInvoice({ ...editingPurchaseInvoice, stockItemName: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl font-bold text-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Gelen Miktar
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingPurchaseInvoice.quantity}
                    onChange={(e) => {
                      const qty = Number(e.target.value) || 0;
                      const tot = qty * (editingPurchaseInvoice.unitPrice || 0);
                      setEditingPurchaseInvoice({
                        ...editingPurchaseInvoice,
                        quantity: qty,
                        totalAmount: Number(tot.toFixed(2)),
                      });
                    }}
                    className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl font-bold text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Birim
                  </label>
                  <input
                    type="text"
                    required
                    value={editingPurchaseInvoice.unit}
                    onChange={(e) => setEditingPurchaseInvoice({ ...editingPurchaseInvoice, unit: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl font-medium text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Birim Alış Fiyatı ({settings.currencySymbol})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingPurchaseInvoice.unitPrice}
                    onChange={(e) => {
                      const price = Number(e.target.value) || 0;
                      const tot = (editingPurchaseInvoice.quantity || 0) * price;
                      setEditingPurchaseInvoice({
                        ...editingPurchaseInvoice,
                        unitPrice: price,
                        totalAmount: Number(tot.toFixed(2)),
                      });
                    }}
                    className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl font-bold text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Toplam Fiş Tutarı ({settings.currencySymbol})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingPurchaseInvoice.totalAmount}
                    onChange={(e) => setEditingPurchaseInvoice({ ...editingPurchaseInvoice, totalAmount: Number(e.target.value) || 0 })}
                    className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl font-black text-emerald-600 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Ödeme Şekli
                  </label>
                  <select
                    value={editingPurchaseInvoice.paymentType}
                    onChange={(e) => setEditingPurchaseInvoice({ ...editingPurchaseInvoice, paymentType: e.target.value as any })}
                    className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl font-semibold text-stone-900 dark:text-stone-100"
                  >
                    <option value="nakit">Nakit Kasa</option>
                    <option value="kredi_karti">Banka / Kredi Kartı</option>
                    <option value="havale">Banka Havalesi / EFT</option>
                    <option value="veresiye">Veresiye / Açık Hesap</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setEditingPurchaseInvoice(null)}
                  className="px-4 py-2 rounded-xl font-bold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Değişiklikleri Kaydet</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Viewing Order Detail Modal (for Geçmiş Adisyonlar) */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 max-w-lg w-full rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <div>
                <h3 className="font-black text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <span>Adisyon #{viewingOrder.id}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    viewingOrder.status === 'closed'
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : viewingOrder.status === 'unpaid_debt'
                      ? 'bg-rose-500/10 text-rose-500'
                      : 'bg-amber-500/10 text-amber-500'
                  }`}>
                    {viewingOrder.status === 'closed' ? 'Ödendi & Kapandı' : viewingOrder.status === 'unpaid_debt' ? 'Borç / Veresiye' : 'Açık'}
                  </span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5 font-medium">
                  {viewingOrder.tableName} ({viewingOrder.zoneName}) • Garson: {viewingOrder.waiterName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingOrder(null)}
                className="text-stone-400 hover:text-stone-600 text-sm font-bold p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs max-h-80 overflow-y-auto">
              <table className="w-full text-left">
                <thead className="bg-stone-50 dark:bg-stone-800 text-[10px] uppercase font-bold text-stone-500">
                  <tr>
                    <th className="p-2">Ürün</th>
                    <th className="p-2 text-center">Adet</th>
                    <th className="p-2 text-right">Birim</th>
                    <th className="p-2 text-right">Tutar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {viewingOrder.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-2">
                        <span className="font-bold text-stone-900 dark:text-stone-100">{item.name}</span>
                        {item.note && <span className="text-[10px] text-stone-400 block italic">{item.note}</span>}
                      </td>
                      <td className="p-2 text-center font-bold">{item.quantity}</td>
                      <td className="p-2 text-right text-stone-500">{formatCurrency(item.price, settings.currencySymbol)}</td>
                      <td className="p-2 text-right font-bold text-stone-900 dark:text-stone-100">
                        {formatCurrency(item.price * item.quantity, settings.currencySymbol)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="bg-stone-50 dark:bg-stone-800/60 p-3 rounded-2xl space-y-1.5 text-xs">
                <div className="flex justify-between text-stone-500">
                  <span>Ara Toplam:</span>
                  <span className="font-medium">{formatCurrency(viewingOrder.subtotal, settings.currencySymbol)}</span>
                </div>
                {viewingOrder.discountPercent ? (
                  <div className="flex justify-between text-emerald-600">
                    <span>İndirim (%{viewingOrder.discountPercent}):</span>
                    <span>-{formatCurrency(viewingOrder.discountAmount || (viewingOrder.subtotal * viewingOrder.discountPercent) / 100, settings.currencySymbol)}</span>
                  </div>
                ) : null}
                <div className="flex justify-between text-sm font-black text-stone-900 dark:text-stone-100 pt-1.5 border-t border-stone-200 dark:border-stone-700">
                  <span>Genel Toplam:</span>
                  <span className="text-amber-600 dark:text-amber-400">{formatCurrency(viewingOrder.totalAmount, settings.currencySymbol)}</span>
                </div>
                {viewingOrder.paymentType && (
                  <div className="flex justify-between text-[11px] text-stone-400 pt-1">
                    <span>Ödeme Şekli:</span>
                    <span className="font-bold uppercase text-stone-700 dark:text-stone-300">{viewingOrder.paymentType}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2 border-t border-stone-200 dark:border-stone-800">
              <button
                type="button"
                onClick={() => {
                  onOpenPrintTicket(viewingOrder);
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Yeniden Fiş Yazdır</span>
              </button>
              <button
                type="button"
                onClick={() => setViewingOrder(null)}
                className="px-4 py-2 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-xl text-xs font-bold hover:bg-stone-200 cursor-pointer"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-stone-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-stone-700 text-xs font-bold animate-in fade-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
};
