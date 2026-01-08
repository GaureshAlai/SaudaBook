
import React, { useState } from 'react';
import { Contract, ContractItem, ContractStatus, Language } from '../types';
import { PRODUCTS, DEFAULT_VENDOR } from '../constants';
import { t } from '../translations';
import { X, Plus, Trash2, Clock, Calendar } from 'lucide-react';

interface Props {
  lang: Language;
  onClose: () => void;
  onSave: (contract: Contract) => void;
}

export const ContractModal: React.FC<Props> = ({ lang, onClose, onSave }) => {
  const now = new Date();
  const [broker, setBroker] = useState('');
  const [date, setDate] = useState(now.toISOString().split('T')[0]);
  const [time, setTime] = useState(now.toTimeString().split(' ')[0].slice(0, 5));
  const [items, setItems] = useState<Partial<ContractItem>[]>([{ id: '1', productName: PRODUCTS[0], rate: 0, totalQuantity: 0, receivedQuantity: 0 }]);

  const addItem = () => {
    setItems([...items, { id: Math.random().toString(36).substr(2, 9), productName: PRODUCTS[0], rate: 0, totalQuantity: 0, receivedQuantity: 0 }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof ContractItem, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleSave = () => {
    if (!broker || items.some(i => !i.rate || !i.totalQuantity)) {
      alert("Please fill all fields correctly");
      return;
    }

    const newContract: Contract = {
      id: Math.random().toString(36).substr(2, 9),
      date,
      time,
      brokerName: broker,
      vendorName: DEFAULT_VENDOR,
      status: ContractStatus.OPEN,
      items: items as ContractItem[],
      deliveries: []
    };

    onSave(newContract);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-black text-slate-800">{t('createContract', lang)}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={20}/></button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('broker', lang)}</label>
              <input 
                type="text" 
                value={broker}
                onChange={(e) => setBroker(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" 
                placeholder="Enter Broker Name"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Calendar size={12}/> {t('date', lang)}
                </label>
                <input 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Clock size={12}/> Time
                </label>
                <input 
                  type="time" 
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" 
                />
              </div>
            </div>

            <div className="space-y-1 col-span-full">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('vendor', lang)}</label>
              <input 
                type="text" 
                disabled 
                value={DEFAULT_VENDOR} 
                className="w-full px-4 py-2 border border-slate-100 bg-slate-50 rounded-xl text-slate-400 font-bold text-sm"
              />
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">{t('addProduct', lang)}</h3>
              <button onClick={addItem} className="flex items-center gap-1 text-xs font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest">
                <Plus size={16}/> {t('addProduct', lang)}
              </button>
            </div>

            {items.map((item, index) => (
              <div key={item.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 relative group">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Product Selection</label>
                    <select 
                      value={item.productName}
                      onChange={(e) => updateItem(item.id!, 'productName', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white font-bold text-sm"
                    >
                      {PRODUCTS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <button 
                    onClick={() => removeItem(item.id!)}
                    className="mt-6 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 size={18}/>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('rate', lang)} (₹)</label>
                    <input 
                      type="number" 
                      value={item.rate || ''}
                      onChange={(e) => updateItem(item.id!, 'rate', parseFloat(e.target.value))}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-sm"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('quantity', lang)}</label>
                    <input 
                      type="number" 
                      value={item.totalQuantity || ''}
                      onChange={(e) => updateItem(item.id!, 'totalQuantity', parseFloat(e.target.value))}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-sm"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 flex gap-3 bg-white">
          <button 
            onClick={onClose}
            className="flex-1 py-3 text-slate-600 font-black hover:bg-slate-100 rounded-xl transition-all text-xs uppercase tracking-widest"
          >
            {t('cancel', lang)}
          </button>
          <button 
            onClick={handleSave}
            className="flex-1 py-3 bg-blue-600 text-white font-black hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-200 transition-all text-xs uppercase tracking-widest"
          >
            {t('save', lang)}
          </button>
        </div>
      </div>
    </div>
  );
};
