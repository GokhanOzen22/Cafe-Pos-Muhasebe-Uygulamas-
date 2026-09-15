import React, { useState, useEffect } from 'react';
import { ServerInfo, SystemLog } from '../types';
import { StorageService } from '../services/storage';
import {
  Database,
  Server,
  Wifi,
  HardDrive,
  FileText,
  RefreshCw,
  Download,
  Upload,
  Clock,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Copy,
  Laptop,
  Smartphone,
  ChefHat,
  RotateCcw
} from 'lucide-react';
import { formatDate, formatTime } from '../utils/formatters';

interface LocalDatabaseManagerProps {
  onResetData: () => void;
}

export const LocalDatabaseManager: React.FC<LocalDatabaseManagerProps> = ({ onResetData }) => {
  const [serverInfo, setServerInfo] = useState<ServerInfo | null>(null);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const loadServerData = async () => {
    setLoading(true);
    const info = await StorageService.getServerInfo();
    const logList = await StorageService.getSystemLogs();
    setServerInfo(info);
    setLogs(logList);
    setLoading(false);
  };

  useEffect(() => {
    loadServerData();
    const interval = setInterval(() => {
      StorageService.getServerInfo().then(setServerInfo);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadBackup = () => {
    const zones = StorageService.getZones();
    const tables = StorageService.getTables();
    const categories = StorageService.getCategories();
    const menuItems = StorageService.getMenuItems();
    const stockItems = StorageService.getStockItems();
    const orders = StorageService.getOrders();
    const settings = StorageService.getSettings();
    const users = StorageService.getUsers();

    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      zones,
      tables,
      categories,
      menuItems,
      stockItems,
      orders,
      settings,
      users,
      logs
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Meric_POS_Yedek_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const content = evt.target?.result as string;
        const parsed = JSON.parse(content);

        if (parsed.tables && parsed.menuItems) {
          if (parsed.zones) StorageService.saveZones(parsed.zones);
          if (parsed.tables) StorageService.saveTables(parsed.tables);
          if (parsed.categories) StorageService.saveCategories(parsed.categories);
          if (parsed.menuItems) StorageService.saveMenuItems(parsed.menuItems);
          if (parsed.stockItems) StorageService.saveStockItems(parsed.stockItems);
          if (parsed.orders) StorageService.saveOrders(parsed.orders);
          if (parsed.settings) StorageService.saveSettings(parsed.settings);
          if (parsed.users) StorageService.saveUsers(parsed.users);

          alert('Yedek verileri başarıyla yüklendi! Sayfa yenileniyor...');
          window.location.reload();
        } else {
          alert('Geçersiz yedek dosyası formatı!');
        }
      } catch (err) {
        alert('Yedek yükleme hatası: ' + err);
      }
    };
    reader.readAsText(file);
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || log.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Status */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 sm:p-6 text-stone-100 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-stone-100">Kasa Sunucusu & Yerel SQLite Veritabanı</h2>
                <p className="text-xs text-stone-400">
                  Tüm verileriniz ve işlem loglarınız tamamen bu bilgisayarın diskinde yerel olarak saklanmaktadır.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadServerData}
              disabled={loading}
              className="flex items-center gap-2 bg-stone-800 hover:bg-stone-700 text-stone-200 px-3.5 py-2 rounded-xl border border-stone-700 text-xs font-semibold transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Yenile
            </button>
            <button
              onClick={handleDownloadBackup}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-stone-950 px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Veritabanı Yedeği İndir (.json)
            </button>
          </div>
        </div>

        {/* Server Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="bg-stone-950/80 p-4 rounded-xl border border-stone-800">
            <div className="flex items-center justify-between text-stone-400 text-xs mb-1">
              <span>Sunucu Durumu</span>
              <Wifi className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-base font-bold text-emerald-400">AKTİF & YEREL</span>
            </div>
            <p className="text-[11px] text-stone-500 mt-1">Sadece yerel Wi-Fi ağında çalışır</p>
          </div>

          <div className="bg-stone-950/80 p-4 rounded-xl border border-stone-800">
            <div className="flex items-center justify-between text-stone-400 text-xs mb-1">
              <span>Yerel Ağ IP Adresi (Wi-Fi)</span>
              <Laptop className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-center justify-between gap-2 mt-2">
              <span className="text-sm font-mono font-bold text-amber-400 truncate">
                {serverInfo?.localUrl || 'http://localhost:3000'}
              </span>
              <button
                onClick={() => handleCopyUrl(serverInfo?.localUrl || 'http://localhost:3000')}
                className="p-1 text-stone-400 hover:text-white bg-stone-800 rounded transition-colors"
                title="Kopyala"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-[11px] text-stone-500 mt-1">Tabletlerin bağlanacağı IP adresi</p>
          </div>

          <div className="bg-stone-950/80 p-4 rounded-xl border border-stone-800">
            <div className="flex items-center justify-between text-stone-400 text-xs mb-1">
              <span>Yerel SQLite Disk Konumu</span>
              <HardDrive className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-xs font-mono text-stone-200 mt-2 truncate" title={serverInfo?.dbPath || 'data/database.sqlite'}>
              {serverInfo?.dbPath || 'data/database.sqlite'}
            </div>
            <p className="text-[11px] text-stone-500 mt-1">Gerçek SQLite veritabanı dosyası</p>
          </div>

          <div className="bg-stone-950/80 p-4 rounded-xl border border-stone-800">
            <div className="flex items-center justify-between text-stone-400 text-xs mb-1">
              <span>Toplam İşlem Logu</span>
              <FileText className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-lg font-bold text-purple-300 mt-1">
              {serverInfo?.totalLogs || logs.length} Kayıtlı Log
            </div>
            <p className="text-[11px] text-stone-500 mt-1">Anlık kayıt tutulmaktadır</p>
          </div>
        </div>
      </div>

      {/* System Version & One-Click UI Update Panel */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 sm:p-6 text-stone-100 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 font-bold flex items-center justify-center shrink-0 shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-stone-100">Ekran Üzerinden Sürüm & Veri Güncelleme Yöneticisi</h3>
                <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                  v2.1.0 - Güncel Sürüm
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Hiçbir kod veya komut yazmadan tüm verilerinizi ve uygulama ayarlarınızı doğrudan ekran üzerinden yedekleyebilir veya güncelleyebilirsiniz.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownloadBackup}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-stone-950 px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Sistem Yedeğini İndir (.json)</span>
            </button>

            <label className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all">
              <Upload className="w-4 h-4" />
              <span>Sürüm / Yedek Yükle</span>
              <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
            </label>
          </div>
        </div>

        {/* Workflow Steps for User */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="bg-stone-950/70 p-4 rounded-xl border border-stone-800/80 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <span className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 text-[11px] flex items-center justify-center shrink-0">1</span>
              <span>1. Ekran Üzerinden Yedek Alın</span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              Yukarıdaki <strong>"Sistem Yedeğini İndir"</strong> butonuna basarak tüm adisyon, masa, stok ve menü verilerinizi bilgisayarınıza kaydedin.
            </p>
          </div>

          <div className="bg-stone-950/70 p-4 rounded-xl border border-stone-800/80 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <span className="w-5 h-5 rounded-full bg-emerald-500 text-stone-950 text-[11px] flex items-center justify-center shrink-0">2</span>
              <span>2. Yeni Versiyon Dosyasını Seçin</span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              Güncellenmiş menü veya yedek dosyanızı yüklemek için <strong>"Sürüm / Yedek Yükle"</strong> butonuna tıklayıp <code className="text-amber-400 font-mono">.json</code> dosyasını seçin.
            </p>
          </div>

          <div className="bg-stone-950/70 p-4 rounded-xl border border-stone-800/80 space-y-2">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-xs">
              <span className="w-5 h-5 rounded-full bg-blue-500 text-stone-950 text-[11px] flex items-center justify-center shrink-0">3</span>
              <span>3. Otomatik Yenilenme & Yükleme</span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              Dosya seçildiği an veritabanı doğrudan yerel diskinizde güncellenir ve ekran yenilenerek yeni verileriniz anında aktif olur.
            </p>
          </div>
        </div>
      </div>

      {/* Network Setup Guide for Tablets */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 text-stone-100 space-y-4">
        <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
          <Wifi className="w-4 h-4 text-amber-400" />
          İşletme İçi Yerel Ağ (Local Wi-Fi) Tablet & Mutfak Bağlantı Rehberi
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-stone-950/60 p-4 rounded-xl border border-stone-800/80 space-y-2">
            <div className="flex items-center gap-2 text-stone-200 font-semibold text-xs">
              <span className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 text-[11px] font-bold flex items-center justify-center shrink-0">1</span>
              <span>Kasa PC & Tabletleri Aynı Ağ Bağlayın</span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              Kasadaki ana bilgisayarı ve garson tabletlerini işletmenizdeki aynı Wi-Fi modemine/router'a bağlayın. İnternetinizin olmasına gerek yoktur.
            </p>
          </div>

          <div className="bg-stone-950/60 p-4 rounded-xl border border-stone-800/80 space-y-2">
            <div className="flex items-center gap-2 text-stone-200 font-semibold text-xs">
              <span className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 text-[11px] font-bold flex items-center justify-center shrink-0">2</span>
              <span>Tablet Tarayıcısını Açın</span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              Garson tabletinde veya mutfak ekranında Chrome/Safari tarayıcısını açıp adres çubuğuna <span className="font-mono text-amber-400">{serverInfo?.localUrl || 'http://192.168.1.X:3000'}</span> yazın.
            </p>
          </div>

          <div className="bg-stone-950/60 p-4 rounded-xl border border-stone-800/80 space-y-2">
            <div className="flex items-center gap-2 text-stone-200 font-semibold text-xs">
              <span className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 text-[11px] font-bold flex items-center justify-center shrink-0">3</span>
              <span>Çevrimdışı / Anlık Eşzamanlanma</span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              Garson tabletinden alınan sipariş saniyeler içinde mutfak ekranına ve kasadaki bilgisayarın SQLite veritabanına otomatik kaydolur.
            </p>
          </div>
        </div>
      </div>

      {/* Backup & System Logs Tabs */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-stone-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              Sistem & İşlem Logları (SQLite Log Defteri)
            </h3>
            <p className="text-xs text-stone-400">
              Kim ne zaman hangi masayı açtı, sipariş ekledi, adisyon kapattı veya stok değiştirdi.
            </p>
          </div>

          {/* Backup Action Buttons */}
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 bg-stone-800 hover:bg-stone-700 text-stone-200 px-3 py-1.5 rounded-xl border border-stone-700 text-xs font-semibold cursor-pointer transition-all">
              <Upload className="w-3.5 h-3.5 text-amber-400" />
              <span>Yedek Yükle</span>
              <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
            </label>

            <button
              onClick={onResetData}
              className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1.5 rounded-xl border border-red-500/30 text-xs font-semibold transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Fabrika Ayarlarına Sıfırla</span>
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Loglarda ara (işlem, kullanıcı, detay)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-950 text-stone-100 pl-9 pr-4 py-2 rounded-xl text-xs border border-stone-800 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'Tümü' },
              { id: 'order', label: 'Sipariş & Adisyon' },
              { id: 'table', label: 'Masa İşlemleri' },
              { id: 'payment', label: 'Ödeme' },
              { id: 'stock', label: 'Stok' },
              { id: 'menu', label: 'Menü' },
              { id: 'system', label: 'Sistem' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                    : 'bg-stone-800 text-stone-400 hover:text-stone-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Log Table */}
        <div className="border border-stone-800 rounded-xl overflow-hidden bg-stone-950/60 max-h-[400px] overflow-y-auto">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-stone-500 text-xs">
              Henüz filtrenize uygun işlem log kaydı bulunamadı.
            </div>
          ) : (
            <table className="w-full text-left text-xs text-stone-300">
              <thead className="bg-stone-900 border-b border-stone-800 text-stone-400 sticky top-0 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Tarih & Saat</th>
                  <th className="py-2.5 px-3">Kullanıcı</th>
                  <th className="py-2.5 px-3">Kategori</th>
                  <th className="py-2.5 px-3">İşlem</th>
                  <th className="py-2.5 px-3">Açıklama / Detay</th>
                  <th className="py-2.5 px-3 text-right">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-stone-900/60 transition-colors">
                    <td className="py-2 px-3 whitespace-nowrap font-mono text-[11px] text-stone-400">
                      {formatDate(log.timestamp)} {formatTime(log.timestamp)}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap font-medium text-stone-200">
                      {log.userName}
                      <span className="text-[10px] text-amber-400 font-mono block leading-tight">
                        {log.userRole === 'admin' ? 'Yönetici' : log.userRole === 'kitchen' ? 'Mutfak' : 'Garson'}
                      </span>
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          log.category === 'order'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : log.category === 'payment'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : log.category === 'stock'
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : log.category === 'table'
                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                            : 'bg-stone-800 text-stone-400'
                        }`}
                      >
                        {log.category}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-semibold text-stone-100 whitespace-nowrap">{log.action}</td>
                    <td className="py-2 px-3 text-stone-300">{log.details}</td>
                    <td className="py-2 px-3 text-right font-mono text-[10px] text-stone-500">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
