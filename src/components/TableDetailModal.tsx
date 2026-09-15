import React, { useState } from 'react';
import { Table, Category, MenuItem, Order, OrderItem, RestaurantSettings, AppUser } from '../types';
import {
  X, Plus, Minus, Trash2, Search, Send, CreditCard, Banknote, Ticket,
  Printer, ArrowRightLeft, MessageSquare, Percent, Tag, Check, Coffee,
  CupSoda, Egg, UtensilsCrossed, Hamburger, Cake, AlertCircle, ShoppingBag, ShieldAlert,
  User, UserX, Lock
} from 'lucide-react';
import { formatCurrency, formatTime } from '../utils/formatters';

interface TableDetailModalProps {
  table: Table;
  order?: Order;
  categories: Category[];
  menuItems: MenuItem[];
  settings: RestaurantSettings;
  currentUser?: AppUser | null;
  onClose: () => void;
  onSaveOrder: (
    tableId: string,
    items: OrderItem[],
    discountPercent: number,
    discountAmount: number,
    waiterName: string,
    customerNotes: string,
    isBillRequest?: boolean,
    immediatePaymentType?: 'nakit' | 'kredi_karti' | 'yemek_karti' | 'parcali'
  ) => void;
  onClosePayment: (orderId: string, paymentType: 'nakit' | 'kredi_karti' | 'yemek_karti' | 'parcali', amount: number) => void;
  onRequestBillStatus: (tableId: string, requested: boolean) => void;
  onOpenTransferModal: (table: Table) => void;
  onOpenPrintTicket: (order: Order) => void;
  onMarkAsUnpaidDebt: (
    tableId: string,
    customerNotes: string,
    items: OrderItem[],
    discountPercent: number,
    discountAmount: number,
    waiterName: string
  ) => void;
}

