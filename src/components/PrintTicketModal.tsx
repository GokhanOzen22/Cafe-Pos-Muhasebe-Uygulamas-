import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Order, RestaurantSettings } from '../types';
import { X, Printer, ArrowLeft, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { formatCurrency, formatDate, formatTime } from '../utils/formatters';
import { generateTicketHtml, executeThermalPrint } from '../utils/thermalPrinter';

interface PrintTicketModalProps {
  order: Order;
  settings: RestaurantSettings;
  onClose: () => void;
}

export const PrintTicketModal: React.FC<PrintTicketModalProps> = ({ order, settings, onClose }) => {
  const [showLogo, setShowLogo] = useState<boolean>(true);
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  const [printSuccess, setPrintSuccess] = useState<boolean>(false);
  const [selectedPaymentType, setSelectedPaymentType] = useState<string>(
    order.paymentType || (order.status === 'closed' ? 'nakit' : 'open')
  );

  // Manage print class on body
  useEffect(() => {
    document.body.classList.add('printing-receipt');
    return () => {
      document.body.classList.remove('printing-receipt');
    };
  }, []);

  const handlePrint = async () => {
    if (isPrinting) return;
    setIsPrinting(true);
    setPrintSuccess(false);

    const targetPrinter =
      settings.selectedPrinterName ||
      settings.printers?.find((p) => p.isDefault)?.usbDeviceName ||
      settings.printers?.find((p) => p.isDefault)?.name ||
      '';

    try {
      // 1. Generate clean, self-contained 72mm thermal HTML slip with accurate payment banner
      const htmlContent = generateTicketHtml(order, settings, {
        showLogo,
        forcedPaymentType: selectedPaymentType,
      });

      // 2. High-reliability thermal print (Electron direct / isolated hidden iframe)
      const result = await executeThermalPrint(htmlContent, targetPrinter);

      if (result.success) {
        setPrintSuccess(true);
      }
    } catch (err) {
      console.warn('Doğrudan yazdırma yürütme hatası:', err);
      try {
        window.print();
      } catch (e) {
        console.error('window.print hatası:', e);
      }
    } finally {
      // Keep modal alive during Windows print spooling to prevent premature DOM removal
      setTimeout(() => {
        setIsPrinting(false);
        onClose();
      }, 1000);
    }
  };

  // Dedicated Thermal Ticket Content (Reused for screen preview and thermal portal)
  const renderTicketContent = (isPortal: boolean = false) => {
    const itemCount = order.items?.length || 0;
    const isCompact = itemCount > 8;
    const isUltraCompact = itemCount > 18;

    return (
      <div
        id={isPortal ? 'thermal-pos-print-slip' : undefined}
        className={`${
          isPortal
            ? 'thermal-portal-slip'
            : 'bg-white text-black p-4 sm:p-5 rounded-xl text-xs space-y-2 shadow-inner overflow-y-auto flex-1 min-h-0'
        }`}
        style={{
          fontFamily: 'Arial, "Segoe UI", -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif',
          color: '#000000',
          backgroundColor: '#ffffff',
        }}
      >
        {/* 1. Header / Logo / Business Details */}
        <div className="text-center space-y-1 thermal-unbreakable-block" style={{ color: '#000000' }}>
          {showLogo && (
            <div className="flex justify-center mb-1">
              <img
                src={settings.logoUrl || '/logo.svg'}
                onError={(e) => {
                  e.currentTarget.src = '/logo.svg';
                }}
                alt={settings.name || 'Logo'}
                className="max-h-16 max-w-[190px] object-contain mx-auto"
                style={{
                  filter: 'grayscale(100%) contrast(350%) brightness(80%)',
                  WebkitFilter: 'grayscale(100%) contrast(350%) brightness(80%)',
                  imageRendering: 'crisp-edges',
                }}
              />
            </div>
          )}

          {order.ticketTitle ? (
            <div
              className="p-1 rounded font-black text-xs uppercase tracking-wider mb-1"
              style={{
                backgroundColor: '#000000',
                color: '#ffffff',
                WebkitTextFillColor: '#ffffff',
              }}
            >
              *** {order.ticketTitle} ***
            </div>
          ) : null}

          {settings.name && (
            <h2
              className="font-black text-base uppercase tracking-tight"
              style={{ color: '#000000', fontWeight: 900 }}
            >
              {settings.name}
            </h2>
          )}
          {settings.address && (
            <p className="text-xs font-bold leading-tight" style={{ color: '#000000' }}>
              {settings.address}
            </p>
          )}
          {settings.phone && (
            <p className="text-xs font-bold" style={{ color: '#000000' }}>
              Tel: {settings.phone}
            </p>
          )}
          {settings.taxNumber && (
            <p className="text-xs font-bold" style={{ color: '#000000' }}>
              {settings.taxOffice ? `${settings.taxOffice} • ` : ''}VKN: {settings.taxNumber}
            </p>
          )}

          <div
            className="my-1.5"
            style={{
              borderBottom: '2px dashed #000000',
              height: '1px',
            }}
          />

          {settings.receiptHeaderNote && (
            <p className="text-xs font-bold italic" style={{ color: '#000000' }}>
              {settings.receiptHeaderNote}
            </p>
          )}
        </div>

        {/* 2. Order Metadata (Masa, No, Tarih/Saat, Garson, Not) */}
        <div
          className="space-y-1 text-xs pt-1 thermal-unbreakable-block"
          style={{ color: '#000000', fontWeight: 700 }}
        >
          <div className="flex justify-between items-center">
            <span className="font-bold">Masa:</span>
            <span
              className="font-black text-sm tracking-tight"
              style={{ fontWeight: 900, color: '#000000' }}
            >
              {order.tableName} ({order.zoneName})
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-bold">Adisyon No:</span>
            <span className="font-black" style={{ fontWeight: 900 }}>
              {order.id}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-bold">Tarih / Saat:</span>
            <span className="font-bold">
              {formatDate(order.createdAt)} - {formatTime(order.createdAt)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-bold">Garson:</span>
            <span className="font-black" style={{ fontWeight: 900 }}>
              {order.waiterName}
            </span>
          </div>
          {order.customerNotes && (
            <div className="flex justify-between items-center">
              <span className="font-bold">Müşteri / Not:</span>
              <span className="font-black" style={{ fontWeight: 900 }}>
                {order.customerNotes}
              </span>
            </div>
          )}
          {order.status === 'unpaid_debt' && (
            <div className="flex justify-between items-center text-xs">
              <span className="font-black">Hesap Durumu:</span>
              <span className="font-black px-1.5 py-0.5 border-2 border-black uppercase text-[11px]" style={{ fontWeight: 900 }}>
                VERESİYE / AÇIK BORÇ
              </span>
            </div>
          )}
        </div>

        <div
          className="my-1.5"
          style={{
            borderBottom: '2px dashed #000000',
            height: '1px',
          }}
        />

        {/* 3. All Order Items In One Single Continuous Stream (No page splitting) */}
        <div className="space-y-1 text-xs" style={{ color: '#000000' }}>
          <div
            className="flex justify-between font-black uppercase pb-1 text-xs thermal-unbreakable-block"
            style={{
              borderBottom: '2px solid #000000',
              fontWeight: 900,
              color: '#000000',
            }}
          >
            <span className="w-6/12 text-left">Ürün ({itemCount})</span>
            <span className="w-2/12 text-center">Ad.</span>
            <span className="w-4/12 text-right">Tutar</span>
          </div>

          {/* List every single item in the order */}
          {order.items && order.items.length > 0 ? (
            order.items.map((item, idx) => (
              <div
                key={item.id || idx}
                className={`thermal-item-row ${
                  isUltraCompact ? 'py-0.5 space-y-0' : isCompact ? 'py-0.5 space-y-0.5' : 'py-1 space-y-0.5'
                }`}
                style={{
                  borderBottom: '1px dotted #888888',
                  pageBreakInside: 'avoid',
                  breakInside: 'avoid',
                }}
              >
                <div className="flex justify-between items-baseline">
                  <span
                    className={`w-6/12 font-bold leading-snug break-words ${
                      isUltraCompact ? 'text-[10px]' : isCompact ? 'text-[11px]' : 'text-xs'
                    }`}
                    style={{ color: '#000000', fontWeight: 800 }}
                  >
                    {item.name}
                  </span>
                  <span
                    className={`w-2/12 text-center font-black ${
                      isUltraCompact ? 'text-[10px]' : isCompact ? 'text-[11px]' : 'text-xs'
                    }`}
                    style={{ color: '#000000', fontWeight: 900 }}
                  >
                    x{item.quantity}
                  </span>
                  <span
                    className={`w-4/12 text-right font-black ${
                      isUltraCompact ? 'text-[10px]' : isCompact ? 'text-[11px]' : 'text-xs'
                    }`}
                    style={{ color: '#000000', fontWeight: 900 }}
                  >
                    {formatCurrency(item.price * item.quantity, settings.currencySymbol)}
                  </span>
                </div>
                {item.note && (
                  <div
                    className="text-[10px] font-bold italic pl-2 leading-tight"
                    style={{ color: '#000000' }}
                  >
                    * {item.note}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-2 font-bold text-xs">Adisyonda ürün bulunmamaktadır.</div>
          )}
        </div>

        <div
          className="my-1.5"
          style={{
            borderBottom: '2px dashed #000000',
            height: '1px',
          }}
        />

        {/* 4. Subtotal, Discounts, Tax, and Grand Total */}
        <div
          className="space-y-1 text-xs thermal-unbreakable-block"
          style={{ color: '#000000', fontWeight: 700 }}
        >
          <div className="flex justify-between items-center">
            <span className="font-bold">Ara Toplam:</span>
            <span className="font-black" style={{ fontWeight: 800 }}>
              {formatCurrency(order.subtotal, settings.currencySymbol)}
            </span>
          </div>

          {order.discountAmount > 0 && (
            <div className="flex justify-between items-center">
              <span className="font-bold">İskonto İndirimi:</span>
              <span className="font-black" style={{ fontWeight: 900 }}>
                -{formatCurrency(order.discountAmount, settings.currencySymbol)}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="font-bold">KDV (%{settings.taxRatePercent}):</span>
            <span className="font-black" style={{ fontWeight: 800 }}>
              {formatCurrency(order.taxAmount, settings.currencySymbol)}
            </span>
          </div>

          {/* Prominent High-Contrast Grand Total */}
          <div
            className="flex justify-between items-center py-1.5 px-2 mt-1 rounded"
            style={{
              border: '2px solid #000000',
              backgroundColor: '#ffffff',
              color: '#000000',
            }}
          >
            <span className="font-black text-xs uppercase" style={{ fontWeight: 900 }}>
              TOPLAM TUTAR:
            </span>
            <span
              className="font-black text-base"
              style={{ fontWeight: 900, fontSize: '16px' }}
            >
              {formatCurrency(order.totalAmount, settings.currencySymbol)}
            </span>
          </div>
        </div>

        {/* User-requested Payment Confirmation Banner */}
        {(() => {
          let paymentText = '';
          if (selectedPaymentType === 'kredi_karti') {
            paymentText = 'KREDİ KARTI İLE ALINDI';
          } else if (selectedPaymentType === 'nakit') {
            paymentText = 'NAKİT ALINDI';
          } else if (selectedPaymentType === 'yemek_karti') {
            paymentText = 'YEMEK KARTI İLE ALINDI';
          } else if (selectedPaymentType === 'parcali') {
            paymentText = 'PARÇALI ÖDEME İLE ALINDI';
          } else if (selectedPaymentType === 'havale') {
            paymentText = 'HAVALE / EFT İLE ALINDI';
          } else if (order.status === 'unpaid_debt' || selectedPaymentType === 'veresiye') {
            paymentText = 'VERESİYE / BORÇ KAYDEDİLDİ';
          } else if (order.status === 'closed') {
            paymentText = 'ÖDENDİ';
          } else {
            paymentText = 'ÖDEME BEKLİYOR (AÇIK HESAP)';
          }

          return (
            <div
              className="my-2 p-1.5 rounded text-center thermal-unbreakable-block"
              style={{
                border: '2px solid #000000',
                backgroundColor: '#ffffff',
                color: '#000000',
              }}
            >
              <div className="font-black text-xs uppercase tracking-wider" style={{ fontWeight: 900, color: '#000000' }}>
                *** {paymentText} ***
              </div>
              {order.payments && order.payments.length > 0 && (
                <div className="mt-1 pt-1 border-t border-dotted border-black text-[10px] font-bold space-y-0.5">
                  {order.payments.map((p, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>{p.type === 'nakit' ? 'Nakit' : p.type === 'kredi_karti' ? 'Kredi Kartı' : 'Yemek Kartı'}:</span>
                      <span>{formatCurrency(p.amount, settings.currencySymbol)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}

        <div
          className="my-1.5"
          style={{
            borderBottom: '2px dashed #000000',
            height: '1px',
          }}
        />

        {/* 5. Footer Note */}
        <div
          className="text-center text-xs font-bold pt-0.5 space-y-0.5 thermal-unbreakable-block"
          style={{ color: '#000000' }}
        >
          <p className="font-bold" style={{ fontWeight: 800 }}>
            {settings.receiptFooterNote || 'Afiyet olsun, yine bekleriz!'}
          </p>
          <p
            className="text-[10px] font-semibold pt-1 tracking-tight"
            style={{ color: '#000000' }}
          >
            DG Digital Güvenlik Yazılım — Otomasyon Sistemleri
          </p>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* 1. ON-SCREEN MODAL PREVIEW */}
      <div className="fixed inset-0 z-60 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-hidden">
        <div className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 border border-stone-200 dark:border-stone-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 w-full max-w-sm max-h-[94vh] flex flex-col shadow-2xl space-y-3">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3 shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="p-1 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                title="Geri dön"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h3 className="font-bold text-sm text-stone-800 dark:text-stone-200">
                {order.ticketTitle || 'Adisyon Fişi'}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Clarity & Printing Tuning Toolbar */}
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-2.5 space-y-2 shrink-0 text-xs">
            <div className="flex items-center justify-between font-bold text-emerald-950 dark:text-emerald-300">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Doğrudan Yazdırma (Seçim Diyaloğu Açılmaz)</span>
              </div>
              <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                {settings.selectedPrinterName || 'POS-80C'}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-emerald-500/20 text-[11px] text-stone-600 dark:text-stone-300 font-semibold">
              <span>Hedef Termal Yazıcı:</span>
              <span className="text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-1">
                <Printer className="w-3.5 h-3.5" />
                {settings.selectedPrinterName || 'POS-80C (Termal Kasa Yazıcısı)'}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-emerald-500/20 text-[11px] text-stone-600 dark:text-stone-300 font-semibold">
              <span>Belediye Logosu:</span>
              <button
                type="button"
                onClick={() => setShowLogo(!showLogo)}
                className={`px-2 py-0.5 rounded font-bold transition-colors flex items-center gap-1 ${
                  showLogo
                    ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
                    : 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                }`}
              >
                <ImageIcon className="w-3 h-3" />
                <span>{showLogo ? 'Logo Açık' : 'Logo Kapalı'}</span>
              </button>
            </div>

            {/* Quick Payment Status Selector for Printout */}
            <div className="flex items-center justify-between pt-1 border-t border-emerald-500/20 text-[11px] text-stone-600 dark:text-stone-300 font-semibold">
              <span>Fişteki Ödeme:</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setSelectedPaymentType('kredi_karti')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                    selectedPaymentType === 'kredi_karti'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-300 dark:hover:bg-stone-700'
                  }`}
                >
                  Kredi Kartı
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPaymentType('nakit')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                    selectedPaymentType === 'nakit'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-300 dark:hover:bg-stone-700'
                  }`}
                >
                  Nakit
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPaymentType('open')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                    selectedPaymentType === 'open'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-300 dark:hover:bg-stone-700'
                  }`}
                >
                  Açık
                </button>
              </div>
            </div>
          </div>

          {/* Visual Scrollable Preview */}
          {renderTicketContent(false)}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 shrink-0 pt-1">
            <button
              onClick={onClose}
              disabled={isPrinting}
              className="w-full sm:flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-xl font-semibold text-xs transition-colors cursor-pointer"
            >
              Kapat
            </button>

            <button
              onClick={handlePrint}
              disabled={isPrinting}
              className={`w-full sm:flex-1 py-2.5 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer disabled:opacity-50 ${
                printSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-500 hover:bg-amber-400 text-stone-950'
              }`}
            >
              {printSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Fiş Yazıcıya Gönderildi ✓</span>
                </>
              ) : (
                <>
                  <Printer className="w-4 h-4" />
                  <span>{isPrinting ? 'Doğrudan Yazdırılıyor...' : 'Direkt Yazdır & Kapat'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 2. DEDICATED THERMAL PRINT PORTAL (DIRECT CHILD OF BODY) */}
      {typeof document !== 'undefined' &&
        createPortal(renderTicketContent(true), document.body)}
    </>
  );
};
