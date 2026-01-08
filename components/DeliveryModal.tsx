
import React, { useState } from 'react';
import { Contract, Language, Delivery } from '../types';
import { t } from '../translations';
import { X } from 'lucide-react';

interface Props {
  contract: Contract;
  lang: Language;
  onClose: () => void;
  onSave: (delivery: Delivery) => void;
}

export const DeliveryModal: React.FC<Props> = ({ contract, lang, onClose, onSave }) => {
  const [itemId, setItemId] = useState(contract.items[0].id);
  const [quantity, setQuantity] = useState<number>(0);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [remarks, setRemarks] = useState('');

  const selectedItem = contract.items.find(i => i.id === itemId);
  const pending = selectedItem ? selectedItem.totalQuantity - selectedItem.receivedQuantity : 0;

  const handleSave = () => {
    if (quantity <= 0 || quantity > pending) {
      alert(`Invalid quantity. Max allowed: ${pending}`);
      return;
    }

    const delivery: Delivery = {
      id: Math.random().toString(36).substr(2, 9),
      date,
      quantity,
      itemId,
      remarks
    };

    onSave(delivery);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">{t('addDelivery', lang)}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full"><X size={20}/></button>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Select Item</label>
            <select 
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {contract.items.map(item => (
                <option key={item.id} value={item.id}>
                  {item.productName} (P: {item.totalQuantity - item.receivedQuantity})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">{t('quantity', lang)}</label>
              <input 
                type="number" 
                value={quantity || ''}
                onChange={(e) => setQuantity(parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                placeholder="0"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">{t('date', lang)}</label>
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Remarks (Optional)</label>
            <textarea 
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-20 resize-none" 
              placeholder="E.g. Vehicle MH-01-1234"
            />
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl">{t('cancel', lang)}</button>
          <button onClick={handleSave} className="flex-1 py-3 bg-blue-600 text-white font-bold hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-200">{t('save', lang)}</button>
        </div>
      </div>
    </div>
  );
};
