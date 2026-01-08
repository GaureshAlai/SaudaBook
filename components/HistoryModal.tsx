
import React from 'react';
import { Contract, Language, Delivery } from '../types';
import { t } from '../translations';
import { X, Trash2, Calendar, Package, ArrowLeft } from 'lucide-react';

interface Props {
  contract: Contract;
  lang: Language;
  onClose: () => void;
  onDeleteDelivery: (deliveryId: string) => void;
}

export const HistoryModal: React.FC<Props> = ({ contract, lang, onClose, onDeleteDelivery }) => {
  const getProductName = (itemId: string) => {
    return contract.items.find(i => i.id === itemId)?.productName || 'Unknown Product';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
              <ArrowLeft size={20} className="text-slate-600"/>
            </button>
            <div>
              <h2 className="text-lg font-black text-slate-800">{t('history', lang)}</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{contract.brokerName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors md:hidden">
            <X size={20}/>
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1 space-y-3 bg-slate-50/50">
          {contract.deliveries?.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
              <Package size={32} className="opacity-20" />
              <p className="text-xs font-bold uppercase tracking-widest">No deliveries yet</p>
            </div>
          ) : (
            [...(contract.deliveries || [])].reverse().map((delivery) => (
              <div key={delivery.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between group">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-slate-800">{getProductName(delivery.itemId)}</span>
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-black rounded-md">+{delivery.quantity}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                    <span className="flex items-center gap-1"><Calendar size={10}/> {new Date(delivery.date).toLocaleDateString(lang === 'en' ? 'en-GB' : 'hi-IN')}</span>
                    {delivery.remarks && <span className="text-slate-500">• {delivery.remarks}</span>}
                  </div>
                </div>
                <button 
                  onClick={() => {
                    if (window.confirm(t('confirmDelete', lang))) {
                      onDeleteDelivery(delivery.id);
                    }
                  }}
                  className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 size={16}/>
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-slate-100 bg-white">
          <button 
            onClick={onClose}
            className="w-full py-3 bg-slate-800 text-white font-black rounded-xl hover:bg-slate-900 transition-all text-xs uppercase tracking-widest shadow-lg shadow-slate-200"
          >
            {t('close', lang)}
          </button>
        </div>
      </div>
    </div>
  );
};
