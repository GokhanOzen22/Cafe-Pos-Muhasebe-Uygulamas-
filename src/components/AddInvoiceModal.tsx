import React, { useState } from 'react';
import { StockItem, PurchaseInvoice, ExpenseInvoice, AppUser, RestaurantSettings } from '../types';
import { X, FilePlus, Receipt, Zap, Building2, CreditCard, Banknote, Landmark, ShieldAlert } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface AddInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  stockItems: StockItem[];
  currentUser: AppUser | null;
  settings: RestaurantSettings;
  onAddPurchaseInvoice: (invoice: PurchaseInvoice) => void;
  onAddExpenseInvoice: (expense: ExpenseInvoice) => void;
}

export const AddInvoiceModal: React.FC<AddInvoiceModalProps> = ({
  isOpen,
  onClose,
  stockItems,
  currentUser,
  settings,
  onAddPurchaseInvoice,
  onAddExpenseInvoice,
}) => {
  const [activeType, setActiveType] = useState<'purchase' | 'expense'>('expense');

  // Purchase Form State
  const [purchaseForm, setPurchaseForm] = useState({
    invoiceNo: `F-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    supplierName: '',
    date: new Date().toISOString().slice(0, 10),
    stockItemId: '',
    customItemName: '',
    quantity: '1',
    unit: 'kg',
    unitPrice: '',
    paymentType: 'nakit' as 'nakit' | 'kredi_karti' | 'havale' | 'veresiye',
    notes: '',
  });

  // Expense Form State
  const [expenseForm, setExpenseForm] = useState({
    title: '',
    category: 'elektrik' as 'elektrik' | 'su' | 'dogalgaz' | 'internet' | 'kira' | 'personel' | 'temizlik' | 'tamirat' | 'diger',
    invoiceNo: '',
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    paymentType: 'nakit' as 'nakit' | 'kredi_karti' | 'havale' | 'veresiye',
    notes: '',
  });

  if (!isOpen) return null;

  const canManageInvoices = currentUser
    ? currentUser.role === 'admin' || currentUser.isSystemAdmin || !!currentUser.permissions?.canManageInvoices
    : true;

  if (!canManageInvoices) {
    return (
      <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-md w-full p-6 text-stone-100 shadow-2xl space-y-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-stone-100">Yetkisiz İşlem</h3>
            <p className="text-xs text-stone-400 mt-1">
              Fiş / fatura ve gider kaydı girme yetkiniz bulunmamaktadır. Yalnızca yetkilendirilmiş personel ve yöneticiler işlem yapabilir.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold py-2.5 rounded-xl text-xs transition-colors shadow-md"
          >
            Anladım, Kapat
          </button>
        </div>
      </div>
    );
  }

  const handlePurchaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!purchaseForm.supplierName.trim()) {
      alert('Lütfen tedarikçi / firma adını giriniz.');
      return;
    }
    const selectedStock = stockItems.find((s) => s.id === purchaseForm.stockItemId);
    const itemName = selectedStock ? selectedStock.name : purchaseForm.customItemName.trim() || 'Genel Malzeme';
    const qty = parseFloat(purchaseForm.quantity) || 0;
    const price = parseFloat(purchaseForm.unitPrice) || 0;
    if (qty <= 0) {
      alert('Lütfen geçerli bir miktar giriniz.');
      return;
    }

    const newInvoice: PurchaseInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNo: purchaseForm.invoiceNo || `F-${Date.now().toString().slice(-6)}`,
      supplierName: purchaseForm.supplierName,
      date: purchaseForm.date || new Date().toISOString().slice(0, 10),
      stockItemId: purchaseForm.stockItemId || undefined,
      stockItemName: itemName,
      quantity: qty,
      unit: purchaseForm.unit || selectedStock?.unit || 'kg',
      unitPrice: price,
      totalAmount: qty * price,
      paymentType: purchaseForm.paymentType,
      createdByName: currentUser?.name ? `${currentUser.name} (${currentUser.role === 'cashier' ? 'Kasa Sorumlusu' : 'Yönetici'})` : 'Kasa Sorumlusu',
      notes: purchaseForm.notes,
      createdAt: new Date().toISOString(),
    };

    onAddPurchaseInvoice(newInvoice);

    alert(`✅ Mal Alım Fişi Kaydedildi!\n${qty} ${newInvoice.unit} ${itemName} stoğa eklendi ve ödemesi kaydedildi.`);
    onClose();
  };

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(expenseForm.amount) || 0;
    if (!expenseForm.title.trim()) {
      alert('Lütfen fatura / gider adını giriniz.');
      return;
    }
    if (amountVal <= 0) {
      alert('Lütfen geçerli bir ödeme tutarı giriniz.');
      return;
    }

    const newExpense: ExpenseInvoice = {
      id: `exp-${Date.now()}`,
      title: expenseForm.title.trim(),
      category: expenseForm.category,
      invoiceNo: expenseForm.invoiceNo.trim() || `FT-${Date.now().toString().slice(-6)}`,
      amount: amountVal,
      date: expenseForm.date || new Date().toISOString().slice(0, 10),
      paymentType: expenseForm.paymentType,
      paidByName: currentUser?.name ? `${currentUser.name} (${currentUser.role === 'cashier' ? 'Kasa Sorumlusu' : 'Yönetici'})` : 'Kasa Sorumlusu',
      notes: expenseForm.notes.trim(),
      createdAt: new Date().toISOString(),
    };

    onAddExpenseInvoice(newExpense);

    alert(`✅ Ödenen Fatura / Gider Kaydedildi!\n"${newExpense.title}" için ${formatCurrency(newExpense.amount, settings.currencySymbol)} ödeme kaydı işlendi.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-xl w-full p-6 text-stone-100 shadow-2xl space-y-5 my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <FilePlus className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-stone-100">Ödenen Fatura & Gider Kayıt Paneli</h3>
              <p className="text-xs text-stone-400">İşletme faturaları, fatura ödemeleri ve mal alım fişlerini kaydedin</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-stone-800 rounded-xl text-stone-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Type Switcher Tabs */}
        <div className="grid grid-cols-2 gap-2 bg-stone-950 p-1.5 rounded-2xl border border-stone-800">
          <button
            type="button"
            onClick={() => setActiveType('expense')}
            className={`py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeType === 'expense'
                ? 'bg-amber-500 text-stone-950 shadow-md scale-[1.02]'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>💡 Ödenen İşletme Faturası & Gider</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveType('purchase')}
            className={`py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeType === 'purchase'
                ? 'bg-emerald-500 text-stone-950 shadow-md scale-[1.02]'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>📦 Mal Alım Fişi (Depo / Toptancı)</span>
          </button>
        </div>

        {/* EXPENSE INVOICE FORM */}
        {activeType === 'expense' && (
          <form onSubmit={handleExpenseSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-400 mb-1 font-bold">Ödenen Fatura / Gider Adı *</label>
                <input
                  type="text"
                  required
                  value={expenseForm.title}
                  onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
                  placeholder="ör: Ağustos Elektrik Faturası, Dükkan Kirası"
                  className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 focus:outline-hidden focus:border-amber-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-stone-400 mb-1 font-bold">Gider Kategorisi</label>
                <select
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value as any })}
                  className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 focus:outline-hidden focus:border-amber-500 font-bold"
                >
                  <option value="elektrik">⚡ Elektrik Faturası</option>
                  <option value="su">💧 Şebeke Su Faturası</option>
                  <option value="dogalgaz">🔥 Doğalgaz Faturası</option>
                  <option value="internet">🌐 İnternet & Telefon</option>
                  <option value="kira">🏢 İşyeri Kirası</option>
                  <option value="personel">👥 Personel Maaş / Avans</option>
                  <option value="temizlik">🧹 Temizlik & Hijyen Gideri</option>
                  <option value="tamirat">🛠️ Bakım, Onarım & Servis</option>
                  <option value="diger">📦 Diğer İşletme Gideri</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-400 mb-1 font-bold">Fatura / Abone / Makbuz No</label>
                <input
                  type="text"
                  value={expenseForm.invoiceNo}
                  onChange={(e) => setExpenseForm({ ...expenseForm, invoiceNo: e.target.value })}
                  placeholder="ör: TREDAŞ-88291, TTNET-90214"
                  className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 focus:outline-hidden focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-stone-400 mb-1 font-bold">Ödeme Tarihi *</label>
                <input
                  type="date"
                  required
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 focus:outline-hidden focus:border-amber-500 font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-amber-400 mb-1 font-bold">Ödenen Tutar (₺) *</label>
                <input
                  type="number"
                  step="any"
                  required
                  min="1"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  placeholder="0.00 TL"
                  className="w-full px-3 py-2.5 bg-stone-950 border border-amber-500/50 rounded-xl text-amber-300 focus:outline-hidden font-black text-base"
                />
              </div>

              <div>
                <label className="block text-stone-400 mb-1 font-bold">Ödeme Yapılan Kaynak</label>
                <select
                  value={expenseForm.paymentType}
                  onChange={(e) => setExpenseForm({ ...expenseForm, paymentType: e.target.value as any })}
                  className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 focus:outline-hidden focus:border-amber-500 font-bold"
                >
                  <option value="nakit">💵 Nakit Kasa (Kasadan Ödendi)</option>
                  <option value="kredi_karti">💳 Şirket Kredi Kartı / POS</option>
                  <option value="havale">🏦 Banka Hesabı / EFT / Havale</option>
                  <option value="veresiye">📄 Veresiye / Cari Borç</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-stone-400 mb-1 font-bold">Açıklama / Not</label>
              <input
                type="text"
                value={expenseForm.notes}
                onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })}
                placeholder="ör: Makbuz kasa çekmecesine koyuldu, makbuz no: 104"
                className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 focus:outline-hidden"
              />
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black py-3 px-4 rounded-xl text-xs transition-all cursor-pointer shadow-lg hover:shadow-xl"
              >
                Fatura Ödemesini Kaydet
              </button>
              <button
                type="button"
                onClick={onClose}
                className="bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold py-3 px-4 rounded-xl text-xs transition-all cursor-pointer"
              >
                İptal
              </button>
            </div>
          </form>
        )}

        {/* PURCHASE INVOICE FORM */}
        {activeType === 'purchase' && (
          <form onSubmit={handlePurchaseSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-400 mb-1 font-bold">Fiş / Fatura Numarası *</label>
                <input
                  type="text"
                  required
                  value={purchaseForm.invoiceNo}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, invoiceNo: e.target.value })}
                  placeholder="ör: F-2026-001"
                  className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 focus:outline-hidden focus:border-emerald-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-stone-400 mb-1 font-bold">Tedarikçi / Toptancı Firma *</label>
                <input
                  type="text"
                  required
                  value={purchaseForm.supplierName}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, supplierName: e.target.value })}
                  placeholder="ör: Meriç Kasap A.Ş., Toptancı"
                  className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 focus:outline-hidden focus:border-emerald-500 font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-400 mb-1 font-bold">Fatura / Alım Tarihi</label>
                <input
                  type="date"
                  required
                  value={purchaseForm.date}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, date: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 focus:outline-hidden focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-stone-400 mb-1 font-bold">Ödeme Şekli</label>
                <select
                  value={purchaseForm.paymentType}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, paymentType: e.target.value as any })}
                  className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 focus:outline-hidden focus:border-emerald-500 font-bold"
                >
                  <option value="nakit">💵 Nakit Kasa (Kasadan Ödendi)</option>
                  <option value="kredi_karti">💳 Şirket Kredi Kartı / POS</option>
                  <option value="havale">🏦 Banka Havalesi / EFT</option>
                  <option value="veresiye">📄 Veresiye / Cari Borç</option>
                </select>
              </div>
            </div>

            {/* Stock Item Selection */}
            <div className="bg-stone-800/60 p-3 rounded-2xl border border-stone-700 space-y-3">
              <div>
                <label className="block text-emerald-400 mb-1 font-bold">İlişkili Depo Stok Kalemi Seçiniz *</label>
                <select
                  value={purchaseForm.stockItemId}
                  onChange={(e) => {
                    const st = stockItems.find((s) => s.id === e.target.value);
                    setPurchaseForm({
                      ...purchaseForm,
                      stockItemId: e.target.value,
                      unit: st ? st.unit : purchaseForm.unit,
                      unitPrice: st ? st.costPerUnit.toString() : purchaseForm.unitPrice,
                    });
                  }}
                  className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-xl text-stone-100 focus:outline-hidden focus:border-emerald-500 font-bold"
                >
                  <option value="">-- Depodaki Stok Ürünlerinden Seçin veya Yeni Girin --</option>
                  {stockItems.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} (Mevcut: {st.quantity} {st.unit} - Birim: {st.costPerUnit} TL)
                    </option>
                  ))}
                </select>
              </div>

              {!purchaseForm.stockItemId && (
                <div>
                  <label className="block text-stone-400 mb-1 font-bold">Serbest Ürün / Malzeme Adı (Listede yoksa)</label>
                  <input
                    type="text"
                    value={purchaseForm.customItemName}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, customItemName: e.target.value })}
                    placeholder="ör: Domates, Salça, Ambalaj Kutusu"
                    className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-xl text-stone-100 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-stone-400 mb-1 font-bold">Gelen Miktar *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    min="0.1"
                    value={purchaseForm.quantity}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, quantity: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-xl text-stone-100 focus:outline-hidden focus:border-emerald-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-stone-400 mb-1 font-bold">Birim</label>
                  <select
                    value={purchaseForm.unit}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, unit: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-xl text-stone-100 focus:outline-hidden focus:border-emerald-500"
                  >
                    <option value="kg">kg</option>
                    <option value="lt">lt</option>
                    <option value="adet">adet</option>
                    <option value="paket">paket</option>
                    <option value="kutu">kutu</option>
                    <option value="gram">gram</option>
                    <option value="porsiyon">porsiyon</option>
                  </select>
                </div>
                <div>
                  <label className="block text-stone-400 mb-1 font-bold">Birim Alış (₺) *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    min="0"
                    value={purchaseForm.unitPrice}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, unitPrice: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-xl text-stone-100 focus:outline-hidden focus:border-emerald-500 font-bold"
                  />
                </div>
              </div>

              {/* Total Calculated */}
              <div className="bg-emerald-950/40 p-3 rounded-xl border border-emerald-500/30 flex items-center justify-between">
                <span className="font-bold text-emerald-400">HESAPLANAN TOPLAM TUTAR:</span>
                <span className="text-xl font-black text-emerald-300">
                  {formatCurrency((parseFloat(purchaseForm.quantity) || 0) * (parseFloat(purchaseForm.unitPrice) || 0), settings.currencySymbol)}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-stone-400 mb-1 font-bold">Fiş / İrsaliye Notu</label>
              <input
                type="text"
                value={purchaseForm.notes}
                onChange={(e) => setPurchaseForm({ ...purchaseForm, notes: e.target.value })}
                placeholder="ör: Teslim alındı, irsaliye no 402"
                className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 focus:outline-hidden"
              />
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 px-4 rounded-xl text-xs transition-all cursor-pointer shadow-lg hover:shadow-xl"
              >
                Mal Alım Fişini Kaydet & Stoğa İşle
              </button>
              <button
                type="button"
                onClick={onClose}
                className="bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold py-3 px-4 rounded-xl text-xs transition-all cursor-pointer"
              >
                İptal
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
