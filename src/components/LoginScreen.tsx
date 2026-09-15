import React, { useState } from 'react';
import { AppUser, RestaurantSettings } from '../types';
import {
  Utensils, Lock, ShieldCheck, Smartphone, ChefHat, KeyRound,
  ArrowRight, AlertCircle, CheckCircle2, UserCheck, Shield
} from 'lucide-react';

interface LoginScreenProps {
  users: AppUser[];
  settings: RestaurantSettings;
  onLoginSuccess: (user: AppUser) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  users,
  settings,
  onLoginSuccess,
}) => {
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(
    users.length > 0 ? users[0] : null
  );
  const [pinCode, setPinCode] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [loginMode, setLoginMode] = useState<'quick' | 'username'>('quick');
  const [usernameInput, setUsernameInput] = useState<string>('');

  const handleNumpadPress = (num: string) => {
    if (pinCode.length < 6) {
      const newPin = pinCode + num;
      setPinCode(newPin);
      setErrorMessage('');

      // Auto attempt login if 4 digits entered in quick mode
      if (loginMode === 'quick' && selectedUser && newPin.length === 4) {
        if (selectedUser.pinCode === newPin) {
          onLoginSuccess(selectedUser);
        } else {
          setErrorMessage('Hatalı PIN kodu! Lütfen tekrar deneyin.');
          setTimeout(() => setPinCode(''), 500);
        }
      }
    }
  };

  const handleNumpadClear = () => {
    setPinCode('');
    setErrorMessage('');
  };

  const handleNumpadBackspace = () => {
    setPinCode((prev) => prev.slice(0, -1));
    setErrorMessage('');
  };

  const handleLoginSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (loginMode === 'quick') {
      if (!selectedUser) {
        setErrorMessage('Lütfen giriş yapacak personeli seçin.');
        return;
      }
      if (selectedUser.pinCode === pinCode) {
        onLoginSuccess(selectedUser);
      } else {
        setErrorMessage('Hatalı PIN Kodu! Lütfen tekrar deneyin.');
        setPinCode('');
      }
    } else {
      // Username mode
      const foundUser = users.find(
        (u) => u.username.toLowerCase() === usernameInput.trim().toLowerCase()
      );
      if (!foundUser) {
        setErrorMessage('Bu kullanıcı adı ile kayıtlı personel bulunamadı.');
        return;
      }
      if (foundUser.pinCode === pinCode) {
        onLoginSuccess(foundUser);
      } else {
        setErrorMessage('Hatalı PIN kodu!');
        setPinCode('');
      }
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 select-none relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Logo */}
      <div className="max-w-5xl mx-auto w-full flex items-center justify-between pb-6 border-b border-stone-800/80 z-10 gap-4">
        <div className="flex items-center gap-4">
          {(settings.logoUrl || '/logo.svg') ? (
            <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-3xl overflow-hidden bg-white border border-stone-700 p-2 flex items-center justify-center shrink-0 shadow-2xl shadow-amber-500/10 ring-4 ring-white/10">
              <img src={settings.logoUrl || '/logo.svg'} alt={settings.name} className="w-full h-full object-contain" />
            </div>
          ) : (
            <div className="bg-amber-500 text-stone-950 p-4 rounded-3xl font-bold shadow-lg shadow-amber-500/20 flex items-center justify-center shrink-0">
              <Utensils className="w-10 h-10" />
            </div>
          )}
          <div>
            <h1 className="font-bold text-2xl sm:text-3xl text-white tracking-tight">
              {settings.name}
            </h1>
            <p className="text-xs sm:text-base text-stone-400 font-medium">Adisyon POS & Personel Yetki Otomasyonu</p>
          </div>
        </div>

        {/* Quick Mode Toggle */}
        <div className="flex items-center bg-stone-900 p-1 rounded-xl border border-stone-800 text-xs">
          <button
            type="button"
            onClick={() => {
              setLoginMode('quick');
              setErrorMessage('');
              setPinCode('');
            }}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              loginMode === 'quick'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Personel Seçimi
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginMode('username');
              setErrorMessage('');
              setPinCode('');
            }}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              loginMode === 'username'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Kullanıcı Adı ile
          </button>
        </div>
      </div>

      {/* Main Login Body */}
      <div className="max-w-5xl mx-auto w-full my-auto py-8 grid grid-cols-1 md:grid-cols-12 gap-8 z-10 items-center">
        {/* Left Section: User Select Cards */}
        <div className="md:col-span-7 space-y-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              Sisteme Giriş Yapın
            </h2>
            <p className="text-xs text-stone-400">
              Devam etmek için profilinizi seçin veya kullanıcı adınızı girip PIN kodunuzu tuşlayın.
            </p>
          </div>

          {loginMode === 'quick' ? (
            <div className="space-y-3">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">
                Kayıtlı Personel Hesapları
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                {users.map((user) => {
                  const isSelected = selectedUser?.id === user.id;

                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => {
                        setSelectedUser(user);
                        setPinCode('');
                        setErrorMessage('');
                      }}
                      className={`p-4 rounded-2xl text-left border transition-all flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-500 text-white ring-2 ring-amber-500/30 shadow-lg'
                          : 'bg-stone-900/80 border-stone-800 text-stone-300 hover:bg-stone-800/80 hover:border-stone-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 font-bold text-lg ${
                            user.role === 'admin'
                              ? 'bg-amber-500/20 text-amber-400'
                              : user.role === 'kitchen'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-blue-500/20 text-blue-400'
                          }`}
                        >
                          {user.role === 'admin' && <ShieldCheck className="w-5 h-5" />}
                          {user.role === 'kitchen' && <ChefHat className="w-5 h-5" />}
                          {user.role === 'pos' && <Smartphone className="w-5 h-5" />}
                        </div>

                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-stone-100 truncate">
                            {user.name}
                          </h4>
                          <span
                            className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md mt-0.5 ${
                              user.role === 'admin'
                                ? 'bg-amber-500/20 text-amber-300'
                                : user.role === 'kitchen'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-blue-500/20 text-blue-300'
                            }`}
                          >
                            {user.role === 'admin' && 'Yönetici'}
                            {user.role === 'kitchen' && 'Mutfak Şefi'}
                            {user.role === 'pos' && 'Garson (POS)'}
                          </span>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center shrink-0 font-bold">
                          ✓
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-stone-900/80 p-6 rounded-2xl border border-stone-800 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
                  Kullanıcı Adı
                </label>
                <input
                  type="text"
                  placeholder="Kullanıcı adınızı yazın..."
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="w-full p-3 bg-stone-950 border border-stone-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-100 font-mono text-sm"
                />
              </div>

              <p className="text-xs text-stone-500">
                Kullanıcı adınızı girdikten sonra yan taraftaki klavyeden 4 haneli PIN kodunuzu girerek sisteme bağlanabilirsiniz.
              </p>
            </div>
          )}

          {/* User Active Permissions Preview */}
          {selectedUser && loginMode === 'quick' && (
            <div className="bg-stone-900/40 p-3.5 rounded-2xl border border-stone-800/80 text-xs text-stone-400 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                Sistem Yetki Önizlemesi ({selectedUser.name}):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedUser.permissions.canTakeOrder && (
                  <span className="bg-stone-800 text-stone-200 px-2 py-0.5 rounded border border-stone-700">
                    🛒 Sipariş Alma & Masa
                  </span>
                )}
                {selectedUser.permissions.canApplyDiscount && (
                  <span className="bg-stone-800 text-stone-200 px-2 py-0.5 rounded border border-stone-700">
                    🏷️ İskonto Uygulama
                  </span>
                )}
                {selectedUser.permissions.canCancelItem && (
                  <span className="bg-stone-800 text-stone-200 px-2 py-0.5 rounded border border-stone-700">
                    ❌ Ürün İptali
                  </span>
                )}
                {selectedUser.permissions.canViewReports && (
                  <span className="bg-stone-800 text-stone-200 px-2 py-0.5 rounded border border-stone-700">
                    📊 Ciro & Z-Raporu
                  </span>
                )}
                {selectedUser.permissions.canManageUsers && (
                  <span className="bg-stone-800 text-stone-200 px-2 py-0.5 rounded border border-stone-700">
                    🔑 Kullanıcı Yönetimi
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Section: Interactive Numpad */}
        <div className="md:col-span-5 bg-stone-900/90 p-6 rounded-3xl border border-stone-800 shadow-2xl flex flex-col items-center space-y-5">
          <div className="text-center space-y-1">
            <span className="text-[11px] font-semibold text-amber-500 uppercase tracking-widest flex items-center justify-center gap-1">
              <KeyRound className="w-3.5 h-3.5" /> PIN Kodu Girişi
            </span>
            <h3 className="text-sm font-bold text-stone-200">
              {loginMode === 'quick' && selectedUser
                ? `${selectedUser.name} için 4 Haneli PIN`
                : 'PIN Kodunuzu Tuşlayın'}
            </h3>
          </div>

          {/* PIN Dots Indicator Display */}
          <div className="flex items-center justify-center gap-3 py-3 px-6 bg-stone-950 rounded-2xl border border-stone-800 w-full min-h-[56px]">
            {[0, 1, 2, 3].map((index) => {
              const hasDigit = pinCode.length > index;
              return (
                <div
                  key={index}
                  className={`w-4 h-4 rounded-full transition-all duration-200 ${
                    hasDigit
                      ? 'bg-amber-500 scale-110 shadow-lg shadow-amber-500/50'
                      : 'bg-stone-800 border border-stone-700'
                  }`}
                />
              );
            })}
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2 w-full animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="font-medium">{errorMessage}</span>
            </div>
          )}

          {/* Numpad Keypad Grid */}
          <div className="grid grid-cols-3 gap-2.5 w-full">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleNumpadPress(num)}
                className="h-14 bg-stone-800 hover:bg-stone-700 active:bg-amber-500 active:text-stone-950 text-white text-xl font-bold rounded-2xl border border-stone-700/60 shadow-sm transition-all flex items-center justify-center"
              >
                {num}
              </button>
            ))}

            <button
              type="button"
              onClick={handleNumpadClear}
              className="h-14 bg-stone-800/50 hover:bg-red-500/20 text-stone-400 hover:text-red-300 text-xs font-semibold rounded-2xl border border-stone-800 transition-all flex items-center justify-center"
            >
              Temizle
            </button>

            <button
              type="button"
              onClick={() => handleNumpadPress('0')}
              className="h-14 bg-stone-800 hover:bg-stone-700 active:bg-amber-500 active:text-stone-950 text-white text-xl font-bold rounded-2xl border border-stone-700/60 shadow-sm transition-all flex items-center justify-center"
            >
              0
            </button>

            <button
              type="button"
              onClick={handleNumpadBackspace}
              className="h-14 bg-stone-800/50 hover:bg-stone-700 text-stone-300 text-sm font-semibold rounded-2xl border border-stone-800 transition-all flex items-center justify-center"
            >
              ⌫ Sil
            </button>
          </div>

          {/* Submit Login Button */}
          <button
            type="button"
            onClick={() => handleLoginSubmit()}
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 active:scale-[0.99] text-stone-950 font-bold text-sm rounded-2xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all"
          >
            <span>Sisteme Giriş Yap</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="max-w-5xl mx-auto w-full text-center text-[11px] text-stone-500 pt-4 border-t border-stone-900 z-10 space-y-1">
        <div>
          Varsayılan PIN: <strong className="text-stone-300 font-mono">1234</strong> (Yönetici) | <strong className="text-stone-300 font-mono">1001</strong> (Garson Mehmet) | <strong className="text-stone-300 font-mono">2001</strong> (Mutfak Can)
        </div>
        <div className="text-[11px] text-stone-400 font-medium">
          © {new Date().getFullYear()} {settings.name} — Tüm hakları saklıdır. Yazılım & Altyapı: <span className="text-amber-400 font-semibold">DG Digital Güvenlik Yazılım</span>
        </div>
      </div>
    </div>
  );
};
