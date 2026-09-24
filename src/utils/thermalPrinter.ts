import { Order, RestaurantSettings, DailyZReport, AppUser } from '../types';
import { formatCurrency, formatDate, formatTime } from './formatters';

/**
 * Universal High-Reliability Thermal POS Printer Engine
 * 
 * Works across:
 * 1. Electron Silent IPC (Direct print to Windows spooler with zero dialog)
 * 2. Chrome / Edge Kiosk Mode (--kiosk-printing)
 * 3. Standard Browsers via isolated hidden <iframe> (guarantees zero blank pages, no React unmount race conditions)
 */

export interface TicketPrintOptions {
  showLogo?: boolean;
  forcedPaymentType?: 'nakit' | 'kredi_karti' | 'yemek_karti' | 'parcali' | 'open' | string;
}

export const generateTicketHtml = (
  order: Order,
  settings: RestaurantSettings,
  options: TicketPrintOptions = { showLogo: true }
): string => {
  const itemCount = order.items?.length || 0;
  const isCompact = itemCount > 8;
  const isUltraCompact = itemCount > 18;

  const logoHtml = options.showLogo && settings.logoUrl
    ? `<div style="text-align: center; margin-bottom: 6px;">
        <img src="${settings.logoUrl}" alt="${settings.name || 'Logo'}" style="max-height: 60px; max-width: 180px; object-contain: contain; filter: grayscale(100%) contrast(300%);" onerror="this.style.display='none'" />
       </div>`
    : '';

  const titleHtml = order.ticketTitle
    ? `<div style="background-color: #000000; color: #ffffff; -webkit-text-fill-color: #ffffff; padding: 4px; text-align: center; font-weight: 900; font-size: 12px; margin: 4px 0; letter-spacing: 0.5px;">
        *** ${order.ticketTitle} ***
       </div>`
    : '';

  const businessInfoHtml = `
    <div style="text-align: center; margin-bottom: 6px;">
      ${logoHtml}
      ${titleHtml}
      ${settings.name ? `<h2 style="font-size: 15px; font-weight: 900; margin: 2px 0; text-transform: uppercase;">${settings.name}</h2>` : ''}
      ${settings.address ? `<p style="font-size: 10px; font-weight: 700; margin: 1px 0;">${settings.address}</p>` : ''}
      ${settings.phone ? `<p style="font-size: 10px; font-weight: 700; margin: 1px 0;">Tel: ${settings.phone}</p>` : ''}
      ${settings.taxNumber ? `<p style="font-size: 10px; font-weight: 700; margin: 1px 0;">${settings.taxOffice ? `${settings.taxOffice} • ` : ''}VKN: ${settings.taxNumber}</p>` : ''}
      ${settings.receiptHeaderNote ? `<p style="font-size: 10px; font-style: italic; font-weight: 700; margin-top: 3px;">${settings.receiptHeaderNote}</p>` : ''}
    </div>
  `;

  const metaHtml = `
    <div style="border-top: 2px dashed #000000; border-bottom: 2px dashed #000000; padding: 5px 0; margin: 6px 0; font-size: 11px; font-weight: 700;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
        <span>Masa:</span>
        <span style="font-size: 13px; font-weight: 900;">${order.tableName || 'Masa'} (${order.zoneName || 'Salon'})</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
        <span>Adisyon No:</span>
        <span style="font-weight: 900;">#${order.id}</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
        <span>Tarih / Saat:</span>
        <span>${formatDate(order.createdAt)} - ${formatTime(order.createdAt)}</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
        <span>Garson:</span>
        <span style="font-weight: 900;">${order.waiterName || 'Kasa'}</span>
      </div>
      ${order.customerNotes ? `
        <div style="display: flex; justify-content: space-between; margin-top: 2px;">
          <span>Müşteri / Not:</span>
          <span style="font-weight: 900;">${order.customerNotes}</span>
        </div>
      ` : ''}
      ${order.status === 'unpaid_debt' ? `
        <div style="display: flex; justify-content: space-between; margin-top: 3px; border: 1.5px solid #000; padding: 2px 4px; font-size: 11px; font-weight: 900;">
          <span>HESAP DURUMU:</span>
          <span>VERESİYE / AÇIK BORÇ</span>
        </div>
      ` : ''}
    </div>
  `;

  const itemsRows = (order.items || []).map((item) => {
    const itemTotal = item.price * item.quantity;
    const fontSize = isUltraCompact ? '10px' : isCompact ? '11px' : '12px';
    const notesHtml = item.note ? `<div style="font-size: 9px; font-style: italic; color: #333333; margin-top: 1px;">➜ Not: ${item.note}</div>` : '';

    return `
      <div style="border-bottom: 1px dotted #888888; padding: ${isUltraCompact ? '2px 0' : '4px 0'}; font-size: ${fontSize}; page-break-inside: avoid; break-inside: avoid;">
        <div style="display: flex; justify-content: space-between; align-items: baseline;">
          <div style="flex: 1; padding-right: 4px; font-weight: 800;">
            ${item.name}
            ${notesHtml}
          </div>
          <div style="width: 32px; text-align: center; font-weight: 900;">${item.quantity}</div>
          <div style="width: 65px; text-align: right; font-weight: 900;">${formatCurrency(itemTotal)}</div>
        </div>
      </div>
    `;
  }).join('');

  const itemsTableHtml = `
    <div style="margin: 6px 0;">
      <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #000000; padding-bottom: 3px; font-size: 11px; font-weight: 900; text-transform: uppercase;">
        <div style="flex: 1;">Ürün (${itemCount})</div>
        <div style="width: 32px; text-align: center;">Ad.</div>
        <div style="width: 65px; text-align: right;">Tutar</div>
      </div>
      ${itemsRows}
    </div>
  `;

  const totalsHtml = `
    <div style="border-top: 2px solid #000000; padding-top: 6px; margin-top: 6px; font-size: 12px; font-weight: 700;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
        <span>Ara Toplam:</span>
        <span style="font-weight: 900;">${formatCurrency(order.subtotal || 0)}</span>
      </div>
      ${(order.discountAmount || 0) > 0 ? `
        <div style="display: flex; justify-content: space-between; margin-bottom: 3px; font-weight: 800;">
          <span>İndirim ${order.discountPercent ? `(%${order.discountPercent})` : ''}:</span>
          <span>-${formatCurrency(order.discountAmount || 0)}</span>
        </div>
      ` : ''}
      ${(order.taxAmount || 0) > 0 ? `
        <div style="display: flex; justify-content: space-between; margin-bottom: 3px; font-size: 11px;">
          <span>Hesaplanan KDV (%10):</span>
          <span>${formatCurrency(order.taxAmount || 0)}</span>
        </div>
      ` : ''}
      <div style="display: flex; justify-content: space-between; align-items: baseline; border-top: 2px solid #000000; border-bottom: 2px solid #000000; padding: 6px 0; margin-top: 6px; font-size: 17px; font-weight: 900;">
        <span>GENEL TOPLAM:</span>
        <span style="font-size: 18px;">${formatCurrency(order.totalAmount || 0)}</span>
      </div>
    </div>
  `;

  // Explicit Payment Status Banner as requested by user
  const effectivePaymentType = options.forcedPaymentType || order.paymentType;
  let paymentText = '';
  if (effectivePaymentType === 'kredi_karti') {
    paymentText = 'KREDİ KARTI İLE ALINDI';
  } else if (effectivePaymentType === 'nakit') {
    paymentText = 'NAKİT ALINDI';
  } else if (effectivePaymentType === 'yemek_karti') {
    paymentText = 'YEMEK KARTI İLE ALINDI';
  } else if (effectivePaymentType === 'parcali') {
    paymentText = 'PARÇALI ÖDEME İLE ALINDI';
  } else if (effectivePaymentType === 'havale') {
    paymentText = 'HAVALE / EFT İLE ALINDI';
  } else if (order.status === 'unpaid_debt' || effectivePaymentType === 'veresiye') {
    paymentText = 'VERESİYE / BORÇ KAYDEDİLDİ';
  } else if (order.status === 'closed') {
    paymentText = 'ÖDENDİ';
  } else {
    paymentText = 'ÖDEME BEKLİYOR (AÇIK HESAP)';
  }

  const paymentsBreakdownHtml = (order.payments && order.payments.length > 0)
    ? `<div style="margin-top: 4px; font-size: 11px; font-weight: 800; border-top: 1px dotted #000000; padding-top: 3px;">
        ${order.payments.map((p) => `
          <div style="display: flex; justify-content: space-between;">
            <span>${p.type === 'nakit' ? 'Nakit' : p.type === 'kredi_karti' ? 'Kredi Kartı' : 'Yemek Kartı'}:</span>
            <span>${formatCurrency(p.amount)}</span>
          </div>
        `).join('')}
       </div>`
    : '';

  const paymentBannerHtml = `
    <div style="margin: 8px 0 6px 0; padding: 7px 4px; border: 2px solid #000000; text-align: center; background-color: #ffffff; page-break-inside: avoid; break-inside: avoid;">
      <div style="font-size: 13px; font-weight: 900; letter-spacing: 0.5px; text-transform: uppercase;">
        *** ${paymentText} ***
      </div>
      ${paymentsBreakdownHtml}
    </div>
  `;

  const footerHtml = `
    <div style="text-align: center; margin-top: 8px; padding-top: 6px; border-top: 1px dashed #888888; font-size: 10px; font-weight: 700;">
      <p style="font-weight: 900; font-size: 11px; margin-bottom: 3px;">${settings.receiptFooterNote || 'Afiyet Olsun, Bizi Tercih Ettiğiniz İçin Teşekkür Ederiz!'}</p>
      <p style="font-size: 9px; color: #444444; margin-top: 4px;">* Mali değeri yoktur / Bilgi amaçlı adisyon fişidir *</p>
      <div style="margin-top: 8px; font-family: monospace; font-size: 9px; letter-spacing: 2px;">
        *** TEŞEKKÜRLER ***
      </div>
    </div>
  `;

  return `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="utf-8">
      <title>Adisyon Fişi #${order.id}</title>
      <style>
        @page {
          size: 80mm auto;
          margin: 0mm !important;
        }
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          color: #000000 !important;
          -webkit-text-fill-color: #000000 !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        html, body {
          width: 72mm;
          max-width: 72mm;
          margin: 0 !important;
          padding: 1.5mm 1mm 8mm 1mm !important;
          background: #ffffff !important;
          font-family: Arial, "Segoe UI", -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif;
          font-size: 12px;
          line-height: 1.3;
          overflow: visible !important;
        }
      </style>
    </head>
    <body>
      ${businessInfoHtml}
      ${metaHtml}
      ${itemsTableHtml}
      ${totalsHtml}
      ${paymentBannerHtml}
      ${footerHtml}
    </body>
    </html>
  `;
};

