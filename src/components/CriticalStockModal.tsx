import React, { useState } from 'react';
import { StockItem, MenuItem, RestaurantSettings } from '../types';
import { AlertTriangle, X, Package, Utensils, Plus, CheckCircle2, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface CriticalStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  stockItems: StockItem[];
  menuItems: MenuItem[];
  settings: RestaurantSettings;
  onUpdateStockItems: (items: StockItem[]) => void;
  onUpdateMenuItems: (items: MenuItem[]) => void;
  onNavigateToStock?: () => void;
}

export const CriticalStockModal: React.FC<CriticalStockModalProps> = ({
  isOpen,
  onClose,
  stockItems,
  menuItems,
  settings,
  onUpdateStockItems,
  onUpdateMenuItems,
  onNavigateToStock,
}) => {
  const [quickAddAmount, setQuickAddAmount] = useState<{ [key: string]: string }>({});

  if (!isOpen) return null;

  // Filter items below or equal to minThreshold
  const criticalRawMaterials = stockItems.filter((s) => s.quantity <= s.minThreshold);
  const criticalMenuItems = menuItems.filter((m) => (m.stockQuantity ?? 0) <= (m.minStockAlert ?? 10));

  const totalCriticalCount = criticalRawMaterials.length + criticalMenuItems.length;

  // Quick increase quantity for StockItem
  const handleAddStockQty = (stockId: string, addAmount: number) => {
    const updated = stockItems.map((s) => {
      if (s.id === stockId) {
        return {
          ...s,
          quantity: Math.max(0, s.quantity + addAmount),
          lastUpdated: new Date().toISOString(),
        };
      }
      return s;
    });
    onUpdateStockItems(updated);
  };

  // Quick increase quantity for MenuItem
  const handleAddMenuItemQty = (itemId: string, addAmount: number) => {
    const updated = menuItems.map((m) => {
      if (m.id === itemId) {
        return {
          ...m,
          stockQuantity: Math.max(0, (m.stockQuantity || 0) + addAmount),
        };
      }
      return m;
    });
    onUpdateMenuItems(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-6 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-500/20 text-rose-400 rounded-2xl border border-rose-500/30">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                <span>Kritik Stok Uyarısı</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/30 text-rose-300 border border-rose-500/40 font-mono">
                  {totalCriticalCount} Çeşit Ürün
                </span>
              </h2>
              <p className="text-xs text-stone-400">Kritik eşik seviyesine düşen veya tükenen ürünlerin listesi</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content - Scrollable */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          
          {totalCriticalCount === 0 ? (
            <div className="text-center py-12 space-y-3">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">Kritik Stokta Ürün Bulunmuyor</h3>
              <p className="text-sm text-stone-500 dark:text-stone-400 max-w-md mx-auto">
                Tüm hammadde ve menü ürünlerinizin stok miktarları kritik eşik değerlerinin üzerindedir.
              </p>
            </div>
          ) : (
            <>
              {/* Critical Raw Materials Section */}
              {criticalRawMaterials.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-2">
                    <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                      <Package className="w-4 h-4 text-amber-500" />
                      <span>Kritik Hammaddeler / Depo Stokları ({criticalRawMaterials.length})</span>
                    </h3>
                  </div>

                  <div className="space-y-2">
                    {criticalRawMaterials.map((item) => {
                      const isZero = item.quantity <= 0;
                      return (
                        <div
                          key={item.id}
                          className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-stone-900 dark:text-stone-100">{item.name}</span>
                              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                                isZero
                                  ? 'bg-rose-600 text-white animate-pulse'
                                  : 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                              }`}>
                                {isZero ? 'TÜKENDİ!' : 'KRİTİK'}
                              </span>
                            </div>
                            <div className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-3">
                              <span>Mevcut: <strong className={isZero ? 'text-rose-500 font-bold' : 'text-stone-900 dark:text-stone-100'}>{item.quantity} {item.unit}</strong></span>
                              <span>•</span>
                              <span>Kritik Eşik: <strong>{item.minThreshold} {item.unit}</strong></span>
                              {item.costPerUnit > 0 && (
                                <>
                                  <span>•</span>
                                  <span>Maliyet: {formatCurrency(item.costPerUnit, settings.currencySymbol)}/{item.unit}</span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Quick Add Stock Buttons */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[11px] text-stone-400 mr-1 font-medium">Hızlı Ekle:</span>
                            <button
                              onClick={() => handleAddStockQty(item.id, 5)}
                              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-lg transition-colors shadow-2xs flex items-center gap-0.5"
                              title="Stoka +5 birim ekle"
                            >
                              <Plus className="w-3 h-3" />
                              <span>5 {item.unit}</span>
                            </button>
                            <button
                              onClick={() => handleAddStockQty(item.id, 10)}
                              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-lg transition-colors shadow-2xs flex items-center gap-0.5"
                              title="Stoka +10 birim ekle"
                            >
                              <Plus className="w-3 h-3" />
                              <span>10 {item.unit}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Critical Menu Items Section */}
              {criticalMenuItems.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-2">
                    <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                      <Utensils className="w-4 h-4 text-amber-500" />
                      <span>Kritik Menü Satış Ürünleri ({criticalMenuItems.length})</span>
                    </h3>
                  </div>

                  <div className="space-y-2">
                    {criticalMenuItems.map((item) => {
                      const qty = item.stockQuantity || 0;
                      const isZero = qty <= 0;
                      return (
                        <div
                          key={item.id}
                          className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-stone-900 dark:text-stone-100">{item.name}</span>
                              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                                isZero
                                  ? 'bg-rose-600 text-white animate-pulse'
                                  : 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                              }`}>
                                {isZero ? 'TÜKENDİ!' : 'KRİTİK'}
                              </span>
                            </div>
                            <div className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-3">
                              <span>Mevcut: <strong className={isZero ? 'text-rose-500 font-bold' : 'text-stone-900 dark:text-stone-100'}>{qty} {item.unit}</strong></span>
                              <span>•</span>
                              <span>Kritik Eşik: <strong>{item.minStockAlert || 10} {item.unit}</strong></span>
                            </div>
                          </div>

                          {/* Quick Add Stock Buttons */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[11px] text-stone-400 mr-1 font-medium">Hızlı Ekle:</span>
                            <button
                              onClick={() => handleAddMenuItemQty(item.id, 5)}
                              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-lg transition-colors shadow-2xs flex items-center gap-0.5"
                              title="Stoka +5 adet ekle"
                            >
                              <Plus className="w-3 h-3" />
                              <span>5 {item.unit}</span>
                            </button>
                            <button
                              onClick={() => handleAddMenuItemQty(item.id, 10)}
                              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-lg transition-colors shadow-2xs flex items-center gap-0.5"
                              title="Stoka +10 adet ekle"
                            >
                              <Plus className="w-3 h-3" />
                              <span>10 {item.unit}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-stone-100 dark:bg-stone-950/80 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between gap-3 shrink-0">
          {onNavigateToStock ? (
            <button
              onClick={() => {
                onClose();
                onNavigateToStock();
              }}
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-stone-950 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors shadow-xs"
            >
              <span>Stok Yönetim Paneline Git</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div></div>
          )}

          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 rounded-xl text-xs sm:text-sm font-bold transition-colors"
          >
            Kapat
          </button>
        </div>

      </div>
    </div>
  );
};
