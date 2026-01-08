
import React, { useState } from 'react';
import { FirebaseConfig, Language, User } from '../types';
import { t } from '../translations';
import { X, Cloud, ShieldCheck, LogOut, RefreshCw, User as UserIcon, ExternalLink, Info } from 'lucide-react';

interface Props {
  lang: Language;
  config: FirebaseConfig;
  user: User;
  onClose: () => void;
  onLogout: () => void;
  onSave: (config: FirebaseConfig) => void;
}

export const SettingsModal: React.FC<Props> = ({ lang, config, user, onClose, onLogout, onSave }) => {
  const [formData, setFormData] = useState<FirebaseConfig>(config);

  const handleLogoutClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onLogout();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200 animate-scale-up">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
          <div className="flex items-center gap-3">
            <Cloud className="text-blue-600" size={24} />
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">{t('settings', lang)}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24} className="text-slate-400" /></button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Profile Card */}
          <div className="p-5 bg-white border border-slate-100 rounded-[2rem] flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner shrink-0">
                <UserIcon size={28} />
              </div>
              <div className="space-y-0.5 min-w-0">
                <p className="font-black text-slate-800 text-base leading-tight truncate">{user.businessName}</p>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest truncate">{user.email}</p>
              </div>
            </div>
            <button 
              type="button"
              onClick={handleLogoutClick}
              className="p-4 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all border border-slate-100 hover:border-red-200 shrink-0 shadow-sm active:scale-90"
              title="Logout"
            >
              <LogOut size={24} />
            </button>
          </div>

          {/* Info Box */}
          <div className="p-5 bg-blue-50/50 border border-blue-100 rounded-[2rem] flex gap-4">
            <ShieldCheck className="text-blue-500 shrink-0" size={24} />
            <div className="space-y-2">
              <p className="text-[11px] text-blue-900 font-bold uppercase tracking-widest leading-relaxed">
                Connect to your Firebase project to sync data across all your devices in real-time. 
              </p>
              <a 
                href="https://console.firebase.google.com/" 
                target="_blank" 
                rel="noreferrer"
                className="text-[10px] text-blue-600 underline font-black flex items-center gap-1.5 uppercase tracking-tighter hover:text-blue-700"
              >
                GO TO FIREBASE CONSOLE <ExternalLink size={12}/>
              </a>
            </div>
          </div>

          <div className="space-y-5">
            {/* Toggle */}
            <div className="flex items-center justify-between p-5 bg-slate-50/50 rounded-[2rem] border border-slate-100">
              <div className="flex flex-col">
                <span className="font-black text-slate-700 text-sm">{t('enableCloudSync', lang)}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Requires Google Firebase Credentials</span>
              </div>
              <button 
                type="button"
                onClick={() => setFormData({ ...formData, enabled: !formData.enabled })}
                className={`w-16 h-8 rounded-full transition-all relative outline-none ring-offset-2 focus:ring-2 focus:ring-blue-400 ${formData.enabled ? 'bg-blue-600' : 'bg-slate-300'}`}
              >
                <div className={`absolute top-1.5 w-5 h-5 bg-white rounded-full shadow-md transition-all ${formData.enabled ? 'left-9' : 'left-1.5'}`} />
              </button>
            </div>

            {/* Inputs */}
            <div className={`space-y-5 transition-all duration-300 ${formData.enabled ? 'opacity-100' : 'opacity-40 pointer-events-none grayscale'}`}>
              <div className="space-y-2 px-1">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{t('apiKey', lang)}</label>
                  <Info size={14} className="text-slate-300" />
                </div>
                <input 
                  type="password" 
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  className="w-full px-5 py-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-mono text-xs bg-slate-50/50"
                  placeholder="Paste API Key here..."
                />
              </div>
              <div className="space-y-2 px-1">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{t('projectId', lang)}</label>
                  <Info size={14} className="text-slate-300" />
                </div>
                <input 
                  type="text" 
                  value={formData.projectId}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                  className="w-full px-5 py-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-xs bg-slate-50/50"
                  placeholder="Paste Project ID here..."
                />
              </div>
              {config.lastSync && (
                <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1 bg-emerald-50 w-fit px-4 py-2 rounded-full border border-emerald-100">
                  <RefreshCw size={12} className="animate-spin" />
                  Last synced: {new Date(config.lastSync).toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 flex gap-4 bg-white">
          <button 
            type="button"
            onClick={onClose}
            className="flex-1 py-4 text-slate-500 font-black hover:bg-slate-50 rounded-[1.5rem] transition-all uppercase tracking-widest text-[11px]"
          >
            {t('cancel', lang)}
          </button>
          <button 
            type="button"
            onClick={() => onSave(formData)}
            className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-black rounded-[1.5rem] shadow-xl shadow-blue-200 hover:brightness-110 active:scale-95 transition-all uppercase tracking-widest text-[11px]"
          >
            {t('save', lang)}
          </button>
        </div>
      </div>
    </div>
  );
};
