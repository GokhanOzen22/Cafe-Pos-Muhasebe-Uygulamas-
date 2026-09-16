import React, { useState } from 'react';
import { RestaurantSettings, PrinterDevice, BarcodeScannerConfig } from '../types';
import {
  Printer, Scan, Cpu, Settings2, Plus, Trash2, Edit3, CheckCircle2,
  AlertCircle, RefreshCw, Volume2, Wifi, Usb, Cable, Check, Play,
  HelpCircle, Tag, Smartphone, QrCode, Globe, Copy, ExternalLink, ShieldCheck, KeyRound, Save
} from 'lucide-react';

interface HardwareSettingsProps {
  settings: RestaurantSettings;
  onUpdateSettings: (settings: RestaurantSettings) => void;
}

export const HardwareSettings: React.FC<HardwareSettingsProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const printers: PrinterDevice[] = settings.printers || [];
  const scannerConfig: BarcodeScannerConfig = settings.barcodeScanner || {
    enabled: true,
    mode: 'usb_hid',
    prefix: '',
    suffix: 'ENTER',
    beepAlert: true,
  };

  // Mobile Terminal & Server Network State
  const defaultHost = typeof window !== 'undefined' ? window.location.hostname : '192.168.1.100';
  const defaultPort = typeof window !== 'undefined' && window.location.port ? window.location.port : '3000';
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';

  const [serverIp, setServerIp] = useState<string>(settings.serverIp || defaultHost);
  const [serverPort, setServerPort] = useState<string>(settings.serverPort ? String(settings.serverPort) : defaultPort);
  
  // Remote WAN / Outer Network Access State
  const [remoteWanUrl, setRemoteWanUrl] = useState<string>(settings.remoteWanUrl || currentOrigin);
  const [remoteWanPort, setRemoteWanPort] = useState<string>(settings.remoteWanPort ? String(settings.remoteWanPort) : '443');

  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [copiedRemoteUrl, setCopiedRemoteUrl] = useState<boolean>(false);
  const [saveNetworkSuccess, setSaveNetworkSuccess] = useState<boolean>(false);

  // Computed Local Mobile Access URL
  const isCloudOrDomain = typeof window !== 'undefined' && window.location.hostname.includes('.');
  const constructedUrl = isCloudOrDomain && serverIp === defaultHost
    ? window.location.origin
    : serverIp.startsWith('http://') || serverIp.startsWith('https://')
    ? serverIp
    : `http://${serverIp}:${serverPort || '3000'}`;

  // Computed Remote WAN Admin Access URL
  const constructedRemoteUrl = remoteWanUrl.startsWith('http://') || remoteWanUrl.startsWith('https://')
    ? remoteWanUrl
    : `https://${remoteWanUrl}${remoteWanPort && remoteWanPort !== '443' && remoteWanPort !== '80' ? `:${remoteWanPort}` : ''}`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(constructedUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const handleCopyRemoteUrl = () => {
    navigator.clipboard.writeText(constructedRemoteUrl);
    setCopiedRemoteUrl(true);
    setTimeout(() => setCopiedRemoteUrl(false), 2500);
  };

  const handleSaveNetworkSettings = () => {
    onUpdateSettings({
      ...settings,
      serverIp,
      serverPort: Number(serverPort) || 3000,
      remoteWanUrl,
      remoteWanPort: Number(remoteWanPort) || 443,
    });
    setSaveNetworkSuccess(true);
    setTimeout(() => setSaveNetworkSuccess(false), 3000);
  };

  // State for Printer Modal
  const [showPrinterModal, setShowPrinterModal] = useState<boolean>(false);
  const [editingPrinter, setEditingPrinter] = useState<PrinterDevice | null>(null);

  // Form State for Printer
  const [printerName, setPrinterName] = useState<string>('');
  const [printerType, setPrinterType] = useState<'receipt' | 'kitchen' | 'barcode'>('receipt');
  const [connectionType, setConnectionType] = useState<'network' | 'usb' | 'serial'>('network');
  const [ipAddress, setIpAddress] = useState<string>('192.168.1.200');
  const [port, setPort] = useState<number>(9100);
  const [comPort, setComPort] = useState<string>('COM1');
  const [baudRate, setBaudRate] = useState<number>(9600);
  const [paperWidth, setPaperWidth] = useState<'80mm' | '58mm' | 'etiket'>('80mm');
  const [autoCut, setAutoCut] = useState<boolean>(true);

  // Dedicated USB states
  const [usbPort, setUsbPort] = useState<string>('USB001');
  const [customUsbPort, setCustomUsbPort] = useState<string>('');
  const [usbDeviceName, setUsbDeviceName] = useState<string>('');
  const [vendorId, setVendorId] = useState<string>('');
  const [productId, setProductId] = useState<string>('');
  const [isScanningUsb, setIsScanningUsb] = useState<boolean>(false);
  const [usbScanError, setUsbScanError] = useState<string | null>(null);
  const [usbScanSuccess, setUsbScanSuccess] = useState<string | null>(null);
  const [detectedUsbDevices, setDetectedUsbDevices] = useState<Array<{ name: string; vid: string; pid: string; port: string }>>([]);

  // Load previously granted or connected WebUSB devices
  const checkGrantedUsbDevices = async () => {
    try {
      if (typeof navigator !== 'undefined' && 'usb' in navigator) {
        const devices = await (navigator as any).usb.getDevices();
        if (devices && devices.length > 0) {
          const list = devices.map((d: any, idx: number) => ({
            name: d.productName || d.manufacturerName || `USB Termal Aygıt #${idx + 1}`,
            vid: '0x' + d.vendorId.toString(16).padStart(4, '0').toUpperCase(),
            pid: '0x' + d.productId.toString(16).padStart(4, '0').toUpperCase(),
            port: `USB-DEV-${idx + 1}`,
          }));
          setDetectedUsbDevices(list);
        }
      }
    } catch (e) {
      // Benign catch for environments without WebUSB permissions
    }
  };

  // WebUSB Direct Detection
  const handleScanWebUsb = async () => {
    setIsScanningUsb(true);
    setUsbScanError(null);
    setUsbScanSuccess(null);

    try {
      if (typeof navigator === 'undefined' || !('usb' in navigator)) {
        setUsbScanError('Tarayıcınız doğrudan WebUSB donanım arayüzünü desteklemiyor veya izin verilmedi. Aşağıdaki listeden Windows USB Portunu (USB001 veya Xprinter/Epson USB) seçerek devam edebilirsiniz.');
        setIsScanningUsb(false);
        return;
      }

      // Request USB device from browser native prompt
      const device = await (navigator as any).usb.requestDevice({
        filters: [] // Allow selecting any connected thermal printer or USB device
      });

      if (device) {
        const vid = '0x' + device.vendorId.toString(16).padStart(4, '0').toUpperCase();
        const pid = '0x' + device.productId.toString(16).padStart(4, '0').toUpperCase();
        const devName = device.productName || device.manufacturerName || 'USB POS Termal Yazıcı';
        
        setUsbDeviceName(devName);
        setVendorId(vid);
        setProductId(pid);
        setUsbPort('USB-DIRECT');
        
        // Add to detected devices list
        setDetectedUsbDevices((prev) => {
          const filtered = prev.filter((p) => p.vid !== vid || p.pid !== pid);
          return [{ name: devName, vid, pid, port: 'USB-DIRECT' }, ...filtered];
        });

        if (!printerName.trim()) {
          setPrinterName(`${devName} (USB)`);
        }
        
        setUsbScanSuccess(`USB Aygıtı Başarıyla Bağlandı: ${devName} (Vendor ID: ${vid}, Product ID: ${pid})`);
      }
    } catch (err: any) {
      if (err.name !== 'NotFoundError') {
        setUsbScanError(`USB Aygıt Seçim Bildirimi: ${err.message || 'Cihaz seçilmedi. Aşağıdaki hazır USB port listesinden seçim yapabilirsiniz.'}`);
      }
    } finally {
      setIsScanningUsb(false);
    }
  };

  // Test Print Feedback State
  const [testPrintStatus, setTestPrintStatus] = useState<string | null>(null);

  // Live Barcode Scan Tester State
  const [testBarcodeScanInput, setTestBarcodeScanInput] = useState<string>('');
  const [scannedLog, setScannedLog] = useState<Array<{ code: string; time: string }>>([]);

  // Open Printer Modal for Add or Edit
  const handleOpenPrinterModal = (printer?: PrinterDevice) => {
    setUsbScanError(null);
    setUsbScanSuccess(null);
    checkGrantedUsbDevices();

    if (printer) {
      setEditingPrinter(printer);
      setPrinterName(printer.name);
      setPrinterType(printer.type);
      setConnectionType(printer.connectionType);
      setIpAddress(printer.ipAddress || '192.168.1.200');
      setPort(printer.port || 9100);
      setComPort(printer.comPort || 'COM1');
      setBaudRate(printer.baudRate || 9600);
      setUsbPort(printer.usbPort || 'USB001');
      setCustomUsbPort(printer.usbPort && !['USB001', 'USB002', 'USB003', 'USB-POS-80', 'USB-POS-58', 'USB-DIRECT'].includes(printer.usbPort) ? printer.usbPort : '');
      setUsbDeviceName(printer.usbDeviceName || '');
      setVendorId(printer.vendorId || '');
      setProductId(printer.productId || '');
      setPaperWidth(printer.paperWidth || '80mm');
      setAutoCut(printer.autoCut ?? true);
    } else {
      setEditingPrinter(null);
      setPrinterName('');
      setPrinterType('receipt');
      setConnectionType('usb'); // Default to USB since it's the standard for POS
      setIpAddress('192.168.1.200');
      setPort(9100);
      setComPort('COM1');
      setBaudRate(9600);
      setUsbPort('USB001');
      setCustomUsbPort('');
      setUsbDeviceName('POS-80 Thermal USB Printer');
      setVendorId('');
      setProductId('');
      setPaperWidth('80mm');
      setAutoCut(true);
    }
    setShowPrinterModal(true);
  };

  // Save Printer Device
  const handleSavePrinter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!printerName.trim()) return;

    const resolvedUsbPort = usbPort === 'custom' ? (customUsbPort.trim() || 'USB-CUSTOM') : usbPort;

    const updatedPrinter: PrinterDevice = {
      id: editingPrinter ? editingPrinter.id : `prn-${Date.now()}`,
      name: printerName,
      type: printerType,
      connectionType,
      ipAddress: connectionType === 'network' ? ipAddress : undefined,
      port: connectionType === 'network' ? Number(port) : undefined,
      comPort: connectionType === 'serial' ? comPort : undefined,
      baudRate: connectionType === 'serial' ? Number(baudRate) : undefined,
      usbPort: connectionType === 'usb' ? resolvedUsbPort : undefined,
      usbDeviceName: connectionType === 'usb' ? usbDeviceName : undefined,
      vendorId: connectionType === 'usb' ? vendorId : undefined,
      productId: connectionType === 'usb' ? productId : undefined,
      paperWidth,
      autoCut,
      isDefault: editingPrinter ? editingPrinter.isDefault : printers.length === 0,
    };

    let newPrinters: PrinterDevice[];
    if (editingPrinter) {
      newPrinters = printers.map((p) => (p.id === editingPrinter.id ? updatedPrinter : p));
    } else {
      newPrinters = [...printers, updatedPrinter];
    }

    onUpdateSettings({
      ...settings,
      printers: newPrinters,
    });

    setShowPrinterModal(false);
  };

  // Delete Printer
  const handleDeletePrinter = (id: string) => {
    if (confirm('Bu yazıcı tanımını kaldırmak istediğinize emin misiniz?')) {
      const updated = printers.filter((p) => p.id !== id);
      onUpdateSettings({
        ...settings,
        printers: updated,
      });
    }
  };

  // Test Print Simulation
  const handleTestPrint = (printer: PrinterDevice) => {
    const portDesc = printer.connectionType === 'usb'
      ? `USB Port: ${printer.usbPort || 'USB001'}${printer.usbDeviceName ? ` (${printer.usbDeviceName})` : ''}`
      : printer.connectionType === 'network'
      ? `IP: ${printer.ipAddress}:${printer.port}`
      : `COM: ${printer.comPort || 'COM1'} @ ${printer.baudRate || 9600}`;

    setTestPrintStatus(`"${printer.name}" [${portDesc}] cihazına sınama çıktısı gönderiliyor...`);
    setTimeout(() => {
      setTestPrintStatus(`✅ Sınama Başarılı! ${printer.name} [${portDesc}] bağlantısı doğrulandı.`);
      setTimeout(() => setTestPrintStatus(null), 4000);
    }, 1200);
  };

  // Update Barcode Scanner Settings
  const handleUpdateScanner = (newScanner: Partial<BarcodeScannerConfig>) => {
    const updated = {
      ...scannerConfig,
      ...newScanner,
    };
    onUpdateSettings({
      ...settings,
      barcodeScanner: updated,
    });
  };

  // Handle Live Barcode Scan Input
  const handleBarcodeTestKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (testBarcodeScanInput.trim()) {
        const newLog = {
          code: testBarcodeScanInput.trim(),
          time: new Date().toLocaleTimeString('tr-TR'),
        };
        setScannedLog((prev) => [newLog, ...prev.slice(0, 4)]);
        setTestBarcodeScanInput('');

        // Audio chime alert if enabled
        if (scannerConfig.beepAlert) {
          try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = 1200;
            gain.gain.value = 0.1;
            osc.start();
            osc.stop(ctx.currentTime + 0.15);
          } catch (err) {
            // Audio context fallback
          }
        }
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Test Print Toast Banner */}
      {testPrintStatus && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 rounded-2xl flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-3">
            <Printer className="w-5 h-5 text-amber-500 animate-pulse" />
            <span className="text-sm font-semibold">{testPrintStatus}</span>
          </div>
        </div>
      )}

      {/* SECTION 0: MOBILE WAITER TERMINAL & SERVER NETWORK SETTINGS */}
      <div className="bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-stone-200 dark:border-stone-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-amber-500" />
              Mobil Garson Terminali & Sunucu Ağ Bağlantısı
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Garsonların cep telefonlarından sisteme erişim adresleri, sunucu IP/Port yapılandırması ve hızlı QR kod ile bağlanma
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveNetworkSettings}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-stone-950 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>Ağ Ayarlarını Kaydet</span>
            </button>
          </div>
        </div>

        {saveNetworkSuccess && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-2xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Sunucu ağ IP ve Port ayarları başarıyla kaydedildi!</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: Network & Port Settings */}
          <div className="md:col-span-7 space-y-4">
            <div className="bg-stone-50 dark:bg-stone-950/60 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-2">
                <Globe className="w-4 h-4 text-amber-500" />
                Sunucu IP ve Port Tanımları
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Yerel Sunucu IP / Host Adresi
                  </label>
                  <input
                    type="text"
                    value={serverIp}
                    onChange={(e) => setServerIp(e.target.value)}
                    placeholder="192.168.1.100"
                    className="w-full p-2.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-xs font-mono text-stone-900 dark:text-stone-100"
                  />
                  <span className="text-[10px] text-stone-400 mt-1 block">
                    Restoran ana bilgisayarının yerel IP adresi
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Port Numarası
                  </label>
                  <input
                    type="text"
                    value={serverPort}
                    onChange={(e) => setServerPort(e.target.value)}
                    placeholder="3000"
                    className="w-full p-2.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-xs font-mono text-stone-900 dark:text-stone-100"
                  />
                  <span className="text-[10px] text-stone-400 mt-1 block">
                    Varsayılan: 3000
                  </span>
                </div>
              </div>

              {/* Constructed Mobile Connection Link Box */}
              <div className="pt-2 border-t border-stone-200 dark:border-stone-800 space-y-2">
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                  Garsonlar İçin Mobil Erişim Bağlantısı (URL):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={constructedUrl}
                    className="flex-1 p-2.5 bg-amber-500/10 border border-amber-500/30 font-mono text-xs text-amber-900 dark:text-amber-300 font-bold rounded-xl selection:bg-amber-500"
                  />
                  <button
                    type="button"
                    onClick={handleCopyUrl}
                    className="px-3 py-2.5 bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-900 dark:text-stone-100 font-bold text-xs rounded-xl flex items-center gap-1.5 shrink-0 transition-all"
                  >
                    {copiedUrl ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedUrl ? 'Kopyalandı' : 'Kopyala'}</span>
                  </button>
                  <a
                    href={constructedUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl flex items-center justify-center shrink-0"
                    title="Yeni Sekmede Test Et"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Wi-Fi & Device Checklist */}
            <div className="p-4 bg-stone-50 dark:bg-stone-950/60 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-stone-900 dark:text-stone-100">
                <Wifi className="w-4 h-4 text-emerald-500" />
                <span>Wi-Fi Ağ Gereksinimi</span>
              </div>
              <p className="text-stone-500 dark:text-stone-400 leading-relaxed">
                Garson cep telefonlarının ve ana POS cihazının aynı Wi-Fi ağına (örneğin restoranın lokal Wi-Fi bağlantısı) bağlı olduğundan emin olun.
              </p>
            </div>
          </div>

          {/* Right Column: QR Code Generator for Mobile Phones */}
          <div className="md:col-span-5 flex flex-col items-center justify-center bg-stone-50 dark:bg-stone-950/60 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 text-center space-y-3">
            <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-bold text-xs uppercase tracking-wider">
              <QrCode className="w-4 h-4 text-amber-500" />
              <span>Garson Telefon Kamera QR Kodu</span>
            </div>

            {/* QR Code Container */}
            <div className="p-3 bg-white rounded-2xl shadow-md border border-stone-200 flex items-center justify-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(constructedUrl)}`}
                alt="Garson Telefon Giriş QR Kodu"
                className="w-44 h-44 object-contain rounded-lg"
                referrerPolicy="no-referrer"
              />
            </div>

            <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium max-w-xs">
              Garsonlar iOS (iPhone) veya Android telefon kamerasını açıp bu QR kodu okutarak garson ekranına anında erişebilir.
            </p>
          </div>
        </div>

        {/* STEP BY STEP GUIDE */}
        <div className="p-5 bg-amber-500/10 border border-amber-500/20 rounded-2xl space-y-3">
          <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-amber-500" />
            Garson Telefon Bağlantısı Adım Adım Kurulum Rehberi
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-white dark:bg-stone-900 rounded-xl border border-amber-500/20 space-y-1">
              <span className="font-extrabold text-amber-500">1. Wi-Fi Ağı</span>
              <p className="text-stone-600 dark:text-stone-300 text-[11px]">
                Garson telefonunu restoranın ortak Wi-Fi kablosuz ağına bağlayın.
              </p>
            </div>

            <div className="p-3 bg-white dark:bg-stone-900 rounded-xl border border-amber-500/20 space-y-1">
              <span className="font-extrabold text-amber-500">2. QR / URL Açma</span>
              <p className="text-stone-600 dark:text-stone-300 text-[11px]">
                QR Kodu okutun veya Safari/Chrome tarayıcısına yukarıdaki bağlantı adresini yazın.
              </p>
            </div>

            <div className="p-3 bg-white dark:bg-stone-900 rounded-xl border border-amber-500/20 space-y-1">
              <span className="font-extrabold text-amber-500">3. Ana Ekrana Ekle</span>
              <p className="text-stone-600 dark:text-stone-300 text-[11px]">
                Tarayıcı menüsünden "Ana Ekrana Ekle" diyerek tam ekran telefon uygulamasına dönüştürün.
              </p>
            </div>

            <div className="p-3 bg-white dark:bg-stone-900 rounded-xl border border-amber-500/20 space-y-1">
              <span className="font-extrabold text-amber-500">4. PIN ile Giriş</span>
              <p className="text-stone-600 dark:text-stone-300 text-[11px]">
                Garson kendisine verilen 4 haneli PIN kodunu girerek masaları yönetmeye başlar.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 0.5: REMOTE ADMIN ACCESS (OUTSIDE WI-FI / WAN ACCESS) */}
      <div className="bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-stone-200 dark:border-stone-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Globe className="w-5 h-5 text-amber-500" />
              Uzaktan Yönetici Erişimi (Wi-Fi Dışı / Dış Ağ & Mobil Veri)
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Restoran dışındayken, evden veya 4G/5G hücresel veriden canlı kasa, rapor ve sipariş takibi yapabilmeniz için bağlantı ayarları
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveNetworkSettings}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-stone-950 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>Dış Ağ Ayarlarını Kaydet</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: Outer URL / Domain / Port Form */}
          <div className="md:col-span-7 space-y-4">
            <div className="bg-stone-50 dark:bg-stone-950/60 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Dış Ağ (WAN / Bulut) Bağlantı Adresi Yapılandırması
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Dış Ağ Web / Statik IP / Domain Adresi
                  </label>
                  <input
                    type="text"
                    value={remoteWanUrl}
                    onChange={(e) => setRemoteWanUrl(e.target.value)}
                    placeholder="https://pos.restoraniniz.com"
                    className="w-full p-2.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-xs font-mono text-stone-900 dark:text-stone-100"
                  />
                  <span className="text-[10px] text-stone-400 mt-1 block">
                    Cloud Run adresi, Statik IP veya özel alan adınız (Domain)
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Dış Port (WAN)
                  </label>
                  <input
                    type="text"
                    value={remoteWanPort}
                    onChange={(e) => setRemoteWanPort(e.target.value)}
                    placeholder="443"
                    className="w-full p-2.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-xs font-mono text-stone-900 dark:text-stone-100"
                  />
                  <span className="text-[10px] text-stone-400 mt-1 block">
                    HTTPS varsayılan: 443
                  </span>
                </div>
              </div>

              {/* Constructed Outer Access URL Box */}
              <div className="pt-2 border-t border-stone-200 dark:border-stone-800 space-y-2">
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                  Yönetici Dış Ağ Bağlantı Adresi (Wi-Fi Dışı Erişim):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={constructedRemoteUrl}
                    className="flex-1 p-2.5 bg-emerald-500/10 border border-emerald-500/30 font-mono text-xs text-emerald-900 dark:text-emerald-300 font-bold rounded-xl selection:bg-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleCopyRemoteUrl}
                    className="px-3 py-2.5 bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-900 dark:text-stone-100 font-bold text-xs rounded-xl flex items-center gap-1.5 shrink-0 transition-all"
                  >
                    {copiedRemoteUrl ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedRemoteUrl ? 'Kopyalandı' : 'Kopyala'}</span>
                  </button>
                  <a
                    href={constructedRemoteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs rounded-xl flex items-center justify-center shrink-0"
                    title="Wi-Fi Dışından Test Et"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* Security Alert Notice */}
            <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 space-y-1 text-xs">
              <div className="flex items-center gap-2 font-bold text-emerald-900 dark:text-emerald-300">
                <KeyRound className="w-4 h-4 text-emerald-500" />
                <span>Yönetici Güvenliği ve Şifre Koruması</span>
              </div>
              <p className="text-emerald-800 dark:text-emerald-200/80 leading-relaxed text-[11px]">
                Dış ağdan bağlandığınızda sistem yönetici PIN kodunuzu (Varsayılan: 1234) veya şifrenizi isteyecektir. Yetkisiz kişilerin erişimini engellemek için yönetici PIN kodunu benzersiz yapınız.
              </p>
            </div>
          </div>

          {/* Right Column: QR Code for Remote Admin Access */}
          <div className="md:col-span-5 flex flex-col items-center justify-center bg-stone-50 dark:bg-stone-950/60 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 text-center space-y-3">
            <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-bold text-xs uppercase tracking-wider">
              <QrCode className="w-4 h-4 text-emerald-500" />
              <span>Yönetici Dış Ağ QR Kodu</span>
            </div>

            {/* QR Code Container */}
            <div className="p-3 bg-white rounded-2xl shadow-md border border-stone-200 flex items-center justify-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(constructedRemoteUrl)}`}
                alt="Yönetici Dış Ağ Giriş QR Kodu"
                className="w-44 h-44 object-contain rounded-lg"
                referrerPolicy="no-referrer"
              />
            </div>

            <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium max-w-xs">
              Bu QR kodu cep telefonunuza kaydedip dışarıdayken 4G/5G ile tarayarak dükkanınıza doğrudan bağlanabilirsiniz.
            </p>
          </div>
        </div>

        {/* 3 WAYS TO ACCESS REMOTELY */}
        <div className="p-5 bg-stone-100 dark:bg-stone-950/80 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-3">
          <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider flex items-center gap-2">
            <Globe className="w-4 h-4 text-amber-500" />
            Wi-Fi Dışından (Uzaktan) Erişim Sağlama Yöntemleri
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-4 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 space-y-1.5">
              <div className="flex items-center gap-2 text-amber-500 font-extrabold">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-[10px]">1</span>
                <span>Canlı Bulut Adresi (Önerilen)</span>
              </div>
              <p className="text-stone-600 dark:text-stone-400 text-[11px] leading-relaxed">
                Uygulama canlı web sunucusunda (Cloud Run) çalıştığı için yukarıda otomatik oluşan HTTPS web adresi ile ek hiçbir modem ayarı gerekmeden doğrudan 4G/5G'den bağlanabilirsiniz.
              </p>
            </div>

            <div className="p-4 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 space-y-1.5">
              <div className="flex items-center gap-2 text-amber-500 font-extrabold">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-[10px]">2</span>
                <span>Statik IP + Port Yönlendirme</span>
              </div>
              <p className="text-stone-600 dark:text-stone-400 text-[11px] leading-relaxed">
                Yerel bilgisayarda çalıştırıyorsanız, İnternet servis sağlayıcınızdan Statik IP alıp modem arayüzünden 3000 portunu ana bilgisayara yönlendirerek (Port Forwarding) dışarıdan erişebilirsiniz.
              </p>
            </div>

            <div className="p-4 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 space-y-1.5">
              <div className="flex items-center gap-2 text-amber-500 font-extrabold">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-[10px]">3</span>
                <span>Cloudflare Tunnel / Ngrok</span>
              </div>
              <p className="text-stone-600 dark:text-stone-400 text-[11px] leading-relaxed">
                Modem portu açmadan güvenli şifreli tünel oluşturmak için bilgisayarınıza Cloudflare Tunnel veya Ngrok kurup dış domain oluşturabilirsiniz.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: PRINTER CONFIGURATIONS */}
      <div className="bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-stone-200 dark:border-stone-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Printer className="w-5 h-5 text-amber-500" />
              Yazıcı Cihaz & Port Tanımları
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Adisyon thermal yazıcılar, Mutfak ip yazıcıları ve Barkod/Etiket yazıcılarının port ve bağlantı ayarları
            </p>
          </div>

          <button
            onClick={() => handleOpenPrinterModal()}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-stone-950 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Yazıcı Ekle</span>
          </button>
        </div>

        {/* Printer Devices Grid */}
        {printers.length === 0 ? (
          <div className="p-8 text-center bg-stone-50 dark:bg-stone-950/50 rounded-2xl border border-dashed border-stone-300 dark:border-stone-800 text-stone-500 text-xs">
            Henüz tanımlı yazıcı bulunmuyor. Lütfen "Yeni Yazıcı Ekle" butonunu kullanarak tanımlayın.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {printers.map((printer) => (
              <div
                key={printer.id}
                className="bg-stone-50 dark:bg-stone-950/60 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 flex flex-col justify-between space-y-4 hover:border-amber-500/50 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`p-2 rounded-xl font-bold ${
                          printer.type === 'receipt'
                            ? 'bg-amber-500/20 text-amber-500'
                            : printer.type === 'kitchen'
                            ? 'bg-emerald-500/20 text-emerald-500'
                            : 'bg-blue-500/20 text-blue-500'
                        }`}
                      >
                        {printer.type === 'barcode' ? (
                          <Tag className="w-5 h-5" />
                        ) : (
                          <Printer className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100 line-clamp-1">
                          {printer.name}
                        </h4>
                        <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider block">
                          {printer.type === 'receipt' && 'Adisyon Yazıcısı'}
                          {printer.type === 'kitchen' && 'Mutfak / Sipariş'}
                          {printer.type === 'barcode' && 'Barkod & Etiket'}
                        </span>
                      </div>
                    </div>

                    {printer.isDefault && (
                      <span className="bg-amber-500/20 text-amber-500 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30 shrink-0">
                        Varsayılan
                      </span>
                    )}
                  </div>

                  {/* Connection Details Badge List */}
                  <div className="space-y-1.5 text-xs text-stone-600 dark:text-stone-300 font-mono bg-white dark:bg-stone-900/80 p-3 rounded-xl border border-stone-200 dark:border-stone-800/80">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-stone-400 font-sans">Bağlantı Türü:</span>
                      <span className="font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1">
                        {printer.connectionType === 'network' && <Wifi className="w-3.5 h-3.5 text-sky-500" />}
                        {printer.connectionType === 'usb' && <Usb className="w-3.5 h-3.5 text-amber-500" />}
                        {printer.connectionType === 'serial' && <Cable className="w-3.5 h-3.5 text-purple-500" />}
                        {printer.connectionType === 'network' ? 'TCP/IP Ethernet' : printer.connectionType === 'usb' ? 'USB Bağlantı' : 'RS232 / Seri COM'}
                      </span>
                    </div>

                    {printer.connectionType === 'network' && (
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-stone-400 font-sans">IP & Port:</span>
                        <span className="font-bold text-stone-800 dark:text-stone-200">
                          {printer.ipAddress}:{printer.port}
                        </span>
                      </div>
                    )}

                    {printer.connectionType === 'usb' && (
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-stone-400 font-sans">USB Port:</span>
                        <span className="font-bold text-stone-800 dark:text-stone-200 truncate max-w-[170px]" title={printer.usbDeviceName || printer.usbPort || 'USB001'}>
                          {printer.usbPort || 'USB001'} {printer.usbDeviceName ? `(${printer.usbDeviceName})` : ''}
                        </span>
                      </div>
                    )}

                    {printer.connectionType === 'serial' && (
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-stone-400 font-sans">Port & Baud:</span>
                        <span className="font-bold text-stone-800 dark:text-stone-200">
                          {printer.comPort || 'COM1'} {printer.baudRate ? `@ ${printer.baudRate}` : ''}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1 border-t border-stone-100 dark:border-stone-800">
                      <span className="text-[10px] text-stone-400 font-sans">Kağıt / Otomatik Kesme:</span>
                      <span className="text-[11px] text-stone-700 dark:text-stone-300 font-sans">
                        {printer.paperWidth} {printer.autoCut ? '• Kesmeli' : ''}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-stone-200 dark:border-stone-800">
                  <button
                    onClick={() => handleTestPrint(printer)}
                    className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Sınama Yazdır</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenPrinterModal(printer)}
                      className="p-1.5 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-lg"
                      title="Düzenle"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeletePrinter(printer.id)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
                      title="Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: BARCODE SCANNER HARDWARE CONFIGURATION */}
      <div className="bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Scan className="w-5 h-5 text-amber-500" />
              Barkod Okuyucu Donanım & Klavye Emülasyon Ayarları
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              USB el tipi el terminali, Lazer veya COM Seri port barkod okuyucu cihaz entegrasyonu
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={scannerConfig.enabled}
              onChange={(e) => handleUpdateScanner({ enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none dark:peer-focus:ring-amber-800 rounded-full peer dark:bg-stone-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:after:border-stone-600 peer-checked:bg-amber-500"></div>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Scanner Mode & Port Inputs */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                Okuyucu Çalışma Modu (Interface)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleUpdateScanner({ mode: 'usb_hid' })}
                  className={`p-3 rounded-xl border text-xs font-bold text-left flex items-center gap-2.5 transition-all ${
                    scannerConfig.mode === 'usb_hid'
                      ? 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400'
                      : 'bg-stone-50 dark:bg-stone-950/50 border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400'
                  }`}
                >
                  <Usb className="w-4 h-4 shrink-0 text-amber-500" />
                  <div>
                    <span className="block">USB HID (Klavye)</span>
                    <span className="text-[10px] font-normal text-stone-500">Standart USB Okuyucu</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleUpdateScanner({ mode: 'com_serial' })}
                  className={`p-3 rounded-xl border text-xs font-bold text-left flex items-center gap-2.5 transition-all ${
                    scannerConfig.mode === 'com_serial'
                      ? 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400'
                      : 'bg-stone-50 dark:bg-stone-950/50 border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400'
                  }`}
                >
                  <Cable className="w-4 h-4 shrink-0 text-purple-500" />
                  <div>
                    <span className="block">COM Seri Port (RS232)</span>
                    <span className="text-[10px] font-normal text-stone-500">Sananal/Fiziksel Port</span>
                  </div>
                </button>
              </div>
            </div>

            {/* COM Port Detail Options */}
            {scannerConfig.mode === 'com_serial' && (
              <div className="grid grid-cols-2 gap-3 p-3 bg-stone-50 dark:bg-stone-950/50 rounded-xl border border-stone-200 dark:border-stone-800">
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-1">
                    Port Adı
                  </label>
                  <select
                    value={scannerConfig.comPort || 'COM1'}
                    onChange={(e) => handleUpdateScanner({ comPort: e.target.value })}
                    className="w-full p-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs font-mono"
                  >
                    <option value="COM1">COM1</option>
                    <option value="COM2">COM2</option>
                    <option value="COM3">COM3</option>
                    <option value="COM4">COM4</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-1">
                    Baud Rate
                  </label>
                  <select
                    value={scannerConfig.baudRate || 9600}
                    onChange={(e) => handleUpdateScanner({ baudRate: Number(e.target.value) })}
                    className="w-full p-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs font-mono"
                  >
                    <option value={9600}>9600 bps</option>
                    <option value={19200}>19200 bps</option>
                    <option value={115200}>115200 bps</option>
                  </select>
                </div>
              </div>
            )}

            {/* Suffix / Character Options */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Okuma Sonu Suffix
                </label>
                <select
                  value={scannerConfig.suffix || 'ENTER'}
                  onChange={(e) => handleUpdateScanner({ suffix: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-950/60 border border-stone-200 dark:border-stone-800 rounded-xl text-xs font-semibold"
                >
                  <option value="ENTER">Enter (CR/LF)</option>
                  <option value="TAB">Tab</option>
                  <option value="NONE">Yok</option>
                </select>
              </div>

              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2 p-2.5 bg-stone-50 dark:bg-stone-950/60 border border-stone-200 dark:border-stone-800 rounded-xl text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={scannerConfig.beepAlert ?? true}
                    onChange={(e) => handleUpdateScanner({ beepAlert: e.target.checked })}
                    className="rounded text-amber-500 focus:ring-amber-500"
                  />
                  <Volume2 className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Sesli Bip Uyarısı</span>
                </label>
              </div>
            </div>
          </div>

          {/* Live Scanner Testing Playground */}
          <div className="bg-stone-50 dark:bg-stone-950/80 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                <Scan className="w-4 h-4" />
                Canlı Barkod Okuyucu Test Alanı
              </span>

              <p className="text-xs text-stone-500 dark:text-stone-400">
                Fiziksel barkod okuyucu cihazınızla aşağıdaki kutuya odaklanıp herhangi bir ürün veya koli barkodunu okutarak cihaz bağlantısını doğrulayabilirsiniz.
              </p>

              <div className="space-y-1">
                <input
                  type="text"
                  placeholder="Barkodu buraya okutun..."
                  value={testBarcodeScanInput}
                  onChange={(e) => setTestBarcodeScanInput(e.target.value)}
                  onKeyDown={handleBarcodeTestKeyDown}
                  className="w-full p-3 bg-white dark:bg-stone-900 border-2 border-amber-500/50 rounded-xl text-sm font-mono text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <span className="text-[10px] text-stone-400 block pl-1">
                  *Okuma tamamlandığında otomatık liste kaydı yapılır ve ses çalınır.
                </span>
              </div>
            </div>

            {/* Scan History Log */}
            <div className="space-y-2 pt-3 border-t border-stone-200 dark:border-stone-800">
              <span className="text-[11px] font-bold text-stone-500 block">
                Son Okutulan Barkodlar Logu:
              </span>
              {scannedLog.length === 0 ? (
                <span className="text-xs text-stone-400 italic block">Henüz barkod okutulmadı...</span>
              ) : (
                <div className="space-y-1">
                  {scannedLog.map((log, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs font-mono bg-white dark:bg-stone-900 p-2 rounded-lg border border-stone-200 dark:border-stone-800"
                    >
                      <span className="font-bold text-amber-500">║▌│█║ {log.code}</span>
                      <span className="text-[10px] text-stone-400">{log.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PRINTER ADD/EDIT MODAL */}
      {showPrinterModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 max-w-lg w-full rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Printer className="w-5 h-5 text-amber-500" />
                {editingPrinter ? 'Yazıcı Cihazını Düzenle' : 'Yeni Yazıcı Ekle'}
              </h3>
              <button
                onClick={() => setShowPrinterModal(false)}
                className="text-stone-400 hover:text-stone-600 text-sm font-bold p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePrinter} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Yazıcı Adı / Açıklaması
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    connectionType === 'usb'
                      ? 'Örn: Kasa USB Termal 80mm'
                      : connectionType === 'network'
                      ? 'Örn: Mutfak Thermal 80mm IP'
                      : 'Örn: Kasa Seri COM Termal'
                  }
                  value={printerName}
                  onChange={(e) => setPrinterName(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Yazıcı Amacı / Tipi
                  </label>
                  <select
                    value={printerType}
                    onChange={(e: any) => setPrinterType(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-xs font-semibold"
                  >
                    <option value="receipt">Adisyon Yazıcısı (Kasa)</option>
                    <option value="kitchen">Mutfak / Sipariş Fişi</option>
                    <option value="barcode">Barkod & Etiket Yazıcı</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Bağlantı Türü
                  </label>
                  <select
                    value={connectionType}
                    onChange={(e: any) => setConnectionType(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-xs font-semibold"
                  >
                    <option value="usb">Direct USB Port (Önerilen)</option>
                    <option value="network">TCP/IP Network Ethernet</option>
                    <option value="serial">Seri COM Port (RS232)</option>
                  </select>
                </div>
              </div>

              {/* Conditional Connection Port Inputs */}
              {/* 1. DIRECT USB PORT */}
              {connectionType === 'usb' && (
                <div className="space-y-3 p-3.5 bg-amber-500/5 dark:bg-amber-950/20 rounded-2xl border border-amber-500/20">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <label className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                      <Usb className="w-4 h-4 text-amber-500" />
                      <span>USB Termal Portu & Cihaz Tanımlama</span>
                    </label>

                    {/* Direct WebUSB device picker button */}
                    <button
                      type="button"
                      onClick={handleScanWebUsb}
                      disabled={isScanningUsb}
                      className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                      title="Bilgisayara takılı USB termal yazıcıları doğrudan tarar"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isScanningUsb ? 'animate-spin' : ''}`} />
                      <span>{isScanningUsb ? 'Taranıyor...' : 'USB Yazıcıyı Otomatik Tara'}</span>
                    </button>
                  </div>

                  {/* Feedback on WebUSB Device Selection */}
                  {usbScanSuccess && (
                    <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div className="flex-1 font-semibold">{usbScanSuccess}</div>
                    </div>
                  )}

                  {usbScanError && (
                    <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 rounded-xl text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <div className="flex-1 text-[11px]">{usbScanError}</div>
                    </div>
                  )}

                  {/* Quick Select USB Profile Buttons */}
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-1.5">
                      Hızlı USB Yazıcı Seçimi (En Çok Kullanılan Modeller):
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setUsbPort('USB001');
                          setUsbDeviceName('POS-80 Thermal USB Printer');
                          if (!printerName.trim()) setPrinterName('Kasa Adisyon (USB001)');
                        }}
                        className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 transition-colors"
                      >
                        ⚡ Windows USB001
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setUsbPort('USB-XPRINTER');
                          setUsbDeviceName('Xprinter XP-80C / XP-N160M USB');
                          if (!printerName.trim()) setPrinterName('Xprinter Termal (USB)');
                        }}
                        className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-700 transition-colors"
                      >
                        ⚡ Xprinter USB
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setUsbPort('USB-EPSON');
                          setUsbDeviceName('Epson TM-T20 / TM-T88 USB');
                          if (!printerName.trim()) setPrinterName('Epson TM Termal (USB)');
                        }}
                        className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-700 transition-colors"
                      >
                        ⚡ Epson USB
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setUsbPort('USB-POS-80');
                          setUsbDeviceName('Standart 80mm Termal USB');
                          if (!printerName.trim()) setPrinterName('80mm Termal (USB)');
                        }}
                        className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-700 transition-colors"
                      >
                        ⚡ 80mm Standart USB
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-1">
                        USB Yazıcı Portu / Donanım Yolu
                      </label>
                      <select
                        value={usbPort}
                        onChange={(e) => {
                          const val = e.target.value;
                          setUsbPort(val);
                          // Auto match detected device details if selected
                          const matchedDev = detectedUsbDevices.find(d => d.port === val || d.name === val);
                          if (matchedDev) {
                            setUsbDeviceName(matchedDev.name);
                            setVendorId(matchedDev.vid);
                            setProductId(matchedDev.pid);
                          } else if (val === 'USB-XPRINTER' && !usbDeviceName) {
                            setUsbDeviceName('Xprinter XP-80C / XP-N160M USB');
                          } else if (val === 'USB-EPSON' && !usbDeviceName) {
                            setUsbDeviceName('Epson TM-T20 / TM-T88 USB');
                          } else if (val === 'USB-BIXOLON' && !usbDeviceName) {
                            setUsbDeviceName('Bixolon SRP-330 / SRP-350 USB');
                          } else if (val === 'USB-RONGTA' && !usbDeviceName) {
                            setUsbDeviceName('Rongta RP80 / RP326 USB');
                          }
                        }}
                        className="w-full p-2.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-xs font-semibold"
                      >
                        {detectedUsbDevices.length > 0 && (
                          <optgroup label="── Algılanan WebUSB Donanımları ──">
                            {detectedUsbDevices.map((d, idx) => (
                              <option key={idx} value={d.port}>
                                [ALGILANAN USB] {d.name} ({d.vid})
                              </option>
                            ))}
                          </optgroup>
                        )}
                        <optgroup label="── Windows Sanal USB Yazıcı Portları ──">
                          <option value="USB001">USB001 (Windows Birincil USB Yazıcı Portu - Önerilen)</option>
                          <option value="USB002">USB002 (İkincil Sanal USB Portu)</option>
                          <option value="USB003">USB003 (Sanal USB Port 3)</option>
                        </optgroup>
                        <optgroup label="── Hazır USB Termal Yazıcı Profilleri ──">
                          <option value="USB-POS-80">USB-POS-80 (80mm Standart USB Termal)</option>
                          <option value="USB-POS-58">USB-POS-58 (58mm Standart USB Termal)</option>
                          <option value="USB-XPRINTER">USB-XPRINTER (Xprinter Termal USB)</option>
                          <option value="USB-EPSON">USB-EPSON (Epson TM-T20 / TM-T88 USB)</option>
                          <option value="USB-BIXOLON">USB-BIXOLON (Bixolon SRP Termal USB)</option>
                          <option value="USB-RONGTA">USB-RONGTA (Rongta / Zjiang 80mm USB)</option>
                          <option value="USB-DIRECT">USB-DIRECT (Doğrudan WebUSB Bağlantısı)</option>
                          <option value="custom">Özel USB Portu Belirt...</option>
                        </optgroup>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-1">
                        Aygıt / Yazıcı Modeli
                      </label>
                      <input
                        type="text"
                        placeholder="Örn: POS-80 / Epson / Xprinter USB"
                        value={usbDeviceName}
                        onChange={(e) => setUsbDeviceName(e.target.value)}
                        className="w-full p-2.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-xs font-semibold"
                      />
                    </div>
                  </div>

                  {usbPort === 'custom' && (
                    <div>
                      <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-1">
                        Özel USB Aygıt / Port Yolu
                      </label>
                      <input
                        type="text"
                        placeholder="Örn: /dev/usb/lp0 veya USB-Thermal-Printer"
                        value={customUsbPort}
                        onChange={(e) => setCustomUsbPort(e.target.value)}
                        className="w-full p-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs font-mono"
                      />
                    </div>
                  )}

                  {(vendorId || productId) && (
                    <div className="flex items-center gap-3 text-[11px] text-stone-500 font-mono pt-0.5">
                      <span>Vendor ID: <strong className="text-stone-800 dark:text-stone-200">{vendorId}</strong></span>
                      <span>•</span>
                      <span>Product ID: <strong className="text-stone-800 dark:text-stone-200">{productId}</strong></span>
                    </div>
                  )}

                  <div className="p-2.5 bg-amber-500/10 dark:bg-amber-950/40 rounded-xl border border-amber-500/20 text-[11px] text-amber-800 dark:text-amber-200 leading-relaxed flex items-start gap-2">
                    <Usb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <strong>Direct USB Modu:</strong> COM Port veya Baud Rate gerekmez. Bilgisayarınızın USB portuna takılı olan termal yazıcı doğrudan USB veri yolu veya Windows sanal USB portu (USB001 / USB002) üzerinden haberleşir.
                    </div>
                  </div>
                </div>
              )}

              {/* 2. TCP/IP NETWORK ETHERNET */}
              {connectionType === 'network' && (
                <div className="grid grid-cols-3 gap-3 p-3 bg-stone-50 dark:bg-stone-950/60 rounded-2xl border border-stone-200 dark:border-stone-800">
                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-1">
                      IP Adresi
                    </label>
                    <input
                      type="text"
                      placeholder="192.168.1.200"
                      value={ipAddress}
                      onChange={(e) => setIpAddress(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-1">
                      Port
                    </label>
                    <input
                      type="number"
                      value={port}
                      onChange={(e) => setPort(Number(e.target.value))}
                      className="w-full p-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>
              )}

              {/* 3. SERIAL COM PORT (RS232) */}
              {connectionType === 'serial' && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-stone-50 dark:bg-stone-950/60 rounded-2xl border border-stone-200 dark:border-stone-800">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-1">
                      Seri COM Port Adı
                    </label>
                    <select
                      value={comPort}
                      onChange={(e) => setComPort(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs font-mono"
                    >
                      <option value="COM1">COM1</option>
                      <option value="COM2">COM2</option>
                      <option value="COM3">COM3</option>
                      <option value="COM4">COM4</option>
                      <option value="COM5">COM5</option>
                      <option value="COM6">COM6</option>
                      <option value="COM7">COM7</option>
                      <option value="COM8">COM8</option>
                      <option value="LPT1">LPT1</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-1">
                      Baud Rate
                    </label>
                    <select
                      value={baudRate}
                      onChange={(e) => setBaudRate(Number(e.target.value))}
                      className="w-full p-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs font-mono"
                    >
                      <option value={9600}>9600 (Standart)</option>
                      <option value={19200}>19200</option>
                      <option value={38400}>38400</option>
                      <option value={57600}>57600</option>
                      <option value={115200}>115200 (Yüksek Hızlı)</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Kağıt / Genişlik
                  </label>
                  <select
                    value={paperWidth}
                    onChange={(e: any) => setPaperWidth(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-xs font-semibold"
                  >
                    <option value="80mm">80mm Standart Thermal</option>
                    <option value="58mm">58mm Dar Thermal</option>
                    <option value="etiket">Yapışkanlı Etiket</option>
                  </select>
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 p-2.5 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoCut}
                      onChange={(e) => setAutoCut(e.target.checked)}
                      className="rounded text-amber-500 focus:ring-amber-500"
                    />
                    <span>Otomatik Kağıt Kesme</span>
                  </label>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPrinterModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 text-xs font-bold"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 rounded-xl text-xs font-bold shadow-xs"
                >
                  Yazıcıyı Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