export interface ZReportPrintParams {
  targetReport?: DailyZReport | null;
  activeRevenue: number;
  activeOrdersCount: number;
  activePaymentStats: { nakit: number; kredi_karti: number; yemek_karti: number };
  activeTax: number;
  activeDiscounts: number;
  activeProfit: number;
  activeSoldItems: Array<{ name: string; qty: number; total?: number; revenue?: number }>;
  activeOpenTablesCount: number;
  activeOpenTablesAmount: number;
  activeUnpaidDebtsCount: number;
  activeUnpaidDebtsAmount: number;
  activeUnpaidDebtsList: Array<{ orderId: string; customerName: string; tableName: string; amount: number; createdAt: string }>;
  settings: RestaurantSettings;
  currentUser?: AppUser | { id?: string; name?: string; role?: string } | null;
  reportDateFilter?: string;
  selectedDate?: string;
}

export const generateZReportHtml = (params: ZReportPrintParams): string => {
  const { targetReport, settings, currentUser } = params;

  const slipRevenue = targetReport ? targetReport.totalRevenue : params.activeRevenue;
  const slipOrdersCount = targetReport ? targetReport.ordersCount : params.activeOrdersCount;
  const slipNakit = targetReport ? targetReport.paymentBreakdown.nakit : params.activePaymentStats.nakit;
  const slipKredi = targetReport ? targetReport.paymentBreakdown.kredi_karti : params.activePaymentStats.kredi_karti;
  const slipYemek = targetReport ? targetReport.paymentBreakdown.yemek_karti : params.activePaymentStats.yemek_karti;
  const slipTax = targetReport ? targetReport.totalTax : params.activeTax;
  const slipDiscounts = targetReport ? targetReport.totalDiscounts : params.activeDiscounts;
  const slipProfit = targetReport ? targetReport.estimatedProfit : params.activeProfit;
  const slipItems = targetReport ? (targetReport.itemsSold || []) : params.activeSoldItems;

  const slipDevredenCount = targetReport ? (targetReport.devredenMasaSayisi || 0) : params.activeOpenTablesCount;
  const slipDevredenTotal = targetReport ? (targetReport.devredenTutar || 0) : params.activeOpenTablesAmount;

  const slipDevredenBorcluSayisi = targetReport
    ? (targetReport.devredenBorcluSayisi !== undefined ? targetReport.devredenBorcluSayisi : (targetReport.devredenBorclular?.length || 0))
    : params.activeUnpaidDebtsCount;
  const slipDevredenBorcTutari = targetReport
    ? (targetReport.devredenBorcTutari !== undefined ? targetReport.devredenBorcTutari : 0)
    : params.activeUnpaidDebtsAmount;
  const slipDevredenBorclular = targetReport
    ? (targetReport.devredenBorclular || [])
    : params.activeUnpaidDebtsList;

  const totalSoldUnits = slipItems.reduce((acc, i) => acc + i.qty, 0);

  const slipTitle = targetReport
    ? `${targetReport.zReportNo} GÜN SONU RESMİ Z-RAPORU`
    : params.reportDateFilter === 'today'
    ? 'GÜN SONU Z-RAPORU (BUGÜN)'
    : params.reportDateFilter === 'yesterday'
    ? 'GÜN SONU Z-RAPORU (DÜN)'
    : params.reportDateFilter === 'custom' && params.selectedDate
    ? `GÜN SONU Z-RAPORU (${formatDate(params.selectedDate)})`
    : 'AKTİF GÜN SONU MÜHÜR & Z-RAPORU';

  const slipDateStr = targetReport
    ? `${formatDate(targetReport.closedAt)} - ${formatTime(targetReport.closedAt)}`
    : `${formatDate(new Date().toISOString())} - ${formatTime(new Date().toISOString())}`;

  const cashierName = targetReport ? targetReport.closedByUserName : (currentUser?.name || 'Kasa Yetkilisi');

  const itemsRowsHtml = slipItems.slice(0, 80).map((item) => {
    const itemTotal = (item as any).total !== undefined ? (item as any).total : ((item as any).revenue || 0);
    return `
      <div style="display: flex; justify-content: space-between; border-bottom: 1px dotted #888888; padding: 2.5px 0; font-size: 11px;">
        <span style="flex: 1; font-weight: 700;">${item.name}</span>
        <span style="width: 35px; text-align: center; font-weight: 900;">${item.qty}</span>
        <span style="width: 65px; text-align: right; font-weight: 900;">${formatCurrency(itemTotal)}</span>
      </div>
    `;
  }).join('');

  const debtsListHtml = slipDevredenBorclular.length > 0
    ? slipDevredenBorclular.slice(0, 15).map((d) => `
      <div style="display: flex; justify-content: space-between; border-bottom: 1px dotted #888888; padding: 2px 0; font-size: 10px;">
        <span style="font-weight: 800;">${d.customerName} (${d.tableName})</span>
        <span style="font-weight: 900;">${formatCurrency(d.amount)}</span>
      </div>
    `).join('')
    : '<div style="font-size: 10px; font-style: italic; color: #555555;">Kayıtlı açık borçlu bulunmamaktadır.</div>';

  return `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="utf-8">
      <title>${slipTitle}</title>
      <style>
        @page {
          size: 80mm auto;
          margin: 0mm !important;
        }
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          color: #000000 !important;
          -webkit-text-fill-color: #000000 !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        html, body {
          width: 72mm;
          max-width: 72mm;
          margin: 0 !important;
          padding: 1.5mm 1mm 8mm 1mm !important;
          background: #ffffff !important;
          font-family: Arial, "Segoe UI", -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif;
          font-size: 11px;
          line-height: 1.35;
          overflow: visible !important;
        }
      </style>
    </head>
    <body>
      <div style="text-align: center; border-bottom: 2px dashed #000000; padding-bottom: 6px; margin-bottom: 6px;">
        ${settings.name ? `<h2 style="font-size: 15px; font-weight: 900; text-transform: uppercase;">${settings.name}</h2>` : ''}
        ${settings.address ? `<p style="font-size: 10px; font-weight: 700;">${settings.address}</p>` : ''}
        ${settings.phone ? `<p style="font-size: 10px; font-weight: 700;">Tel: ${settings.phone}</p>` : ''}
        <div style="background-color: #000000; color: #ffffff; -webkit-text-fill-color: #ffffff; padding: 4px; font-size: 12px; font-weight: 900; margin: 4px 0;">
          *** ${slipTitle} ***
        </div>
        <p style="font-size: 11px; font-weight: 700;">Mühür / Rapor Zamanı: ${slipDateStr}</p>
        <p style="font-size: 11px; font-weight: 700;">Kasa Sorumlusu: ${cashierName}</p>
      </div>

      <!-- MAIN TOTALS -->
      <div style="border-bottom: 2px solid #000000; padding-bottom: 6px; margin-bottom: 6px; font-size: 12px; font-weight: 700;">
        <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: 900; border: 2px solid #000000; padding: 4px 6px; margin-bottom: 6px;">
          <span>TOPLAM CİRO:</span>
          <span>${formatCurrency(slipRevenue)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
          <span>Kapanan Hesap Sayısı:</span>
          <span style="font-weight: 900;">${slipOrdersCount} Adet</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
          <span>Toplam Satılan Ürün:</span>
          <span style="font-weight: 900;">${totalSoldUnits} Porsiyon/Adet</span>
        </div>
        ${slipDiscounts > 0 ? `
          <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
            <span>Toplam İndirimler:</span>
            <span style="font-weight: 900;">-${formatCurrency(slipDiscounts)}</span>
          </div>
        ` : ''}
        <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
          <span>Hesaplanan KDV Tutarı:</span>
          <span style="font-weight: 900;">${formatCurrency(slipTax)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
          <span>Tahmini Brüt Kâr:</span>
          <span style="font-weight: 900;">${formatCurrency(slipProfit)}</span>
        </div>
      </div>

      <!-- PAYMENT METHODS BREAKDOWN -->
      <div style="border-bottom: 2px dashed #000000; padding-bottom: 6px; margin-bottom: 6px; font-size: 11px;">
        <div style="font-weight: 900; font-size: 12px; text-transform: uppercase; margin-bottom: 4px; border-bottom: 1px solid #000000; padding-bottom: 2px;">
          TAHSİLAT TÜRÜ DAĞILIMI
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 2px; font-weight: 700;">
          <span>💵 Nakit Tahsilat:</span>
          <span style="font-weight: 900;">${formatCurrency(slipNakit)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 2px; font-weight: 700;">
          <span>💳 Kredi Kartı / POS:</span>
          <span style="font-weight: 900;">${formatCurrency(slipKredi)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 2px; font-weight: 700;">
          <span>🎫 Yemek Kartı (Ticket/Multinet):</span>
          <span style="font-weight: 900;">${formatCurrency(slipYemek)}</span>
        </div>
      </div>

      <!-- OPEN TABLES / DEBTS TRANSFERRED -->
      <div style="border-bottom: 2px dashed #000000; padding-bottom: 6px; margin-bottom: 6px; font-size: 11px;">
        <div style="font-weight: 900; font-size: 12px; text-transform: uppercase; margin-bottom: 4px; border-bottom: 1px solid #000000; padding-bottom: 2px;">
          DEVREDEN AÇIK MASALAR & BORÇLAR
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 2px; font-weight: 700;">
          <span>Ertesi Güne Devreden Masa:</span>
          <span style="font-weight: 900;">${slipDevredenCount} Masa (${formatCurrency(slipDevredenTotal)})</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-weight: 700;">
          <span>Açık Veresiye / Borç Toplamı:</span>
          <span style="font-weight: 900;">${slipDevredenBorcluSayisi} Kişi (${formatCurrency(slipDevredenBorcTutari)})</span>
        </div>
        ${slipDevredenBorclular.length > 0 ? `
          <div style="margin-top: 4px; padding-top: 2px; border-top: 1px dotted #888;">
            <div style="font-size: 10px; font-weight: 900; margin-bottom: 2px;">Veresiye Listesi (Özet):</div>
            ${debtsListHtml}
          </div>
        ` : ''}
      </div>

      <!-- SOLD ITEMS BREAKDOWN -->
      ${slipItems.length > 0 ? `
        <div style="margin-bottom: 8px;">
          <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #000000; padding-bottom: 3px; font-size: 11px; font-weight: 900; text-transform: uppercase;">
            <div style="flex: 1;">Satılan Ürün (${slipItems.length})</div>
            <div style="width: 35px; text-align: center;">Ad.</div>
            <div style="width: 65px; text-align: right;">Tutar</div>
          </div>
          ${itemsRowsHtml}
        </div>
      ` : ''}

      <!-- SIGNATURE BLOCK -->
      <div style="margin-top: 12px; border-top: 2px solid #000000; padding-top: 6px; text-align: center; font-size: 10px; font-weight: 700;">
        <div style="display: flex; justify-content: space-between; margin-top: 8px;">
          <div style="width: 48%; border-top: 1px solid #000; padding-top: 4px;">
            <p style="font-weight: 900;">KASA GÖREVLİSİ</p>
            <p style="font-size: 9px; margin-top: 12px;">İmza</p>
          </div>
          <div style="width: 48%; border-top: 1px solid #000; padding-top: 4px;">
            <p style="font-weight: 900;">İŞLETME MÜDÜRÜ</p>
            <p style="font-size: 9px; margin-top: 12px;">Kaşe / Onay</p>
          </div>
        </div>
        <p style="margin-top: 10px; font-size: 9px; color: #444444;">*** RESMİ GÜN SONU KAYIT BELGESİDİR ***</p>
      </div>
    </body>
    </html>
  `;
};

