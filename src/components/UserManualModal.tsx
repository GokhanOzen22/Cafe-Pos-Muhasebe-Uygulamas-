import React, { useState } from 'react';
import {
  BookOpen, X, Printer, Search, Smartphone, ChefHat, ShieldCheck,
  CreditCard, Utensils, AlertTriangle, Users, Database, Layers,
  CheckCircle2, Clock, Zap, ChevronRight, Send, Ticket, Banknote,
  UserX, ArrowRightLeft, Plus, Minus, Trash2, MessageSquare,
  AlertCircle, ShoppingBag, Check, Lock, UtensilsCrossed, User,
  HelpCircle, Sparkles, ArrowDown, Archive, BarChart3, Eye, FileText, Calendar
} from 'lucide-react';
import { RestaurantSettings } from '../types';

interface UserManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: RestaurantSettings;
}

export const UserManualModal: React.FC<UserManualModalProps> = ({
  isOpen,
  onClose,
  settings,
}) => {
  const [activeSection, setActiveSection] = useState<string>('steps');

  if (!isOpen) return null;

  const sections = [
    { id: 'steps', title: '⭐ Sipariş Adımları & Butonlar', icon: UtensilsCrossed, badge: 'Görsel Rehber' },
    { id: 'roles', title: '1. Giriş & Roller (PIN)', icon: Users },
    { id: 'orders', title: '2. Masa & Sipariş (POS)', icon: Smartphone },
    { id: 'payment', title: '3. Ödeme & Adisyon', icon: CreditCard },
    { id: 'zreport', title: '4. Günü Kapat & Z-Raporu', icon: Lock, badge: 'Mali Kapatma' },
    { id: 'printing', title: '5. Doğrudan Yazdırma (Fiş)', icon: Printer },
    { id: 'kitchen', title: '6. Mutfak Ekranı (KDS)', icon: ChefHat },
    { id: 'admin', title: '7. Yönetim & Fiyat/Menü', icon: ShieldCheck },
    { id: 'stock', title: '8. Stok, Fatura & Reçete', icon: Layers },
    { id: 'network', title: '9. Tablet & Çoklu Cihaz', icon: Database },
  ];

  const handlePrintManual = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl w-full max-w-6xl h-[94vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white flex items-center justify-between border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-extrabold text-base sm:text-lg text-white">
                  {settings.name || 'Meriç Belediyesi Sosyal Tesisleri'}
                </h2>
                <span className="text-[10px] bg-amber-500 text-stone-950 font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Kullanım Kitapçığı & Buton Rehberi v2.4
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Adım Adım Sipariş Akışı, Buton Görselleri ve İşletme Operasyon Kılavuzu
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrintManual}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold rounded-xl border border-stone-700 transition-colors"
              title="Kılavuzu Yazdır"
            >
              <Printer className="w-4 h-4" />
              <span>Yazdır</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body with Sidebar */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          {/* Navigation Sidebar */}
          <div className="w-full md:w-68 bg-stone-50 dark:bg-stone-950/70 border-b md:border-b-0 md:border-r border-stone-200 dark:border-stone-800 p-3 flex md:flex-col gap-1.5 overflow-x-auto md:overflow-y-auto shrink-0">
            <div className="hidden md:block px-2 py-1 text-[11px] font-black uppercase text-stone-400 tracking-wider">
              Rehber Bölümleri
            </div>
            {sections.map((sec) => {
              const Icon = sec.icon;
              const isSelected = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setActiveSection(sec.id)}
                  className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-all whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500 text-stone-950 shadow-sm'
                      : 'text-stone-600 dark:text-stone-300 hover:bg-stone-200/70 dark:hover:bg-stone-800/70'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-stone-950' : 'text-stone-400'}`} />
                    <span className="truncate">{sec.title}</span>
                  </div>
                  {sec.badge && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-black shrink-0 ${
                      isSelected ? 'bg-stone-950 text-amber-400' : 'bg-amber-500/20 text-amber-700 dark:text-amber-400'
                    }`}>
                      {sec.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Detailed Content Pane */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 space-y-6">

            {/* ⭐ SECTION: VISUAL ORDERING STEPS & BUTTON GALLERY */}
            {activeSection === 'steps' && (
              <div className="space-y-6 animate-in fade-in">
                {/* Intro Banner */}
                <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border border-amber-500/30">
                  <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 font-black text-sm uppercase tracking-wider mb-1">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Hızlı Sipariş Akışı & Buton Rehberi</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-stone-900 dark:text-stone-100">
                    Siparişi Başlatmaktan Hesap Kapatmaya 7 Adımlı Görsel Süreç
                  </h3>
                  <p className="text-xs text-stone-600 dark:text-stone-300 mt-1 leading-relaxed">
                    Aşağıdaki her kutuda, ekranda gördüğünüz butonların birebir görsel örnekleri, ne işe yaradıkları ve hangi durumlarda kullanılacakları açıklanmıştır.
                  </p>

                  {/* Flow Badges */}
                  <div className="flex items-center gap-1.5 sm:gap-2 mt-4 flex-wrap text-[11px] font-bold">
                    <span className="bg-stone-900 text-white px-2.5 py-1 rounded-lg">1. Masa Seç</span>
                    <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span className="bg-stone-900 text-white px-2.5 py-1 rounded-lg">2. Ürün Ekle</span>
                    <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span className="bg-stone-900 text-white px-2.5 py-1 rounded-lg">3. Not/Porsiyon Yaz</span>
                    <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span className="bg-stone-900 text-white px-2.5 py-1 rounded-lg">4. Müşteri Adı Gir</span>
                    <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span className="bg-amber-500 text-stone-950 px-2.5 py-1 rounded-lg">5. Mutfağa İlet</span>
                    <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span className="bg-emerald-600 text-white px-2.5 py-1 rounded-lg">6. Hesap Kapat</span>
                  </div>
                </div>

                {/* ADIM 1: MASA SEÇİMİ VE MASA KARTLARI */}
                <div className="p-4 sm:p-5 rounded-3xl bg-stone-50 dark:bg-stone-950/60 border border-stone-200 dark:border-stone-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-xl bg-amber-500 text-stone-950 font-black flex items-center justify-center text-xs">1</span>
                      <h4 className="font-extrabold text-sm sm:text-base text-stone-900 dark:text-stone-100">
                        Adım 1: Salon ve Masa Seçimi
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold text-stone-500">Masa Kartları & Renkler</span>
                  </div>

                  <p className="text-xs text-stone-600 dark:text-stone-300">
                    Üst menüden salonu (Ana Salon, Teras, Bahçe) seçtikten sonra ilgili masanın üzerine dokunun:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    {/* Boş Masa Görseli */}
                    <div className="p-3.5 bg-white dark:bg-stone-900 rounded-2xl border-2 border-emerald-500/50 shadow-xs flex flex-col justify-between h-32">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-stone-900 dark:text-stone-100">Bahçe 3</span>
                        <span className="text-[10px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full">BOŞ</span>
                      </div>
                      <div className="text-center py-1 text-emerald-600 dark:text-emerald-400">
                        <Utensils className="w-6 h-6 mx-auto opacity-70" />
                      </div>
                      <div className="text-[10px] font-semibold text-stone-500 text-center">
                        Dokununca yeni adisyon açılır
                      </div>
                    </div>

                    {/* Dolu Masa Görseli */}
                    <div className="p-3.5 bg-white dark:bg-stone-900 rounded-2xl border-2 border-amber-500 shadow-xs flex flex-col justify-between h-32">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-stone-900 dark:text-stone-100">Teras 5</span>
                        <span className="text-[10px] font-bold bg-amber-500 text-stone-950 px-2 py-0.5 rounded-full">AÇIK #104</span>
                      </div>
                      <div className="text-center">
                        <span className="text-base font-black text-stone-900 dark:text-amber-400">₺540,00</span>
                        <p className="text-[10px] text-stone-400">4 Kişi • ⏱️ 28 dk</p>
                      </div>
                      <div className="text-[10px] font-semibold text-stone-500 text-center">
                        Mevcut siparişe ürün eklenir
                      </div>
                    </div>

                    {/* Hesap İstendi Masa Görseli */}
                    <div className="p-3.5 bg-white dark:bg-stone-900 rounded-2xl border-2 border-rose-500 shadow-xs flex flex-col justify-between h-32 animate-pulse">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-stone-900 dark:text-stone-100">Ana Salon 2</span>
                        <span className="text-[10px] font-black bg-rose-500 text-white px-2 py-0.5 rounded-full">HESAP İSTENDİ</span>
                      </div>
                      <div className="text-center">
                        <span className="text-base font-black text-rose-600 dark:text-rose-400">₺780,00</span>
                        <p className="text-[10px] text-rose-500 font-bold">Fiş Basıldı / Kasa Bekliyor</p>
                      </div>
                      <div className="text-[10px] font-semibold text-stone-500 text-center">
                        Kasa ödemeyi kapatabilir
                      </div>
                    </div>
                  </div>
                </div>

                {/* ADIM 2: MENÜ & KATEGORİ BUTONLARI */}
                <div className="p-4 sm:p-5 rounded-3xl bg-stone-50 dark:bg-stone-950/60 border border-stone-200 dark:border-stone-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-xl bg-amber-500 text-stone-950 font-black flex items-center justify-center text-xs">2</span>
                      <h4 className="font-extrabold text-sm sm:text-base text-stone-900 dark:text-stone-100">
                        Adım 2: Arama Çubuğu & Kategori Butonları
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold text-stone-500">Ürün Filtreleme</span>
                  </div>

                  <p className="text-xs text-stone-600 dark:text-stone-300">
                    Açılan ekranda sağ tarafta ürün arama ve hızlı kategori sekmeleri yer alır:
                  </p>

                  <div className="space-y-3">
                    {/* Search Input Mockup */}
                    <div className="p-2.5 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-700 flex items-center gap-2 shadow-2xs">
                      <Search className="w-4 h-4 text-stone-400 ml-1 shrink-0" />
                      <span className="text-xs text-stone-400 italic font-mono flex-1">
                        Ürün adı ara (Örn: Çay, Köfte, San Sebastian)...
                      </span>
                      <span className="text-[10px] bg-stone-100 dark:bg-stone-800 text-stone-500 px-2 py-0.5 rounded-md font-bold">
                        Hızlı Arama
                      </span>
                    </div>

                    {/* Category Buttons Mockup */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                      <div className="px-3.5 py-2 rounded-xl font-bold bg-amber-500 text-stone-950 shadow-xs flex items-center gap-1.5 shrink-0 cursor-default">
                        <span>Tüm Menü</span>
                        <span className="text-[10px] bg-stone-950 text-amber-400 px-1.5 py-0.2 rounded-full">38</span>
                      </div>
                      <div className="px-3.5 py-2 rounded-xl font-bold bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700 flex items-center gap-1.5 shrink-0 cursor-default">
                        <span>🥩 Izgaralar</span>
                      </div>
                      <div className="px-3.5 py-2 rounded-xl font-bold bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700 flex items-center gap-1.5 shrink-0 cursor-default">
                        <span>🍕 Pideler & Lahmacun</span>
                      </div>
                      <div className="px-3.5 py-2 rounded-xl font-bold bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700 flex items-center gap-1.5 shrink-0 cursor-default">
                        <span>☕ İçecekler</span>
                      </div>
                      <div className="px-3.5 py-2 rounded-xl font-bold bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700 flex items-center gap-1.5 shrink-0 cursor-default">
                        <span>🍰 Tatlılar</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ADIM 3: ÜRÜN KARTLARI, MİKTAR & NOT BUTONLARI */}
                <div className="p-4 sm:p-5 rounded-3xl bg-stone-50 dark:bg-stone-950/60 border border-stone-200 dark:border-stone-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-xl bg-amber-500 text-stone-950 font-black flex items-center justify-center text-xs">3</span>
                      <h4 className="font-extrabold text-sm sm:text-base text-stone-900 dark:text-stone-100">
                        Adım 3: Ürün Ekleme, Miktar Artırma ve Mutfak Notu
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold text-stone-500">Ürün Kartı & Sepet</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Sol: Menü Ürün Butonu Görseli */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
                        Menüdeki Ürün Kartı Görseli (Tıklandığında +1 ekler):
                      </span>
                      <div className="p-3.5 bg-white dark:bg-stone-800 rounded-2xl border border-amber-400 shadow-xs flex flex-col justify-between h-32 relative">
                        <div className="flex items-start justify-between">
                          <div>
                            <h5 className="font-extrabold text-sm text-stone-900 dark:text-stone-100">Meriç Kasap Köfte</h5>
                            <p className="text-[10px] text-stone-400">Garnitür, köz biber ve domates ile</p>
                          </div>
                          <span className="text-[10px] bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                            Stok: 48
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-stone-200 dark:border-stone-700">
                          <span className="text-base font-black text-amber-500">₺280,00</span>
                          <span className="text-[11px] font-bold bg-amber-500 text-stone-950 px-2 py-0.5 rounded-lg flex items-center gap-1">
                            <Plus className="w-3 h-3" /> Sepete Ekle
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Sağ: Sepetteki Kalem Kontrolleri */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
                        Sepetteki Ürün Satırı & Butonları:
                      </span>
                      <div className="p-3 bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 space-y-2 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-stone-900 dark:text-stone-100">Meriç Kasap Köfte</span>
                            <span className="text-[10px] bg-blue-500/10 text-blue-700 dark:text-blue-300 px-1.5 py-0.2 rounded font-bold border border-blue-500/20">
                              Yeni
                            </span>
                          </div>
                          <span className="font-black text-xs text-amber-500">₺560,00</span>
                        </div>

                        {/* Miktar ve Not Butonları Görseli */}
                        <div className="flex items-center justify-between pt-1 border-t border-stone-100 dark:border-stone-700/60">
                          <div className="flex items-center gap-1">
                            <button type="button" className="p-1 bg-stone-200 dark:bg-stone-700 rounded-md text-stone-800 dark:text-stone-200">
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center font-black text-xs text-stone-900 dark:text-stone-100">2</span>
                            <button type="button" className="p-1 bg-stone-200 dark:bg-stone-700 rounded-md text-stone-800 dark:text-stone-200">
                              <Plus className="w-3 h-3" />
                            </button>
                            <button type="button" className="p-1 bg-rose-500/15 text-rose-600 rounded-md ml-1" title="Ürünü İptal Et">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                            <MessageSquare className="w-3 h-3" />
                            <span>Not: Az acılı, soğansız</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ADIM 4: MÜŞTERİ TANIMI (ZORUNLU ALAN) */}
                <div className="p-4 sm:p-5 rounded-3xl bg-stone-50 dark:bg-stone-950/60 border border-stone-200 dark:border-stone-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-xl bg-amber-500 text-stone-950 font-black flex items-center justify-center text-xs">4</span>
                      <h4 className="font-extrabold text-sm sm:text-base text-stone-900 dark:text-stone-100">
                        Adım 4: Müşteri / Kişi Tanımı (Zorunlu Alan)
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold bg-rose-500 text-white px-2 py-0.5 rounded-full">Kritik Kural</span>
                  </div>

                  <p className="text-xs text-stone-600 dark:text-stone-300">
                    Masayı kaydetmeden, hesap istemeden veya ödeme almadan önce masadaki müşteriyi tanımlayan bir bilgi girilmelidir:
                  </p>

                  <div className="p-3 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="flex items-center gap-1 text-stone-800 dark:text-stone-200">
                        <User className="w-3.5 h-3.5 text-amber-500" />
                        MÜŞTERİ / KİŞİ TANIMI
                      </span>
                      <span className="text-[10px] bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded font-black border border-rose-500/20">
                        Zorunlu Alan
                      </span>
                    </div>
                    <div className="p-2 bg-stone-50 dark:bg-stone-800 rounded-xl border border-amber-500/50 text-xs font-semibold text-stone-900 dark:text-stone-100 flex items-center justify-between">
                      <span>Örn: Ahmet Bey (Belediye Ekibi) veya 4 Kişilik Aile</span>
                      <Check className="w-4 h-4 text-emerald-500" />
                    </div>
                    <p className="text-[10px] text-stone-400">
                      💡 Bu alan boş bırakılırsa sistem "Lütfen müşteri adı veya tanımı yazınız" uyarısı verir ve kaydı kilitler.
                    </p>
                  </div>
                </div>

                {/* ADIM 5, 6, 7: ANA EYLEM BUTONLARI REHBERİ (BİREBİR GÖRSELLER) */}
                <div className="p-4 sm:p-5 rounded-3xl bg-stone-50 dark:bg-stone-950/60 border border-stone-200 dark:border-stone-800 space-y-5">
                  <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-xl bg-amber-500 text-stone-950 font-black flex items-center justify-center text-xs">5</span>
                      <h4 className="font-extrabold text-sm sm:text-base text-stone-900 dark:text-stone-100">
                        Adım 5: Alt Eylem Butonları & Görevleri
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold text-stone-500">Adisyon Alt Barı</span>
                  </div>

                  <p className="text-xs text-stone-600 dark:text-stone-300">
                    Adisyon penceresinin altındaki butonların görevleri ve hangi roldeki personelin kullanacağı:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* BUTON 1: Kaydet & Mutfak */}
                    <div className="p-4 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-2.5 shadow-2xs">
                      <div className="text-[11px] font-bold text-stone-400 flex items-center justify-between">
                        <span>BUTON 1: SİPARİŞİ MUTFAĞA İLET</span>
                        <span className="bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 px-2 py-0.5 rounded font-mono text-[10px]">
                          Garson / Kasa
                        </span>
                      </div>
                      
                      {/* Gerçek Buton Görseli */}
                      <div className="py-2.5 px-3 bg-stone-900 dark:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-default">
                        <Send className="w-4 h-4 text-amber-400" />
                        <span>Kaydet & Mutfak</span>
                      </div>

                      <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                        <strong>Ne İşe Yarar?</strong> Yeni eklenen siparişleri aşçının ekranına (KDS) anında düşürür. Varsa mutfak yazıcısından fiş basar. Pencereyi kapatır ve masayı açık bırakır.
                      </p>
                    </div>

                    {/* BUTON 2: Garson Hesap İste / Fiş Bas */}
                    <div className="p-4 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-2.5 shadow-2xs">
                      <div className="text-[11px] font-bold text-stone-400 flex items-center justify-between">
                        <span>BUTON 2: GARSON HESAP İSTE / FİŞ BAS</span>
                        <span className="bg-amber-500/20 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded font-mono text-[10px]">
                          Garson Rolü
                        </span>
                      </div>
                      
                      {/* Gerçek Buton Görseli */}
                      <div className="py-2.5 px-3 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs cursor-default">
                        <Ticket className="w-4 h-4 text-stone-950" />
                        <span>Hesap İste / Fiş Bas</span>
                      </div>

                      <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                        <strong>Ne İşe Yarar?</strong> Müşteri hesap istediğinde basılır. Masanın adisyon fişini termal yazıcıdan çıkarır ve kasaya <em>"Masa 5 Hesap İstendi"</em> uyarısı gönderir.
                      </p>
                    </div>

                    {/* BUTON 3: Kasa Hesap Kapat */}
                    <div className="p-4 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-2.5 shadow-2xs">
                      <div className="text-[11px] font-bold text-stone-400 flex items-center justify-between">
                        <span>BUTON 3: KASA HESAP KAPATMA</span>
                        <span className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded font-mono text-[10px]">
                          Kasiyer / Yönetici
                        </span>
                      </div>
                      
                      {/* Gerçek Buton Görseli */}
                      <div className="py-2.5 px-3 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-default">
                        <CreditCard className="w-4 h-4" />
                        <span>Hesap Kapat (₺560,00)</span>
                      </div>

                      <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                        <strong>Ne İşe Yarar?</strong> Ödeme alma alt penceresini açar. Nakit veya Kredi Kartı seçimi yapılarak masa bakiyesi sıfırlanır ve masa boş duruma geçer.
                      </p>
                    </div>

                    {/* BUTON 4: Doğrudan Fiş Yazdırma Butonu */}
                    <div className="p-4 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-2.5 shadow-2xs">
                      <div className="text-[11px] font-bold text-stone-400 flex items-center justify-between">
                        <span>BUTON 4: DİYALOGSUZ FİŞ YAZDIRMA</span>
                        <span className="bg-amber-500/20 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded font-mono text-[10px]">
                          Doğrudan Kiosk
                        </span>
                      </div>
                      
                      {/* Gerçek Buton Görseli */}
                      <div className="py-2.5 px-3 bg-amber-500 text-stone-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs cursor-default">
                        <Printer className="w-4 h-4" />
                        <span>Direkt Yazdır & Kapat</span>
                      </div>

                      <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                        <strong>Ne İşe Yarar?</strong> Windows yazıcı seçim penceresini atlayarak fişi direkt <strong>POS-80C</strong> yazıcıya yollar ve pencereyi otomatik kapatır.
                      </p>
                    </div>

                    {/* BUTON 5: Masa Taşı */}
                    <div className="p-4 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-2.5 shadow-2xs">
                      <div className="text-[11px] font-bold text-stone-400 flex items-center justify-between">
                        <span>BUTON 5: MASA TAŞIMA / AKTARMA</span>
                        <span className="bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 px-2 py-0.5 rounded font-mono text-[10px]">
                          Tüm Roller
                        </span>
                      </div>
                      
                      {/* Gerçek Buton Görseli */}
                      <div className="py-2 px-3 bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-stone-200 dark:border-stone-700 cursor-default">
                        <ArrowRightLeft className="w-4 h-4 text-amber-500" />
                        <span>Masa Taşı</span>
                      </div>

                      <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                        <strong>Ne İşe Yarar?</strong> Müşteri başka bir masaya geçtiğinde basılır. Açılan listeden boş masa seçildiğinde tüm siparişler yeni masaya aktarılır.
                      </p>
                    </div>

                    {/* BUTON 6: Ödemeden Gitti (Borç Yaz) */}
                    <div className="p-4 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-2.5 shadow-2xs">
                      <div className="text-[11px] font-bold text-stone-400 flex items-center justify-between">
                        <span>BUTON 6: AÇIK HESAP / BORÇ KAYDI</span>
                        <span className="bg-rose-500/20 text-rose-700 dark:text-rose-400 px-2 py-0.5 rounded font-mono text-[10px]">
                          Güvenlik Özelliği
                        </span>
                      </div>
                      
                      {/* Gerçek Buton Görseli */}
                      <div className="py-2 px-3 bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-default">
                        <UserX className="w-4 h-4 text-rose-500" />
                        <span>Ödemeden Gitti (Borç Yaz)</span>
                      </div>

                      <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                        <strong>Ne İşe Yarar?</strong> Müşteri ödemeden ayrıldığında veya sonradan ödeyeceğini belirttiğinde hesabı masadan kaldırıp <em>"Tahsil Edilmemiş Borçlar"</em> listesine taşır.
                      </p>
                    </div>
                  </div>
                </div>

                {/* ADIM 6: ÖDEME ALMA PENCERESİ VE ÖDEME TÜRÜ BUTONLARI */}
                <div className="p-4 sm:p-5 rounded-3xl bg-stone-50 dark:bg-stone-950/60 border border-stone-200 dark:border-stone-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-xl bg-amber-500 text-stone-950 font-black flex items-center justify-center text-xs">6</span>
                      <h4 className="font-extrabold text-sm sm:text-base text-stone-900 dark:text-stone-100">
                        Adım 6: Ödeme Türü Seçimi Butonları
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold text-stone-500">Tahsilat Kartı</span>
                  </div>

                  <p className="text-xs text-stone-600 dark:text-stone-300">
                    Kasiyer <strong>"Hesap Kapat"</strong> butonuna bastığında karşısına çıkan tahsilat seçenekleri:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
                    {/* Kredi Kartı Butonu */}
                    <div className="p-3.5 rounded-2xl bg-amber-500 text-stone-950 font-black text-xs flex flex-col items-center gap-2 border-2 border-amber-500 shadow-md">
                      <CreditCard className="w-6 h-6" />
                      <span>Kredi Kartı (POS Slip)</span>
                      <span className="text-[10px] font-medium bg-stone-950/20 px-2 py-0.5 rounded-md">Banka POS cihazından çekildi</span>
                    </div>

                    {/* Nakit Butonu */}
                    <div className="p-3.5 rounded-2xl bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-bold text-xs flex flex-col items-center gap-2 border border-stone-300 dark:border-stone-700">
                      <Banknote className="w-6 h-6 text-emerald-500" />
                      <span>Nakit Para</span>
                      <span className="text-[10px] text-stone-400">Para üstü hesabı ile</span>
                    </div>
                  </div>

                  <div className="max-w-lg mx-auto pt-2">
                    <div className="py-3 bg-emerald-600 text-white rounded-xl text-xs font-bold text-center shadow-md">
                      ✓ Ödemeyi Onayla & Kapat (Masayı Boşaltır)
                    </div>
                  </div>
                </div>

                {/* ADIM 7: MUTFAK HAZIR ZİLİ */}
                <div className="p-4 sm:p-5 rounded-3xl bg-stone-50 dark:bg-stone-950/60 border border-stone-200 dark:border-stone-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-xl bg-amber-500 text-stone-950 font-black flex items-center justify-center text-xs">7</span>
                      <h4 className="font-extrabold text-sm sm:text-base text-stone-900 dark:text-stone-100">
                        Adım 7: Mutfak "Hazır & Servis" Zili
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">KDS & Garson</span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800">
                    <div className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 shrink-0">
                      <ChefHat className="w-4 h-4" />
                      <span>Hazır & Servise Ver</span>
                    </div>
                    <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                      Aşçı yemek hazır olduğunda bu butona basar. Salondaki garsonların ekranında anında <strong>"Masa 3 Hazır"</strong> uyarısı yanıp söner ve sesli mutfak zili çalar.
                    </p>
                  </div>
                </div>

                {/* ADIM 8: GÜNÜ KAPAT & Z-RAPORU MÜHÜRLEME */}
                <div className="p-4 sm:p-5 rounded-3xl bg-stone-50 dark:bg-stone-950/60 border border-stone-200 dark:border-stone-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-xl bg-amber-500 text-stone-950 font-black flex items-center justify-center text-xs">8</span>
                      <h4 className="font-extrabold text-sm sm:text-base text-stone-900 dark:text-stone-100">
                        Adım 8: Günü Kapat & Resmi Z-Raporu Mühürleme
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold bg-amber-500 text-stone-950 px-2 py-0.5 rounded-full">Yönetim / Kasa</span>
                  </div>

                  <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                    İşletme kapanışında dünkü ve bugünkü satışların birbirine karışmaması için gün sonu kapatılır. <strong>Günü Kapat</strong> butonuna basıldığında tüm satışlar mühürlenir, resmi Z-raporu arşivlenir ve tek kesintisiz sayfada termal yazıcıya basılır:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Günü Kapat Butonu Görseli */}
                    <div className="p-4 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-2">
                      <span className="text-[10px] font-bold text-stone-400 block">KAPANIŞ VE DEVİR BUTONU</span>
                      <div className="py-2.5 px-3 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs cursor-default">
                        <Lock className="w-4 h-4" />
                        <span>Günü Kapat</span>
                      </div>
                      <p className="text-[11px] text-stone-500 leading-tight">
                        Ciro ve tahsilatları mühürler, yeni güne 0 ₺ tertemiz başlangıç sağlar.
                      </p>
                    </div>

                    {/* Z-Raporu Termal Butonu Görseli */}
                    <div className="p-4 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-2">
                      <span className="text-[10px] font-bold text-stone-400 block">TERMAL FİŞ ÇIKTISI (TEK SAYFA)</span>
                      <div className="py-2.5 px-3 bg-purple-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs cursor-default">
                        <Printer className="w-4 h-4" />
                        <span>Z-Raporu (Termal)</span>
                      </div>
                      <p className="text-[11px] text-stone-500 leading-tight">
                        Kaç ürün olursa olsun sayfayı 3'e 4'e bölmeden tek uzun rulo fişte döker.
                      </p>
                    </div>

                    {/* Detaylı Rapor A4 Butonu Görseli */}
                    <div className="p-4 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-2">
                      <span className="text-[10px] font-bold text-stone-400 block">RESMİ A4 DÖKÜM ÇIKTISI</span>
                      <div className="py-2.5 px-3 bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs cursor-default">
                        <BarChart3 className="w-4 h-4" />
                        <span>Detaylı Rapor (A4)</span>
                      </div>
                      <p className="text-[11px] text-stone-500 leading-tight">
                        Kâr-zarar, personel ciroları ve vergi dökümleriyle standart A4 kağıt çıktısı.
                      </p>
                    </div>
                  </div>
                </div>

                {/* ADIM 9: GEÇMİŞ Z-RAPORLARI ARŞİVİ */}
                <div className="p-4 sm:p-5 rounded-3xl bg-stone-50 dark:bg-stone-950/60 border border-stone-200 dark:border-stone-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-xl bg-purple-600 text-white font-black flex items-center justify-center text-xs">9</span>
                      <h4 className="font-extrabold text-sm sm:text-base text-stone-900 dark:text-stone-100">
                        Adım 9: Geçmiş Z-Raporları Arşivi & Tekrar Yazdırma
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold bg-purple-500/20 text-purple-700 dark:text-purple-400 px-2 py-0.5 rounded-full">Arşiv Takibi</span>
                  </div>

                  <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                    Yönetim Paneli &gt; <strong>Raporlar</strong> sekmesindeki <strong>"Geçmiş Z-Raporları Arşivi"</strong> sekmesinden geçmişte kapatılan tüm günlerin Z-raporlarına tek tıkla ulaşabilirsiniz:
                  </p>

                  <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-stone-900 p-3 rounded-2xl border border-stone-200 dark:border-stone-800 text-xs">
                    <div className="px-3 py-1.5 bg-stone-100 dark:bg-stone-800 rounded-lg font-mono font-bold text-purple-600 dark:text-purple-400">
                      Z-0001
                    </div>
                    <span className="text-stone-400">22.09.2026 - 23:45</span>
                    <span className="font-black text-amber-500">₺14.250,00</span>
                    <div className="ml-auto flex items-center gap-1.5">
                      <span className="px-2 py-1 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 font-bold rounded flex items-center gap-1 text-[11px]">
                        <Eye className="w-3 h-3 text-amber-500" /> İncele
                      </span>
                      <span className="px-2 py-1 bg-purple-600 text-white font-bold rounded flex items-center gap-1 text-[11px]">
                        <Printer className="w-3 h-3" /> Termal Yazdır
                      </span>
                      <span className="px-2 py-1 bg-emerald-600 text-white font-bold rounded flex items-center gap-1 text-[11px]">
                        <BarChart3 className="w-3 h-3" /> A4 Yazdır
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* 1. ROLES & LOGIN */}
            {activeSection === 'roles' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="border-b border-stone-200 dark:border-stone-800 pb-3">
                  <h3 className="text-lg font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <Users className="w-5 h-5 text-amber-500" />
                    1. Sisteme Giriş & Kullanıcı PIN Kodları
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                    Uygulamaya her personel kendi 4 haneli PIN koduyla giriş yapar. Yapılan her sipariş, iptal ve tahsilat işlemi personelin adına kaydedilir.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-extrabold text-amber-700 dark:text-amber-400">Yönetici (Admin)</span>
                      <span className="text-[10px] font-mono bg-amber-500 text-stone-950 px-2 py-0.5 rounded-md font-bold">PIN: 1234</span>
                    </div>
                    <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-relaxed">
                      Tüm yetkilere sahiptir. Menü, fiyatlar, salon/masalar, stok, fatura, personel yetkileri ve Z raporlarına erişebilir.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-extrabold text-blue-700 dark:text-blue-400">Garson (Ahmet / Mehmet)</span>
                      <span className="text-[10px] font-mono bg-blue-500 text-white px-2 py-0.5 rounded-md font-bold">PIN: 5678 / 9012</span>
                    </div>
                    <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-relaxed">
                      Masaları açar, sipariş alır, mutfağa iletir, masa taşır. İptal ve indirim için yönetici onayı gerekir.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400">Mutfak Personeli (Ali Usta)</span>
                      <span className="text-[10px] font-mono bg-emerald-500 text-white px-2 py-0.5 rounded-md font-bold">PIN: 1111</span>
                    </div>
                    <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-relaxed">
                      Mutfak Ekranını (KDS) görür. Siparişleri hazırlar, "Hazır" butonuna basarak garsonlara sesli/ışıklı bildirim gönderir.
                    </p>
                  </div>
                </div>

                <div className="bg-stone-50 dark:bg-stone-950/60 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 text-xs space-y-2">
                  <h4 className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-500" />
                    Önemli Giriş Notları:
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-stone-600 dark:text-stone-300 leading-relaxed">
                    <li><strong>Zorunlu Güvenlik Girişi:</strong> Program her kapatıldığında veya yeniden açıldığında kullanıcı girişi zorunludur; son giriş yapan kullanıcı ile otomatik açılmaz. Her açılışta ilgili personel kendi profilini seçip 4 haneli PIN kodunu girmelidir.</li>
                    <li><strong>Kendi Şifresini / PIN Kodunu Değiştirme:</strong> Her personel (Garson, Mutfak Şefi, Yönetici), üst menüdeki adının yanındaki <strong>"Şifre Değiştir"</strong> butonuna veya profiline tıklayarak mevcut PIN kodunu girip yeni 4-6 haneli PIN belirleyebilir.</li>
                    <li>Vardiya değiştiğinde sağ üst köşedeki <strong>"Çıkış"</strong> butonuna basarak oturumu kapatın.</li>
                    <li>Tüm personellerin yetki ve şifre yönetimi ayrıca <strong>Yönetim Paneli &gt; Kullanıcılar</strong> sekmesinden de yapılabilir.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* 2. ORDERS & POS */}
            {activeSection === 'orders' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="border-b border-stone-200 dark:border-stone-800 pb-3">
                  <h3 className="text-lg font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-amber-500" />
                    2. Masa & Sipariş Yönetimi (POS)
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                    Masa seçimi, ürün ekleme, porsiyon/not belirleme ve mutfağa gönderme işlemleri.
                  </p>
                </div>

                <div className="space-y-3 text-xs leading-relaxed text-stone-700 dark:text-stone-300">
                  <div className="flex items-start gap-3 p-3.5 bg-stone-50 dark:bg-stone-950/60 rounded-2xl border border-stone-200 dark:border-stone-800">
                    <span className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 font-black flex items-center justify-center shrink-0">1</span>
                    <div>
                      <strong className="text-stone-900 dark:text-stone-100 block">Salon ve Masa Seçimi:</strong>
                      Üst sekmelerden salonu (Ana Salon, Teras, Bahçe, vb.) seçin. Masaya tıklayın. Boş masalar yeşil, dolu masalar sarı/turuncu çerçeveyle gösterilir.
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 bg-stone-50 dark:bg-stone-950/60 rounded-2xl border border-stone-200 dark:border-stone-800">
                    <span className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 font-black flex items-center justify-center shrink-0">2</span>
                    <div>
                      <strong className="text-stone-900 dark:text-stone-100 block">Ürün Ekleme & Porsiyon:</strong>
                      Sol veya üst kategorilerden ürün seçin. Ürüne her dokunduğunuzda adedi artar. Porsiyon (1, 1.5, Dürüm vb.) veya ürün notu ("Az acılı, soğansız") ekleyebilirsiniz.
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 bg-stone-50 dark:bg-stone-950/60 rounded-2xl border border-stone-200 dark:border-stone-800">
                    <span className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 font-black flex items-center justify-center shrink-0">3</span>
                    <div>
                      <strong className="text-stone-900 dark:text-stone-100 block">Siparişi Kaydet & Mutfağa Gönder:</strong>
                      Sağ alttaki <strong>"Kaydet & Mutfak"</strong> butonuna basıldığında sipariş mutfak ekranına düşer ve varsa mutfak termal yazıcısından fiş çıkar.
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 bg-stone-50 dark:bg-stone-950/60 rounded-2xl border border-stone-200 dark:border-stone-800">
                    <span className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 font-black flex items-center justify-center shrink-0">4</span>
                    <div>
                      <strong className="text-stone-900 dark:text-stone-100 block">Masa Taşıma:</strong>
                      Müşteri yer değiştirdiğinde adisyon penceresindeki <strong>"Masa Taşı"</strong> butonuna basıp hedef boş masayı seçin. Tüm siparişler taşınır.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. PAYMENT & CLOSING */}
            {activeSection === 'payment' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="border-b border-stone-200 dark:border-stone-800 pb-3">
                  <h3 className="text-lg font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-amber-500" />
                    3. Ödeme Alma & Hesap Kapatma
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                    Nakit, Kredi Kartı veya Parçalı Tahsilat adımları.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                    <h4 className="font-extrabold text-xs text-emerald-700 dark:text-emerald-400 mb-1">Nakit Ödeme</h4>
                    <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-relaxed">
                      Müşteri nakit verdiğinde "Nakit" seçin. Verilen para girildiğinde sistem para üstünü otomatik hesaplar.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                    <h4 className="font-extrabold text-xs text-blue-700 dark:text-blue-400 mb-1">Kredi Kartı / POS</h4>
                    <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-relaxed">
                      Banka POS cihazından slip alındıktan sonra "Kredi Kartı" butonuna basarak hesabı kapatın.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                    <h4 className="font-extrabold text-xs text-purple-700 dark:text-purple-400 mb-1">Parçalı / Bölüşümlü Ödeme</h4>
                    <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-relaxed">
                      Müşteriler hesabı bölüşmek istediğinde (örn: 200 TL Nakit, 300 TL Kredi Kartı) tutarları ayrı ayrı işleyebilirsiniz.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs space-y-1">
                  <strong className="text-amber-800 dark:text-amber-300 flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-amber-500" />
                    Masa Kapanışı:
                  </strong>
                  <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
                    Kalan bakiye 0.00 TL olduğunda <strong>"Hesabı Kapat & Masayı Boşalt"</strong> butonu aktifleşir. Tıklandığında masa anında boş durumuna geçer ve kasa cirosuna işlenir.
                  </p>
                </div>
              </div>
            )}

            {/* 4. GÜNÜ KAPATMA & Z-RAPORLARI (YENİ MALİ SİSTEM) */}
            {activeSection === 'zreport' && (
              <div className="space-y-5 animate-in fade-in">
                <div className="border-b border-stone-200 dark:border-stone-800 pb-3">
                  <h3 className="text-lg font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-amber-500" />
                    4. Günü Kapatma, Mali Mühürleme & Z-Raporu Sistemi
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                    Gün sonu cirosunu mühürleme, dünkü satışların bugüne karışmasını önleme ve geçmiş Z-raporları arşivi.
                  </p>
                </div>

                {/* Problem & Çözüm Bilgi Kartı */}
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-extrabold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Dünkü Ciro ile Bugünün Cirosunun Karışması Nasıl Engellenir?</span>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                    İşletme gece kapandığında veya vardiya bittiğinde Yönetici ya da Kasiyer <strong>"Günü Kapat"</strong> butonuna basmalıdır. Bu işlem yapıldığında:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-xs text-stone-600 dark:text-stone-300">
                    <li>O ana kadar kapanan tüm adisyonlar resmi bir <strong>Z-Raporu Numarası</strong> (Örn: Z-0001, Z-0002) ile mühürlenir.</li>
                    <li>Sistemdeki aktif ciro sıfırlanır; ertesi gün yapılan satışlar <strong>0 ₺</strong>'den başlayarak toplanır.</li>
                    <li>O an salonda oturmakta olan masalar varsa (devreden açık masalar), silinmez! Güvenle yeni güne devreder.</li>
                    <li><strong>Devreden Müşteri Borçları:</strong> Bu günden borçlu olanlar (ödemeden ayrılan / veresiye adisyonlar) tahsil edilene kadar diğer günlere borçlu olarak devredilmeye devam eder; asla silinmez veya ciroya dahil edilmez. Müşteri borcunu ödediğinde o anın gününün kasasına ve cirosuna girer.</li>
                    <li>Resmi Z-raporu termal yazıcıdan <strong>tek kesintisiz rulo fiş</strong> olarak otomatik yazdırılır.</li>
                  </ul>
                </div>

                {/* Butonlar & Özellikler Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Kart 1: Günü Kapat Butonu */}
                  <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-950/60 border border-stone-200 dark:border-stone-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                        <Lock className="w-4 h-4 text-amber-500" />
                        Günü Kapat Butonu
                      </span>
                      <span className="text-[10px] bg-amber-500 text-stone-950 font-black px-2 py-0.5 rounded-full">Kritik</span>
                    </div>
                    <div className="py-2.5 px-3 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs cursor-default">
                      <Lock className="w-4 h-4" />
                      <span>Günü Kapat & Mühürle</span>
                    </div>
                    <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                      Yönetim Paneli &gt; <strong>Raporlar</strong> sekmesinde sağ üstte ve filtre barında yer alır. Tıklandığında onay penceresi açılır ve mühürlenecek nakit/kredi kartı cirosunu özetler.
                    </p>
                  </div>

                  {/* Kart 2: Tek Kesintisiz Sayfa Termal Yazdırma */}
                  <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-950/60 border border-stone-200 dark:border-stone-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                        <Printer className="w-4 h-4 text-purple-500" />
                        Kesintisiz Tek Sayfa Termal Çıktı
                      </span>
                      <span className="text-[10px] bg-purple-500/20 text-purple-700 dark:text-purple-400 font-bold px-2 py-0.5 rounded-full">POS Rulo</span>
                    </div>
                    <div className="py-2.5 px-3 bg-purple-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs cursor-default">
                      <Printer className="w-4 h-4" />
                      <span>Z-Raporu (Termal)</span>
                    </div>
                    <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                      Menüde ister 5 ister 50 çeşit satılan ürün olsun, termal rulo kağıt 3'e veya 4'e bölünmez! Fiş baştan sona tek parça halinde kesintisiz yazdırılır.
                    </p>
                  </div>

                  {/* Kart 3: Geçmiş Z-Raporları Arşivi */}
                  <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-950/60 border border-stone-200 dark:border-stone-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                        <Archive className="w-4 h-4 text-sky-500" />
                        Geçmiş Z-Raporları Arşivi
                      </span>
                      <span className="text-[10px] bg-sky-500/20 text-sky-700 dark:text-sky-400 font-bold px-2 py-0.5 rounded-full">Tarihçe</span>
                    </div>
                    <div className="py-2 px-3 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-stone-200 dark:border-stone-700 cursor-default">
                      <Archive className="w-4 h-4 text-purple-500" />
                      <span>Geçmiş Z-Raporları Arşivi (Sekme)</span>
                    </div>
                    <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                      Raporlar sekmesinin altındaki "Geçmiş Z-Raporları Arşivi" butonu ile geçmiş günlerin mühürlü kayıtlarına ulaşabilir, dünün veya geçen haftanın Z-raporunu inceleyip yeniden yazdırabilirsiniz.
                    </p>
                  </div>

                  {/* Kart 4: Devreden Borçlar (Tahsil Edilene Kadar Devam Eden Borçlar) */}
                  <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-950/60 border border-rose-200 dark:border-rose-900/40 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                        <UserX className="w-4 h-4 text-rose-500" />
                        Devreden Müşteri Borçları (Veresiye)
                      </span>
                      <span className="text-[10px] bg-rose-500 text-white font-black px-2 py-0.5 rounded-full">Önemli</span>
                    </div>
                    <div className="py-2 px-3 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 rounded-xl text-xs font-bold flex items-center justify-between border border-rose-200 dark:border-rose-900/50 cursor-default">
                      <span className="flex items-center gap-1.5">
                        <UserX className="w-4 h-4 text-rose-600" />
                        <span>Devreden Borçlar Listesi</span>
                      </span>
                      <span className="text-[10px] bg-rose-600 text-white px-2 py-0.5 rounded-full">Otomatik Devir</span>
                    </div>
                    <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                      Ödemeden ayrılan müşteriler "Ödemeden Gitti (Borç Yaz)" ile işaretlenir. Gün kapatıldığında bu borçlar silinmez, <strong>tahsil edilene kadar sonraki günlere borçlu olarak devredilir</strong>. Z-Raporunda devreden borçlular ayrı döküm olarak listelenir.
                    </p>
                  </div>

                  {/* Kart 5: Tarih & Dönem Filtreleri */}
                  <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-950/60 border border-stone-200 dark:border-stone-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-emerald-500" />
                        Aktif Gün vs Özel Tarih Seçimi
                      </span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full">Filtreleme</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs overflow-x-auto pb-1">
                      <span className="px-2.5 py-1 bg-amber-500 text-stone-950 font-bold rounded-lg text-[11px]">Aktif Açık Dönem</span>
                      <span className="px-2.5 py-1 bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold rounded-lg text-[11px]">Bugün</span>
                      <span className="px-2.5 py-1 bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold rounded-lg text-[11px]">Dün</span>
                    </div>
                    <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                      "Aktif Açık Dönem" seçildiğinde sadece son gün kapanışından sonraki canlı satışlar gösterilir. Arşivdeki raporlar ise mühürlendikleri anki durumuyla korunur.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 5. DIRECT PRINTING */}
            {activeSection === 'printing' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="border-b border-stone-200 dark:border-stone-800 pb-3">
                  <h3 className="text-lg font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <Printer className="w-5 h-5 text-amber-500" />
                    5. Doğrudan (Sessiz) Termal Fiş Yazdırma
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                    Windows yazıcı seçim penceresi açılmadan tek tıkla doğrudan fiş çıkarma standardı.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-extrabold text-xs">
                    <Zap className="w-4 h-4 text-emerald-500" />
                    <span>Yazıcı Seçim Penceresi Olmadan Fiş Çıkarma Nasıl Çalışır?</span>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                    Adisyon ekranında <strong>"Direkt Yazdır & Kapat"</strong> butonuna bastığınızda, sistem Windows yazıcı sorma penceresini göstermez. Fişi doğrudan işletmenin termal fiş yazıcısına (varsayılan: <strong>POS-80C</strong>) gönderir ve adisyon penceresini kapatır.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-extrabold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-amber-500" />
                    <span>Ürün Sayısı Çok Olduğunda Tek Seferde Kesintisiz Yazdırma</span>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                    İster <strong>Adisyon Fişi</strong> olsun ister gün sonu <strong>Z-Raporu</strong>, içerisindeki ürün sayısı ne kadar çok olursa olsun (10, 20, 40+ ürün), sistem çıktıyı 3'e veya 4'e bölmez. Bütün satırlar, toplamlar ve resmi mühür bilgileri <strong>tek seferde ve tek kesintisiz rulo fiş</strong> olarak yazdırılır.
                  </p>
                </div>

                <div className="space-y-2 text-xs text-stone-700 dark:text-stone-300">
                  <h4 className="font-bold text-stone-900 dark:text-stone-100">Ayarlar ve Sorun Giderme:</h4>
                  <ul className="list-disc list-inside space-y-1.5 leading-relaxed">
                    <li><strong>Hedef Yazıcı Değiştirme:</strong> Yönetim Paneli &gt; Donanım &gt; Yazıcılar sekmesinden Windows'ta takılı yazıcı adını (örn. POS-80C) seçebilirsiniz.</li>
                    <li><strong>Test Butonu:</strong> "Diyalogsuz Test Yazdır" butonuyla yazıcının hazır olduğunu anında test edebilirsiniz.</li>
                    <li><strong>Kasa Kısayolu:</strong> Masaüstündeki <code>baslat.bat</code> veya <code>kasa-kiosk-yazici-baslat.bat</code> dosyası tam sessiz yazdırma moduyla çalışır.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* 6. KITCHEN DISPLAY */}
            {activeSection === 'kitchen' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="border-b border-stone-200 dark:border-stone-800 pb-3">
                  <h3 className="text-lg font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <ChefHat className="w-5 h-5 text-amber-500" />
                    6. Mutfak Ekranı (KDS) & Garson Zil Sistemi
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                    Aşçı ve mutfak personelinin sipariş hazırlama ve garson çağırma akışı.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 bg-stone-50 dark:bg-stone-950/60 rounded-2xl border border-stone-200 dark:border-stone-800">
                    <h4 className="font-bold text-xs text-stone-900 dark:text-stone-100 mb-1">
                      1. Sipariş Gelişi:
                    </h4>
                    <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                      Garson siparişi onayladığında mutfak ekranına yeni bir kart düşer. Kart üzerinde masa adı, saat, garson adı ve ürün notları ("az pişmiş", "soğansız") görünür.
                    </p>
                  </div>

                  <div className="p-4 bg-stone-50 dark:bg-stone-950/60 rounded-2xl border border-stone-200 dark:border-stone-800">
                    <h4 className="font-bold text-xs text-stone-900 dark:text-stone-100 mb-1">
                      2. "Hazır" Butonu & Garson Çağrısı:
                    </h4>
                    <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                      Yemek hazır olduğunda mutfak personeli <strong>"Hazır & Servise Ver"</strong> butonuna basar. Garsonların tabletinde ve üst barda anında <strong>sesli zil çalar</strong> ve masa adı yeşil yanıp söner.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 7. ADMIN & MENU */}
            {activeSection === 'admin' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="border-b border-stone-200 dark:border-stone-800 pb-3">
                  <h3 className="text-lg font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-amber-500" />
                    7. Yönetim Paneli, Menü & Fiyat Güncelleme
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                    Fiyat değiştirme, yeni ürün/kategori tanımlama ve raporlama.
                  </p>
                </div>

                <div className="space-y-3 text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                  <div className="p-3.5 bg-stone-50 dark:bg-stone-950/60 rounded-2xl border border-stone-200 dark:border-stone-800">
                    <strong className="text-stone-900 dark:text-stone-100 block mb-1">Ürün ve Fiyat Değişikliği:</strong>
                    Yönetim Paneli &gt; <strong>Menü Yönetimi</strong> sekmesinden herhangi bir ürünün fiyatını, adını veya kategorisini anında güncelleyebilirsiniz. Değişiklik anında tüm garson tabletlerine yansır.
                  </div>

                  <div className="p-3.5 bg-stone-50 dark:bg-stone-950/60 rounded-2xl border border-stone-200 dark:border-stone-800">
                    <strong className="text-stone-900 dark:text-stone-100 block mb-1">Salon ve Masa Yönetimi:</strong>
                    Yönetim Paneli &gt; <strong>Salonlar & Masalar</strong> sekmesinden yeni masalar ekleyebilir, masa isimlerini düzenleyebilirsiniz. Açık adisyonu olan masalar güvenliğiniz için silinemez.
                  </div>

                  <div className="p-3.5 bg-stone-50 dark:bg-stone-950/60 rounded-2xl border border-stone-200 dark:border-stone-800">
                    <strong className="text-stone-900 dark:text-stone-100 block mb-1">Gün Sonu (Z Raporu):</strong>
                    Yönetim Paneli &gt; <strong>Raporlar</strong> sekmesinden günlük nakit, kredi kartı, cari toplamları ve en çok satan ürünleri listeleyebilir, Z raporu çıktısı alabilirsiniz.
                  </div>
                </div>
              </div>
            )}

            {/* 8. STOCK & INVOICES */}
            {activeSection === 'stock' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="border-b border-stone-200 dark:border-stone-800 pb-3">
                  <h3 className="text-lg font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-amber-500" />
                    8. Stok, Mal Alım Faturaları & Reçeteler
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                    Hammadde girişleri, işletme giderleri ve otomatik stok düşümü.
                  </p>
                </div>

                <div className="space-y-3 text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                  <div className="p-3.5 bg-stone-50 dark:bg-stone-950/60 rounded-2xl border border-stone-200 dark:border-stone-800">
                    <strong className="text-stone-900 dark:text-stone-100 block mb-1">Fiş / Fatura Ekleme (Hızlı Buton):</strong>
                    Üst bardaki <strong>"+ Fiş / Fatura Ekle"</strong> butonuna basarak toptancıdan gelen et, sebze, içecek irsaliyelerini veya elektrik, su, kira gibi işletme giderlerini kolayca işleyebilirsiniz.
                  </div>

                  <div className="p-3.5 bg-stone-50 dark:bg-stone-950/60 rounded-2xl border border-stone-200 dark:border-stone-800">
                    <strong className="text-stone-900 dark:text-stone-100 block mb-1">Reçete & Otomatik Stok Düşüşü:</strong>
                    Köfte porsiyon satıldığında arka plandaki reçeteye göre kıyma ve ekmek gramajı stoktan otomatik düşer. Stok kritik eşiğin altına indiğinde üst barda kırmızı uyarı zili yanar.
                  </div>
                </div>
              </div>
            )}

            {/* 9. TABLET & NETWORK */}
            {activeSection === 'network' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="border-b border-stone-200 dark:border-stone-800 pb-3">
                  <h3 className="text-lg font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <Database className="w-5 h-5 text-amber-500" />
                    9. Tablet, Telefon & Çoklu Cihaz Kurulumu
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                    Garsonların kendi telefonlarından veya tabletlerden aynı tesise bağlanması.
                  </p>
                </div>

                <div className="p-4 bg-stone-50 dark:bg-stone-950/60 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-2 text-xs">
                  <strong className="text-stone-900 dark:text-stone-100 block font-bold">Nasıl Bağlanılır?</strong>
                  <ol className="list-decimal list-inside space-y-1 text-stone-600 dark:text-stone-300 leading-relaxed">
                    <li>Kasa bilgisayarı ile garson tabletleri aynı Wi-Fi ağına bağlı olmalıdır.</li>
                    <li>Yönetim Paneli &gt; <strong>Donanım / Ağ Ayarları</strong> sekmesine girin.</li>
                    <li>Ekranda çıkan <strong>Yerel Ağ QR Kodunu</strong> garsonun tablet veya telefonuna okutun (veya IP adresini tarayıcıya yazın).</li>
                    <li>Garson kendi PIN kodunu girerek hemen sipariş almaya başlayabilir. Tüm veriler kasa ile anında senkronize olur.</li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-stone-50 dark:bg-stone-950 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500 shrink-0">
          <span>Meriç Belediyesi Sosyal Tesisleri Otomasyon Sistemi</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-900 hover:bg-stone-800 dark:bg-stone-800 dark:hover:bg-stone-700 text-white font-bold rounded-xl transition-colors cursor-pointer"
          >
            Anladım, Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
