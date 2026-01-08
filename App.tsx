
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Contract, ContractStatus, Language, Delivery, FirebaseConfig, User } from './types';
import { t } from './translations';
import { StatCard } from './components/StatCard';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { ContractModal } from './components/ContractModal';
import { DeliveryModal } from './components/DeliveryModal';
import { HistoryModal } from './components/HistoryModal';
import { SettingsModal } from './components/SettingsModal';
import { AiAssistant } from './components/AiAssistant';
import { AuthScreen } from './components/AuthScreen';
import { 
  Plus, Search, Box, Package, Truck, IndianRupee, 
  Camera, Settings, LayoutDashboard, History, Trash2, 
  ChevronRight, AlertCircle, Clock, Cloud, LogOut, RefreshCw
} from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [lang, setLang] = useState<Language>('en');
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | ContractStatus>('ALL');
  const [showContractModal, setShowContractModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [deliveryTarget, setDeliveryTarget] = useState<Contract | null>(null);
  const [historyTarget, setHistoryTarget] = useState<Contract | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [firebaseConfig, setFirebaseConfig] = useState<FirebaseConfig>({
    apiKey: '',
    projectId: '',
    enabled: false
  });

  // Sync with Mock Remote Server
  const handleSync = useCallback(async (isPull = false) => {
    if (!user) return;
    setSyncing(true);

    try {
      // Simulate API Roundtrip
      await new Promise(r => setTimeout(r, 800));
      const remoteStoreKey = `saudabook_remote_data_${user.email}`;
      
      if (isPull) {
        const remoteData = localStorage.getItem(remoteStoreKey);
        if (remoteData) {
          setContracts(JSON.parse(remoteData));
        }
      } else {
        localStorage.setItem(remoteStoreKey, JSON.stringify(contracts));
      }

      setFirebaseConfig(prev => ({ ...prev, lastSync: Date.now() }));
    } catch (e) {
      console.error("Sync error:", e);
    } finally {
      setSyncing(false);
    }
  }, [user, contracts]);

  // Logout Logic - Only removes sensitive user key, keeps contract data
  const handleLogout = useCallback(() => {
    // Immediate state update
    setUser(null);
    localStorage.removeItem('saudabook_user');
    setShowSettingsModal(false);
  }, []);

  // Initial Data Load & Persistence
  useEffect(() => {
    const savedUser = localStorage.getItem('saudabook_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch(e) {
        localStorage.removeItem('saudabook_user');
      }
    }

    const savedContracts = localStorage.getItem('saudabook_contracts');
    if (savedContracts) {
      try {
        setContracts(JSON.parse(savedContracts));
      } catch(e) {
        console.error("Error loading contracts", e);
      }
    }

    const savedSettings = localStorage.getItem('saudabook_settings');
    if (savedSettings) {
      try {
        setFirebaseConfig(JSON.parse(savedSettings));
      } catch(e) {
        console.error("Error loading settings", e);
      }
    }

    const savedLang = localStorage.getItem('saudabook_lang');
    if (savedLang) setLang(savedLang as Language);
  }, []);

  // Sync logic when logged in
  useEffect(() => {
    if (user && contracts.length === 0) {
      handleSync(true);
    }
  }, [user, handleSync]);

  useEffect(() => {
    localStorage.setItem('saudabook_contracts', JSON.stringify(contracts));
  }, [contracts]);

  useEffect(() => {
    localStorage.setItem('saudabook_settings', JSON.stringify(firebaseConfig));
  }, [firebaseConfig]);

  useEffect(() => {
    localStorage.setItem('saudabook_lang', lang);
  }, [lang]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('saudabook_user', JSON.stringify(user));
    }
  }, [user]);

  // Analytics Calculations
  const stats = useMemo(() => {
    let totalBooked = 0;
    let totalReceived = 0;
    let pendingValue = 0;

    contracts.forEach(c => {
      c.items.forEach(item => {
        totalBooked += item.totalQuantity;
        totalReceived += item.receivedQuantity;
        const pending = item.totalQuantity - item.receivedQuantity;
        pendingValue += (pending * (item.rate || 0));
      });
    });

    return {
      booked: totalBooked,
      received: totalReceived,
      pending: totalBooked - totalReceived,
      value: (pendingValue / 100000).toFixed(2) // Convert to Lakhs
    };
  }, [contracts]);

  const filteredContracts = useMemo(() => {
    return contracts
      .filter(c => {
        const matchesSearch = c.brokerName.toLowerCase().includes(search.toLowerCase()) || 
                             c.items.some(i => i.productName.toLowerCase().includes(search.toLowerCase()));
        const matchesFilter = filterStatus === 'ALL' || c.status === filterStatus;
        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [contracts, search, filterStatus]);

  // Fix: Removed trailing comma and dependency array syntax from handleAddContract to resolve redeclaration of handleSync
  const handleAddContract = (newContract: Contract) => {
    const enriched = { ...newContract, updatedAt: Date.now() };
    setContracts(prev => {
      const next = [enriched, ...prev];
      return next;
    });
    setShowContractModal(false);
  };

  const handleDeleteContract = (id: string) => {
    if (window.confirm(t('confirmDelete', lang))) {
      setContracts(prev => {
        const next = prev.filter(c => c.id !== id);
        return next;
      });
    }
  };

  const handleAddDelivery = (delivery: Delivery) => {
    if (!deliveryTarget) return;

    setContracts(prev => {
      const next = prev.map(c => {
        if (c.id === deliveryTarget.id) {
          const updatedItems = c.items.map(item => {
            if (item.id === delivery.itemId) {
              return { ...item, receivedQuantity: item.receivedQuantity + delivery.quantity };
            }
            return item;
          });
          const allClosed = updatedItems.every(i => i.receivedQuantity >= i.totalQuantity);
          return {
            ...c,
            items: updatedItems,
            deliveries: [...(c.deliveries || []), delivery],
            status: allClosed ? ContractStatus.CLOSED : c.status,
            updatedAt: Date.now()
          };
        }
        return c;
      });
      return next;
    });

    setDeliveryTarget(null);
  };

  const handleDeleteDelivery = (contractId: string, deliveryId: string) => {
    setContracts(prev => {
      const next = prev.map(c => {
        if (c.id === contractId) {
          const deliveryToDelete = c.deliveries.find(d => d.id === deliveryId);
          if (!deliveryToDelete) return c;
          const updatedItems = c.items.map(item => {
            if (item.id === deliveryToDelete.itemId) {
              return { ...item, receivedQuantity: Math.max(0, item.receivedQuantity - deliveryToDelete.quantity) };
            }
            return item;
          });
          const anyOpen = updatedItems.some(i => i.receivedQuantity < i.totalQuantity);
          const updatedContract = {
            ...c,
            items: updatedItems,
            deliveries: c.deliveries.filter(d => d.id !== deliveryId),
            status: anyOpen ? ContractStatus.OPEN : ContractStatus.CLOSED,
            updatedAt: Date.now()
          };
          if (historyTarget?.id === contractId) setHistoryTarget(updatedContract);
          return updatedContract;
        }
        return c;
      });
      return next;
    });
  };

  if (!user) {
    return <AuthScreen lang={lang} onLogin={setUser} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-32 transition-opacity duration-500">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100 transform -rotate-3 shrink-0">
            <LayoutDashboard size={22} />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-black bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent truncate">SaudaBook</h1>
            <p className="text-[10px] uppercase tracking-tighter text-slate-400 font-bold leading-none truncate">{user.businessName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100">
            <div className={`w-2 h-2 rounded-full ${syncing ? 'bg-orange-500 animate-pulse' : firebaseConfig.enabled ? 'bg-emerald-500' : 'bg-slate-300'}`} />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              {syncing ? <RefreshCw size={10} className="animate-spin" /> : null}
              {syncing ? 'Syncing...' : firebaseConfig.enabled ? 'Cloud Active' : 'Offline'}
            </span>
          </div>
          <LanguageSwitcher current={lang} onSelect={setLang} />
          <button 
            onClick={() => setShowSettingsModal(true)}
            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
          >
            <Settings size={22} />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 space-y-8 mt-2">
        {/* Dashboard Stats */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            label={t('totalBooked', lang)} 
            value={stats.booked.toLocaleString()} 
            subValue="Total Contract Units" 
            icon={<Box size={18} className="text-blue-500"/>} 
          />
          <StatCard 
            label={t('receivedStock', lang)} 
            value={stats.received.toLocaleString()} 
            subValue={`${Math.round((stats.received / (stats.booked || 1)) * 100)}% ${t('received', lang)}`}
            icon={<Package size={18} className="text-emerald-500"/>}
            colorClass="text-emerald-600"
          />
          <StatCard 
            label={t('pendingDelivery', lang)} 
            value={stats.pending.toLocaleString()} 
            subValue="Awaiting Inward"
            icon={<Truck size={18} className="text-orange-500"/>}
            colorClass="text-orange-600"
          />
          <StatCard 
            label={t('pendingValue', lang)} 
            value={`₹ ${stats.value}`} 
            subValue={`(${t('lakhs', lang)}) Liability`}
            icon={<IndianRupee size={18} className="text-indigo-500"/>}
            colorClass="text-indigo-600"
          />
        </section>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
            <input 
              type="text" 
              placeholder={t('searchPlaceholder', lang)}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
            />
          </div>
          
          <div className="flex gap-1.5 w-full md:w-auto p-1 bg-slate-100 rounded-xl overflow-x-auto">
            <button 
              onClick={() => setFilterStatus('ALL')}
              className={`px-5 py-2 rounded-lg font-bold text-xs whitespace-nowrap transition-all ${filterStatus === 'ALL' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}
            >
              ALL
            </button>
            <button 
              onClick={() => setFilterStatus(ContractStatus.OPEN)}
              className={`px-5 py-2 rounded-lg font-bold text-xs whitespace-nowrap transition-all ${filterStatus === ContractStatus.OPEN ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}
            >
              {t('open', lang).toUpperCase()}
            </button>
            <button 
              onClick={() => setFilterStatus(ContractStatus.CLOSED)}
              className={`px-5 py-2 rounded-lg font-bold text-xs whitespace-nowrap transition-all ${filterStatus === ContractStatus.CLOSED ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}
            >
              {t('closed', lang).toUpperCase()}
            </button>
          </div>
        </div>

        {/* Contract List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContracts.map(contract => (
            <div key={contract.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group overflow-hidden flex flex-col relative animate-fade-in">
              <div className="p-5 flex justify-between items-start border-b border-slate-100 bg-slate-50/30">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-slate-800 text-lg leading-tight">{contract.brokerName}</h3>
                    <button 
                      onClick={() => handleDeleteContract(contract.id)}
                      className="p-1.5 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={14}/>
                    </button>
                  </div>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 flex-wrap">
                    <Truck size={12} className="text-blue-500"/> {contract.vendorName} • {new Date(contract.date).toLocaleDateString(lang === 'en' ? 'en-GB' : 'hi-IN')} {contract.time && `• ${contract.time}`}
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${contract.status === ContractStatus.OPEN ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-200' : 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200'}`}>
                  {t(contract.status.toLowerCase(), lang)}
                </div>
              </div>

              <div className="p-5 space-y-6 flex-1">
                {contract.items.map(item => {
                  const progress = (item.receivedQuantity / item.totalQuantity) * 100;
                  const isFinished = progress >= 100;
                  return (
                    <div key={item.id} className="space-y-2">
                      <div className="flex justify-between items-end">
                        <span className="font-bold text-slate-700 text-sm">{item.productName}</span>
                        <div className="text-right">
                          <span className="text-slate-400 text-[10px] font-bold block uppercase tracking-tighter">Rate</span>
                          <span className="text-indigo-600 font-black text-sm">₹{item.rate}</span>
                        </div>
                      </div>
                      <div className="relative pt-1">
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${isFinished ? 'bg-emerald-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'}`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        {isFinished && <div className="absolute -right-1 -top-1 bg-emerald-500 text-white rounded-full p-0.5 border-2 border-white"><ChevronRight size={8} className="rotate-90"/></div>}
                      </div>
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                        <div className="flex flex-col">
                          <span className="text-slate-400">{t('received', lang)}</span>
                          <span className="text-emerald-600">{item.receivedQuantity}</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-slate-400">Prog</span>
                          <span className="text-blue-600">{Math.round(progress)}%</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-slate-400">{t('pending', lang)}</span>
                          <span className="text-orange-500">{Math.max(0, item.totalQuantity - item.receivedQuantity)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {contract.deliveries?.length > 0 && (
                  <div className="pt-4 border-t border-slate-50">
                    <button 
                      onClick={() => setHistoryTarget(contract)}
                      className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-1.5 hover:underline"
                    >
                      <History size={12}/> {t('history', lang)} ({contract.deliveries.length})
                    </button>
                  </div>
                )}
              </div>

              {contract.status === ContractStatus.OPEN && (
                <div className="p-4 bg-slate-50/50 border-t border-slate-100 mt-auto">
                  <button 
                    onClick={() => setDeliveryTarget(contract)}
                    className="w-full py-3 bg-white border-2 border-dashed border-blue-200 rounded-2xl text-blue-600 font-black text-xs hover:bg-blue-50 hover:border-blue-300 transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
                  >
                    <Plus size={16}/> {t('addDelivery', lang)}
                  </button>
                </div>
              )}
            </div>
          ))}

          {filteredContracts.length === 0 && (
            <div className="col-span-full py-24 flex flex-col items-center justify-center text-slate-300 space-y-4">
              <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center border border-slate-200">
                <Box size={40} className="opacity-20"/>
              </div>
              <p className="font-bold tracking-tight">No contracts found.</p>
              {syncing && <p className="text-[10px] font-black uppercase tracking-widest animate-pulse">Syncing your account...</p>}
            </div>
          )}
        </div>
      </main>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 bg-white/90 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-2xl z-40">
        <button 
          onClick={() => alert("OCR Bill Scan integration coming in next update!")}
          className="flex items-center gap-2 px-6 py-3.5 text-slate-600 font-black hover:text-blue-600 transition-all text-xs uppercase tracking-widest border-r border-slate-100"
        >
          <Camera size={20} className="text-blue-500"/>
          <span className="hidden md:inline">{t('scanBill', lang)}</span>
        </button>
        <button 
          onClick={() => setShowContractModal(true)}
          className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl font-black shadow-xl shadow-blue-200 hover:scale-105 active:scale-95 transition-all text-xs uppercase tracking-widest"
        >
          <Plus size={20}/>
          <span>{t('createContract', lang)}</span>
        </button>
      </div>

      {/* Modals */}
      {showContractModal && (
        <ContractModal 
          lang={lang} 
          onClose={() => setShowContractModal(false)} 
          onSave={handleAddContract}
        />
      )}

      {deliveryTarget && (
        <DeliveryModal 
          contract={deliveryTarget}
          lang={lang}
          onClose={() => setDeliveryTarget(null)}
          onSave={handleAddDelivery}
        />
      )}

      {historyTarget && (
        <HistoryModal
          contract={historyTarget}
          lang={lang}
          onClose={() => setHistoryTarget(null)}
          onDeleteDelivery={(did) => handleDeleteDelivery(historyTarget.id, did)}
        />
      )}

      {showSettingsModal && (
        <SettingsModal
          lang={lang}
          config={firebaseConfig}
          user={user}
          onClose={() => setShowSettingsModal(false)}
          onLogout={handleLogout}
          onSave={(cfg) => {
            setFirebaseConfig(cfg);
            setShowSettingsModal(false);
          }}
        />
      )}

      {/* AI Assistant */}
      <AiAssistant contracts={contracts} lang={lang} />
    </div>
  );
};

export default App;