export const generateTestTicketHtml = (settings: RestaurantSettings): string => {
  return `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="utf-8">
      <title>Yazıcı Test Fişi</title>
      <style>
        @page { size: 80mm auto; margin: 0mm !important; }
        * { box-sizing: border-box; margin: 0; padding: 0; color: #000000 !important; }
        body {
          width: 72mm;
          max-width: 72mm;
          margin: 0 !important;
          padding: 2mm 1mm 6mm 1mm !important;
          font-family: Arial, sans-serif;
          font-size: 12px;
          line-height: 1.35;
        }
      </style>
    </head>
    <body>
      <div style="text-align: center; border-bottom: 2px dashed #000; padding-bottom: 6px; margin-bottom: 6px;">
        <h2 style="font-size: 15px; font-weight: 900;">${settings.name || 'MERİÇ BELEDİYESİ POS'}</h2>
        <div style="background-color: #000; color: #fff; -webkit-text-fill-color: #fff; padding: 4px; font-size: 12px; font-weight: 900; margin: 4px 0;">
          *** TERMAL YAZICI TEST FİŞİ ***
        </div>
        <p style="font-weight: 700; font-size: 11px;">Tarih: ${formatDate(new Date().toISOString())} ${formatTime(new Date().toISOString())}</p>
        <p style="font-weight: 700; font-size: 11px;">Yazıcı: ${settings.selectedPrinterName || 'Sistem Varsayılanı (POS-80C)'}</p>
      </div>

      <div style="margin: 6px 0; font-size: 11px; line-height: 1.4;">
        <p style="font-weight: 900; margin-bottom: 3px;">✅ BAĞLANTI DURUMU:</p>
        <p>• Termal yazıcı bağlantısı ve Türkçe karakter seti başarılı.</p>
        <p>• Sayfa genişliği: 72mm (80mm rulo için optimize).</p>
        <p>• Boş sayfa koruması: AKTİF.</p>
      </div>

      <div style="border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 4px 0; margin: 6px 0; font-size: 11px; font-weight: 700;">
        <p>ÇĞİÖŞÜ çğıöşü 1234567890</p>
        <p style="letter-spacing: 2px; font-weight: 900;">ABCDEF123456</p>
      </div>

      <div style="text-align: center; margin-top: 8px; font-size: 10px; font-weight: 800;">
        *** TEST BAŞARIYLA TAMAMLANDI ***
      </div>
    </body>
    </html>
  `;
};

