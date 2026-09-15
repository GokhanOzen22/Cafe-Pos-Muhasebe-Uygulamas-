import React, { useState, useEffect } from 'react';
import { CheckCircle2, CreditCard, Banknote, Ticket, X } from 'lucide-react';
import { StorageService } from './services/storage';
import { Zone, Table, Category, MenuItem, StockItem, Order, OrderItem, RestaurantSettings, UserRole, AppUser, PurchaseInvoice, ExpenseInvoice, KitchenNotification } from './types';

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
import { KitchenReadyAlert } from './components/KitchenReadyAlert';
import { playKitchenReadyChime, triggerDesktopNotification } from './utils/audioAlert';

export default function App() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [purchaseInvoices, setPurchaseInvoices] = useState<PurchaseInvoice[]>([]);
  const [expenseInvoices, setExpenseInvoices] = useState<ExpenseInvoice[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
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
  const [modalSessionKey, setModalSessionKey] = useState<number>(0);

  // Unpaid Debts Modal & Payment
  const [showUnpaidDebtsModal, setShowUnpaidDebtsModal] = useState<boolean>(false);
  const [showCriticalStockModal, setShowCriticalStockModal] = useState<boolean>(false);
  const [debtPaymentModalOrder, setDebtPaymentModalOrder] = useState<Order | null>(null);
  const [debtPaymentType, setDebtPaymentType] = useState<'nakit' | 'kredi_karti' | 'yemek_karti'>('kredi_karti');

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
      setOrders(StorageService.getOrders());
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
        if (serverData.orders) setOrders(serverData.orders);
        if (serverData.settings) setSettings(serverData.settings);
        if (serverData.users) setUsers(serverData.users);
        if (serverData.notifications) {
          setNotifications(serverData.notifications);
          serverData.notifications.forEach((n) => {
            if (n.read) alertedNotificationIdsRef.current.add(n.id);
          });
        }
      }

      // Restore user session if saved
      const savedUserId = localStorage.getItem('pos_current_user_id');
      const activeUsersList = serverData?.users || loadedUsers;
      if (savedUserId && activeUsersList.length > 0) {
        const found = activeUsersList.find((u) => u.id === savedUserId);
        if (found) {
          setCurrentUser(found);
        }
      }
    };

    loadInitialData();

    // Periodic poll from Local Kasa Express server for real-time tablet sync (every 3 seconds)
    const pollInterval = setInterval(async () => {
      const serverData = await StorageService.fetchFullDataFromServer();
      if (serverData) {
        if (serverData.tables) setTables(serverData.tables);
        if (serverData.orders) setOrders(serverData.orders);
        if (serverData.stockItems) setStockItems(serverData.stockItems);
        if (serverData.menuItems) setMenuItems(serverData.menuItems);
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

    window.addEventListener('kitchen_notifications_updated', handleNotifUpdate);
    return () => {
      window.removeEventListener('kitchen_notifications_updated', handleNotifUpdate);
    };
  }, []);

  // Handle Login Success
  const handleLoginSuccess = (user: AppUser) => {
    setCurrentUser(user);
    localStorage.setItem('pos_current_user_id', user.id);

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

    setToastMessage(`${user.name} olarak giriş yapıldı.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Handle Logout
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('pos_current_user_id');
    setToastMessage('Oturum kapatıldı.');
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Sync to storage on state changes
  const saveAll = (
    newZones = zones,
    newTables = tables,
    newCategories = categories,
    newMenuItems = menuItems,
    newStock = stockItems,
    newOrders = orders,
    newSettings = settings,
    newUsers = users
  ) => {
    StorageService.saveZones(newZones);
    StorageService.saveTables(newTables);
    StorageService.saveCategories(newCategories);
    StorageService.saveMenuItems(newMenuItems);
    StorageService.saveStockItems(newStock);
    StorageService.saveOrders(newOrders);
    StorageService.saveSettings(newSettings);
    StorageService.saveUsers(newUsers);
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

    setToastMessage(toastText);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
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
    setToastMessage(`Borç Yazıldı: "${customerNotes}" (${table.number})`);
    setTimeout(() => {
      setToastMessage(null);
    }, 2000);
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
        return {
          ...o,
          status: 'closed' as const,
          closedAt: new Date().toISOString(),
          paymentType,
          totalAmount: amount,
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
      setToastMessage(`✓ ${createdNotif.tableName} - ${createdNotif.items[0]?.name} hazır! Garsona bildirildi.`);
      setTimeout(() => setToastMessage(null), 3000);
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
      setToastMessage(`✓ ${createdNotif.tableName} - Tüm siparişler hazır! Garsona bildirildi.`);
      setTimeout(() => setToastMessage(null), 3000);
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
    setToastMessage('✓ Mutfak bildirimleri temizlendi.');
    setTimeout(() => setToastMessage(null), 2500);
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
        onOpenCriticalStockModal={() => setShowCriticalStockModal(true)}
        onOpenAddInvoiceModal={() => setShowAddInvoiceModal(true)}
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
        onClearNotifications={handleClearNotifications}
        onDeleteNotification={handleDeleteNotification}
        onSelectTableById={handleSelectTableById}
      />

      {/* Main Body Content */}
      <main className="w-full max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-3 sm:py-6 flex-1 overflow-x-hidden">
        {activeTab === 'tables' && (
          <TableGrid
            tables={tables}
            zones={zones}
            orders={orders}
            settings={settings}
            currentUser={currentUser}
            unpaidDebtCount={unpaidDebtCount}
            onSelectTable={(tbl) => setSelectedTable(tbl)}
            onAddTableClick={() => {
              const canAddTable = currentUser
                ? currentUser.role === 'admin' || currentUser.isSystemAdmin || !!currentUser.permissions?.canAddTable
                : true;
              if (canAddTable) {
                setShowNewTableModal(true);
              } else {
                alert('Masa ekleme yetkiniz bulunmamaktadır.');
              }
            }}
            onQuickNewOrder={(tbl) => setSelectedTable(tbl)}
            onOpenUnpaidDebtsModal={() => setShowUnpaidDebtsModal(true)}
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
            onAddPurchaseInvoice={handleAddPurchaseInvoice}
            onAddExpenseInvoice={handleAddExpenseInvoice}
            onOpenAddInvoiceModal={() => setShowAddInvoiceModal(true)}
            onUpdateCategories={(newCat) => {
              setCategories(newCat);
              saveAll(zones, tables, newCat, menuItems, stockItems, orders, settings, users);
            }}
            onUpdateMenuItems={(newItems) => {
              setMenuItems(newItems);
              saveAll(zones, tables, categories, newItems, stockItems, orders, settings, users);
            }}
            onUpdateStockItems={(newStock) => {
              setStockItems(newStock);
              saveAll(zones, tables, categories, menuItems, newStock, orders, settings, users);
            }}
            onUpdateZones={(newZones) => {
              setZones(newZones);
              saveAll(newZones, tables, categories, menuItems, stockItems, orders, settings, users);
            }}
            onUpdateTables={(newTables) => {
              setTables(newTables);
              saveAll(zones, newTables, categories, menuItems, stockItems, orders, settings, users);
            }}
            onUpdateSettings={(newSettings) => {
              setSettings(newSettings);
              saveAll(zones, tables, categories, menuItems, stockItems, orders, newSettings, users);
            }}
            onUpdateUsers={(newUsers) => {
              setUsers(newUsers);
              saveAll(zones, tables, categories, menuItems, stockItems, orders, settings, newUsers);
            }}
            onOpenPrintTicket={(order) => setPrintingOrder(order)}
          />
        )}

      </main>

      {/* Global Application Footer */}
      <footer className="mt-auto border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 py-4 px-4 sm:px-6 lg:px-8 text-center text-xs text-stone-500 dark:text-stone-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
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
          onClose={() => setSelectedTable(null)}
          onSaveOrder={handleSaveOrder}
          onClosePayment={handleClosePayment}
          onRequestBillStatus={handleRequestBillStatus}
          onOpenTransferModal={(tbl) => {
            setTransferSourceTable(tbl);
            setSelectedTable(null);
          }}
          onOpenPrintTicket={(ord) => setPrintingOrder(ord)}
          onMarkAsUnpaidDebt={handleMarkAsUnpaidDebt}
        />
      )}

      {/* Unpaid Debts Modal */}
      {showUnpaidDebtsModal && (
        <UnpaidDebtsModal
          orders={orders}
          settings={settings}
          onClose={() => setShowUnpaidDebtsModal(false)}
          onSelectDebtForPayment={(ord) => setDebtPaymentModalOrder(ord)}
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
              <div className="grid grid-cols-3 gap-2">
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

                <button
                  type="button"
                  onClick={() => setDebtPaymentType('yemek_karti')}
                  className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all ${
                    debtPaymentType === 'yemek_karti'
                      ? 'bg-amber-500 text-stone-950 border-amber-500 shadow-xs'
                      : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  <Ticket className="w-5 h-5" />
                  <span>Yemek Kartı</span>
                </button>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setDebtPaymentModalOrder(null)}
                className="w-1/3 py-3 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs rounded-xl"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={() => {
                  handleClosePayment(debtPaymentModalOrder.id, debtPaymentType, debtPaymentModalOrder.totalAmount);
                  setDebtPaymentModalOrder(null);
                  setShowUnpaidDebtsModal(false);
                  setToastMessage(`"${debtPaymentModalOrder.customerNotes}" müşteri borcu tahsil edildi!`);
                  setTimeout(() => setToastMessage(null), 3000);
                }}
                className="w-2/3 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2"
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

      {/* Waiter Kitchen Ready Notification Alert Popup */}
      <KitchenReadyAlert
        notification={activeReadyAlert}
        onClose={() => setActiveReadyAlert(null)}
        onGoToTable={handleSelectTableById}
        onMarkRead={(id) => handleMarkNotificationRead(id)}
      />

      {/* 2-Second Sipariş Alındı Notification Toast */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-100 bg-emerald-600 text-white font-extrabold text-base sm:text-lg px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border-2 border-emerald-400 animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-none">
          <div className="bg-white/20 p-1.5 rounded-xl">
            <CheckCircle2 className="w-6 h-6 text-white" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
