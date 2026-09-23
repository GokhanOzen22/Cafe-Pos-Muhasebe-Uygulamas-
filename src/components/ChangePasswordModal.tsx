import React, { useState } from 'react';
import { AppUser } from '../types';
import {
  X, Lock, KeyRound, Eye, EyeOff, CheckCircle2, AlertCircle, Shield,
  User, Check
} from 'lucide-react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AppUser;
  onUpdatePin: (newPin: string) => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdatePin,
}) => {
  const [currentPin, setCurrentPin] = useState<string>('');
  const [newPin, setNewPin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');
  
  const [showCurrentPin, setShowCurrentPin] = useState<boolean>(false);
  const [showNewPin, setShowNewPin] = useState<boolean>(false);
  const [showConfirmPin, setShowConfirmPin] = useState<boolean>(false);

  const [activeInput, setActiveInput] = useState<'current' | 'new' | 'confirm'>('current');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  if (!isOpen) return null;

  const handleNumpadPress = (digit: string) => {
    setErrorMessage('');
    if (activeInput === 'current') {
      if (currentPin.length < 6) setCurrentPin((prev) => prev + digit);
    } else if (activeInput === 'new') {
      if (newPin.length < 6) setNewPin((prev) => prev + digit);
    } else if (activeInput === 'confirm') {
      if (confirmPin.length < 6) setConfirmPin((prev) => prev + digit);
    }
  };

  const handleNumpadBackspace = () => {
    setErrorMessage('');
    if (activeInput === 'current') {
      setCurrentPin((prev) => prev.slice(0, -1));
    } else if (activeInput === 'new') {
      setNewPin((prev) => prev.slice(0, -1));
    } else if (activeInput === 'confirm') {
      setConfirmPin((prev) => prev.slice(0, -1));
    }
  };

  const handleNumpadClear = () => {
    setErrorMessage('');
    if (activeInput === 'current') {
      setCurrentPin('');
    } else if (activeInput === 'new') {
      setNewPin('');
    } else if (activeInput === 'confirm') {
      setConfirmPin('');
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    // 1. Verify Current PIN
    if (currentPin.trim() !== currentUser.pinCode.trim()) {
      setErrorMessage('Mevcut PIN kodunuz / şifreniz hatalı! Lütfen kontrol ediniz.');
      setActiveInput('current');
      return;
    }

    // 2. Validate New PIN format
    const cleanedNewPin = newPin.trim();
    if (!cleanedNewPin || cleanedNewPin.length < 4) {
      setErrorMessage('Yeni PIN kodu en az 4 haneli olmalıdır.');
      setActiveInput('new');
      return;
    }

    if (cleanedNewPin.length > 6) {
      setErrorMessage('Yeni PIN kodu en fazla 6 haneli olabilir.');
      setActiveInput('new');
      return;
    }

    // 3. Must be different from old PIN
    if (cleanedNewPin === currentUser.pinCode.trim()) {
      setErrorMessage('Yeni PIN kodunuz eskisiyle aynı olamaz. Lütfen farklı bir şifre belirleyin.');
      setActiveInput('new');
      return;
    }

    // 4. Confirm PIN match
    if (cleanedNewPin !== confirmPin.trim()) {
      setErrorMessage('Yeni PIN kodları birbiriyle uyuşmuyor! Lütfen tekrar kontrol edin.');
      setActiveInput('confirm');
      return;
    }

    // Success
    onUpdatePin(cleanedNewPin);
    setSuccessMessage('Şifreniz / PIN kodunuz başarıyla güncellendi!');
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const isMatching = newPin.length >= 4 && confirmPin.length >= 4 && newPin === confirmPin;

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-stone-200 dark:border-stone-800 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <span>Kendi Şifremi / PIN Kodumu Değiştir</span>
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                Hesabınız için yeni bir 4-6 haneli PIN kodu belirleyin
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          
          {/* User Profile Mini Card */}
          <div className="flex items-center justify-between p-3.5 bg-stone-50 dark:bg-stone-950/60 rounded-2xl border border-stone-200 dark:border-stone-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold flex items-center justify-center text-sm border border-amber-500/20">
                {currentUser.name.charAt(0)}
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-stone-900 dark:text-stone-100">
                  {currentUser.name}
                </h4>
                <p className="text-xs text-stone-500 dark:text-stone-400 font-mono">
                  @{currentUser.username}
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-300 dark:border-stone-700">
              {currentUser.role === 'admin' ? 'Yönetici' : currentUser.role === 'kitchen' ? 'Mutfak' : 'Garson'}
            </span>
          </div>

          {/* Success Banner */}
          {successMessage && (
            <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 rounded-2xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-400 rounded-2xl text-xs font-bold flex items-center gap-2 animate-shake">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            
            {/* Current PIN */}
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5 flex items-center justify-between">
                <span>Mevcut PIN Kodu / Şifreniz:</span>
                <span className="text-[10px] text-stone-400 font-normal">Kimlik Doğrulama</span>
              </label>
              <div
                onClick={() => setActiveInput('current')}
                className={`relative flex items-center rounded-2xl border transition-all ${
                  activeInput === 'current'
                    ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/10'
                    : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-950/40'
                }`}
              >
                <div className="pl-3.5 text-stone-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showCurrentPin ? 'text' : 'password'}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={currentPin}
                  onFocus={() => setActiveInput('current')}
                  onChange={(e) => {
                    setCurrentPin(e.target.value.replace(/\D/g, ''));
                    setErrorMessage('');
                  }}
                  placeholder="Mevcut 4 haneli PIN"
                  className="w-full py-2.5 px-3 bg-transparent text-sm font-mono tracking-widest focus:outline-none text-stone-900 dark:text-stone-100"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCurrentPin(!showCurrentPin);
                  }}
                  className="pr-3.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
                >
                  {showCurrentPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New PIN */}
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5 flex items-center justify-between">
                <span>Yeni PIN Kodu (4-6 Rakam):</span>
                <span className="text-[10px] text-amber-500 font-bold">En az 4 hane</span>
              </label>
              <div
                onClick={() => setActiveInput('new')}
                className={`relative flex items-center rounded-2xl border transition-all ${
                  activeInput === 'new'
                    ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/10'
                    : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-950/40'
                }`}
              >
                <div className="pl-3.5 text-stone-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showNewPin ? 'text' : 'password'}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={newPin}
                  onFocus={() => setActiveInput('new')}
                  onChange={(e) => {
                    setNewPin(e.target.value.replace(/\D/g, ''));
                    setErrorMessage('');
                  }}
                  placeholder="Yeni PIN kodunuz"
                  className="w-full py-2.5 px-3 bg-transparent text-sm font-mono tracking-widest focus:outline-none text-stone-900 dark:text-stone-100"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowNewPin(!showNewPin);
                  }}
                  className="pr-3.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
                >
                  {showNewPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New PIN */}
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5 flex items-center justify-between">
                <span>Yeni PIN Kodunu Tekrar Girin:</span>
                {isMatching && (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Eşleşti
                  </span>
                )}
              </label>
              <div
                onClick={() => setActiveInput('confirm')}
                className={`relative flex items-center rounded-2xl border transition-all ${
                  activeInput === 'confirm'
                    ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/10'
                    : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-950/40'
                }`}
              >
                <div className="pl-3.5 text-stone-400">
                  <Shield className="w-4 h-4" />
                </div>
                <input
                  type={showConfirmPin ? 'text' : 'password'}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={confirmPin}
                  onFocus={() => setActiveInput('confirm')}
                  onChange={(e) => {
                    setConfirmPin(e.target.value.replace(/\D/g, ''));
                    setErrorMessage('');
                  }}
                  placeholder="Yeni PIN tekrar"
                  className="w-full py-2.5 px-3 bg-transparent text-sm font-mono tracking-widest focus:outline-none text-stone-900 dark:text-stone-100"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowConfirmPin(!showConfirmPin);
                  }}
                  className="pr-3.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
                >
                  {showConfirmPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </form>

          {/* Quick On-Screen Touch Numpad for POS / Tablets */}
          <div className="pt-1 border-t border-stone-200 dark:border-stone-800 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
              <span className="font-semibold">Dokunmatik Tuş Takımı (POS / Tablet)</span>
              <span className="text-amber-500 font-bold">
                Aktif Alan: {activeInput === 'current' ? 'Mevcut PIN' : activeInput === 'new' ? 'Yeni PIN' : 'Yeni PIN Tekrar'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleNumpadPress(num)}
                  className="h-10 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 active:bg-amber-500 active:text-stone-950 text-stone-900 dark:text-white font-extrabold text-base rounded-xl transition-all flex items-center justify-center cursor-pointer shadow-2xs"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={handleNumpadClear}
                className="h-10 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-300 font-bold text-xs rounded-xl transition-all flex items-center justify-center cursor-pointer"
              >
                Temizle
              </button>
              <button
                type="button"
                onClick={() => handleNumpadPress('0')}
                className="h-10 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 active:bg-amber-500 active:text-stone-950 text-stone-900 dark:text-white font-extrabold text-base rounded-xl transition-all flex items-center justify-center cursor-pointer shadow-2xs"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleNumpadBackspace}
                className="h-10 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 font-bold text-xs rounded-xl transition-all flex items-center justify-center cursor-pointer"
              >
                ⌫ Sil
              </button>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/60 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-stone-200 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            İptal
          </button>
          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={!currentPin || newPin.length < 4 || confirmPin.length < 4}
            className={`px-5 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm ${
              !currentPin || newPin.length < 4 || confirmPin.length < 4
                ? 'bg-stone-300 dark:bg-stone-800 text-stone-400 dark:text-stone-600 cursor-not-allowed'
                : 'bg-amber-500 hover:bg-amber-600 active:scale-98 text-stone-950 shadow-amber-500/20'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>Şifremi Güncelle</span>
          </button>
        </div>

      </div>
    </div>
  );
};
