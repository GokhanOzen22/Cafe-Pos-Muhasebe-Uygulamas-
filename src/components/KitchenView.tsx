import React, { useState } from 'react';
import { Order, OrderItem, RestaurantSettings } from '../types';
import { ChefHat, Clock, CheckCircle2, AlertCircle, Sparkles, Filter, Utensils } from 'lucide-react';
import { getElapsedTimeMinutes } from '../utils/formatters';

interface KitchenViewProps {
  orders: Order[];
  settings: RestaurantSettings;
  onUpdateItemStatus: (orderId: string, itemId: string, status: 'preparing' | 'served') => void;
  onUpdateAllTableItemsStatus: (orderId: string, status: 'served') => void;
}

export const KitchenView: React.FC<KitchenViewProps> = ({
  orders,
  settings,
  onUpdateItemStatus,
  onUpdateAllTableItemsStatus,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'kitchen' | 'bar'>('all');

  // Filter open orders that have active pending/preparing items
  const activeKitchenOrders = orders.filter((order) => {
    if (order.status !== 'open') return false;
    return order.items.some((item) => item.status === 'pending' || item.status === 'preparing');
  });

  return (
    <div className="space-y-6">
      
      {/* Kitchen Bar Header Controls */}
      <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500/10 text-amber-500 p-2.5 rounded-2xl border border-amber-500/20">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              Mutfak & Bar Canlı Sipariş Ekranı
              <span className="text-xs bg-amber-500 text-stone-950 px-2.5 py-0.5 rounded-full font-bold">
                {activeKitchenOrders.length} Masa Bekliyor
              </span>
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Masa bazlı gelen siparişler ve özel müşteri notları
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl text-xs font-medium">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterType === 'all'
                ? 'bg-stone-900 text-white dark:bg-amber-500 dark:text-stone-950 font-bold'
                : 'text-stone-600 dark:text-stone-300'
            }`}
          >
            Tüm Istasyonlar
          </button>
          <button
            onClick={() => setFilterType('kitchen')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterType === 'kitchen'
                ? 'bg-stone-900 text-white dark:bg-amber-500 dark:text-stone-950 font-bold'
                : 'text-stone-600 dark:text-stone-300'
            }`}
          >
            Yemek & Mutfak
          </button>
          <button
            onClick={() => setFilterType('bar')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterType === 'bar'
                ? 'bg-stone-900 text-white dark:bg-amber-500 dark:text-stone-950 font-bold'
                : 'text-stone-600 dark:text-stone-300'
            }`}
          >
            Bar & İçecek
          </button>
        </div>
      </div>

      {/* Orders Grid */}
      {activeKitchenOrders.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 space-y-2">
          <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500" />
          <h3 className="text-lg font-bold text-stone-800 dark:text-stone-200">
            Tüm Mutfak Siparişleri Tamamlandı!
          </h3>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Bekleyen mutfak veya bar siparişi yok. Yeni siparişler otomatik görünecektir.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {activeKitchenOrders.map((order) => {
            const elapsedMins = getElapsedTimeMinutes(order.createdAt);
            const isLate = elapsedMins >= 15;
            const kitchenItems = order.items.filter((i) => i.status === 'pending' || i.status === 'preparing');

            return (
              <div
                key={order.id}
                className={`bg-white dark:bg-stone-900 rounded-3xl border shadow-md overflow-hidden flex flex-col justify-between ${
                  isLate
                    ? 'border-rose-500/80 ring-2 ring-rose-500/20'
                    : 'border-stone-200 dark:border-stone-800'
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div
                    className={`p-4 border-b flex items-center justify-between ${
                      isLate
                        ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/50'
                        : 'bg-stone-50 dark:bg-stone-800/60 text-stone-900 dark:text-stone-100 border-stone-200 dark:border-stone-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-lg">{order.tableName}</h3>
                        <span className="text-xs bg-stone-200 dark:bg-stone-700 px-2 py-0.5 rounded-full font-medium">
                          {order.zoneName}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 dark:text-stone-400">Garson: {order.waiterName}</p>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-bold px-3 py-1 bg-white dark:bg-stone-900 rounded-xl shadow-2xs border border-stone-200 dark:border-stone-700">
                      <Clock className={`w-3.5 h-3.5 ${isLate ? 'text-rose-500 animate-spin' : 'text-amber-500'}`} />
                      <span>{elapsedMins} dk</span>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="p-4 space-y-3">
                    {kitchenItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 bg-stone-50 dark:bg-stone-800/80 rounded-2xl border border-stone-200 dark:border-stone-700/60 flex items-start justify-between gap-3"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-base text-amber-600 dark:text-amber-400 min-w-[24px]">
                              {item.quantity}x
                            </span>
                            <span className="font-bold text-sm text-stone-900 dark:text-stone-100">
                              {item.name}
                            </span>
                          </div>

                          {item.note && (
                            <div className="mt-1.5 p-1.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-lg text-xs font-semibold text-amber-800 dark:text-amber-300">
                              Not: {item.note}
                            </div>
                          )}
                        </div>

                        {/* Status buttons for item */}
                        <div className="flex flex-col gap-1">
                          {item.status === 'pending' ? (
                            <button
                              onClick={() => onUpdateItemStatus(order.id, item.id, 'preparing')}
                              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-lg shadow-2xs"
                            >
                              Hazırla
                            </button>
                          ) : (
                            <button
                              onClick={() => onUpdateItemStatus(order.id, item.id, 'served')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-2xs"
                            >
                              Hazır ✓
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Complete All Button */}
                <div className="p-4 bg-stone-50 dark:bg-stone-900/80 border-t border-stone-200 dark:border-stone-800">
                  <button
                    onClick={() => onUpdateAllTableItemsStatus(order.id, 'served')}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Tüm Masayı Hazır / Servis Edildi Yap</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
