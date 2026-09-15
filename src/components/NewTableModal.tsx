import React, { useState } from 'react';
import { Zone } from '../types';
import { X, Plus } from 'lucide-react';

interface NewTableModalProps {
  zones: Zone[];
  onClose: () => void;
  onAddTable: (number: string, zoneId: string, capacity: number) => void;
}

export const NewTableModal: React.FC<NewTableModalProps> = ({ zones, onClose, onAddTable }) => {
  const [number, setNumber] = useState<string>('');
  const [zoneId, setZoneId] = useState<string>(zones[0]?.id || '');
  const [capacity, setCapacity] = useState<number>(4);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!number || !zoneId) return;
    onAddTable(number, zoneId, capacity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
          <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Plus className="w-5 h-5 text-amber-500" />
            Yeni Masa Ekle
          </h3>
          <button type="button" onClick={onClose} className="text-stone-400 hover:text-stone-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <label className="text-xs font-semibold text-stone-600 dark:text-stone-400">Masa Adı / Numarası:</label>
          <input
            type="text"
            required
            placeholder="Örn: Masa 15, Bahçe 4, VIP 2"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            className="w-full mt-1 p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-stone-600 dark:text-stone-400">Salon / Bölge:</label>
          <select
            value={zoneId}
            onChange={(e) => setZoneId(e.target.value)}
            className="w-full mt-1 p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm"
          >
            {zones.map((z) => (
              <option key={z.id} value={z.id}>{z.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-stone-600 dark:text-stone-400">Kişi / Sandalye Kapasitesi:</label>
          <input
            type="number"
            min={1}
            max={30}
            value={capacity}
            onChange={(e) => setCapacity(parseInt(e.target.value) || 2)}
            className="w-full mt-1 p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm"
          />
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
            className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl text-xs font-bold"
          >
            Masayı Ekle
          </button>
        </div>
      </form>
    </div>
  );
};
