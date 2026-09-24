import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, CreditCard, Banknote, X, Printer } from 'lucide-react';
import { StorageService } from './services/storage';
import { Zone, Table, Category, MenuItem, StockItem, Order, OrderItem, RestaurantSettings, UserRole, AppUser, PurchaseInvoice, ExpenseInvoice, KitchenNotification, DailyZReport } from './types';
import { initialOrders } from './data/initialData';

import { Header } from './components/Header';
import { TableGrid } from './components/TableGrid';
import { TableDetailModal } from './components/TableDetailModal';
import { KitchenView } from './components/KitchenView';
import { AdminPanel } from './components/AdminPanel';
import { PrintTicketModal } from './components/PrintTicketModal';
import { TransferTableModal } from './components/TransferTableModal';
import { NewTableModal } from './components/NewTableModal';
import { LoginScreen } from './components/LoginScreen';
import { UnpaidDebtsModal } from './components/UnpaidDebtsModal';
import { CriticalStockModal } from './components/CriticalStockModal';
import { AddInvoiceModal } from './components/AddInvoiceModal';
import { UserManualModal } from './components/UserManualModal';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { KitchenReadyAlert } from './components/KitchenReadyAlert';
import { CloseDayModal } from './components/CloseDayModal';
import { playKitchenReadyChime, triggerDesktopNotification } from './utils/audioAlert';
import { generateTicketHtml, executeThermalPrint } from './utils/thermalPrinter';