/**
 * Universal print executor:
 * Priority 1: Electron Silent IPC with raw HTML (Zero dialog, direct spooling)
 * Priority 2: Isolated Hidden <iframe> (Guaranteed zero blank pages, no React unmounting race conditions)
 */
export const executeThermalPrint = async (
  htmlContent: string,
  targetPrinterName?: string
): Promise<{ success: boolean; error?: string }> => {
  // 1. Try Electron Native Direct Print
  if (typeof window !== 'undefined' && window.electronAPI && typeof window.electronAPI.printDirect === 'function') {
    try {
      const res = await window.electronAPI.printDirect({
        html: htmlContent,
        deviceName: targetPrinterName || '',
        silent: true,
        copies: 1,
      });

      if (res && res.success) {
        return { success: true };
      }
      console.warn('Electron printDirect result:', res);
    } catch (e: any) {
      console.warn('Electron printDirect hatası, iframe fallback uygulanacak:', e);
    }
  }

  // 2. High-Reliability Isolated <iframe> Print
  return new Promise((resolve) => {
    try {
      // Remove any leftover print iframes
      const existing = document.getElementById('thermal-print-isolated-iframe');
      if (existing) {
        try { existing.remove(); } catch (e) {}
      }

      const iframe = document.createElement('iframe');
      iframe.id = 'thermal-print-isolated-iframe';
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.style.opacity = '0';
      iframe.style.pointerEvents = 'none';
      iframe.style.zIndex = '-999999';

      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) {
        // Fallback to standard window.print if iframe cannot be accessed
        window.print();
        return resolve({ success: true });
      }

      iframeDoc.open();
      iframeDoc.write(htmlContent);
      iframeDoc.close();

      const triggerPrint = () => {
        try {
          if (iframe.contentWindow) {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
          } else {
            window.print();
          }

          // Clean up iframe after printing is spooled to OS (keep for 4s so OS spooler captures it completely)
          setTimeout(() => {
            try { iframe.remove(); } catch (e) {}
          }, 4000);

          resolve({ success: true });
        } catch (printErr: any) {
          console.error('Iframe print hatası:', printErr);
          try { window.print(); } catch (e) {}
          resolve({ success: false, error: printErr?.message || 'Bilinmeyen hata' });
        }
      };

      // Ensure fonts and images inside the iframe are fully loaded before calling print
      if (iframeDoc.readyState === 'complete') {
        setTimeout(triggerPrint, 150);
      } else {
        iframe.onload = () => setTimeout(triggerPrint, 150);
      }
    } catch (err: any) {
      console.error('Yazdırma hazırlık hatası:', err);
      try { window.print(); } catch (e) {}
      resolve({ success: false, error: err?.message || 'Yazdırılamadı' });
    }
  });
};
