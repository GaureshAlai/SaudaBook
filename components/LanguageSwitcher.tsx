
import React from 'react';
import { Language } from '../types';

interface Props {
  current: Language;
  onSelect: (lang: Language) => void;
}

export const LanguageSwitcher: React.FC<Props> = ({ current, onSelect }) => {
  return (
    <div className="flex bg-slate-200 p-1 rounded-lg">
      <button 
        onClick={() => onSelect('en')}
        className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${current === 'en' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-600 hover:text-slate-900'}`}
      >
        EN
      </button>
      <button 
        onClick={() => onSelect('hi')}
        className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${current === 'hi' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-600 hover:text-slate-900'}`}
      >
        हिं
      </button>
      <button 
        onClick={() => onSelect('mr')}
        className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${current === 'mr' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-600 hover:text-slate-900'}`}
      >
        मरा
      </button>
    </div>
  );
};
