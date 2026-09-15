import React, { useState } from 'react';
import { Table, Zone } from '../types';
import { X, ArrowRightLeft } from 'lucide-react';

interface TransferTableModalProps {
  sourceTable: Table;
  tables: Table[];
  zones: Zone[];
  onClose: () => void;
  onTransfer: (sourceTableId: string, targetTableId: string) => void;
}

export const TransferTableModal: React.FC<TransferTableModalProps> = ({
  sourceTable,
  tables,
  zones,
  onClose,
  onTransfer,
}) => {
  const [targetTableId, setTargetTableId] = useState<string>('');

  const availableTables = tables.filter((t) => t.id !== sourceTable.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetTableId) return;
    onTransfer(sourceTable.id, targetTableId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
          <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-amber-500" />
            Masa Taşı / Birleştir
          </h3>
          <button type="button" onClick={onClose} className="text-stone-400 hover:text-stone-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-stone-500 dark:text-stone-400">
          <span className="font-bold text-stone-900 dark:text-stone-100">{sourceTable.number}</span> üzerindeki açık adisyonu başka bir masaya taşıyın.
        </p>

        <div>
          <label className="text-xs font-semibold text-stone-600 dark:text-stone-400">Hedef Masa Seçin:</label>
          <select
            value={targetTableId}
            onChange={(e) => setTargetTableId(e.target.value)}
            required
            className="w-full mt-1 p-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl text-sm font-semibold text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">-- Masa Seçin --</option>
            {availableTables.map((t) => {
              const zone = zones.find((z) => z.id === t.zoneId);
              return (
                <option key={t.id} value={t.id}>
                  {t.number} ({zone?.name || 'Genel'}) - {t.status === 'empty' ? 'Boş Masa' : 'Dolu Masa (Birleştir)'}
                </option>
              );
            })}
          </select>
        </div>

        <div className="flex items-center gap-3 pt-3 border-t border-stone-200 dark:border-stone-800">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-xl text-xs font-semibold"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={!targetTableId}
            className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl text-xs font-bold disabled:opacity-50"
          >
            Taşımayı Onayla
          </button>
        </div>
      </form>
    </div>
  );
};
