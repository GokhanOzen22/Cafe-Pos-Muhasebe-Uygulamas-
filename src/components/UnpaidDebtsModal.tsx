import React, { useState } from 'react';
import { Order, RestaurantSettings } from '../types';
import { X, Search, CreditCard, Clock, UserX, AlertCircle, ShoppingBag, User, CheckCircle2, DollarSign, Printer } from 'lucide-react';
import { formatCurrency, formatTime } from '../utils/formatters';

interface UnpaidDebtsModalProps {
  orders: Order[];
  settings: RestaurantSettings;
  onClose: () => void;
  onSelectDebtForPayment: (order: Order) => void;
  onOpenPrintTicket?: (order: Order) => void;
}

export const UnpaidDebtsModal: React.FC<UnpaidDebtsModalProps> = ({
  orders,
  settings,
  onClose,
  onSelectDebtForPayment,
  onOpenPrintTicket,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter orders with status 'unpaid_debt'
  const debtOrders = orders.filter((o) => o.status === 'unpaid_debt');

  const filteredDebts = debtOrders.filter((o) => {
    const matchesCustomer = o.customerNotes?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTable = o.tableName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesId = o.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCustomer || matchesTable || matchesId;
  });

  const totalUnpaidAmount = debtOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-stone-200 dark:border-stone-800 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-500/20 text-rose-400 rounded-2xl border border-rose-500/30">
              <UserX className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white">Müşteri Açık Borçları / Veresiyeler</h2>
                <span className="text-xs bg-rose-500 text-white font-extrabold px-2.5 py-0.5 rounded-full">
                  {debtOrders.length} Müşteri
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Ödemeden ayrılan müşterilerin kayıtlı borçları. Müşteri geldiğinde ödemeyi tahsil edebilirsiniz.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Summary Top Bar */}
        <div className="p-4 bg-stone-50 dark:bg-stone-950/60 border-b border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
            <input
              type="text"
              placeholder="Müşteri ismi / notu, masa veya adisyon ID ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-stone-900 dark:text-stone-100"
            />
          </div>

          <div className="flex items-center gap-3 bg-white dark:bg-stone-900 px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-800">
            <span className="text-xs text-stone-500 dark:text-stone-400 font-semibold">Toplam Açık Borç:</span>
            <span className="text-base font-black text-rose-600 dark:text-rose-400">
              {formatCurrency(totalUnpaidAmount, settings.currencySymbol)}
            </span>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredDebts.length === 0 ? (
            <div className="text-center py-16 text-stone-400 space-y-2">
              <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500/60" />
              <h3 className="text-base font-bold text-stone-800 dark:text-stone-200">
                Açık Borç Bulunmuyor
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                {searchQuery
                  ? 'Aramanıza uygun borç kaydı bulunamadı.'
                  : 'Tüm adisyonlar ödenmiş. Müşteri ödemeden gittiğinde masadan "Ödemeden Gitti (Borç Yaz)" butonunu kullanarak borç kaydedebilirsiniz.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredDebts.map((debtOrder) => (
                <div
                  key={debtOrder.id}
                  className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-rose-200 dark:border-rose-900/50 shadow-xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Customer Name / Note */}
                    <div className="flex items-start justify-between gap-2 border-b border-stone-100 dark:border-stone-800 pb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="p-2 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl shrink-0">
                          <User className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-black text-sm text-stone-900 dark:text-stone-100 truncate">
                            {debtOrder.customerNotes || 'İsimsiz Müşteri'}
                          </h4>
                          <span className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-1">
                            Adisyon #{debtOrder.id} • Masa {debtOrder.tableName}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {onOpenPrintTicket && (
                          <button
                            type="button"
                            onClick={() => onOpenPrintTicket(debtOrder)}
                            title="Adisyon Fişini Yazdır"
                            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer border border-transparent hover:border-stone-200 dark:hover:border-stone-700"
                          >
                            <Printer className="w-4 h-4 text-amber-500" />
                          </button>
                        )}
                        <span className="text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-900/40">
                          Açık Borç
                        </span>
                      </div>
                    </div>

                    {/* Order Info & Items */}
                    <div className="pt-2 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-stone-400" />
                          {debtOrder.createdAt ? formatTime(debtOrder.createdAt) : '-'}
                        </span>
                        <span>Garson: {debtOrder.waiterName || 'Belirtilmedi'}</span>
                      </div>

                      {/* Items Summary list */}
                      <div className="p-2.5 bg-stone-50 dark:bg-stone-950/50 rounded-xl border border-stone-100 dark:border-stone-800 text-xs text-stone-700 dark:text-stone-300 max-h-24 overflow-y-auto space-y-1">
                        {debtOrder.items.map((item) => (
                          <div key={item.id} className="flex justify-between items-center text-[11px]">
                            <span className="font-medium truncate pr-2">
                              {item.quantity}x {item.name}
                            </span>
                            <span className="font-mono text-stone-500 shrink-0">
                              {formatCurrency(item.price * item.quantity, settings.currencySymbol)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Bar */}
                  <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-stone-400 font-semibold uppercase">Ödenecek Tutar</span>
                      <span className="text-base font-black text-rose-600 dark:text-rose-400">
                        {formatCurrency(debtOrder.totalAmount, settings.currencySymbol)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {onOpenPrintTicket && (
                        <button
                          type="button"
                          onClick={() => onOpenPrintTicket(debtOrder)}
                          title="Borçlu Müşteri Adisyonunu Yazdır"
                          className="px-3 py-2.5 bg-stone-100 hover:bg-amber-500/10 dark:bg-stone-800 dark:hover:bg-amber-500/20 text-stone-700 dark:text-stone-300 hover:text-amber-700 dark:hover:text-amber-400 font-bold text-xs rounded-xl flex items-center gap-1.5 border border-stone-200 dark:border-stone-700 hover:border-amber-500/30 transition-all cursor-pointer"
                        >
                          <Printer className="w-4 h-4 text-amber-500" />
                          <span>Adisyon Yazdır</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onSelectDebtForPayment(debtOrder)}
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Ödeme Al (Ödeme Ekranına Git)</span>
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-100 dark:bg-stone-950/80 border-t border-stone-200 dark:border-stone-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 text-stone-800 dark:text-stone-200 font-bold text-xs rounded-xl"
          >
            Kapat
          </button>
        </div>

      </div>
    </div>
  );
};
