
import React, { useState, useEffect } from 'react';
import { User, Language } from '../types';
import { t } from '../translations';
import { LayoutDashboard, Lock, Mail, ArrowRight, Building2, AlertCircle, Loader2 } from 'lucide-react';

interface Props {
  lang: Language;
  onLogin: (user: User) => void;
}

// Simulated Remote Database for Users
const getRemoteUsers = () => {
  const users = localStorage.getItem('saudabook_remote_users');
  return users ? JSON.parse(users) : {};
};

const saveRemoteUser = (email: string, data: any) => {
  const users = getRemoteUsers();
  users[email.toLowerCase()] = data;
  localStorage.setItem('saudabook_remote_users', JSON.stringify(users));
};

export const AuthScreen: React.FC<Props> = ({ lang, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [business, setBusiness] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email || !password || (!isLogin && !business)) {
      setError("Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    
    // Simulate network delay
    await new Promise(r => setTimeout(r, 800));

    const users = getRemoteUsers();
    const normalizedEmail = email.toLowerCase();

    if (isLogin) {
      // LOGIN LOGIC
      const storedUser = users[normalizedEmail];
      if (!storedUser) {
        setError("Account not found. Please create an account first.");
        setIsLoading(false);
        return;
      }
      if (storedUser.password !== password) {
        setError("Incorrect password. Please try again.");
        setIsLoading(false);
        return;
      }
      
      onLogin({
        id: btoa(normalizedEmail),
        email: normalizedEmail,
        businessName: storedUser.businessName
      });
    } else {
      // REGISTRATION LOGIC
      if (users[normalizedEmail]) {
        setError("An account with this email already exists.");
        setIsLoading(false);
        return;
      }

      saveRemoteUser(normalizedEmail, {
        password,
        businessName: business,
        createdAt: Date.now()
      });

      onLogin({
        id: btoa(normalizedEmail),
        email: normalizedEmail,
        businessName: business
      });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl shadow-blue-100 overflow-hidden border border-slate-100">
        <div className="p-8 pb-10 text-center bg-gradient-to-b from-blue-50/50 to-transparent">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl mx-auto mb-6 transform -rotate-6">
            <LayoutDashboard size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-800 mb-1">SaudaBook</h1>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em]">Smart Inventory Control</p>
        </div>

        <form onSubmit={handleSubmit} className="px-8 pb-10 space-y-5">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-bold animate-shake">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          {!isLogin && (
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Business Name</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="text" 
                  value={business}
                  onChange={(e) => setBusiness(e.target.value)}
                  disabled={isLoading}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none transition-all text-sm font-semibold disabled:opacity-50"
                  placeholder="e.g. Sanjay Soya Tradelink"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('email', lang)}</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none transition-all text-sm font-semibold disabled:opacity-50"
                placeholder="name@business.com"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('password', lang)}</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none transition-all text-sm font-semibold disabled:opacity-50"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-blue-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs disabled:opacity-70 disabled:grayscale"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : (isLogin ? t('login', lang) : 'Create Account')}
            {!isLoading && <ArrowRight size={18} />}
          </button>

          <button 
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
            disabled={isLoading}
            className="w-full text-center text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors py-2 disabled:opacity-50"
          >
            {isLogin ? "New to SaudaBook? Create Business Profile" : "Already have an account? Login"}
          </button>
        </form>
      </div>
    </div>
  );
};
