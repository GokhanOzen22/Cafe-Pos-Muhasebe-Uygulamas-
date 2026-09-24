import React, { useState } from 'react';
import { Table, Order, RestaurantSettings, AppUser, DailyZReport, MenuItem } from '../types';
import { X, Lock, CheckCircle2, UserX, Printer, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { formatCurrency, formatDate, formatTime } from '../utils/formatters';
import { generateZReportHtml, executeThermalPrint } from '../utils/thermalPrinter';

interface CloseDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  tables: Table[];
  menuItems: MenuItem[];
  settings: RestaurantSettings;
  currentUser?: AppUser | null;
  dailyZReports: DailyZReport[];
  onExecuteCloseDay: () => DailyZReport;
}

export const CloseDayModal: React.FC<CloseDayModalProps> = ({
  isOpen,
  onClose,
  orders,
  tables,
  menuItems,
  settings,
  currentUser,
  dailyZReports,
  onExecuteCloseDay,
}) => {
  const [createdReport, setCreatedReport] = useState<DailyZReport | null>(null);
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  const [printSuccess, setPrintSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  // Unsealed closed orders for day closing calculation
  const unsealedOrders = orders.filter((o) => o.status === 'closed' && !o.zReportId);
  const unsealedRevenue = unsealedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const unsealedNakit = unsealedOrders.filter((o) => o.paymentType === 'nakit').reduce((sum, o) => sum + o.totalAmount, 0);
  const unsealedKredi = unsealedOrders.filter((o) => o.paymentType === 'kredi_karti').reduce((sum, o) => sum + o.totalAmount, 0);
  const unsealedYemek = unsealedOrders.filter((o) => o.paymentType === 'yemek_karti').reduce((sum, o) => sum + o.totalAmount, 0);

  const activeOpenTables = tables.filter((t) => t.status === 'occupied' || t.status === 'bill_requested');
  const activeOpenOrders = orders.filter((o) => o.status === 'open');
  const activeOpenAmount = activeOpenOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  const activeUnpaidDebts = orders.filter((o) => o.status === 'unpaid_debt');
  const activeUnpaidDebtCount = activeUnpaidDebts.length;
  const activeUnpaidDebtAmount = activeUnpaidDebts.reduce((sum, o) => sum + o.totalAmount, 0);

  const nextZNum = (dailyZReports?.length || 0) + 1;
  const nextZReportNo = `Z-${String(nextZNum).padStart(4, '0')}`;

  const handlePrintReport = async (reportToPrint: DailyZReport) => {
    setIsPrinting(true);
    setPrintSuccess(false);

    const targetPrinter =
      settings.selectedPrinterName ||
      settings.printers?.find((p) => p.isDefault)?.usbDeviceName ||
      settings.printers?.find((p) => p.isDefault)?.name ||
      '';

    try {
      const htmlContent = generateZReportHtml({
        targetReport: reportToPrint,
        activeRevenue: reportToPrint.totalRevenue,
        activeOrdersCount: reportToPrint.ordersCount,
        activePaymentStats: reportToPrint.paymentBreakdown,
        activeTax: reportToPrint.totalTax,
        activeDiscounts: reportToPrint.totalDiscounts,
        activeProfit: reportToPrint.estimatedProfit,
        activeSoldItems: reportToPrint.itemsSold || [],
        activeOpenTablesCount: reportToPrint.devredenMasaSayisi || 0,
        activeOpenTablesAmount: reportToPrint.devredenTutar || 0,
        activeUnpaidDebtsCount: reportToPrint.devredenBorcluSayisi || 0,
        activeUnpaidDebtsAmount: reportToPrint.devredenBorcTutari || 0,
        activeUnpaidDebtsList: reportToPrint.devredenBorclular || [],
        settings,
        currentUser: currentUser ? {
          id: currentUser.id,
          name: currentUser.name,
          role: currentUser.role,
        } : undefined,
        reportDateFilter: 'active',
      });

      const res = await executeThermalPrint(htmlContent, targetPrinter);
      if (res.success) {
        setPrintSuccess(true);
      }
    } catch (err) {
      console.warn('Z-Raporu yazdırma hatası:', err);
      try {
        window.print();
      } catch (e) {
        console.error('window.print hatası:', e);
      }
    } finally {
      setIsPrinting(false);
    }
  };

  const handleConfirm = async () => {
    try {
      const newReport = onExecuteCloseDay();
      setCreatedReport(newReport);
      // Automatically print thermal Z-Report immediately upon day close
      handlePrintReport(newReport);
    } catch (err) {
      console.error('Günü kapatma hatası:', err);
    }
  };

  const handleCloseModal = () => {
    setCreatedReport(null);
    setPrintSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-lg w-full p-5 sm:p-6 text-stone-900 dark:text-stone-100 shadow-2xl space-y-4 my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 sm:p-3 bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-2xl">
              <Lock className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg text-stone-900 dark:text-stone-100">
                {createdReport ? 'Gün Kapatıldı & Z-Raporu Kesildi' : 'Günü Kapat & Z-Raporu Mühürle'}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {createdReport ? 'Mali gün sonu mühürleme tamamlandı' : 'Resmi gün sonu devir ve mali mühürleme işlemi'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCloseModal}
            className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AFTER CLOSURE SUCCESS VIEW */}
        {createdReport ? (
          <div className="space-y-4 py-2">
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500 text-stone-950 flex items-center justify-center mx-auto shadow-md">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <h4 className="font-black text-emerald-700 dark:text-emerald-400 text-base">
                {createdReport.zReportNo} Nolu Gün Sonu Başarıyla Kapatıldı!
              </h4>
              <p className="text-xs text-stone-600 dark:text-stone-300">
                Tüm satışlar ve tahsilatlar mühürlendi. Yeni adisyonlar tertemiz <strong>0 ₺</strong> ile başlayacaktır.
              </p>
            </div>

            {/* Financial Summary Card */}
            <div className="bg-stone-50 dark:bg-stone-850 rounded-2xl p-4 border border-stone-200 dark:border-stone-800 space-y-2 text-xs">
              <div className="flex justify-between items-center text-sm font-black border-b border-stone-200 dark:border-stone-700 pb-2">
                <span>Mühürlenen Ciro:</span>
                <span className="text-emerald-600 dark:text-emerald-400 text-base">
                  {formatCurrency(createdReport.totalRevenue, settings.currencySymbol)}
                </span>
              </div>
              <div className="flex justify-between text-stone-600 dark:text-stone-300">
                <span>Kapanan Adisyon:</span>
                <span className="font-bold">{createdReport.ordersCount} Adet</span>
              </div>
              <div className="flex justify-between text-stone-600 dark:text-stone-300">
                <span>Nakit:</span>
                <span className="font-bold">{formatCurrency(createdReport.paymentBreakdown.nakit, settings.currencySymbol)}</span>
              </div>
              <div className="flex justify-between text-stone-600 dark:text-stone-300">
                <span>Kredi Kartı:</span>
                <span className="font-bold">{formatCurrency(createdReport.paymentBreakdown.kredi_karti, settings.currencySymbol)}</span>
              </div>
              <div className="flex justify-between text-stone-600 dark:text-stone-300">
                <span>Devreden Açık Masalar:</span>
                <span className="font-bold">{createdReport.devredenMasaSayisi || 0} Masa ({formatCurrency(createdReport.devredenTutar || 0, settings.currencySymbol)})</span>
              </div>
              <div className="flex justify-between text-stone-600 dark:text-stone-300">
                <span>Devreden Veresiye Borçlar:</span>
                <span className="font-bold text-rose-500">{createdReport.devredenBorcluSayisi || 0} Müşteri ({formatCurrency(createdReport.devredenBorcTutari || 0, settings.currencySymbol)})</span>
              </div>
            </div>

            {/* Print Status Feedback */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-xs flex items-center justify-between text-amber-800 dark:text-amber-300">
              <span className="flex items-center gap-1.5 font-bold">
                <Printer className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Termal Z-Raporu Yazıcıya İletildi</span>
              </span>
              <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded-full font-bold">
                {settings.selectedPrinterName || 'Termal Fiş'}
              </span>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => handlePrintReport(createdReport)}
                disabled={isPrinting}
                className="w-full sm:w-auto flex-1 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer border border-stone-300 dark:border-stone-700"
              >
                <Printer className="w-4 h-4 text-amber-500" />
                <span>{isPrinting ? 'Yazdırılıyor...' : 'Tekrar Z-Raporu Yazdır'}</span>
              </button>
              <button
                type="button"
                onClick={handleCloseModal}
                className="w-full sm:w-auto flex-1 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black py-3 px-5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-95"
              >
                <span>POS & Masalara Dön</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* BEFORE CONFIRMATION PREVIEW VIEW */
          <div className="space-y-4">
            {/* Closure Info Card */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5 space-y-1.5 text-xs">
              <div className="flex items-center gap-2 font-black text-amber-700 dark:text-amber-300 text-sm">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-amber-500" />
                <span>Kesilecek Z-Raporu No: {nextZReportNo}</span>
              </div>
              <p className="text-stone-600 dark:text-stone-300 leading-relaxed text-[11px] sm:text-xs">
                Günü kapattığınızda şu anki ciro ve satışlar bu Z-raporuna kilitlenerek arşive kaldırılacaktır. Yarının / yeni günün cirosu dünkü ciroyla toplanmayıp tertemiz <strong>0 ₺</strong>'den başlayacaktır.
              </p>
            </div>

            {/* Financial Highlights */}
            <div className="bg-stone-50 dark:bg-stone-850 rounded-2xl p-4 border border-stone-200 dark:border-stone-800 space-y-2 text-xs">
              <div className="flex justify-between items-center text-sm font-black border-b border-stone-200 dark:border-stone-700 pb-2">
                <span>Mühürlenecek Toplam Ciro:</span>
                <span className="text-amber-600 dark:text-amber-400 text-base">
                  {formatCurrency(unsealedRevenue, settings.currencySymbol)}
                </span>
              </div>
              <div className="flex justify-between text-stone-600 dark:text-stone-300">
                <span>Kapanan Adisyon Adedi:</span>
                <span className="font-bold">{unsealedOrders.length} Adet</span>
              </div>
              <div className="flex justify-between text-stone-600 dark:text-stone-300">
                <span>Nakit Tahsilat:</span>
                <span className="font-bold">{formatCurrency(unsealedNakit, settings.currencySymbol)}</span>
              </div>
              <div className="flex justify-between text-stone-600 dark:text-stone-300">
                <span>Kredi Kartı:</span>
                <span className="font-bold">{formatCurrency(unsealedKredi, settings.currencySymbol)}</span>
              </div>
              {unsealedYemek > 0 && (
                <div className="flex justify-between text-stone-600 dark:text-stone-300">
                  <span>Yemek Çeki / Kartı:</span>
                  <span className="font-bold">{formatCurrency(unsealedYemek, settings.currencySymbol)}</span>
                </div>
              )}
            </div>

            {/* Open Tables Rollover Status */}
            <div className="bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/50 rounded-2xl p-3 text-xs space-y-1">
              <div className="flex items-center justify-between font-bold text-sky-800 dark:text-sky-300">
                <span>Devreden Açık Masalar:</span>
                <span>{activeOpenTables.length} Masa ({formatCurrency(activeOpenAmount, settings.currencySymbol)})</span>
              </div>
              <p className="text-[11px] text-sky-700/80 dark:text-sky-300/80">
                Açık masalar silinmez, yeni güne otomatik olarak güvenle devreder.
              </p>
            </div>

            {/* Devreden Müşteri Borçları (Veresiye / Açık Hesap) */}
            <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-3 text-xs space-y-1">
              <div className="flex items-center justify-between font-bold text-rose-800 dark:text-rose-300">
                <span className="flex items-center gap-1.5">
                  <UserX className="w-3.5 h-3.5 text-rose-500" />
                  <span>Devreden Müşteri Borçları:</span>
                </span>
                <span className="font-black text-rose-600 dark:text-rose-400">
                  {activeUnpaidDebtCount} Müşteri ({formatCurrency(activeUnpaidDebtAmount, settings.currencySymbol)})
                </span>
              </div>
              <p className="text-[11px] text-rose-700/90 dark:text-rose-300/90 leading-relaxed">
                Tahsil edilene kadar sonraki günlere devreder; tahsil edildiğinde o günün kasasına işlenir.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleCloseModal}
                className="w-full sm:w-auto flex-1 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold py-3 px-4 rounded-xl text-xs transition-colors cursor-pointer"
              >
                İptal / Vazgeç
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="w-full sm:w-auto flex-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black py-3 px-5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg hover:shadow-xl active:scale-95"
              >
                <Lock className="w-4 h-4" />
                <span>Evet, Günü Kapat & Z-Raporu Yazdır</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