export const TableDetailModal: React.FC<TableDetailModalProps> = ({
  table,
  order,
  categories,
  menuItems,
  settings,
  currentUser,
  onClose,
  onSaveOrder,
  onClosePayment,
  onRequestBillStatus,
  onOpenTransferModal,
  onOpenPrintTicket,
  onMarkAsUnpaidDebt,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [mobileTab, setMobileTab] = useState<'menu' | 'bill'>('menu');
  const [items, setItems] = useState<OrderItem[]>(
    order?.items
      ? order.items.map((i) => ({
          ...i,
          sentToKitchen: i.sentToKitchen !== undefined ? i.sentToKitchen : true,
        }))
      : []
  );
  const [discountPercent, setDiscountPercent] = useState<number>(order?.discountPercent || 0);
  const [customDiscountCash, setCustomDiscountCash] = useState<string>(order?.discountAmount ? String(order.discountAmount) : '');
  const [waiterName, setWaiterName] = useState<string>(order?.waiterName || currentUser?.name || 'Ahmet K.');
  const [customerNotes, setCustomerNotes] = useState<string>(order?.customerNotes || '');
  const [customerNoteError, setCustomerNoteError] = useState<boolean>(false);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [showUnpaidModal, setShowUnpaidModal] = useState<boolean>(false);
  const [debtCustomerName, setDebtCustomerName] = useState<string>(order?.customerNotes || '');
  const [paymentType, setPaymentType] = useState<'nakit' | 'kredi_karti' | 'yemek_karti'>('kredi_karti');
  const [editingNoteItemId, setEditingNoteItemId] = useState<string | null>(null);
  const [tempNoteText, setTempNoteText] = useState<string>('');

  // Permission shortcuts
  const canApplyDiscount = currentUser ? currentUser.permissions.canApplyDiscount : true;
  const canCancelItem = currentUser ? currentUser.permissions.canCancelItem : true;
  const canTransferTable = currentUser ? currentUser.permissions.canTransferTable : true;
  const canClosePayment = currentUser
    ? (currentUser.role === 'admin' || currentUser.permissions.canClosePayment === true)
    : true;

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const numCashDiscount = parseFloat(customDiscountCash) || 0;
  const calculatedDiscountPercentAmt = (subtotal * discountPercent) / 100;
  const totalDiscount = Math.min(subtotal, numCashDiscount + calculatedDiscountPercentAmt);
  const taxableSubtotal = Math.max(0, subtotal - totalDiscount);
  const taxAmount = (taxableSubtotal * settings.taxRatePercent) / (100 + settings.taxRatePercent);
  const grandTotal = Math.max(0, subtotal - totalDiscount);

  // Add Item to Bill
  const handleAddItem = (menuItem: MenuItem) => {
    const existingIndex = items.findIndex(
      (i) => i.menuItemId === menuItem.id && (!i.sentToKitchen || i.status === 'pending')
    );
    if (existingIndex > -1) {
      const updated = [...items];
      updated[existingIndex].quantity += 1;
      setItems(updated);
    } else {
      const newItem: OrderItem = {
        id: 'item-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        menuItemId: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        costPrice: menuItem.costPrice,
        quantity: 1,
        timestamp: new Date().toISOString(),
        status: 'pending',
        sentToKitchen: false,
      };
      setItems([...items, newItem]);
    }
  };

  // Modify quantity
  const handleQuantityChange = (itemId: string, delta: number) => {
    const updated = items
      .map((item) => {
        if (item.id === itemId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      })
      .filter(Boolean) as OrderItem[];
    setItems(updated);
  };

  // Save Item Note
  const handleSaveNote = (itemId: string) => {
    setItems(items.map((i) => (i.id === itemId ? { ...i, note: tempNoteText } : i)));
    setEditingNoteItemId(null);
    setTempNoteText('');
  };

  // Filter products
  const filteredMenuItems = menuItems.filter((m) => {
    const matchesCat = selectedCategory === 'all' || m.categoryId === selectedCategory;
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.description && m.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  // Validation for customer identification note
  const validateCustomerNotes = (): boolean => {
    if (!customerNotes.trim()) {
      setCustomerNoteError(true);
      setMobileTab('bill');
      return false;
    }
    setCustomerNoteError(false);
    return true;
  };

  // Handle Save / Kitchen Dispatch
  const handleSaveAndSendKitchen = () => {
    if (!validateCustomerNotes()) return;

    // Filter items that are NEW (unsent or status is pending)
    const newItems = items.filter((i) => !i.sentToKitchen || i.status === 'pending');

    if (newItems.length > 0) {
      // Mark all new items as sentToKitchen = true and status = 'preparing'
      const updatedItems: OrderItem[] = items.map((i) => {
        if (!i.sentToKitchen || i.status === 'pending') {
          return {
            ...i,
            sentToKitchen: true,
            status: 'preparing' as const,
          };
        }
        return i;
      });

      // Save complete order to app state with updated sentToKitchen flags
      onSaveOrder(table.id, updatedItems, discountPercent, numCashDiscount, waiterName, customerNotes.trim());

      // Note: User requested NOT to trigger print ticket modal on "Kaydet & Mutfak".
      // Orders are silently dispatched to kitchen screen.
    } else {
      // No new items to send, just save existing order
      onSaveOrder(table.id, items, discountPercent, numCashDiscount, waiterName, customerNotes.trim());
    }

    onClose();
  };

  // Handle Payment Modal trigger with mandatory customer check
  const handleOpenPaymentModal = () => {
    if (!canClosePayment) {
      alert('Hesap kapatma yetkiniz bulunmamaktadır. Garsonlar sadece Hesap İste yapabilir.');
      return;
    }
    if (!validateCustomerNotes()) return;
    setShowPaymentModal(true);
  };

  // Handle Request Bill & Print Receipt Ticket (Garson için Hesap İste)
  const handleRequestBillClick = () => {
    if (!validateCustomerNotes()) return;

    // Save order items & mark table status as bill_requested with 'Hesap İstendi!' notice
    onSaveOrder(table.id, items, discountPercent, numCashDiscount, waiterName, customerNotes.trim(), true);

    // Prepare full receipt order for printing
    const currentBillOrder: Order = {
      id: order?.id || ('ord-' + Math.floor(100 + Math.random() * 900)),
      tableId: table.id,
      tableName: table.number,
      zoneId: table.zoneId,
      zoneName: categories.find((c) => c.id === table.zoneId)?.name || 'Salon',
      status: 'open',
      items,
      subtotal,
      discountAmount: totalDiscount,
      discountPercent,
      taxAmount,
      totalAmount: grandTotal,
      waiterName: waiterName || 'Garson',
      customerNotes: customerNotes.trim(),
      createdAt: order?.createdAt || new Date().toISOString(),
      ticketTitle: 'MASA HESAP FİŞİ / ADİSYON',
    };

    onOpenPrintTicket(currentBillOrder);
    onClose();
  };

  // Handle Unpaid Customer Debt ("Ödemeden Gitti")
  const handleMarkAsUnpaidDebtClick = () => {
    if (!validateCustomerNotes()) return;
    setDebtCustomerName(customerNotes.trim() || order?.customerNotes || '');
    setShowUnpaidModal(true);
  };

  const handleMarkAsUnpaidDebtSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCustomerName = debtCustomerName.trim();
    if (!finalCustomerName) {
      alert('Lütfen borç kaydı için bir müşteri adı veya unvanı yazınız!');
      return;
    }
    onMarkAsUnpaidDebt(table.id, finalCustomerName, items, discountPercent, numCashDiscount, waiterName);
    setShowUnpaidModal(false);
    setItems([]);
    setDiscountPercent(0);
    setCustomDiscountCash('');
    setCustomerNotes('');
    setDebtCustomerName('');
  };

  // Icon mapping helper
  const renderCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Coffee': return <Coffee className="w-4 h-4" />;
      case 'CupSoda': return <CupSoda className="w-4 h-4" />;
      case 'Egg': return <Egg className="w-4 h-4" />;
      case 'UtensilsCrossed': return <UtensilsCrossed className="w-4 h-4" />;
      case 'HamBurger': return <Hamburger className="w-4 h-4" />;
      case 'Cake': return <Cake className="w-4 h-4" />;
      default: return <ShoppingBag className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl shadow-2xl w-full max-w-6xl h-[92vh] sm:h-[90vh] max-h-[850px] flex flex-col md:flex-row overflow-hidden">
        
        {/* MOBILE HEADER BAR & TAB SWITCHER */}
        <div className="md:hidden bg-stone-900 text-white p-3 border-b border-stone-800 flex flex-col gap-2 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <h2 className="text-base font-black text-amber-400 truncate">{table.number}</h2>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-semibold px-2 py-0.5 rounded-full border border-amber-500/30 shrink-0">
                #{order?.id || 'YENİ'}
              </span>
              <span className="text-xs text-stone-400 truncate">
                ({waiterName})
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {order && (
                <button
                  onClick={() => onOpenPrintTicket(order)}
                  title="Adisyon Fişi Yazdır"
                  className="p-1.5 text-stone-300 hover:bg-stone-800 rounded-lg"
                >
                  <Printer className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Segmented Control for Mobile */}
          <div className="grid grid-cols-2 gap-1 bg-stone-950 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setMobileTab('menu')}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                mobileTab === 'menu'
                  ? 'bg-amber-500 text-stone-950 shadow-xs'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>Menü & Ürün Seç</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileTab('bill')}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                mobileTab === 'bill'
                  ? 'bg-amber-500 text-stone-950 shadow-xs'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Adisyon ({items.reduce((acc, i) => acc + i.quantity, 0)})</span>
            </button>
          </div>
        </div>

        {/* LEFT COLUMN: Active Bill / Order Items (40% width) */}
        <div className={`w-full md:w-5/12 bg-stone-50 dark:bg-stone-900/90 border-r border-stone-200 dark:border-stone-800 flex-col h-full overflow-hidden ${mobileTab === 'bill' ? 'flex' : 'hidden md:flex'}`}>
          
          {/* Header Bar (Desktop Only) */}
          <div className="p-4 border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hidden md:flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">{table.number}</h2>
                <span className="text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold px-2.5 py-0.5 rounded-full border border-amber-500/20">
                  Adisyon #{order?.id || 'YENİ'}
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Garson:
                <select
                  value={waiterName}
                  onChange={(e) => setWaiterName(e.target.value)}
                  className="ml-1 font-medium text-stone-800 dark:text-stone-200 bg-transparent border-none focus:outline-none cursor-pointer"
                >
                  <option value="Ahmet K.">Ahmet K.</option>
                  <option value="Mehmet Y.">Mehmet Y.</option>
                  <option value="Ayşe K.">Ayşe K.</option>
                  <option value="Can T.">Can T.</option>
                </select>
              </p>
            </div>

            <div className="flex items-center gap-1">
              {order && (
                <button
                  onClick={() => onOpenPrintTicket(order)}
                  title="Adisyon Fişi Yazdır"
                  className="p-2 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors"
                >
                  <Printer className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Customer Identification Note Input Card (Mandatory) */}
          <div className="px-4 pt-3 pb-1 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800">
            <div className="p-2.5 bg-stone-50 dark:bg-stone-950 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-1 shadow-2xs">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-500" />
                  Müşteri / Kişi Tanımı
                </span>
                <span className="text-[10px] text-rose-500 font-bold bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.5 rounded-md border border-rose-200 dark:border-rose-900/50">
                  Zorunlu
                </span>
              </label>
              <input
                type="text"
                value={customerNotes}
                onChange={(e) => {
                  setCustomerNotes(e.target.value);
                  if (e.target.value.trim()) setCustomerNoteError(false);
                }}
                placeholder="Örn: Ahmet Bey / Mavi Ceketli Müşteri"
                className={`w-full p-2 bg-white dark:bg-stone-900 border rounded-xl text-xs font-bold text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 transition-all ${
                  customerNoteError
                    ? 'border-rose-500 ring-rose-500/30 bg-rose-50/50 dark:bg-rose-950/30'
                    : 'border-stone-200 dark:border-stone-700 focus:ring-amber-500'
                }`}
              />
              {customerNoteError && (
                <p className="text-[10px] text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1 pt-0.5">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  Lütfen masadaki müşteriyi tanımlayan bir isim veya not giriniz!
                </p>
              )}
            </div>
          </div>

          {/* Items List Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {items.length === 0 ? (
              <div className="text-center py-12 text-stone-400">
                <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium">Henüz sipariş eklenmedi</p>
                <p className="text-xs mt-1">Sağ taraftaki menüden ürün seçebilirsiniz</p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-white dark:bg-stone-800/80 rounded-2xl border border-stone-200/80 dark:border-stone-700/60 shadow-2xs space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm text-stone-900 dark:text-stone-100 truncate">
                          {item.name}
                        </h4>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            item.status === 'served'
                              ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-black border border-emerald-500/40'
                              : item.sentToKitchen || item.status === 'preparing'
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium'
                              : 'bg-blue-500/10 text-blue-700 dark:text-blue-300 font-bold border border-blue-500/30'
                          }`}
                        >
                          {item.status === 'served'
                            ? '✓ Mutfakta Hazır'
                            : item.sentToKitchen || item.status === 'preparing'
                            ? '⏳ Mutfakta'
                            : 'Yeni (Yazdırılacak)'}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 dark:text-stone-400">
                        {formatCurrency(item.price, settings.currencySymbol)} x {item.quantity}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-sm text-stone-900 dark:text-amber-400">
                        {formatCurrency(item.price * item.quantity, settings.currencySymbol)}
                      </span>
                    </div>
                  </div>

                  {/* Note display or edit field */}
                  {editingNoteItemId === item.id ? (
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Örn: Az şekerli, sossuz..."
                        value={tempNoteText}
                        onChange={(e) => setTempNoteText(e.target.value)}
                        className="flex-1 text-xs px-2.5 py-1 bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-600 rounded-lg focus:outline-none"
                      />
                      <button
                        onClick={() => handleSaveNote(item.id)}
                        className="p-1 bg-emerald-500 text-white rounded-lg text-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 pt-1 border-t border-stone-100 dark:border-stone-700/50">
                      <button
                        onClick={() => {
                          setEditingNoteItemId(item.id);
                          setTempNoteText(item.note || '');
                        }}
                        className="flex items-center gap-1 hover:text-amber-600 dark:hover:text-amber-400 text-[11px]"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>{item.note ? `Not: ${item.note}` : '+ Not Ekle'}</span>
                      </button>

                      {/* Quantity Controller Buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleQuantityChange(item.id, -1)}
                          className="p-1 bg-stone-100 dark:bg-stone-700 hover:bg-stone-200 rounded-lg text-stone-700 dark:text-stone-200"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center font-bold text-xs text-stone-900 dark:text-stone-100">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.id, 1)}
                          className="p-1 bg-stone-100 dark:bg-stone-700 hover:bg-stone-200 rounded-lg text-stone-700 dark:text-stone-200"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        {canCancelItem ? (
                          <button
                            onClick={() => handleQuantityChange(item.id, -item.quantity)}
                            title="Ürün / Sipariş İptal"
                            className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg ml-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span title="Ürün İptal Yetkiniz Yok" className="p-1 text-stone-300 dark:text-stone-600 cursor-not-allowed ml-1">
                            <Trash2 className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Discount & Totals Section */}
          <div className="p-4 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 space-y-3">
            
            {/* Quick Discount Controls */}
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="text-stone-500 dark:text-stone-400 font-medium">İskonto / İndirim:</span>
              {canApplyDiscount ? (
                <div className="flex items-center gap-1.5">
                  {[0, 5, 10, 15].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => setDiscountPercent(pct)}
                      className={`px-2 py-1 rounded-lg border font-semibold text-[11px] transition-colors ${
                        discountPercent === pct
                          ? 'bg-amber-500 text-stone-950 border-amber-500'
                          : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300'
                      }`}
                    >
                      %{pct}
                    </button>
                  ))}
                </div>
              ) : (
                <span className="text-[11px] text-stone-400 italic flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-stone-500" />
                  İskonto Yetkiniz Yok
                </span>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-1 text-xs text-stone-600 dark:text-stone-400">
              <div className="flex justify-between">
                <span>Ara Toplam:</span>
                <span className="font-medium text-stone-900 dark:text-stone-200">
                  {formatCurrency(subtotal, settings.currencySymbol)}
                </span>
              </div>

              {totalDiscount > 0 && (
                <div className="flex justify-between text-rose-600 dark:text-rose-400">
                  <span>Top. İndirim (%{discountPercent}):</span>
                  <span>-{formatCurrency(totalDiscount, settings.currencySymbol)}</span>
                </div>
              )}

              <div className="flex justify-between text-[11px] text-stone-400">
                <span>Dahil KDV (%{settings.taxRatePercent}):</span>
                <span>{formatCurrency(taxAmount, settings.currencySymbol)}</span>
              </div>

              <div className="flex justify-between items-center text-lg font-extrabold text-stone-900 dark:text-amber-400 pt-1 border-t border-stone-200 dark:border-stone-800">
                <span>GENEL TOPLAM:</span>
                <span>{formatCurrency(grandTotal, settings.currencySymbol)}</span>
              </div>
            </div>

            {/* Action Bar Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={handleSaveAndSendKitchen}
                className="w-full py-2.5 px-3 bg-stone-900 dark:bg-stone-800 hover:bg-stone-800 dark:hover:bg-stone-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Send className="w-3.5 h-3.5 text-amber-400" />
                <span>Kaydet & Mutfak</span>
              </button>

              {canClosePayment ? (
                <button
                  disabled={items.length === 0}
                  onClick={handleOpenPaymentModal}
                  className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Hesap Kapat ({formatCurrency(grandTotal, settings.currencySymbol)})</span>
                </button>
              ) : (
                <button
                  disabled={items.length === 0}
                  onClick={handleRequestBillClick}
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all ${
                    table.status === 'bill_requested'
                      ? 'bg-amber-500 text-stone-950 font-black ring-2 ring-amber-400'
                      : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950'
                  } disabled:opacity-50`}
                  title="Masadan adisyon yazdır ve hesap iste kurgusunu başlat"
                >
                  <Ticket className="w-4 h-4" />
                  <span>{table.status === 'bill_requested' ? 'Hesap İstendi (Yazdır)' : 'Hesap İste / Fiş Bas'}</span>
                </button>
              )}
            </div>

            {/* If user lacks canClosePayment permission, show info notice */}
            {!canClosePayment && (
              <div className="text-[11px] text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-xl border border-amber-200 dark:border-amber-800/50 flex items-center gap-1.5 font-medium">
                <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Garson yetkisindesiniz. Hesap kapatma kasadadır; buradan <strong>Hesap İste</strong> diyerek adisyon çıkartabilirsiniz.</span>
              </div>
            )}

            {/* Unpaid Customer Debt Action Button (Available for all roles including waitstaff) */}
            {items.length > 0 && (
              <button
                type="button"
                onClick={handleMarkAsUnpaidDebtClick}
                className="w-full py-2 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title="Müşteri ödemeden gittiyse bu seçeneği kullanarak borç olarak kaydedebilirsiniz"
              >
                <UserX className="w-3.5 h-3.5 text-rose-500" />
                <span>Ödemeden Gitti (Borç Yaz)</span>
              </button>
            )}

            {/* Additional Secondary Actions: Transfer & Bill Request */}
            <div className="flex items-center justify-between gap-2 pt-1 text-xs">
              <button
                onClick={() => onOpenTransferModal(table)}
                className="flex items-center gap-1 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>Masa Taşı</span>
              </button>

              {canClosePayment && (
                <button
                  onClick={() => onRequestBillStatus(table.id, table.status !== 'bill_requested')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    table.status === 'bill_requested'
                      ? 'bg-amber-500 text-stone-950 font-bold'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                  }`}
                >
                  <Ticket className="w-3.5 h-3.5" />
                  <span>{table.status === 'bill_requested' ? 'Hesap Basıldı' : 'Hesap İste'}</span>
                </button>
              )}
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: Fast Menu Selection Panel (60% width) */}
        <div className={`w-full md:w-7/12 bg-white dark:bg-stone-900 p-3 sm:p-4 flex-col h-full overflow-hidden relative ${mobileTab === 'menu' ? 'flex' : 'hidden md:flex'}`}>
          
          {/* Search bar & Category filter */}
          <div className="space-y-3 pb-3 border-b border-stone-200 dark:border-stone-800">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
              <input
                type="text"
                placeholder="Ürün adı ara (Örn: Çay, Köfte, San Sebastian)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-900 dark:text-stone-100"
              />
            </div>

            {/* Category tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3.5 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${
                  selectedCategory === 'all'
                    ? 'bg-amber-500 text-stone-950 shadow-xs'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                }`}
              >
                Tüm Menü ({menuItems.length})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-2 rounded-xl font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    selectedCategory === cat.id
                      ? 'bg-amber-500 text-stone-950 shadow-xs'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                  }`}
                >
                  {renderCategoryIcon(cat.iconName)}
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1 overflow-y-auto pt-3 pr-1">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
              {filteredMenuItems.map((product) => {
                const isLowStock = product.stockQuantity <= product.minStockAlert;
                return (
                  <button
                    key={product.id}
                    onClick={() => handleAddItem(product)}
                    disabled={!product.isAvailable}
                    className="p-3 bg-stone-50 dark:bg-stone-800/80 hover:bg-amber-50 dark:hover:bg-amber-950/20 border border-stone-200 dark:border-stone-700/60 hover:border-amber-400 rounded-2xl text-left transition-all group flex flex-col justify-between h-28 sm:h-32 active:scale-98 relative overflow-hidden"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 line-clamp-2">
                          {product.name}
                        </h4>
                      </div>
                      {product.description && (
                        <p className="text-[10px] sm:text-[11px] text-stone-500 dark:text-stone-400 line-clamp-1 sm:line-clamp-2 mt-0.5">
                          {product.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-stone-200/60 dark:border-stone-700/50">
                      <span className="font-extrabold text-xs sm:text-sm text-stone-900 dark:text-amber-400">
                        {formatCurrency(product.price, settings.currencySymbol)}
                      </span>

                      <span
                        className={`text-[9px] sm:text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                          isLowStock
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                            : 'bg-stone-200/60 dark:bg-stone-700 text-stone-600 dark:text-stone-300'
                        }`}
                      >
                        Stok: {product.stockQuantity}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mobile Floating Order Quick Bar */}
          {items.length > 0 && (
            <div className="md:hidden mt-2 p-2.5 bg-stone-900 dark:bg-stone-950 text-white rounded-2xl flex items-center justify-between shadow-xl border border-stone-800 shrink-0">
              <div className="flex flex-col min-w-0 pr-2">
                <span className="text-[10px] text-stone-400 font-medium truncate">
                  {items.reduce((acc, i) => acc + i.quantity, 0)} Ürün Seçildi
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-amber-400">
                  {formatCurrency(grandTotal, settings.currencySymbol)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setMobileTab('bill')}
                  className="px-2.5 py-1.5 bg-stone-800 text-stone-200 hover:bg-stone-700 font-bold text-xs rounded-xl flex items-center gap-1"
                >
                  <span>Adisyon</span>
                </button>
                <button
                  type="button"
                  onClick={handleSaveAndSendKitchen}
                  className="px-3 py-1.5 bg-amber-500 text-stone-950 hover:bg-amber-400 font-bold text-xs rounded-xl flex items-center gap-1 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Mutfak</span>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Payment Settlement Sub-Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-60 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Banknote className="w-5 h-5 text-emerald-500" />
                Ödeme Al & Adisyonu Kapat
              </h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center py-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
              <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">ÖDENECEK TUTAR</span>
              <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(grandTotal, settings.currencySymbol)}
              </p>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-stone-600 dark:text-stone-400">Ödeme Yöntemi Seçin:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentType('kredi_karti')}
                  className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                    paymentType === 'kredi_karti'
                      ? 'bg-amber-500 text-stone-950 border-amber-500 shadow-sm'
                      : 'border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Kredi Kartı</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentType('nakit')}
                  className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                    paymentType === 'nakit'
                      ? 'bg-amber-500 text-stone-950 border-amber-500 shadow-sm'
                      : 'border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  <Banknote className="w-5 h-5" />
                  <span>Nakit</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentType('yemek_karti')}
                  className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                    paymentType === 'yemek_karti'
                      ? 'bg-amber-500 text-stone-950 border-amber-500 shadow-sm'
                      : 'border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  <Ticket className="w-5 h-5" />
                  <span>Yemek Çeki</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-stone-200 dark:border-stone-800">
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 py-3 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 rounded-xl text-sm font-semibold"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={() => {
                  const finalNote = customerNotes.trim() || `Masa ${table.number}`;
                  if (order) {
                    // Update order totals and close payment
                    onSaveOrder(table.id, items, discountPercent, numCashDiscount, waiterName, finalNote, false, paymentType);
                  } else {
                    // Create order and close payment immediately
                    onSaveOrder(table.id, items, discountPercent, numCashDiscount, waiterName, finalNote, false, paymentType);
                  }
                  setShowPaymentModal(false);
                  onClose();
                }}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-md"
              >
                Ödemeyi Onayla & Kapat
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Unpaid Debt Confirmation Modal */}
      {showUnpaidModal && (
        <div className="fixed inset-0 z-60 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleMarkAsUnpaidDebtSubmit} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <UserX className="w-5 h-5 text-rose-500" />
                Ödemeden Gitti - Borç Yaz
              </h3>
              <button
                type="button"
                onClick={() => setShowUnpaidModal(false)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-rose-50 dark:bg-rose-950/40 p-4 rounded-2xl border border-rose-200 dark:border-rose-900/50 space-y-1">
              <span className="text-xs text-rose-700 dark:text-rose-400 font-semibold block">Açık Borç Tutarı ({table.number})</span>
              <p className="text-2xl font-black text-rose-600 dark:text-rose-400">
                {formatCurrency(grandTotal, settings.currencySymbol)}
              </p>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                Bu adisyon müşteri borcu olarak sisteme kaydedilecek ve masa temizlenerek aynı masada yeni adisyon alımına geçilecektir.
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                Müşteri Adı / Unvanı (Zorunlu):
              </label>
              <input
                type="text"
                required
                autoFocus
                placeholder="Örn: Ahmet Yılmaz (Masa Sahibi)..."
                value={debtCustomerName}
                onChange={(e) => setDebtCustomerName(e.target.value)}
                className="w-full p-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm font-bold text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowUnpaidModal(false)}
                className="w-1/3 py-3 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 rounded-xl text-xs font-semibold"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                className="w-2/3 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-extrabold shadow-md flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Borç Yaz & Yeni Adisyona Geç</span>
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
