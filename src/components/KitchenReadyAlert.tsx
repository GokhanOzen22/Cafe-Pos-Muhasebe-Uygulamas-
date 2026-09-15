import React, { useEffect, useState } from 'react';
import { KitchenNotification } from '../types';
import { Bell, Check, ArrowRight, Utensils, X, Volume2 } from 'lucide-react';
import { playKitchenReadyChime } from '../utils/audioAlert';

interface KitchenReadyAlertProps {
  notification: KitchenNotification | null;
  onClose: () => void;
  onGoToTable: (tableId: string) => void;
  onMarkRead: (notificationId: string) => void;
}

export const KitchenReadyAlert: React.FC<KitchenReadyAlertProps> = ({
  notification,
  onClose,
  onGoToTable,
  onMarkRead,
}) => {
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!notification) return;
    setProgress(100);

    const duration = 12000; // 12 seconds
    const interval = 100;
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
      if (!isPaused) {
        setProgress((prev) => {
          if (prev <= step) {
            clearInterval(timer);
            onClose();
            return 0;
          }
          return prev - step;
        });
      }
    }, interval);

    return () => clearInterval(timer);
  }, [notification, isPaused, onClose]);

  if (!notification) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="fixed top-4 right-4 sm:right-6 z-50 max-w-md w-[calc(100vw-2rem)] sm:w-96 bg-stone-900/95 dark:bg-stone-900/98 backdrop-blur-md text-stone-100 rounded-2xl shadow-2xl border-2 border-emerald-500 ring-4 ring-emerald-500/20 overflow-hidden transition-all duration-300 animate-in slide-in-from-top-6 fade-in"
    >
      {/* Top Header */}
      <div className="p-4 bg-gradient-to-r from-emerald-950/80 via-stone-900 to-emerald-950/50 border-b border-emerald-800/40 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative p-2.5 bg-emerald-500 text-stone-950 rounded-xl shadow-md shrink-0 animate-bounce">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full animate-ping" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                Mutfak Hazır
              </span>
              <button
                type="button"
                onClick={() => playKitchenReadyChime()}
                title="Sesi tekrar çal"
                className="text-stone-400 hover:text-amber-400 transition-colors p-1"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <h3 className="font-extrabold text-base text-white truncate mt-0.5">
              {notification.tableName} {notification.zoneName ? `(${notification.zoneName})` : ''}
            </h3>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition-colors shrink-0"
          title="Bildirimi Kapat"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content / Ready Items */}
      <div className="p-4 space-y-3">
        {notification.waiterName && (
          <p className="text-xs text-stone-400">
            Sorumlu Garson: <span className="font-bold text-amber-400">{notification.waiterName}</span>
          </p>
        )}

        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
          {notification.items.map((item, idx) => (
            <div
              key={idx}
              className="flex items-start justify-between gap-2 p-2 rounded-xl bg-stone-800/80 border border-stone-700/60 text-xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-black text-emerald-400 text-sm min-w-[24px]">
                  {item.quantity}x
                </span>
                <span className="font-bold text-stone-100 truncate">{item.name}</span>
              </div>
              {item.note && (
                <span className="text-[10px] text-amber-300 bg-amber-950/40 border border-amber-800/40 px-1.5 py-0.5 rounded-md truncate max-w-[120px]">
                  {item.note}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center gap-2">
          <button
            onClick={() => {
              onMarkRead(notification.id);
              onGoToTable(notification.tableId);
              onClose();
            }}
            className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-emerald-900/30 transition-all cursor-pointer"
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Masaya Git</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              onMarkRead(notification.id);
              onClose();
            }}
            className="py-2 px-3 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1 transition-all border border-stone-700 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>Teslim Alındı</span>
          </button>
        </div>
      </div>

      {/* Auto-Dismiss Progress Bar */}
      <div className="h-1 bg-stone-800 w-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 transition-all ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