export default function App() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [purchaseInvoices, setPurchaseInvoices] = useState<PurchaseInvoice[]>([]);
  const [expenseInvoices, setExpenseInvoices] = useState<ExpenseInvoice[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [dailyZReports, setDailyZReports] = useState<DailyZReport[]>(() => StorageService.getDailyZReports());
  const [users, setUsers] = useState<AppUser[]>([]);
  const [settings, setSettings] = useState<RestaurantSettings>(StorageService.getSettings());
  const [notifications, setNotifications] = useState<KitchenNotification[]>(() => StorageService.getKitchenNotifications());
  const [activeReadyAlert, setActiveReadyAlert] = useState<KitchenNotification | null>(null);

  const alertedNotificationIdsRef = React.useRef<Set<string>>(new Set());

  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);

  const [activeTab, setActiveTab] = useState<'tables' | 'kitchen' | 'admin'>('tables');
  const [activeRole, setActiveRole] = useState<UserRole>('pos');

  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showNewTableModal, setShowNewTableModal] = useState<boolean>(false);
  const [showAddInvoiceModal, setShowAddInvoiceModal] = useState<boolean>(false);
  const [transferSourceTable, setTransferSourceTable] = useState<Table | null>(null);
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = React.useCallback((msg: string, duration = 2800) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimeoutRef.current = null;
    }, duration);
  }, []);

  // Ensure toast notification is always dismissed automatically even if prints/re-renders occur
  React.useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 2800);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const [modalSessionKey, setModalSessionKey] = useState<number>(0);

  // Unpaid Debts Modal & Payment
  const [showUnpaidDebtsModal, setShowUnpaidDebtsModal] = useState<boolean>(false);
  const [showCriticalStockModal, setShowCriticalStockModal] = useState<boolean>(false);
  const [showUserManualModal, setShowUserManualModal] = useState<boolean>(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState<boolean>(false);
  const [showCloseDayModal, setShowCloseDayModal] = useState<boolean>(false);
  const [debtPaymentModalOrder, setDebtPaymentModalOrder] = useState<Order | null>(null);
  const [debtPaymentType, setDebtPaymentType] = useState<'nakit' | 'kredi_karti'>('kredi_karti');

  // Refs to guarantee freshest values during rapid concurrent updates and prevent polling overwrites
  const zonesRef = useRef(zones);
  zonesRef.current = zones;
  const tablesRef = useRef(tables);
  tablesRef.current = tables;
  const categoriesRef = useRef(categories);
  categoriesRef.current = categories;
  const menuItemsRef = useRef(menuItems);
  menuItemsRef.current = menuItems;
  const stockItemsRef = useRef(stockItems);
  stockItemsRef.current = stockItems;
  const ordersRef = useRef(orders);
  ordersRef.current = orders;
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const usersRef = useRef(users);
  usersRef.current = users;
  const purchaseInvoicesRef = useRef(purchaseInvoices);
  purchaseInvoicesRef.current = purchaseInvoices;
  const expenseInvoicesRef = useRef(expenseInvoices);
  expenseInvoicesRef.current = expenseInvoices;

  // Load state on mount and sync with local Kasa server
  useEffect(() => {
    const loadInitialData = async () => {
      // First load from local storage cache for instant UI load
      const loadedUsers = StorageService.getUsers();
      const initialNotifs = StorageService.getKitchenNotifications();
      initialNotifs.forEach((n) => {
        if (n.read) alertedNotificationIdsRef.current.add(n.id);
      });
      setNotifications(initialNotifs);

      setZones(StorageService.getZones());
      setTables(StorageService.getTables());
      setCategories(StorageService.getCategories());
      setMenuItems(StorageService.getMenuItems());
      setStockItems(StorageService.getStockItems());
      setPurchaseInvoices(StorageService.getPurchaseInvoices());
      setExpenseInvoices(StorageService.getExpenseInvoices());
      setDailyZReports(StorageService.getDailyZReports());

      const localOrders = StorageService.getOrders();
      setOrders(localOrders);
      setUsers(loadedUsers);
      setSettings(StorageService.getSettings());

      // Then fetch full state from local Express SQLite server
      const serverData = await StorageService.fetchFullDataFromServer();
      if (serverData) {
        if (serverData.zones) setZones(serverData.zones);
        if (serverData.tables) setTables(serverData.tables);
        if (serverData.categories) setCategories(serverData.categories);
        if (serverData.menuItems) setMenuItems(serverData.menuItems);
        if (serverData.stockItems) setStockItems(serverData.stockItems);
        if (serverData.purchaseInvoices) setPurchaseInvoices(serverData.purchaseInvoices);
        if (serverData.expenseInvoices) setExpenseInvoices(serverData.expenseInvoices);
        if (serverData.dailyZReports) setDailyZReports(serverData.dailyZReports);
        if (serverData.orders) {
          setOrders(serverData.orders);
        }
        if (serverData.settings) setSettings(serverData.settings);
        if (serverData.users) setUsers(serverData.users);
        if (serverData.notifications) {
          setNotifications(serverData.notifications);
          serverData.notifications.forEach((n) => {
            if (n.read) alertedNotificationIdsRef.current.add(n.id);
          });
        }
      }

      // Enforce mandatory user login on every open/reload (do not restore last logged-in user)
      localStorage.removeItem('pos_current_user_id');
    };

    loadInitialData();

    // Periodic poll from Local Kasa Express server for real-time tablet sync (every 3 seconds)
    // Only dispatch React state updates if the server data actually changed to prevent resetting active user inputs
    const pollInterval = setInterval(async () => {
      const serverData = await StorageService.fetchFullDataFromServer();
      if (serverData) {
        if (serverData.zones && JSON.stringify(serverData.zones) !== JSON.stringify(zonesRef.current)) {
          zonesRef.current = serverData.zones;
          setZones(serverData.zones);
        }
        if (serverData.tables && JSON.stringify(serverData.tables) !== JSON.stringify(tablesRef.current)) {
          tablesRef.current = serverData.tables;
          setTables(serverData.tables);
        }
        if (serverData.categories && JSON.stringify(serverData.categories) !== JSON.stringify(categoriesRef.current)) {
          categoriesRef.current = serverData.categories;
          setCategories(serverData.categories);
        }
        if (serverData.menuItems && JSON.stringify(serverData.menuItems) !== JSON.stringify(menuItemsRef.current)) {
          menuItemsRef.current = serverData.menuItems;
          setMenuItems(serverData.menuItems);
        }
        if (serverData.stockItems && JSON.stringify(serverData.stockItems) !== JSON.stringify(stockItemsRef.current)) {
          stockItemsRef.current = serverData.stockItems;
          setStockItems(serverData.stockItems);
        }
        if (serverData.purchaseInvoices && JSON.stringify(serverData.purchaseInvoices) !== JSON.stringify(purchaseInvoicesRef.current)) {
          purchaseInvoicesRef.current = serverData.purchaseInvoices;
          setPurchaseInvoices(serverData.purchaseInvoices);
        }
        if (serverData.expenseInvoices && JSON.stringify(serverData.expenseInvoices) !== JSON.stringify(expenseInvoicesRef.current)) {
          expenseInvoicesRef.current = serverData.expenseInvoices;
          setExpenseInvoices(serverData.expenseInvoices);
        }
        if (serverData.orders && JSON.stringify(serverData.orders) !== JSON.stringify(ordersRef.current)) {
          ordersRef.current = serverData.orders;
          setOrders(serverData.orders);
        }
        if (serverData.settings && JSON.stringify(serverData.settings) !== JSON.stringify(settingsRef.current)) {
          settingsRef.current = serverData.settings;
          setSettings(serverData.settings);
        }
        if (serverData.users && JSON.stringify(serverData.users) !== JSON.stringify(usersRef.current)) {
          usersRef.current = serverData.users;
          setUsers(serverData.users);
        }
        if (serverData.notifications) {
          setNotifications(serverData.notifications);
          // Detect newly arrived unread notifications from kitchen!
          const unreadAlerts = serverData.notifications.filter(
            (n) => !n.read && !alertedNotificationIdsRef.current.has(n.id)
          );
          if (unreadAlerts.length > 0) {
            unreadAlerts.forEach((n) => alertedNotificationIdsRef.current.add(n.id));
            playKitchenReadyChime();
            const latest = unreadAlerts[0];
            setActiveReadyAlert(latest);
            const itemsSummary = latest.items.map((it) => `${it.quantity}x ${it.name}`).join(', ');
            triggerDesktopNotification(`🔔 Mutfak Hazır (${latest.tableName})`, itemsSummary);
          }
        }
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, []);

  // Real-time synchronization for same-window / multiple browser tabs
  useEffect(() => {
    const handleNotifUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<KitchenNotification[]>;
      if (customEvent.detail && Array.isArray(customEvent.detail)) {
        setNotifications(customEvent.detail);
        const unread = customEvent.detail.filter(
          (n) => !n.read && !alertedNotificationIdsRef.current.has(n.id)
        );
        if (unread.length > 0) {
          unread.forEach((n) => alertedNotificationIdsRef.current.add(n.id));
          playKitchenReadyChime();
          setActiveReadyAlert(unread[0]);
          const summary = unread[0].items.map((it) => `${it.quantity}x ${it.name}`).join(', ');
          triggerDesktopNotification(`🔔 Mutfak Hazır (${unread[0].tableName})`, summary);
        }
      }
    };

    const handleOpenPasswordModal = () => {
      setShowChangePasswordModal(true);
    };

    window.addEventListener('kitchen_notifications_updated', handleNotifUpdate);
    window.addEventListener('open_change_password_modal', handleOpenPasswordModal);
    return () => {
      window.removeEventListener('kitchen_notifications_updated', handleNotifUpdate);
      window.removeEventListener('open_change_password_modal', handleOpenPasswordModal);
    };
  }, []);

  // Handle Login Success
  const handleLoginSuccess = (user: AppUser) => {
    setCurrentUser(user);
    // Session is kept in memory only; program close or reload enforces login again

    // Route active view automatically based on user's highest permissions
    if (user.role === 'kitchen' || (!user.permissions.canTakeOrder && user.role !== 'admin')) {
      setActiveTab('kitchen');
      setActiveRole('kitchen');
    } else if (user.permissions.canTakeOrder) {
      setActiveTab('tables');
      setActiveRole('pos');
    } else {
      setActiveTab('admin');
      setActiveRole('admin');
    }

    showToast(`${user.name} olarak giriş yapıldı.`, 3000);
  };

  // Handle Logout
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('pos_current_user_id');
    showToast('Oturum kapatıldı.', 2500);
  };

  // Handle User Change Password / PIN
  const handleUpdateCurrentUserPin = async (newPin: string) => {
    if (!currentUser) return;
    const updatedUsers = users.map((u) =>
      u.id === currentUser.id ? { ...u, pinCode: newPin } : u
    );
    const updatedCurrentUser = { ...currentUser, pinCode: newPin };
    setUsers(updatedUsers);
    setCurrentUser(updatedCurrentUser);
    StorageService.saveUsers(updatedUsers);

    // Record audit log
    StorageService.addSystemLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'Şifre Değiştirildi',
      details: `${currentUser.name} (@${currentUser.username}) kendi PIN kodunu başarıyla güncelledi.`,
      category: 'system',
    });

    showToast('Şifreniz / PIN kodunuz başarıyla güncellendi!', 3000);
  };

  // Sync to storage on state changes
  const saveAll = (
    newZones = zonesRef.current,
    newTables = tablesRef.current,
    newCategories = categoriesRef.current,
    newMenuItems = menuItemsRef.current,
    newStock = stockItemsRef.current,
    newOrders = ordersRef.current,
    newSettings = settingsRef.current,
    newUsers = usersRef.current
  ) => {
    zonesRef.current = newZones;
    tablesRef.current = newTables;
    categoriesRef.current = newCategories;
    menuItemsRef.current = newMenuItems;
    stockItemsRef.current = newStock;
    ordersRef.current = newOrders;
    settingsRef.current = newSettings;
    usersRef.current = newUsers;

    StorageService.saveZones(newZones);
    StorageService.saveTables(newTables);
    StorageService.saveCategories(newCategories);
    StorageService.saveMenuItems(newMenuItems);
    StorageService.saveStockItems(newStock);
    StorageService.saveOrders(newOrders);
    StorageService.saveSettings(newSettings);
    StorageService.saveUsers(newUsers);
  };

  // Atomic update for menu and stock items (essential for "Otomatik Stok Aç & Bağla")
  const handleUpdateMenuAndStockItems = (newItems: MenuItem[], newStock: StockItem[]) => {
    menuItemsRef.current = newItems;
    stockItemsRef.current = newStock;
    setMenuItems(newItems);
    setStockItems(newStock);
    saveAll(
      zonesRef.current,
      tablesRef.current,
      categoriesRef.current,
      newItems,
      newStock,
      ordersRef.current,
      settingsRef.current,
      usersRef.current
    );
  };


  // Quick reset demo data
  const handleResetData = () => {
    if (window.confirm('Tüm veriler varsayılan örnek verilere sıfırlansın mı?')) {
      StorageService.resetAllToDefaults();
      setZones(StorageService.getZones());
      setTables(StorageService.getTables());
      setCategories(StorageService.getCategories());
      setMenuItems(StorageService.getMenuItems());
      setStockItems(StorageService.getStockItems());
      setOrders(StorageService.getOrders());
      setSettings(StorageService.getSettings());
      setSelectedTable(null);
    }
  };

  // Open / Save Order Handler
  const handleSaveOrder = (
    tableId: string,
    items: OrderItem[],
    discountPercent: number,
    discountAmount: number,
    waiterName: string,
    customerNotes?: string,
    isBillRequest?: boolean,
    immediatePaymentType?: 'nakit' | 'kredi_karti' | 'yemek_karti' | 'parcali'
  ) => {
    const table = tables.find((t) => t.id === tableId);
    if (!table) return;

    const zone = zones.find((z) => z.id === table.zoneId);

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalDiscount = Math.min(subtotal, discountAmount + (subtotal * discountPercent) / 100);
    const taxableSubtotal = Math.max(0, subtotal - totalDiscount);
    const taxAmount = (taxableSubtotal * settings.taxRatePercent) / (100 + settings.taxRatePercent);
    const totalAmount = Math.max(0, subtotal - totalDiscount);

    let updatedOrders = [...orders];
    let orderId = table.currentOrderId;
    const existingOrder = orders.find((o) => o.id === orderId && o.status === 'open');
    const existingItems = existingOrder ? existingOrder.items : [];

    if (orderId && existingOrder) {
      // Update existing open order
      updatedOrders = updatedOrders.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            items,
            subtotal,
            discountAmount: totalDiscount,
            discountPercent,
            taxAmount,
            totalAmount,
            waiterName,
            customerNotes: customerNotes || o.customerNotes || '',
            status: immediatePaymentType ? ('closed' as const) : o.status,
            closedAt: immediatePaymentType ? new Date().toISOString() : o.closedAt,
            paymentType: immediatePaymentType || o.paymentType,
          };
        }
        return o;
      });
    } else {
      // Create new order
      orderId = 'ord-' + Math.floor(100 + Math.random() * 900);
      const newOrder: Order = {
        id: orderId,
        tableId: table.id,
        tableName: table.number,
        zoneId: table.zoneId,
        zoneName: zone?.name || 'Genel',
        status: immediatePaymentType ? 'closed' : 'open',
        closedAt: immediatePaymentType ? new Date().toISOString() : undefined,
        paymentType: immediatePaymentType,
        items,
        subtotal,
        discountAmount: totalDiscount,
        discountPercent,
        taxAmount,
        totalAmount,
        waiterName,
        customerNotes: customerNotes || '',
        createdAt: new Date().toISOString(),
      };
      updatedOrders.push(newOrder);
    }

    // Deduct stock for added item quantities (delta calculation)
    let updatedStockItems = [...stockItems];
    const updatedMenuItems = menuItems.map((menuItem) => {
      const oldQty = existingItems
        .filter((i) => i.menuItemId === menuItem.id)
        .reduce((sum, i) => sum + i.quantity, 0);
      const newQty = items
        .filter((i) => i.menuItemId === menuItem.id)
        .reduce((sum, i) => sum + i.quantity, 0);
      const deltaQty = newQty - oldQty;

      if (deltaQty > 0) {
        // Deduct raw ingredient stock if recipe exists
        if (menuItem.recipe && menuItem.recipe.length > 0) {
          menuItem.recipe.forEach((recipeItem) => {
            const stockIndex = updatedStockItems.findIndex((s) => s.id === recipeItem.stockItemId);
            if (stockIndex > -1) {
              updatedStockItems[stockIndex] = {
                ...updatedStockItems[stockIndex],
                quantity: Math.max(0, updatedStockItems[stockIndex].quantity - recipeItem.amount * deltaQty),
              };
            }
          });
        }

        return {
          ...menuItem,
          stockQuantity: Math.max(0, menuItem.stockQuantity - deltaQty),
        };
      }
      return menuItem;
    });

    // Update table status
    const updatedTables = tables.map((t) => {
      if (t.id === table.id) {
        if (immediatePaymentType) {
          return {
            ...t,
            status: 'empty' as const,
            currentOrderId: undefined,
            openedAt: undefined,
          };
        }
        return {
          ...t,
          status: isBillRequest ? ('bill_requested' as const) : ('occupied' as const),
          currentOrderId: orderId,
          openedAt: t.openedAt || new Date().toISOString(),
        };
      }
      return t;
    });

    setOrders(updatedOrders);
    setTables(updatedTables);
    setMenuItems(updatedMenuItems);
    setStockItems(updatedStockItems);
    saveAll(zones, updatedTables, categories, updatedMenuItems, updatedStockItems, updatedOrders, settings, users);

    // Return to main screen & close table detail modal
    setSelectedTable(null);
    setActiveTab('tables');

    // Show 2-second notification toast
    const toastText = immediatePaymentType
      ? `Ödeme Alındı & Masa Kapatıldı! (${table.number})`
      : isBillRequest
      ? `Hesap İstendi! (${table.number})`
      : `✓ Sipariş Kaydedildi & Mutfağa İletildi! (${table.number})`;

    showToast(toastText, 2500);
  };

  // Mark Customer Order as Unpaid Debt ("Ödemeden Gitti")
  const handleMarkAsUnpaidDebt = (
    tableId: string,
    customerNotes: string,
    items: OrderItem[],
    discountPercent: number,
    discountAmount: number,
    waiterName: string
  ) => {
    const table = tables.find((t) => t.id === tableId);
    if (!table) return;

    const zone = zones.find((z) => z.id === table.zoneId);

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalDiscount = Math.min(subtotal, discountAmount + (subtotal * discountPercent) / 100);
    const taxableSubtotal = Math.max(0, subtotal - totalDiscount);
    const taxAmount = (taxableSubtotal * settings.taxRatePercent) / (100 + settings.taxRatePercent);
    const totalAmount = Math.max(0, subtotal - totalDiscount);

    let updatedOrders = [...orders];
    let orderId = table.currentOrderId;

    if (orderId) {
      updatedOrders = updatedOrders.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            items,
            subtotal,
            discountAmount: totalDiscount,
            discountPercent,
            taxAmount,
            totalAmount,
            waiterName,
            customerNotes,
            status: 'unpaid_debt' as const,
            debtOriginDate: o.debtOriginDate || new Date().toISOString().slice(0, 10),
            isCarriedOverDebt: o.isCarriedOverDebt || false,
          };
        }
        return o;
      });
    } else {
      orderId = 'ord-' + Math.floor(100 + Math.random() * 900);
      const newOrder: Order = {
        id: orderId,
        tableId: table.id,
        tableName: table.number,
        zoneId: table.zoneId,
        zoneName: zone?.name || 'Genel',
        status: 'unpaid_debt',
        items,
        subtotal,
        discountAmount: totalDiscount,
        discountPercent,
        taxAmount,
        totalAmount,
        waiterName,
        customerNotes,
        createdAt: new Date().toISOString(),
        debtOriginDate: new Date().toISOString().slice(0, 10),
        isCarriedOverDebt: false,
      };
      updatedOrders.push(newOrder);
    }

    // Free physical table
    const updatedTables = tables.map((t) => {
      if (t.id === table.id) {
        return {
          ...t,
          status: 'empty' as const,
          currentOrderId: undefined,
          openedAt: undefined,
        };
      }
      return t;
    });

    setOrders(updatedOrders);
    setTables(updatedTables);
    saveAll(zones, updatedTables, categories, menuItems, stockItems, updatedOrders, settings, users);

    // Keep table selected and force remount of modal for fresh empty order screen
    const updatedTableObj = updatedTables.find((t) => t.id === tableId) || table;
    setModalSessionKey(Date.now());
    setSelectedTable({ ...updatedTableObj });

    // 2-second notification toast "Borç Yazıldı"
    showToast(`Borç Yazıldı: "${customerNotes}" (${table.number})`, 2500);
  };

  // Close & Pay Payment Handler
  const handleClosePayment = (
    orderId: string,
    paymentType: 'nakit' | 'kredi_karti' | 'yemek_karti' | 'parcali',
    amount: number
  ) => {
    let closedTableId = '';
    const updatedOrders = orders.map((o) => {
      if (o.id === orderId) {
        closedTableId = o.tableId;
        const wasDebt = o.status === 'unpaid_debt';
        return {
          ...o,
          status: 'closed' as const,
          closedAt: new Date().toISOString(),
          paymentType,
          totalAmount: amount,
          debtCollectedAt: wasDebt ? new Date().toISOString() : o.debtCollectedAt,
        };
      }
      return o;
    });

    const updatedTables = tables.map((t) => {
      if (t.id === closedTableId) {
        return {
          ...t,
          status: 'empty' as const,
          currentOrderId: undefined,
          openedAt: undefined,
        };
      }
      return t;
    });

    setOrders(updatedOrders);
    setTables(updatedTables);
    saveAll(zones, updatedTables, categories, menuItems, stockItems, updatedOrders, settings);
  };

  // Handle Day Closure & Z-Report sealing
  const handleCloseDay = (notes?: string): DailyZReport => {
    // Collect all closed orders that are not yet sealed into a Z-report
    const unsealedOrders = orders.filter((o) => o.status === 'closed' && !o.zReportId);
    
    const nextZNum = (dailyZReports.length || 0) + 1;
    const zReportNo = `Z-${String(nextZNum).padStart(4, '0')}`;
    const nowIso = new Date().toISOString();
    const todayDateStr = nowIso.slice(0, 10);

    const totalRevenue = unsealedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalDiscounts = unsealedOrders.reduce((sum, o) => sum + o.discountAmount, 0);
    const totalTax = unsealedOrders.reduce((sum, o) => sum + o.taxAmount, 0);

    const totalCost = unsealedOrders.reduce((sum, o) => {
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

    const paymentBreakdown = {
      kredi_karti: unsealedOrders.filter((o) => o.paymentType === 'kredi_karti').reduce((s, o) => s + o.totalAmount, 0),
      nakit: unsealedOrders.filter((o) => o.paymentType === 'nakit').reduce((s, o) => s + o.totalAmount, 0),
      yemek_karti: unsealedOrders.filter((o) => o.paymentType === 'yemek_karti').reduce((s, o) => s + o.totalAmount, 0),
    };

    const itemSalesMap = new Map<string, { name: string; qty: number; revenue: number }>();
    unsealedOrders.forEach((o) => {
      o.items.forEach((i) => {
        const existing = itemSalesMap.get(i.name) || { name: i.name, qty: 0, revenue: 0 };
        itemSalesMap.set(i.name, {
          name: i.name,
          qty: existing.qty + i.quantity,
          revenue: existing.revenue + i.price * i.quantity,
        });
      });
    });
    const itemsSold = Array.from(itemSalesMap.values()).sort((a, b) => b.qty - a.qty);

    const activeOpenTables = tables.filter((t) => t.status === 'occupied' || t.status === 'bill_requested');
    const openOrders = orders.filter((o) => o.status === 'open');
    const devredenTutar = openOrders.reduce((s, o) => s + o.totalAmount, 0);

    // Active unpaid debts (Veresiye) carried over across days until collected
    const unpaidDebtOrders = orders.filter((o) => o.status === 'unpaid_debt');
    const devredenBorcluSayisi = unpaidDebtOrders.length;
    const devredenBorcTutari = unpaidDebtOrders.reduce((s, o) => s + o.totalAmount, 0);
    const devredenBorclular = unpaidDebtOrders.map((d) => ({
      orderId: d.id,
      customerName: d.customerNotes || 'İsimsiz Müşteri',
      tableName: d.tableName,
      amount: d.totalAmount,
      createdAt: d.createdAt,
    }));

    const newZReport: DailyZReport = {
      id: `zrep-${Date.now()}-${nextZNum}`,
      zNumber: nextZNum,
      zReportNo,
      date: todayDateStr,
      openedAt: unsealedOrders[0]?.createdAt || nowIso,
      closedAt: nowIso,
      closedByUserId: currentUser?.id,
      closedByUserName: currentUser?.name || 'Kasa Yetkilisi',
      totalRevenue,
      ordersCount: unsealedOrders.length,
      paymentBreakdown,
      totalTax,
      totalDiscounts,
      totalCost,
      estimatedProfit,
      devredenMasaSayisi: activeOpenTables.length,
      devredenTutar,
      devredenBorcluSayisi,
      devredenBorcTutari,
      devredenBorclular,
      itemsSold,
      ordersSnapshot: unsealedOrders,
    };

    // Mark unsealed closed orders with this zReportId, and flag unpaid debts as carried over
    const unsealedIds = new Set(unsealedOrders.map((o) => o.id));
    const updatedOrders = orders.map((o) => {
      if (unsealedIds.has(o.id)) {
        return { ...o, zReportId: newZReport.id };
      }
      if (o.status === 'unpaid_debt') {
        return {
          ...o,
          isCarriedOverDebt: true,
          debtOriginDate: o.debtOriginDate || o.createdAt?.slice(0, 10) || todayDateStr,
        };
      }
      return o;
    });

    const updatedReports = [newZReport, ...dailyZReports];

    setOrders(updatedOrders);
    setDailyZReports(updatedReports);

    StorageService.saveOrders(updatedOrders, true);
    StorageService.saveDailyZReports(updatedReports, true);

    StorageService.addSystemLog({
      userId: currentUser?.id || 'admin',
      userName: currentUser?.name || 'Kasa Sorumlusu',
      userRole: currentUser?.role || 'admin',
      action: 'Günü Kapatma (Z-Raporu)',
      details: `${zReportNo} gün sonu Z-Raporu kesildi. ${unsealedOrders.length} adisyon kapatıldı, toplam ciro: ${totalRevenue.toLocaleString('tr-TR')} ₺`,
      category: 'system',
    });

    showToast(`GÜN BAŞARIYLA KAPATILDI! ${zReportNo} nolu Z-Raporu arşive kaydedildi. Yeni satışlar 0 ₺ ciro ile başlıyor.`, 3500);
    return newZReport;
  };

  // Toggle Table Request Bill Status
  const handleRequestBillStatus = (tableId: string, requested: boolean) => {
    const updatedTables = tables.map((t) => {
      if (t.id === tableId) {
        return {
          ...t,
          status: requested ? ('bill_requested' as const) : ('occupied' as const),
        };
      }
      return t;
    });
    setTables(updatedTables);
    saveAll(zones, updatedTables, categories, menuItems, stockItems, orders, settings);
  };

  // Kitchen view status update
  const handleUpdateKitchenItemStatus = (orderId: string, itemId: string, status: 'preparing' | 'served') => {
    const targetOrder = orders.find((o) => o.id === orderId);
    let createdNotif: KitchenNotification | null = null;

    if (targetOrder && status === 'served') {
      const targetItem = targetOrder.items.find((i) => i.id === itemId);
      if (targetItem) {
        createdNotif = {
          id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          orderId: targetOrder.id,
          tableId: targetOrder.tableId,
          tableName: targetOrder.tableName,
          zoneName: targetOrder.zoneName,
          waiterName: targetOrder.waiterName,
          items: [
            {
              id: targetItem.id,
              name: targetItem.name,
              quantity: targetItem.quantity,
              note: targetItem.note,
            },
          ],
          timestamp: new Date().toISOString(),
          read: false,
          type: 'item_ready',
        };
      }
    }

    const updatedOrders = orders.map((o) => {
      if (o.id === orderId) {
        const updatedItems = o.items.map((i) => (i.id === itemId ? { ...i, status } : i));
        return { ...o, items: updatedItems };
      }
      return o;
    });
    setOrders(updatedOrders);
    saveAll(zones, tables, categories, menuItems, stockItems, updatedOrders, settings);

    if (createdNotif) {
      StorageService.addKitchenNotification(createdNotif);
      setNotifications((prev) => [createdNotif!, ...prev.filter((n) => n.id !== createdNotif!.id)]);
      alertedNotificationIdsRef.current.add(createdNotif.id);
      playKitchenReadyChime();
      setActiveReadyAlert(createdNotif);
      triggerDesktopNotification(
        `🔔 Mutfak Hazır (${createdNotif.tableName})`,
        `${createdNotif.items[0]?.quantity}x ${createdNotif.items[0]?.name} servise hazır.`
      );
      showToast(`✓ ${createdNotif.tableName} - ${createdNotif.items[0]?.name} hazır! Garsona bildirildi.`, 3000);
    }
  };

  const handleUpdateAllTableItemsStatus = (orderId: string, status: 'served') => {
    const targetOrder = orders.find((o) => o.id === orderId);
    let createdNotif: KitchenNotification | null = null;

    if (targetOrder && status === 'served') {
      const readyItems = targetOrder.items
        .filter((i) => i.status === 'pending' || i.status === 'preparing')
        .map((i) => ({
          id: i.id,
          name: i.name,
          quantity: i.quantity,
          note: i.note,
        }));

      if (readyItems.length > 0) {
        createdNotif = {
          id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          orderId: targetOrder.id,
          tableId: targetOrder.tableId,
          tableName: targetOrder.tableName,
          zoneName: targetOrder.zoneName,
          waiterName: targetOrder.waiterName,
          items: readyItems,
          timestamp: new Date().toISOString(),
          read: false,
          type: 'table_ready',
        };
      }
    }

    const updatedOrders = orders.map((o) => {
      if (o.id === orderId) {
        const updatedItems = o.items.map((i) => ({ ...i, status }));
        return { ...o, items: updatedItems };
      }
      return o;
    });
    setOrders(updatedOrders);
    saveAll(zones, tables, categories, menuItems, stockItems, updatedOrders, settings);

    if (createdNotif) {
      StorageService.addKitchenNotification(createdNotif);
      setNotifications((prev) => [createdNotif!, ...prev.filter((n) => n.id !== createdNotif!.id)]);
      alertedNotificationIdsRef.current.add(createdNotif.id);
      playKitchenReadyChime();
      setActiveReadyAlert(createdNotif);
      triggerDesktopNotification(
        `🔔 Mutfak Hazır (${createdNotif.tableName})`,
        `Tüm masa siparişleri (${createdNotif.items.length} kalem) servise hazır.`
      );
      showToast(`✓ ${createdNotif.tableName} - Tüm siparişler hazır! Garsona bildirildi.`, 3000);
    }
  };

  const handleSelectTableById = (tableId: string) => {
    const table = tables.find((t) => t.id === tableId);
    if (table) {
      setActiveTab('tables');
      setActiveRole('pos');
      setSelectedTable(table);
    }
  };

  const handleMarkNotificationRead = (id?: string, all?: boolean) => {
    StorageService.markNotificationRead(id, all);
    if (all) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setActiveReadyAlert(null);
    } else if (id) {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      if (activeReadyAlert?.id === id) {
        setActiveReadyAlert(null);
      }
    }
  };

  const handleClearNotifications = () => {
    StorageService.clearKitchenNotifications();
    setNotifications([]);
    setActiveReadyAlert(null);
    alertedNotificationIdsRef.current.clear();
    showToast('✓ Mutfak bildirimleri temizlendi.', 2500);
  };

  const handleDeleteNotification = (id: string) => {
    StorageService.deleteKitchenNotification(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (activeReadyAlert?.id === id) {
      setActiveReadyAlert(null);
    }
  };

  // Table Transfer / Merge
  const handleTransferTable = (sourceTableId: string, targetTableId: string) => {
    const sourceTable = tables.find((t) => t.id === sourceTableId);
    const targetTable = tables.find((t) => t.id === targetTableId);
    if (!sourceTable || !targetTable || !sourceTable.currentOrderId) return;

    const activeOrder = orders.find((o) => o.id === sourceTable.currentOrderId);
    if (!activeOrder) return;

    const targetZone = zones.find((z) => z.id === targetTable.zoneId);

    // If target table has an active order, merge items!
    let updatedOrders = [...orders];
    if (targetTable.currentOrderId) {
      const targetOrder = orders.find((o) => o.id === targetTable.currentOrderId);
      if (targetOrder) {
        const mergedItems = [...targetOrder.items, ...activeOrder.items];
        const newSubtotal = mergedItems.reduce((s, i) => s + i.price * i.quantity, 0);

        updatedOrders = updatedOrders.map((o) => {
          if (o.id === targetOrder.id) {
            return {
              ...o,
              items: mergedItems,
              subtotal: newSubtotal,
              totalAmount: Math.max(0, newSubtotal - o.discountAmount),
            };
          }
          if (o.id === activeOrder.id) {
            return { ...o, status: 'cancelled' as const };
          }
          return o;
        });
      }
    } else {
      // Reassign order to target table
      updatedOrders = updatedOrders.map((o) => {
        if (o.id === activeOrder.id) {
          return {
            ...o,
            tableId: targetTable.id,
            tableName: targetTable.number,
            zoneId: targetTable.zoneId,
            zoneName: targetZone?.name || 'Genel',
          };
        }
        return o;
      });
    }

    const updatedTables = tables.map((t) => {
      if (t.id === sourceTableId) {
        return { ...t, status: 'empty' as const, currentOrderId: undefined, openedAt: undefined };
      }
      if (t.id === targetTableId) {
        return {
          ...t,
          status: 'occupied' as const,
          currentOrderId: targetTable.currentOrderId || activeOrder.id,
          openedAt: t.openedAt || new Date().toISOString(),
        };
      }
      return t;
    });

    setOrders(updatedOrders);
    setTables(updatedTables);
    saveAll(zones, updatedTables, categories, menuItems, stockItems, updatedOrders, settings);
  };

  // Add New Table
  const handleAddTable = (number: string, zoneId: string, capacity: number) => {
    const newTable: Table = {
      id: 'tbl-' + Date.now(),
      number,
      zoneId,
      capacity,
      status: 'empty',
    };
    const updatedTables = [...tables, newTable];
    setTables(updatedTables);
    saveAll(zones, updatedTables, categories, menuItems, stockItems, orders, settings);
  };

  // Add Purchase Invoice Handler
  const handleAddPurchaseInvoice = (invoice: PurchaseInvoice) => {
    const updated = [invoice, ...purchaseInvoices];
    setPurchaseInvoices(updated);
    StorageService.savePurchaseInvoices(updated);

    if (invoice.stockItemId) {
      const updatedStock = stockItems.map((s) => {
        if (s.id === invoice.stockItemId) {
          return {
            ...s,
            quantity: s.quantity + invoice.quantity,
            costPerUnit: invoice.unitPrice > 0 ? invoice.unitPrice : s.costPerUnit,
            lastUpdated: new Date().toISOString(),
          };
        }
        return s;
      });
      setStockItems(updatedStock);
      StorageService.saveStockItems(updatedStock);
    }
  };

  // Add Expense Invoice Handler
  const handleAddExpenseInvoice = (expense: ExpenseInvoice) => {
    const updated = [expense, ...expenseInvoices];
    setExpenseInvoices(updated);
    StorageService.saveExpenseInvoices(updated);
  };

  // Stats
  const occupiedTableCount = tables.filter((t) => t.status === 'occupied' || t.status === 'bill_requested').length;
  const openOrdersTotal = orders
    .filter((o) => o.status === 'open')
    .reduce((sum, o) => sum + o.totalAmount, 0);
  const lowStockCount =
    stockItems.filter((s) => s.quantity <= s.minThreshold).length +
    menuItems.filter((m) => (m.stockQuantity ?? 0) <= (m.minStockAlert ?? 10)).length;

  const currentActiveOrderForModal = selectedTable
    ? orders.find((o) => o.id === selectedTable.currentOrderId && o.status === 'open')
    : undefined;

  // Render Login Screen if user is not logged in
  if (!currentUser) {
    return (
      <LoginScreen
        users={users}
        settings={settings}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  const unpaidDebtCount = orders.filter((o) => o.status === 'unpaid_debt').length;
  const unsealedOrdersCount = orders.filter((o) => o.status === 'closed' && !o.zReportId).length;

  return (
    <div className="min-h-screen flex flex-col bg-stone-100 dark:bg-stone-950 text-stone-900 dark:text-stone-100 antialiased font-sans w-full max-w-full overflow-x-hidden">
      
      {/* Top Header */}
      <Header
        activeRole={activeRole}
        onRoleChange={(role) => setActiveRole(role)}
        settings={settings}
        occupiedTableCount={occupiedTableCount}
        totalTableCount={tables.length}
        openOrdersTotal={openOrdersTotal}
        lowStockCount={lowStockCount}
        onResetData={handleResetData}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenChangePasswordModal={() => setShowChangePasswordModal(true)}
        onOpenCriticalStockModal={() => setShowCriticalStockModal(true)}
        onOpenAddInvoiceModal={() => setShowAddInvoiceModal(true)}
        onOpenUserManualModal={() => setShowUserManualModal(true)}
        onOpenCloseDayModal={() => setShowCloseDayModal(true)}
        unsealedOrdersCount={unsealedOrdersCount}
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
        onClearNotifications={handleClearNotifications}
        onDeleteNotification={handleDeleteNotification}
        onSelectTableById={handleSelectTableById}
      />

      {/* Main Body Content */}
      <main className="w-full max-w-[1720px] mx-auto px-2 sm:px-4 lg:px-6 py-2.5 sm:py-5 flex-1 overflow-x-hidden">
        {activeTab === 'tables' && (
          <TableGrid
            tables={tables}
            zones={zones}
            orders={orders}
            settings={settings}
            currentUser={currentUser}
            unpaidDebtCount={unpaidDebtCount}
            unsealedOrdersCount={unsealedOrdersCount}
            onSelectTable={(tbl) => setSelectedTable(tbl)}
            onQuickNewOrder={(tbl) => setSelectedTable(tbl)}
            onOpenUnpaidDebtsModal={() => setShowUnpaidDebtsModal(true)}
            onOpenCloseDayModal={() => setShowCloseDayModal(true)}
          />
        )}

        {activeTab === 'kitchen' && (
          <KitchenView
            orders={orders}
            settings={settings}
            onUpdateItemStatus={handleUpdateKitchenItemStatus}
            onUpdateAllTableItemsStatus={handleUpdateAllTableItemsStatus}
          />
        )}

        {activeTab === 'admin' && (
          <AdminPanel
            categories={categories}
            menuItems={menuItems}
            stockItems={stockItems}
            purchaseInvoices={purchaseInvoices}
            expenseInvoices={expenseInvoices}
            orders={orders}
            zones={zones}
            tables={tables}
            settings={settings}
            users={users}
            currentUser={currentUser}
            dailyZReports={dailyZReports}
            onCloseDay={handleCloseDay}
            onUpdateDailyZReports={(newReports) => {
              setDailyZReports(newReports);
              StorageService.saveDailyZReports(newReports);
            }}
            onAddPurchaseInvoice={handleAddPurchaseInvoice}
            onAddExpenseInvoice={handleAddExpenseInvoice}
            onUpdatePurchaseInvoices={(newInvoices) => {
              setPurchaseInvoices(newInvoices);
              StorageService.savePurchaseInvoices(newInvoices);
            }}
            onUpdateExpenseInvoices={(newExpenses) => {
              setExpenseInvoices(newExpenses);
              StorageService.saveExpenseInvoices(newExpenses);
            }}
            onUpdateOrders={(newOrders) => {
              setOrders(newOrders);
              StorageService.saveOrders(newOrders);
            }}
            onOpenAddInvoiceModal={() => setShowAddInvoiceModal(true)}
            onUpdateCategories={(newCat) => {
              categoriesRef.current = newCat;
              setCategories(newCat);
              saveAll(zonesRef.current, tablesRef.current, newCat, menuItemsRef.current, stockItemsRef.current, ordersRef.current, settingsRef.current, usersRef.current);
            }}
            onUpdateMenuItems={(newItems) => {
              menuItemsRef.current = newItems;
              setMenuItems(newItems);
              saveAll(zonesRef.current, tablesRef.current, categoriesRef.current, newItems, stockItemsRef.current, ordersRef.current, settingsRef.current, usersRef.current);
            }}
            onUpdateStockItems={(newStock) => {
              stockItemsRef.current = newStock;
              setStockItems(newStock);
              saveAll(zonesRef.current, tablesRef.current, categoriesRef.current, menuItemsRef.current, newStock, ordersRef.current, settingsRef.current, usersRef.current);
            }}
            onUpdateMenuAndStockItems={handleUpdateMenuAndStockItems}
            onUpdateZones={(newZones) => {
              zonesRef.current = newZones;
              setZones(newZones);
              saveAll(newZones, tablesRef.current, categoriesRef.current, menuItemsRef.current, stockItemsRef.current, ordersRef.current, settingsRef.current, usersRef.current);
            }}
            onUpdateTables={(newTables) => {
              tablesRef.current = newTables;
              setTables(newTables);
              saveAll(zonesRef.current, newTables, categoriesRef.current, menuItemsRef.current, stockItemsRef.current, ordersRef.current, settingsRef.current, usersRef.current);
            }}
            onUpdateSettings={(newSettings) => {
              settingsRef.current = newSettings;
              setSettings(newSettings);
              saveAll(zonesRef.current, tablesRef.current, categoriesRef.current, menuItemsRef.current, stockItemsRef.current, ordersRef.current, newSettings, usersRef.current);
            }}
            onUpdateUsers={(newUsers) => {
              usersRef.current = newUsers;
              setUsers(newUsers);
              saveAll(zonesRef.current, tablesRef.current, categoriesRef.current, menuItemsRef.current, stockItemsRef.current, ordersRef.current, settingsRef.current, newUsers);
            }}
            onOpenPrintTicket={(order) => setPrintingOrder(order)}
          />
        )}

      </main>

      {/* Global Application Footer */}
      <footer className="mt-auto border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 py-3 sm:py-4 px-2 sm:px-4 lg:px-6 text-center text-xs text-stone-500 dark:text-stone-400">
        <div className="w-full max-w-[1720px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white p-1 border border-stone-200 dark:border-stone-700 flex items-center justify-center shrink-0 shadow-xs">
              <img src={settings.logoUrl || '/logo.svg'} alt={settings.name} className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-base text-stone-800 dark:text-stone-200">{settings.name}</span>
          </div>
          <div className="text-xs text-stone-500 dark:text-stone-400 font-medium">
            © {new Date().getFullYear()} Tüm hakları saklıdır. Telif Hakkı & Altyapı: <span className="text-amber-600 dark:text-amber-400 font-bold">DG Digital Güvenlik Yazılım</span>
          </div>
        </div>
      </footer>

      {/* Table Detail Order & Payment Modal */}
      {selectedTable && (
        <TableDetailModal
          key={`tbl-modal-${selectedTable.id}-${selectedTable.currentOrderId || 'new'}-${modalSessionKey}`}
          table={selectedTable}
          order={currentActiveOrderForModal}
          categories={categories}
          menuItems={menuItems}
          settings={settings}
          currentUser={currentUser}
          unsealedOrdersCount={unsealedOrdersCount}
          onClose={() => setSelectedTable(null)}
          onSaveOrder={handleSaveOrder}
          onClosePayment={handleClosePayment}
          onRequestBillStatus={handleRequestBillStatus}
          onOpenTransferModal={(tbl) => {
            setTransferSourceTable(tbl);
            setSelectedTable(null);
          }}
          onOpenPrintTicket={(ord) => setPrintingOrder(ord)}
          onOpenCloseDayModal={() => setShowCloseDayModal(true)}
          onMarkAsUnpaidDebt={handleMarkAsUnpaidDebt}
        />
      )}

      {/* Day Closure & Z-Report Sealing Modal */}
      {showCloseDayModal && (
        <CloseDayModal
          isOpen={showCloseDayModal}
          onClose={() => setShowCloseDayModal(false)}
          orders={orders}
          tables={tables}
          menuItems={menuItems}
          settings={settings}
          currentUser={currentUser}
          dailyZReports={dailyZReports}
          onExecuteCloseDay={handleCloseDay}
        />
      )}

      {/* Unpaid Debts Modal */}
      {showUnpaidDebtsModal && (
        <UnpaidDebtsModal
          orders={orders}
          settings={settings}
          onClose={() => setShowUnpaidDebtsModal(false)}
          onSelectDebtForPayment={(ord) => setDebtPaymentModalOrder(ord)}
          onOpenPrintTicket={(ord) => setPrintingOrder(ord)}
        />
      )}

      {/* Debt Order Payment Dialog Overlay */}
      {debtPaymentModalOrder && (
        <div className="fixed inset-0 z-60 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <div>
                <h3 className="font-extrabold text-lg text-stone-900 dark:text-stone-100">Müşteri Borç Tahsilatı</h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Müşteri: <strong className="text-stone-900 dark:text-stone-200">{debtPaymentModalOrder.customerNotes}</strong>
                </p>
              </div>
              <button
                onClick={() => setDebtPaymentModalOrder(null)}
                className="p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-rose-50 dark:bg-rose-950/40 p-4 rounded-2xl border border-rose-200 dark:border-rose-900/50 text-center">
              <span className="text-xs text-stone-500 dark:text-stone-400 font-semibold block">Tahsil Edilecek Borç Tutarı</span>
              <span className="text-3xl font-black text-rose-600 dark:text-rose-400">
                {debtPaymentModalOrder.totalAmount ? debtPaymentModalOrder.totalAmount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' }) : '0 TL'}
              </span>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block">Ödeme Yöntemi Seçiniz:</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDebtPaymentType('kredi_karti')}
                  className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all ${
                    debtPaymentType === 'kredi_karti'
                      ? 'bg-amber-500 text-stone-950 border-amber-500 shadow-xs'
                      : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Kredi Kartı</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDebtPaymentType('nakit')}
                  className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all ${
                    debtPaymentType === 'nakit'
                      ? 'bg-amber-500 text-stone-950 border-amber-500 shadow-xs'
                      : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  <Banknote className="w-5 h-5" />
                  <span>Nakit</span>
                </button>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setDebtPaymentModalOrder(null)}
                className="py-3 px-3.5 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs rounded-xl hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={() => setPrintingOrder(debtPaymentModalOrder)}
                className="py-3 px-3.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                title="Borçlu Müşteri Fişini Yazdır"
              >
                <Printer className="w-4 h-4 text-amber-500" />
                <span>Yazdır</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const paidDebtOrder: Order = {
                    ...debtPaymentModalOrder,
                    status: 'closed',
                    paymentType: debtPaymentType,
                    closedAt: new Date().toISOString(),
                    debtCollectedAt: new Date().toISOString(),
                  };
                  handleClosePayment(debtPaymentModalOrder.id, debtPaymentType, debtPaymentModalOrder.totalAmount);
                  setDebtPaymentModalOrder(null);
                  setShowUnpaidDebtsModal(false);
                  showToast(`"${debtPaymentModalOrder.customerNotes}" müşteri borcu tahsil edildi!`, 3000);

                  // Direct thermal receipt print for collected debt
                  if (settings.autoPrintReceiptOnPayment !== false) {
                    try {
                      const targetPrinter =
                        settings.selectedPrinterName ||
                        settings.printers?.find((p) => p.isDefault)?.usbDeviceName ||
                        settings.printers?.find((p) => p.isDefault)?.name ||
                        '';
                      const htmlContent = generateTicketHtml(paidDebtOrder, settings, {
                        showLogo: true,
                        forcedPaymentType: debtPaymentType,
                      });
                      executeThermalPrint(htmlContent, targetPrinter);
                    } catch (e) {
                      console.error('Borç tahsilatı fişi yazdırma hatası:', e);
                    }
                  }
                }}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Ödemeyi Tahsil Et</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Table Modal */}
      {showNewTableModal && (
        <NewTableModal
          zones={zones}
          onClose={() => setShowNewTableModal(false)}
          onAddTable={handleAddTable}
        />
      )}

      {/* Transfer Table Modal */}
      {transferSourceTable && (
        <TransferTableModal
          sourceTable={transferSourceTable}
          tables={tables}
          zones={zones}
          onClose={() => setTransferSourceTable(null)}
          onTransfer={handleTransferTable}
        />
      )}

      {/* Thermal Ticket Print Modal */}
      {printingOrder && (
        <PrintTicketModal
          order={printingOrder}
          settings={settings}
          onClose={() => setPrintingOrder(null)}
        />
      )}

      {/* Global Add Invoice Modal */}
      <AddInvoiceModal
        isOpen={showAddInvoiceModal}
        onClose={() => setShowAddInvoiceModal(false)}
        stockItems={stockItems}
        currentUser={currentUser}
        settings={settings}
        onAddPurchaseInvoice={handleAddPurchaseInvoice}
        onAddExpenseInvoice={handleAddExpenseInvoice}
      />

      {/* Critical Stock Items List Modal */}
      <CriticalStockModal
        isOpen={showCriticalStockModal}
        onClose={() => setShowCriticalStockModal(false)}
        stockItems={stockItems}
        menuItems={menuItems}
        settings={settings}
        onUpdateStockItems={(updatedStock) => {
          setStockItems(updatedStock);
          saveAll(zones, tables, categories, menuItems, updatedStock, orders, settings, users);
        }}
        onUpdateMenuItems={(updatedMenu) => {
          setMenuItems(updatedMenu);
          saveAll(zones, tables, categories, updatedMenu, stockItems, orders, settings, users);
        }}
        onNavigateToStock={() => {
          setActiveTab('admin');
          setActiveRole('admin');
        }}
      />

      {/* In-App Interactive User Manual Modal */}
      <UserManualModal
        isOpen={showUserManualModal}
        onClose={() => setShowUserManualModal(false)}
        settings={settings}
      />

      {/* Change Password / PIN Modal */}
      {currentUser && (
        <ChangePasswordModal
          isOpen={showChangePasswordModal}
          onClose={() => setShowChangePasswordModal(false)}
          currentUser={currentUser}
          onUpdatePin={handleUpdateCurrentUserPin}
        />
      )}

      {/* Waiter Kitchen Ready Notification Alert Popup */}
      <KitchenReadyAlert
        notification={activeReadyAlert}
        onClose={() => setActiveReadyAlert(null)}
        onGoToTable={handleSelectTableById}
        onMarkRead={(id) => handleMarkNotificationRead(id)}
      />

      {/* Auto-Dismiss & Interactive Notification Toast */}
      {toastMessage && (
        <div
          onClick={() => {
            if (toastTimeoutRef.current) {
              clearTimeout(toastTimeoutRef.current);
              toastTimeoutRef.current = null;
            }
            setToastMessage(null);
          }}
          className="fixed top-5 left-1/2 -translate-x-1/2 z-100 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border-2 border-emerald-400 animate-in fade-in slide-in-from-top-4 duration-300 cursor-pointer transition-all max-w-[94vw] sm:max-w-xl group pointer-events-auto select-none"
          role="alert"
          title="Kapatmak için tıklayın"
        >
          <div className="bg-white/20 p-1.5 rounded-xl shrink-0 group-hover:scale-110 transition-transform">
            <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <span className="flex-1 leading-snug">{toastMessage}</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (toastTimeoutRef.current) {
                clearTimeout(toastTimeoutRef.current);
                toastTimeoutRef.current = null;
              }
              setToastMessage(null);
            }}
            className="p-1.5 hover:bg-white/20 rounded-xl text-white/80 hover:text-white transition-colors shrink-0 ml-1 cursor-pointer"
            title="Bildirimi Kapat"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      )}

    </div>
  );
}
