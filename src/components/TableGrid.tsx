import React, { useState } from 'react';
import { Table, Zone, Order, TableStatus, RestaurantSettings, AppUser } from '../types';
import { Users, Clock, Receipt, Plus, Search, Filter, Sparkles, CheckCircle2, AlertCircle, ArrowRightLeft, User, UserX } from 'lucide-react';
import { formatCurrency, getElapsedTimeMinutes } from '../utils/formatters';

interface TableGridProps {
  tables: Table[];
  zones: Zone[];
  orders: Order[];
  settings: RestaurantSettings;
  currentUser?: AppUser | null;
  unpaidDebtCount?: number;
  onSelectTable: (table: Table) => void;
  onAddTableClick?: () => void;
  onQuickNewOrder: (table: Table) => void;
  onOpenUnpaidDebtsModal?: () => void;
}

export const TableGrid: React.FC<TableGridProps> = ({
  tables,
  zones,
  orders,
  settings,
  currentUser: _currentUser,
  unpaidDebtCount = 0,
  onSelectTable,
  onAddTableClick: _onAddTableClick,
  onQuickNewOrder,
  onOpenUnpaidDebtsModal,
}) => {
  const [selectedZoneId, setSelectedZoneId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<TableStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Helper map for active orders by tableId
  const activeOrdersMap = new Map<string, Order>();
  orders.forEach((o) => {
    if (o.status === 'open') {
      activeOrdersMap.set(o.tableId, o);
    }
  });

  // Filter tables
  const filteredTables = tables.filter((t) => {
    const matchesZone = selectedZoneId === 'all' || t.zoneId === selectedZoneId;
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesSearch =
      t.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.customerName && t.customerName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesZone && matchesStatus && matchesSearch;
  });

  // Status counts for badge filters
  const counts = {
    all: tables.length,
    empty: tables.filter((t) => t.status === 'empty').length,
    occupied: tables.filter((t) => t.status === 'occupied').length,
    bill_requested: tables.filter((t) => t.status === 'bill_requested').length,
    reserved: tables.filter((t) => t.status === 'reserved').length,
  };

  const getStatusBadge = (status: TableStatus) => {
    switch (status) {
      case 'empty':
        return { label: 'Boş', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-400' };
      case 'occupied':
        return { label: 'Dolu', color: 'bg-rose-500/10 text-rose-600 border-rose-500/30 dark:text-rose-400' };
      case 'bill_requested':
        return { label: 'Hesap İstendi', color: 'bg-amber-500/10 text-amber-600 border-amber-500/30 dark:text-amber-400' };
      case 'reserved':
        return { label: 'Rezerve', color: 'bg-purple-500/10 text-purple-600 border-purple-500/30 dark:text-purple-400' };
    }
  };

  const getCardStyle = (status: TableStatus) => {
    switch (status) {
      case 'empty':
        return 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-emerald-400 hover:shadow-emerald-500/10';
      case 'occupied':
        return 'border-rose-300 dark:border-rose-900/60 bg-gradient-to-b from-rose-50/60 to-white dark:from-rose-950/20 dark:to-stone-900 hover:border-rose-500 shadow-rose-500/5';
      case 'bill_requested':
        return 'border-amber-300 dark:border-amber-900/60 bg-gradient-to-b from-amber-50/60 to-white dark:from-amber-950/20 dark:to-stone-900 hover:border-amber-500 shadow-amber-500/5 animate-pulse-slow';
      case 'reserved':
        return 'border-purple-300 dark:border-purple-900/60 bg-gradient-to-b from-purple-50/60 to-white dark:from-purple-950/20 dark:to-stone-900 hover:border-purple-500';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Controls: Zone Selector, Status Filters, Search & Add Table */}
      <div className="bg-white dark:bg-stone-900 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-3 sm:space-y-4 max-w-full overflow-hidden">
        
        {/* Salon / Zone Tabs & Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar max-w-full shrink">
            <button
              onClick={() => setSelectedZoneId('all')}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap shrink-0 ${
                selectedZoneId === 'all'
                  ? 'bg-stone-900 text-white dark:bg-amber-500 dark:text-stone-950 shadow-sm'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
              }`}
            >
              Tümü ({tables.length})
            </button>
            {zones.map((zone) => {
              const zoneTablesCount = tables.filter((t) => t.zoneId === zone.id).length;
              return (
                <button
                  key={zone.id}
                  onClick={() => setSelectedZoneId(zone.id)}
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap shrink-0 ${
                    selectedZoneId === zone.id
                      ? 'bg-stone-900 text-white dark:bg-amber-500 dark:text-stone-950 shadow-sm'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                  }`}
                >
                  {zone.name} ({zoneTablesCount})
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 justify-end shrink-0">
            {onOpenUnpaidDebtsModal && (
              <button
                onClick={onOpenUnpaidDebtsModal}
                className={`flex items-center gap-1 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs shrink-0 ${
                  unpaidDebtCount > 0
                    ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
                }`}
                title="Müşteri Açık Borçları / Veresiyeleri Görüntüle"
              >
                <UserX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Borçlar ({unpaidDebtCount})</span>
              </button>
            )}
          </div>
        </div>

        {/* Second Row: Status Filter Pills & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-stone-100 dark:border-stone-800">
          
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar max-w-full text-xs min-w-0">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap shrink-0 ${
                statusFilter === 'all'
                  ? 'bg-stone-800 text-white dark:bg-stone-200 dark:text-stone-900'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
              }`}
            >
              Tümü ({counts.all})
            </button>

            <button
              onClick={() => setStatusFilter('occupied')}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1 whitespace-nowrap shrink-0 ${
                statusFilter === 'occupied'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
              Dolu ({counts.occupied})
            </button>

            <button
              onClick={() => setStatusFilter('bill_requested')}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1 whitespace-nowrap shrink-0 ${
                statusFilter === 'bill_requested'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
              Hesap ({counts.bill_requested})
            </button>

            <button
              onClick={() => setStatusFilter('empty')}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1 whitespace-nowrap shrink-0 ${
                statusFilter === 'empty'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
              Boş ({counts.empty})
            </button>

            <button
              onClick={() => setStatusFilter('reserved')}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1 whitespace-nowrap shrink-0 ${
                statusFilter === 'reserved'
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0"></span>
              Rezerve ({counts.reserved})
            </button>
          </div>

          {/* Search Table */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
            <input
              type="text"
              placeholder="Masa veya Müşteri Ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-900 dark:text-stone-100"
            />
          </div>

        </div>

      </div>

      {/* Tables Grid Display */}
      {filteredTables.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800">
          <Receipt className="w-12 h-12 mx-auto text-stone-300 dark:text-stone-600 mb-3" />
          <h3 className="text-base font-semibold text-stone-800 dark:text-stone-200">
            Filtreye Uygun Masa Bulunamadı
          </h3>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            Farklı bir bölge veya filtre seçmeyi deneyin.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 min-[480px]:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2.5 sm:gap-4">
          {filteredTables.map((table) => {
            const activeOrder = activeOrdersMap.get(table.id);
            const statusBadge = getStatusBadge(table.status);
            const zone = zones.find((z) => z.id === table.zoneId);
            const elapsedMins = table.openedAt ? getElapsedTimeMinutes(table.openedAt) : 0;
            const pendingItemsCount = activeOrder
              ? activeOrder.items.filter((i) => i.status === 'pending' || i.status === 'preparing').length
              : 0;
            const readyItemsCount = activeOrder
              ? activeOrder.items.filter((i) => i.status === 'served').length
              : 0;

            const isReadyHighlighted = readyItemsCount > 0 && table.status !== 'empty';

            return (
              <div
                key={table.id}
                id={`table-card-${table.id}`}
                onClick={() => onSelectTable(table)}
                className={`relative rounded-xl sm:rounded-2xl p-3 sm:p-4 border transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between group ${
                  isReadyHighlighted ? 'ring-2 ring-emerald-500 shadow-md shadow-emerald-500/10' : ''
                } ${getCardStyle(table.status)}`}
              >
                {/* Header: Table Number & Status Pill */}
                <div>
                  <div className="flex items-start justify-between gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        <h3 className="font-bold text-base sm:text-lg text-stone-900 dark:text-stone-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors truncate">
                          {table.number}
                        </h3>
                        <span className="text-[10px] sm:text-[11px] font-medium text-stone-500 dark:text-stone-400 flex items-center gap-0.5 sm:gap-1 shrink-0">
                          <Users className="w-3 h-3" />
                          {table.capacity}
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-stone-500 dark:text-stone-400 truncate">
                        {zone?.name || 'Genel Area'}
                      </p>
                    </div>

                    <span
                      className={`text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border shrink-0 ${statusBadge.color}`}
                    >
                      {statusBadge.label}
                    </span>
                  </div>

                  {/* Customer / Reservation Info */}
                  {table.status === 'reserved' && table.customerName && (
                    <div className="mt-1.5 sm:mt-2 p-1.5 sm:p-2 bg-purple-50 dark:bg-purple-950/30 rounded-lg text-[11px] sm:text-xs text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-900/50 truncate">
                      <span className="font-semibold truncate block">{table.customerName}</span>
                    </div>
                  )}

                  {/* Active Order Summary */}
                  {activeOrder && (
                    <div className="mt-2 sm:mt-3 space-y-1 sm:space-y-1.5 pt-1.5 sm:pt-2 border-t border-stone-100 dark:border-stone-800/80">
                      {/* Customer Identification Badge */}
                      {activeOrder.customerNotes && (
                        <div className="flex items-center gap-1 px-1.5 py-0.5 sm:px-2 sm:py-1 bg-amber-500/10 text-amber-700 dark:text-amber-300 rounded-lg text-[11px] sm:text-xs font-bold border border-amber-500/20 truncate">
                          <User className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 text-amber-500" />
                          <span className="truncate">{activeOrder.customerNotes}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[11px] sm:text-xs">
                        <span className="text-stone-500 dark:text-stone-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-stone-400 shrink-0" />
                          {elapsedMins} dk
                        </span>
                        <span className="text-stone-500 dark:text-stone-400">
                          {activeOrder.items.length} Kalem
                        </span>
                      </div>

                      {/* Pending kitchen indicator */}
                      {pendingItemsCount > 0 && (
                        <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-amber-600 dark:text-amber-400 font-medium truncate">
                          <AlertCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                          <span className="truncate">{pendingItemsCount} mutfakta</span>
                        </div>
                      )}

                      {/* Ready items waiting for waiter service indicator */}
                      {readyItemsCount > 0 && (
                        <div className="flex items-center gap-1 px-1.5 py-0.5 sm:px-2 sm:py-1 bg-emerald-500/15 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 rounded-lg text-[10px] sm:text-[11px] font-black animate-pulse truncate">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
                          <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-500 shrink-0" />
                          <span className="truncate">🔔 {readyItemsCount} Ürün Hazır</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer: Order Amount or Quick Start Button */}
                <div className="mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-1">
                  {activeOrder ? (
                    <>
                      <span className="text-[10px] sm:text-xs text-stone-500 dark:text-stone-400 font-medium">Adisyon:</span>
                      <span className="text-sm sm:text-base font-extrabold text-stone-900 dark:text-amber-400 shrink-0">
                        {formatCurrency(activeOrder.totalAmount, settings.currencySymbol)}
                      </span>
                    </>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onQuickNewOrder(table);
                      }}
                      className="w-full py-1.5 sm:py-2 bg-stone-100 dark:bg-stone-800 hover:bg-emerald-500 hover:text-white text-stone-700 dark:text-stone-300 rounded-xl text-[11px] sm:text-xs font-semibold transition-all flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Adisyon Aç
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
