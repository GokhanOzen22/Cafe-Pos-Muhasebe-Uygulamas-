import React, { useState, useRef, useEffect } from 'react';
import { UserRole, RestaurantSettings, AppUser, KitchenNotification } from '../types';
import { Utensils, ChefHat, ShieldCheck, Clock, AlertTriangle, RefreshCw, Smartphone, LogOut, User, FilePlus, Bell, Check, ArrowRight, Volume2, Trash2, BookOpen, KeyRound } from 'lucide-react';
import { formatCurrency, getElapsedTimeMinutes } from '../utils/formatters';
import { playKitchenReadyChime } from '../utils/audioAlert';

interface HeaderProps {
  activeRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  settings: RestaurantSettings;
  occupiedTableCount: number;
  totalTableCount: number;
  openOrdersTotal: number;
  lowStockCount: number;
  onResetData: () => void;
  activeTab: 'tables' | 'kitchen' | 'admin';
  onTabChange: (tab: 'tables' | 'kitchen' | 'admin') => void;
  currentUser: AppUser | null;
  onLogout: () => void;
  onOpenChangePasswordModal?: () => void;
  onOpenCriticalStockModal?: () => void;
  onOpenAddInvoiceModal?: () => void;
  onOpenUserManualModal?: () => void;
  notifications?: KitchenNotification[];
  onMarkNotificationRead?: (id?: string, all?: boolean) => void;
  onClearNotifications?: () => void;
  onDeleteNotification?: (id: string) => void;
  onSelectTableById?: (tableId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeRole,
  onRoleChange,
  settings,
  occupiedTableCount,
  totalTableCount,
  openOrdersTotal,
  lowStockCount,
  onResetData,
  activeTab,
  onTabChange,
  currentUser,
  onLogout,
  onOpenChangePasswordModal,
  onOpenCriticalStockModal,
  onOpenAddInvoiceModal,
  onOpenUserManualModal,
  notifications = [],
  onMarkNotificationRead,
  onClearNotifications,
  onDeleteNotification,
  onSelectTableById,
}) => {
  const [currentTime, setCurrentTime] = React.useState<string>('');
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifDropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  React.useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  // Determine authorized tabs based on user permissions
  const canAccessTables = currentUser
    ? currentUser.permissions.canTakeOrder || currentUser.role === 'admin' || currentUser.role === 'pos'
    : true;

  const canAccessKitchen = currentUser
    ? currentUser.role === 'kitchen' || currentUser.permissions.canManageStock || currentUser.role === 'admin'
    : true;

  const canAccessAdmin = currentUser
    ? currentUser.role === 'admin' ||
      currentUser.permissions.canViewReports ||
      currentUser.permissions.canManageMenu ||
      currentUser.permissions.canManageStock ||
      currentUser.permissions.canManageUsers ||
      !!currentUser.permissions.canManageInvoices
    : true;

  const canManageInvoices = currentUser
    ? currentUser.role === 'admin' || currentUser.isSystemAdmin || !!currentUser.permissions?.canManageInvoices
    : true;

  return (
    <header className="bg-stone-900 text-stone-100 border-b border-stone-800 sticky top-0 z-30 shadow-lg w-full max-w-full">
      {/* Top Prominent Municipal Banner */}
      <div className="bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 border-b border-stone-800/80 py-1.5 px-4 text-center">
        <h1 className="font-black uppercase tracking-wider text-amber-400 text-sm sm:text-base md:text-lg text-center mx-auto select-none drop-shadow-sm">
          {settings.name || 'Meriç Belediyesi Sosyal Tesisleri'}
        </h1>
      </div>

      <div className="w-full max-w-[1720px] mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between min-h-13 sm:min-h-14 py-1.5 gap-2 lg:gap-3">
          
          {/* Logo Badge (Kompakt ve Orantılı) */}
          <div className="flex items-center shrink-0">
            {(settings.logoUrl || '/logo.svg') ? (
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white shadow-md p-1 overflow-hidden shrink-0 flex items-center justify-center border-2 border-amber-500 ring-2 ring-amber-500/20 transition-transform hover:scale-105">
                <img 
                  src={settings.logoUrl || '/logo.svg'} 
                  alt={settings.name || 'Meriç Belediyesi'} 
                  className="w-full h-full object-contain" 
                />
              </div>
            ) : (
              <div className="bg-amber-500 text-stone-950 w-10 h-10 sm:w-12 sm:h-12 rounded-xl font-bold shadow-md shadow-amber-500/20 flex items-center justify-center shrink-0 border-2 border-amber-400">
                <Utensils className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            )}
          </div>

          {/* Center Navigation Tabs (Otomatik Ölçeklenen) */}
          <div className="hidden md:flex items-center bg-stone-800/90 p-1 rounded-xl border border-stone-700/60 shrink-0">
            {canAccessTables && (
              <button
                id="nav-tables-btn"
                onClick={() => { onTabChange('tables'); onRoleChange('pos'); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === 'tables'
                    ? 'bg-amber-500 text-stone-950 shadow-sm font-bold'
                    : 'text-stone-300 hover:text-white hover:bg-stone-700/50'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xl:inline">Masa & Adisyon (POS)</span>
                <span className="xl:hidden">Masa POS</span>
              </button>
            )}

            {canAccessKitchen && (
              <button
                id="nav-kitchen-btn"
                onClick={() => { onTabChange('kitchen'); onRoleChange('kitchen'); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === 'kitchen'
                    ? 'bg-amber-500 text-stone-950 shadow-sm font-bold'
                    : 'text-stone-300 hover:text-white hover:bg-stone-700/50'
                }`}
              >
                <ChefHat className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xl:inline">Mutfak Ekranı</span>
                <span className="xl:hidden">Mutfak</span>
              </button>
            )}

            {canAccessAdmin && (
              <button
                id="nav-admin-btn"
                onClick={() => { onTabChange('admin'); onRoleChange('admin'); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === 'admin'
                    ? 'bg-amber-500 text-stone-950 shadow-sm font-bold'
                    : 'text-stone-300 hover:text-white hover:bg-stone-700/50'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xl:inline">Yönetim Paneli</span>
                <span className="xl:hidden">Yönetim</span>
              </button>
            )}
          </div>

          {/* Quick Stats, Actions & User Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Quick Fiş & Fatura Ekle Button */}
            {canManageInvoices && (
              <button
                type="button"
                onClick={onOpenAddInvoiceModal}
                title="Gelen Mal Alım Fişi veya İşletme Faturası Ekle"
                className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-stone-950 border border-amber-500/40 transition-all cursor-pointer shadow-xs shrink-0"
              >
                <FilePlus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
                <span className="hidden 2xl:inline">Fiş / Fatura Ekle</span>
                <span className="hidden sm:inline 2xl:hidden">Fiş Ekle</span>
              </button>
            )}

            {/* Quick Kullanım Kılavuzu Button */}
            {onOpenUserManualModal && (
              <button
                type="button"
                onClick={onOpenUserManualModal}
                title="Kullanım Kitapçığı & Kılavuz"
                className="p-1.5 sm:p-2 text-amber-400 hover:text-stone-950 bg-stone-800 hover:bg-amber-500 rounded-xl border border-amber-500/30 transition-colors cursor-pointer shrink-0"
              >
                <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            )}

            {/* Kitchen Ready Notifications Bell */}
            <div className="relative shrink-0" ref={notifDropdownRef}>
              <button
                type="button"
                onClick={() => setIsNotifOpen((prev) => !prev)}
                title="Mutfak Hazır Bildirimleri"
                className={`relative p-2 rounded-xl border transition-all flex items-center justify-center cursor-pointer ${
                  unreadCount > 0
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/30'
                    : 'bg-stone-800 border-stone-700/70 text-stone-400 hover:text-stone-200 hover:bg-stone-700/80'
                }`}
              >
                <Bell className={`w-4 h-4 ${unreadCount > 0 ? 'animate-bounce text-emerald-400' : ''}`} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-emerald-500 text-stone-950 font-black text-[10px] rounded-full flex items-center justify-center shadow-md animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Dropdown Menu */}
              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-stone-900 border border-stone-700/80 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  {/* Dropdown Header */}
                  <div className="p-3.5 bg-stone-800/90 border-b border-stone-700/70 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-emerald-400" />
                      <span className="font-bold text-xs text-stone-100">Mutfak Bildirimleri</span>
                      {unreadCount > 0 && (
                        <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                          {unreadCount} Yeni
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => playKitchenReadyChime()}
                        title="Zil Sesini Çal"
                        className="p-1.5 text-stone-400 hover:text-amber-400 hover:bg-stone-700/60 rounded-lg transition-colors cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      {notifications.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            if (onClearNotifications) {
                              onClearNotifications();
                            } else {
                              onMarkNotificationRead?.(undefined, true);
                            }
                          }}
                          title="Tüm Bildirimleri Temizle"
                          className="px-2 py-1 text-stone-300 hover:text-white bg-stone-700/70 hover:bg-rose-600/80 rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1.5 font-bold border border-stone-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Temizle</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Dropdown List */}
                  <div className="max-h-80 overflow-y-auto divide-y divide-stone-800/60 p-2 space-y-1">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-stone-400">
                        <Check className="w-8 h-8 text-emerald-500/40 mx-auto mb-2" />
                        <p className="text-xs font-medium text-stone-300">Bekleyen mutfak bildirimi yok</p>
                        <p className="text-[11px] text-stone-500 mt-0.5">Mutfak ürünleri hazır olduğunda burada listelenir</p>
                      </div>
                    ) : (
                      notifications.map((notif) => {
                        const elapsed = getElapsedTimeMinutes(notif.timestamp);
                        return (
                          <div
                            key={notif.id}
                            className={`p-2.5 rounded-xl transition-all ${
                              notif.read
                                ? 'bg-stone-900/40 opacity-70 hover:opacity-100'
                                : 'bg-stone-800/90 border border-emerald-500/30 shadow-xs'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-extrabold text-xs text-stone-100">
                                    {notif.tableName}
                                  </span>
                                  {notif.zoneName && (
                                    <span className="text-[10px] text-stone-400">
                                      ({notif.zoneName})
                                    </span>
                                  )}
                                  {!notif.read && (
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                                  )}
                                </div>
                                {notif.waiterName && (
                                  <span className="text-[10px] text-amber-400/90 block">
                                    Garson: {notif.waiterName}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="text-[10px] font-mono text-stone-400">
                                  {elapsed <= 1 ? 'Şimdi' : `${elapsed} dk önce`}
                                </span>
                                {onDeleteNotification && (
                                  <button
                                    type="button"
                                    onClick={() => onDeleteNotification(notif.id)}
                                    title="Bu bildirimi sil"
                                    className="p-1 text-stone-500 hover:text-rose-400 hover:bg-stone-700/50 rounded transition-colors"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Items preview */}
                            <div className="mt-1.5 space-y-0.5">
                              {notif.items.map((it, idx) => (
                                <div key={idx} className="flex items-center justify-between text-[11px] text-stone-300">
                                  <span className="font-medium truncate">
                                    <strong className="text-emerald-400 mr-1">{it.quantity}x</strong>
                                    {it.name}
                                  </span>
                                  {it.note && (
                                    <span className="text-[9px] text-amber-300 bg-amber-950/50 px-1 rounded truncate max-w-[80px]">
                                      {it.note}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>

                            {/* Actions */}
                            <div className="mt-2.5 pt-2 border-t border-stone-700/50 flex items-center justify-between gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  onMarkNotificationRead?.(notif.id);
                                  onSelectTableById?.(notif.tableId);
                                  setIsNotifOpen(false);
                                }}
                                className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 hover:underline cursor-pointer"
                              >
                                <span>Masaya Git</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>

                              <div className="flex items-center gap-1.5">
                                {!notif.read && (
                                  <button
                                    type="button"
                                    onClick={() => onMarkNotificationRead?.(notif.id)}
                                    className="text-[10px] text-stone-400 hover:text-stone-200 bg-stone-700/50 hover:bg-stone-700 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                                  >
                                    Okundu Yap
                                  </button>
                                )}
                                {onDeleteNotification && (
                                  <button
                                    type="button"
                                    onClick={() => onDeleteNotification(notif.id)}
                                    className="text-[10px] text-rose-400/80 hover:text-rose-300 bg-stone-800 hover:bg-rose-950/40 border border-rose-900/40 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                                  >
                                    Sil
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Live Clock (Hidden on small/medium screens to prevent overflow) */}
            <div className="hidden xl:flex items-center justify-center gap-1.5 text-[11px] text-stone-300 bg-stone-800 px-2.5 py-1.5 rounded-xl border border-stone-700/60 leading-none shrink-0 font-mono">
              <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{currentTime}</span>
            </div>

            {/* Low Stock Badge - Clickable if critical stock exists */}
            {lowStockCount > 0 && (
              <button
                onClick={onOpenCriticalStockModal}
                title="Kritik stoktaki ürün ve hammaddelerin listesini gör"
                className="flex items-center justify-center gap-1 text-[11px] font-bold bg-rose-900/70 hover:bg-rose-800 text-rose-200 hover:text-white px-2.5 py-1.5 rounded-xl border border-rose-600/60 transition-all cursor-pointer whitespace-nowrap animate-pulse leading-none shrink-0"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className="hidden sm:inline">{lowStockCount} Kritik</span>
                <span className="sm:hidden">{lowStockCount}</span>
              </button>
            )}

            {/* Active Bills Total (Shown on wider desktop) */}
            <div className="hidden 2xl:flex flex-col items-end leading-tight shrink-0 pl-1 border-l border-stone-800">
              <span className="text-[9px] text-stone-400 uppercase tracking-wider font-semibold">Açık Masalar</span>
              <span className="text-xs font-bold text-amber-400 font-mono mt-0.5">
                {occupiedTableCount}/{totalTableCount} ({formatCurrency(openOrdersTotal, settings.currencySymbol)})
              </span>
            </div>

            {/* Logged in User Profile Info, Change Password & Logout Button */}
            {currentUser && (
              <div className="flex items-center gap-1 sm:gap-1.5 pl-1.5 sm:pl-2 border-l border-stone-800 shrink-0">
                {/* Clickable Profile Badge */}
                <button
                  type="button"
                  onClick={onOpenChangePasswordModal}
                  title="Kendi Şifrenizi / PIN Kodunuzu Değiştirin"
                  className="flex items-center gap-1.5 bg-stone-800/90 hover:bg-stone-750 hover:border-amber-500/60 px-2 sm:px-2.5 py-1 rounded-xl border border-stone-700/70 transition-all cursor-pointer group text-left shrink-0"
                >
                  <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center group-hover:bg-amber-500 group-hover:text-stone-950 transition-colors shrink-0">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="text-left hidden sm:block">
                    <span className="text-xs font-bold text-stone-100 block leading-tight truncate max-w-[75px] md:max-w-[100px] lg:max-w-[120px]">
                      {currentUser.name}
                    </span>
                    <span className="text-[10px] text-amber-400 font-mono block leading-tight">
                      {currentUser.role === 'admin' ? 'Yönetici' : currentUser.role === 'kitchen' ? 'Mutfak' : 'Garson'}
                    </span>
                  </div>
                  <KeyRound className="w-3 h-3 text-stone-400 group-hover:text-amber-400 transition-colors ml-0.5 shrink-0" />
                </button>

                {/* Dedicated Change Password Button */}
                {onOpenChangePasswordModal && (
                  <button
                    type="button"
                    onClick={onOpenChangePasswordModal}
                    title="Kendi Şifrenizi / PIN Kodunuzu Değiştirin"
                    className="hidden 2xl:flex items-center gap-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 px-2 py-1.5 rounded-xl border border-amber-500/30 text-xs font-bold transition-all cursor-pointer shrink-0"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Şifre</span>
                  </button>
                )}

                {/* Logout Button */}
                <button
                  onClick={onLogout}
                  title="Çıkış Yap (Oturumu Kapat)"
                  className="flex items-center gap-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-2 sm:px-2.5 py-1.5 rounded-xl border border-red-500/30 text-xs font-bold transition-all cursor-pointer shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Çıkış</span>
                </button>
              </div>
            )}

            {/* Reset Data Button */}
            <button
              id="reset-demo-data-btn"
              onClick={onResetData}
              title="Örnek verileri sıfırla"
              className="p-1.5 sm:p-2 text-stone-400 hover:text-stone-200 bg-stone-800 hover:bg-stone-700 rounded-xl border border-stone-700/70 transition-colors shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Submenu Tabs */}
      <div className="md:hidden flex items-center justify-around py-2 border-t border-stone-800 text-xs">
        {canAccessTables && (
          <button
            onClick={() => { onTabChange('tables'); onRoleChange('pos'); }}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium ${
              activeTab === 'tables' ? 'bg-amber-500 text-stone-950' : 'text-stone-300'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            Masa POS
          </button>
        )}
        {canAccessKitchen && (
          <button
            onClick={() => { onTabChange('kitchen'); onRoleChange('kitchen'); }}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium ${
              activeTab === 'kitchen' ? 'bg-amber-500 text-stone-950' : 'text-stone-300'
            }`}
          >
            <ChefHat className="w-3.5 h-3.5" />
            Mutfak
          </button>
        )}
        {canAccessAdmin && (
          <button
            onClick={() => { onTabChange('admin'); onRoleChange('admin'); }}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium ${
              activeTab === 'admin' ? 'bg-amber-500 text-stone-950' : 'text-stone-300'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Yönetim
          </button>
        )}
      </div>
    </header>
  );
};

