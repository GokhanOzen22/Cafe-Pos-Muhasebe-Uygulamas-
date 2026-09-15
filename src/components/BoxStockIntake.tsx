import React, { useState } from 'react';
import { StockItem } from '../types';
import {
  Package, Scan, Plus, CheckCircle2, AlertCircle, Search, Edit3,
  Box, ArrowRight, Barcode, ShieldCheck, History, Tag, Layers
} from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';

interface BoxStockIntakeProps {
  stockItems: StockItem[];
  onUpdateStockItems: (items: StockItem[]) => void;
}

interface IntakeLog {
  id: string;
  stockName: string;
  boxBarcode: string;
  boxCount: number;
  itemsPerBox: number;
  totalAddedUnits: number;
  unit: string;
  supplierName?: string;
  timestamp: string;
}

export const BoxStockIntake: React.FC<BoxStockIntakeProps> = ({
  stockItems,
  onUpdateStockItems,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'intake' | 'mappings'>('intake');

  // Scanning / Search State
  const [searchInput, setSearchInput] = useState<string>('');
  const [selectedStock, setSelectedStock] = useState<StockItem | null>(null);

  // Intake Form State
  const [boxCount, setBoxCount] = useState<number>(1);
  const [supplierName, setSupplierName] = useState<string>('');
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');
  const [boxCostPrice, setBoxCostPrice] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // History Log State
  const [intakeLogs, setIntakeLogs] = useState<IntakeLog[]>([]);

  // Mapping Edit Modal State
  const [editingStock, setEditingStock] = useState<StockItem | null>(null);
  const [editUnitBarcode, setEditUnitBarcode] = useState<string>('');
  const [editBoxBarcode, setEditBoxBarcode] = useState<string>('');
  const [editItemsPerBox, setEditItemsPerBox] = useState<number>(12);
  const [editBoxUnitName, setEditBoxUnitName] = useState<string>('Koli');

  // Handle Search or Scan
  const handleScanOrSearch = (query: string) => {
    setSearchInput(query);
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      setSelectedStock(null);
      return;
    }

    // Match exact box barcode first, then unit barcode, then name
    const found = stockItems.find(
      (item) =>
        item.boxBarcode?.toLowerCase() === trimmed ||
        item.unitBarcode?.toLowerCase() === trimmed ||
        item.name.toLowerCase().includes(trimmed)
    );

    if (found) {
      setSelectedStock(found);
      if (found.costPerUnit && found.itemsPerBox) {
        setBoxCostPrice(String(found.costPerUnit * found.itemsPerBox));
      }
    }
  };

  // Process Stock Intake
  const handleProcessIntake = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStock) return;

    const itemsPerBox = selectedStock.itemsPerBox || 1;
    const totalAdded = boxCount * itemsPerBox;
    const newQuantity = selectedStock.quantity + totalAdded;

    // Optional cost update
    let updatedCost = selectedStock.costPerUnit;
    if (boxCostPrice) {
      const parsedBoxCost = parseFloat(boxCostPrice);
      if (parsedBoxCost > 0) {
        updatedCost = parsedBoxCost / itemsPerBox;
      }
    }

    // Update stock item in state
    const updatedList = stockItems.map((item) =>
      item.id === selectedStock.id
        ? {
            ...item,
            quantity: newQuantity,
            costPerUnit: updatedCost,
            lastUpdated: new Date().toISOString(),
          }
        : item
    );

    onUpdateStockItems(updatedList);

    // Add log entry
    const newLog: IntakeLog = {
      id: `log-${Date.now()}`,
      stockName: selectedStock.name,
      boxBarcode: selectedStock.boxBarcode || 'Barkodsuz',
      boxCount,
      itemsPerBox,
      totalAddedUnits: totalAdded,
      unit: selectedStock.unit,
      supplierName: supplierName || 'Genel Tedarikçi',
      timestamp: new Date().toLocaleTimeString('tr-TR'),
    };

    setIntakeLogs([newLog, ...intakeLogs]);

    setSuccessMessage(
      `✅ stok başarıyla güncellendi: ${selectedStock.name} stok miktarı +${totalAdded} ${selectedStock.unit} arttırıldı! (Yeni Stok: ${newQuantity} ${selectedStock.unit})`
    );

    setTimeout(() => setSuccessMessage(null), 5000);

    // Reset Form
    setSelectedStock(null);
    setSearchInput('');
    setBoxCount(1);
    setSupplierName('');
    setInvoiceNumber('');
    setBoxCostPrice('');
  };

  // Handle Edit Mapping Modal Open
  const handleOpenEditMapping = (item: StockItem) => {
    setEditingStock(item);
    setEditUnitBarcode(item.unitBarcode || '');
    setEditBoxBarcode(item.boxBarcode || '');
    setEditItemsPerBox(item.itemsPerBox || 12);
    setEditBoxUnitName(item.boxUnitName || 'Koli');
  };

  // Save Mapping
  const handleSaveMapping = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStock) return;

    const updatedList = stockItems.map((item) =>
      item.id === editingStock.id
        ? {
            ...item,
            unitBarcode: editUnitBarcode.trim() || undefined,
            boxBarcode: editBoxBarcode.trim() || undefined,
            itemsPerBox: editItemsPerBox > 0 ? editItemsPerBox : 1,
            boxUnitName: editBoxUnitName.trim() || 'Koli',
          }
        : item
    );

    onUpdateStockItems(updatedList);
    setEditingStock(null);
  };

  return (
    <div className="space-y-6">
      {/* Sub navigation bar */}
      <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveSubTab('intake')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              activeSubTab === 'intake'
                ? 'bg-amber-500 text-stone-950 shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
            }`}
          >
            <Box className="w-4 h-4" />
            <span>Koli Bazlı Stok Girişi</span>
          </button>

          <button
            onClick={() => setActiveSubTab('mappings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              activeSubTab === 'mappings'
                ? 'bg-amber-500 text-stone-950 shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
            }`}
          >
            <Barcode className="w-4 h-4" />
            <span>Koli Barkod & Adet Eşleştirme Tanımları ({stockItems.length})</span>
          </button>
        </div>
      </div>

      {/* SUCCESS TOAST BANNER */}
      {successMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-2xl flex items-center justify-between animate-fade-in">
          <span>{successMessage}</span>
        </div>
      )}

      {/* SUB TAB 1: KOLI BAZLI STOK GIRISI */}
      {activeSubTab === 'intake' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Scan & Form */}
          <div className="lg:col-span-7 bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-6">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Scan className="w-5 h-5 text-amber-500" />
                Koli Barkodu Okut veya Stok Ara
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Kolinin üzerindeki barkodu el tipi barkod okuyucu ile okutun; sistem koli içi adedi otomatik hesaplasın.
              </p>
            </div>

            {/* Scan Search Input Box */}
            <div className="relative">
              <input
                type="text"
                placeholder="Barkodu okutun veya ürün adı yazın... (Örn: 869000100399)"
                value={searchInput}
                onChange={(e) => handleScanOrSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-stone-50 dark:bg-stone-950 border-2 border-amber-500/40 focus:border-amber-500 rounded-2xl text-sm font-semibold text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
              <Scan className="w-5 h-5 text-amber-500 absolute left-3 top-3.5" />
            </div>

            {/* Selected Item Preview & Intake Form */}
            {selectedStock ? (
              <form onSubmit={handleProcessIntake} className="bg-stone-50 dark:bg-stone-950/60 p-5 rounded-2xl border border-amber-500/30 space-y-5 animate-fade-in">
                <div className="flex items-start justify-between gap-3 border-b border-stone-200 dark:border-stone-800 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 block">
                      Seçilen Stok Kalemi
                    </span>
                    <h4 className="font-bold text-base text-stone-900 dark:text-stone-100">
                      {selectedStock.name}
                    </h4>
                    <span className="text-xs text-stone-500">
                      Mevcut Stok: <strong>{selectedStock.quantity} {selectedStock.unit}</strong> | Birim Maliyet: {formatCurrency(selectedStock.costPerUnit, '₺')}
                    </span>
                  </div>

                  <div className="bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl text-right">
                    <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400 block">
                      {selectedStock.boxUnitName || 'Koli'} İçi Adet:
                    </span>
                    <span className="text-sm font-extrabold text-amber-500 font-mono">
                      {selectedStock.itemsPerBox || 1} {selectedStock.unit}
                    </span>
                  </div>
                </div>

                {/* Conversion Preview Box */}
                <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl flex items-center justify-between text-xs">
                  <span className="text-stone-700 dark:text-stone-300 font-medium">
                    📦 Hesaplanacak Toplam Stok İlavesi:
                  </span>
                  <span className="font-extrabold text-amber-600 dark:text-amber-400 font-mono text-sm">
                    {boxCount} {selectedStock.boxUnitName || 'Koli'} × {selectedStock.itemsPerBox || 1} = +{boxCount * (selectedStock.itemsPerBox || 1)} {selectedStock.unit}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      Giriş Yapılacak {selectedStock.boxUnitName || 'Koli'} Adedi
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={boxCount}
                      onChange={(e) => setBoxCount(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full p-2.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl font-bold text-sm text-stone-900 dark:text-stone-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      Koli Alış Fiyatı (Opsiyonel)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Örn: 408.00 ₺"
                      value={boxCostPrice}
                      onChange={(e) => setBoxCostPrice(e.target.value)}
                      className="w-full p-2.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl font-bold text-sm text-stone-900 dark:text-stone-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      Tedarikçi Firma / Toptancı
                    </label>
                    <input
                      type="text"
                      placeholder="Örn: Metro Toptancı Market"
                      value={supplierName}
                      onChange={(e) => setSupplierName(e.target.value)}
                      className="w-full p-2.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      Fatura / İrsaliye No
                    </label>
                    <input
                      type="text"
                      placeholder="Örn: FTR-2026-9041"
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      className="w-full p-2.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-xs font-semibold"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedStock(null)}
                    className="px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 text-xs font-bold text-stone-600 dark:text-stone-300"
                  >
                    Vazgeç
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 rounded-xl text-xs font-bold shadow-md shadow-amber-500/20 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Koli Stok Girişini Onayla</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-8 text-center bg-stone-50 dark:bg-stone-950/40 rounded-2xl border border-dashed border-stone-300 dark:border-stone-800 text-stone-500 text-xs space-y-2">
                <Box className="w-8 h-8 text-stone-400 mx-auto" />
                <p>Barkod okuttuğunuzda ilgili stok otomatik olarak buraya gelecektir.</p>
                <p className="text-[11px] text-stone-400">
                  İpucu: Barkodu bulunmayan ürünler için "Koli Barkod & Adet Eşleştirme" sekmesinden barkod tanımı yapabilirsiniz.
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Recent Intake Logs */}
          <div className="lg:col-span-5 bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <History className="w-5 h-5 text-amber-500" />
              Son Koli Giriş Hareketleri
            </h3>

            {intakeLogs.length === 0 ? (
              <div className="p-8 text-center bg-stone-50 dark:bg-stone-950/40 rounded-2xl border border-stone-200 dark:border-stone-800 text-stone-500 text-xs">
                Bu oturumda henüz koli stok girişi yapılmadı.
              </div>
            ) : (
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {intakeLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 bg-stone-50 dark:bg-stone-950/60 rounded-2xl border border-stone-200 dark:border-stone-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <h4 className="font-bold text-stone-900 dark:text-stone-100">
                        {log.stockName}
                      </h4>
                      <span className="text-[11px] text-stone-500 block">
                        {log.supplierName} • {log.timestamp}
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400 font-mono text-sm block">
                        +{log.totalAddedUnits} {log.unit}
                      </span>
                      <span className="text-[10px] text-stone-400">
                        ({log.boxCount} Koli × {log.itemsPerBox})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB TAB 2: KOLI BARKOD & ADET MAPPING TABLE */}
      {activeSubTab === 'mappings' && (
        <div className="bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-3 border-b border-stone-200 dark:border-stone-800 pb-3">
            <div>
              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Barcode className="w-5 h-5 text-amber-500" />
                Stok Koli Barkodu & İçi Adet Tanımları
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Stok hammaddelerinin birim ve koli barkodlarını, koli içi adet katsayılarını buradan yönetebilirsiniz.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-500 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">Stok Adı</th>
                  <th className="py-3 px-3">Kategori</th>
                  <th className="py-3 px-3">Birim Barkod</th>
                  <th className="py-3 px-3">Koli Barkod</th>
                  <th className="py-3 px-3">Koli İçi Adet</th>
                  <th className="py-3 px-3 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {stockItems.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-50 dark:hover:bg-stone-950/50">
                    <td className="py-3 px-3 font-bold text-stone-900 dark:text-stone-100">
                      {item.name}
                    </td>
                    <td className="py-3 px-3 text-stone-500">
                      {item.category}
                    </td>
                    <td className="py-3 px-3 font-mono text-stone-600 dark:text-stone-300">
                      {item.unitBarcode || <span className="text-stone-400 italic">Tanımsız</span>}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-amber-600 dark:text-amber-400">
                      {item.boxBarcode || <span className="text-stone-400 italic font-normal">Tanımsız</span>}
                    </td>
                    <td className="py-3 px-3">
                      <span className="bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 px-2 py-1 rounded-md font-mono font-bold">
                        1 {item.boxUnitName || 'Koli'} = {item.itemsPerBox || 1} {item.unit}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleOpenEditMapping(item)}
                        className="p-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 rounded-lg font-bold text-[11px] inline-flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Barkod Tanımla</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EDIT BARCODE MAPPING MODAL */}
      {editingStock && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 max-w-md w-full rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Barcode className="w-5 h-5 text-amber-500" />
                Koli Barkod Tanımı ({editingStock.name})
              </h3>
              <button
                onClick={() => setEditingStock(null)}
                className="text-stone-400 hover:text-stone-600 text-sm font-bold p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMapping} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Birim Ürün Barkodu (Tekli Barkod)
                </label>
                <input
                  type="text"
                  placeholder="Örn: 869000100301"
                  value={editUnitBarcode}
                  onChange={(e) => setEditUnitBarcode(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl font-mono text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Koli / Kasa Barkodu (Toptan Ambalaj Barkodu)
                </label>
                <input
                  type="text"
                  placeholder="Örn: 869000100399"
                  value={editBoxBarcode}
                  onChange={(e) => setEditBoxBarcode(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl font-mono text-xs font-bold text-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Koli İçi Adet
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editItemsPerBox}
                    onChange={(e) => setEditItemsPerBox(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full p-2.5 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl font-bold text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Ambalaj Tipi
                  </label>
                  <input
                    type="text"
                    placeholder="Koli, Kasa, Çuval..."
                    value={editBoxUnitName}
                    onChange={(e) => setEditBoxUnitName(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingStock(null)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 text-xs font-bold"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 rounded-xl text-xs font-bold shadow-xs"
                >
                  Tanımı Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
