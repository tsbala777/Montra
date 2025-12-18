
import React, { useState, useEffect } from 'react';
import { View, Transaction, Category, Budget, SavingsGoal, UserSettings } from './types';
import { NAV_ITEMS } from './constants';
import { Dashboard } from './pages/Dashboard';
import { TransactionsList } from './pages/TransactionsList';
import { Budgets } from './pages/Budgets';
import { Goals } from './pages/Goals';
import { Settings } from './pages/Settings';
import { Auth } from './pages/Auth';
import { TransactionModal } from './components/TransactionModal';
import { GlassCard } from './components/ui/Glass';
import { Plus, LogOut } from 'lucide-react';

const DEFAULT_SETTINGS: UserSettings = {
  currency: '$',
  theme: 'vibrant',
  isDarkMode: false,
  profile: {
    name: '',
    school: '',
    year: 'Freshman'
  }
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('montra_auth') === 'true' || sessionStorage.getItem('montra_auth') === 'true';
  });
  const [currentView, setCurrentView] = useState<View>(() => {
    const auth = localStorage.getItem('montra_auth') === 'true' || sessionStorage.getItem('montra_auth') === 'true';
    return auth ? 'dashboard' : 'login';
  });
  const [isModalOpen, setModalOpen] = useState(false);
  
  // State
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('montra_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem('montra_budgets');
    if (saved) return JSON.parse(saved);
    return [
      { category: Category.UTILITIES, limit: 150 },
      { category: Category.SHOPPING, limit: 200 },
      { category: Category.GROCERIES, limit: 250 },
      { category: Category.TRANSPORTATION, limit: 80 },
      { category: Category.PERSONAL_CARE, limit: 50 }
    ];
  });

  const [goals, setGoals] = useState<SavingsGoal[]>(() => {
    const saved = localStorage.getItem('montra_goals');
    if (saved) return JSON.parse(saved);
    return [
      { id: '1', name: "Spring Break '25", targetAmount: 1200, currentAmount: 450, icon: '✈️' },
      { id: '2', name: 'New MacBook Pro', targetAmount: 2000, currentAmount: 800, icon: '💻' }
    ];
  });

  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('montra_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });
  
  // Persist State
  useEffect(() => {
    localStorage.setItem('montra_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('montra_budgets', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('montra_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('montra_settings', JSON.stringify(settings));
  }, [settings]);

  const handleLogin = (name: string, rememberMe: boolean) => {
    setIsAuthenticated(true);
    setSettings(prev => ({
      ...prev,
      profile: { ...prev.profile, name }
    }));
    
    if (rememberMe) {
      localStorage.setItem('montra_auth', 'true');
    } else {
      sessionStorage.setItem('montra_auth', 'true');
    }
    
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('montra_auth');
    sessionStorage.removeItem('montra_auth');
    setCurrentView('login');
  };

  const addTransaction = (t: Omit<Transaction, 'id'>) => {
    const newTransaction = { ...t, id: crypto.randomUUID() };
    setTransactions([newTransaction, ...transactions]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const saveBudget = (budget: Budget) => {
    setBudgets(prev => {
      const existing = prev.findIndex(b => b.category === budget.category);
      if (existing > -1) {
        const updated = [...prev];
        updated[existing] = budget;
        return updated;
      }
      return [...prev, budget];
    });
  };

  const deleteBudget = (category: Category) => {
    setBudgets(prev => prev.filter(b => b.category !== category));
  };

  const addGoal = (g: Omit<SavingsGoal, 'id'>) => {
    const newGoal = { ...g, id: crypto.randomUUID() };
    setGoals([...goals, newGoal]);
  };

  const updateGoalAmount = (id: string, amount: number) => {
    setGoals(prev => prev.map(g => 
      g.id === id ? { ...g, currentAmount: g.currentAmount + amount } : g
    ));
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const resetData = () => {
    setTransactions([]);
    setBudgets([]);
    setGoals([]);
    setSettings(DEFAULT_SETTINGS);
    localStorage.clear();
    sessionStorage.clear();
    setIsAuthenticated(false);
    setCurrentView('login');
  };

  const handleNavClick = (view: View) => {
    setCurrentView(view);
  };

  const renderView = () => {
    if (!isAuthenticated) {
      return (
        <Auth 
          onLogin={handleLogin} 
          currentView={currentView === 'signup' ? 'signup' : 'login'} 
          onSwitch={(view) => setCurrentView(view as View)} 
        />
      );
    }

    switch(currentView) {
      case 'dashboard':
        return <Dashboard transactions={transactions} onAddTransaction={() => setModalOpen(true)} studentName={settings.profile.name} studentSchool={settings.profile.school} currency={settings.currency} isDarkMode={settings.isDarkMode} />;
      case 'transactions':
        return <TransactionsList transactions={transactions} onDelete={deleteTransaction} currency={settings.currency} />;
      case 'budgets':
        return (
          <Budgets 
            transactions={transactions} 
            budgets={budgets} 
            onSaveBudget={saveBudget} 
            onDeleteBudget={deleteBudget}
            currency={settings.currency}
          />
        );
      case 'goals':
        return (
          <Goals 
            goals={goals}
            onAddGoal={addGoal}
            onUpdateGoal={updateGoalAmount}
            onDeleteGoal={deleteGoal}
            currency={settings.currency}
          />
        );
      case 'settings':
         return (
          <Settings 
            settings={settings} 
            onUpdateSettings={setSettings} 
            onResetData={resetData}
            transactions={transactions}
          />
        );
      default:
        return <Dashboard transactions={transactions} onAddTransaction={() => setModalOpen(true)} studentName={settings.profile.name} studentSchool={settings.profile.school} currency={settings.currency} isDarkMode={settings.isDarkMode} />;
    }
  };

  const showNav = isAuthenticated && currentView !== 'login' && currentView !== 'signup';

  return (
    <div className={`flex h-screen w-full overflow-hidden transition-colors duration-500 ${settings.isDarkMode ? 'dark bg-slate-950' : 'bg-slate-50/50'} ${settings.theme === 'vibrant' ? 'vibrant-mode' : ''}`}>
      
      {/* Desktop Sidebar (Hidden on Mobile) */}
      {showNav && (
        <aside 
          className="
            hidden md:flex
            fixed left-0 top-0 bottom-0 z-50 
            flex-col 
            glass-panel border-r border-white/40 dark:border-white/5 
            transition-all duration-500 ease-ios transform-gpu
            overflow-hidden group
            shadow-[0_0_40px_-10px_rgba(0,0,0,0.1)] hover:shadow-[0_0_50px_-5px_rgba(79,70,229,0.15)]
            backdrop-blur-2xl saturate-150
            md:translate-x-0 md:w-20 md:hover:w-72
          "
        >
          {/* Header / Logo */}
          <div className="h-24 flex items-center px-5 relative shrink-0">
             <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-indigo-600 text-white flex items-center justify-center text-lg font-bold shadow-lg shadow-indigo-500/20 z-10 shrink-0 transform transition-transform duration-300 hover:scale-110 hover:rotate-3">
                 M
               </div>
               <div className="md:absolute md:left-20 md:opacity-0 md:group-hover:opacity-100 transition-all duration-500 delay-75 md:transform md:translate-x-4 md:group-hover:translate-x-0 whitespace-nowrap">
                  <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Montra</h1>
                  <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Student Finance</p>
               </div>
             </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 space-y-2 py-4">
            {NAV_ITEMS.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id as View)}
                  className={`w-full flex items-center h-12 rounded-xl transition-all duration-300 ease-ios relative group/item overflow-hidden active:scale-95 ${
                    isActive 
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg shadow-indigo-500/20' 
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/10'
                  }`}
                >
                  <div className="w-14 flex items-center justify-center shrink-0">
                     <item.icon size={20} className={`transition-transform duration-300 ease-ios ${isActive ? '' : 'group-hover/item:scale-110'}`} />
                  </div>
                  <span className={`whitespace-nowrap font-medium text-sm transition-all duration-300 ease-ios absolute left-14 md:opacity-0 md:group-hover:opacity-100 md:transform md:translate-x-4 md:group-hover:translate-x-0 md:delay-75`}>
                    {item.label}
                  </span>
                </button>
              )
            })}
          </nav>

          {/* Footer Actions */}
          <div className="p-3 space-y-2 shrink-0 bg-gradient-to-t from-white/80 via-white/50 to-transparent dark:from-slate-900 dark:via-slate-900/50">
             {/* Pro Tip Card */}
            <div className="w-full md:h-0 md:group-hover:h-auto overflow-hidden md:opacity-0 md:group-hover:opacity-100 transition-all duration-500 delay-100 ease-ios">
               <GlassCard className="bg-gradient-to-br from-indigo-500 to-purple-600 border-none text-white p-4 mb-2 shadow-lg shadow-indigo-500/20">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Plus size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white mb-0.5">Quick Tip</p>
                    <p className="text-[10px] leading-relaxed opacity-90 text-white/80">Log expenses daily to boost your streak!</p>
                  </div>
                </div>
              </GlassCard>
            </div>

            <button 
              onClick={handleLogout}
              className="w-full flex items-center h-12 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-300 ease-ios whitespace-nowrap overflow-hidden relative active:scale-95"
            >
               <div className="w-14 flex items-center justify-center shrink-0">
                 <LogOut size={20} />
               </div>
               <span className="absolute left-14 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 ease-ios">Sign Out</span>
            </button>
          </div>
        </aside>
      )}

      {/* Main Content Wrapper */}
      <main 
        className={`
          flex-1 h-full overflow-hidden relative 
          transition-all duration-500 ease-ios transform-gpu
          ${showNav ? 'md:ml-20' : ''}
        `}
      >
        
        {/* Mobile Header (Simplified) */}
        {showNav && (
          <div className="md:hidden h-16 glass-panel border-b border-white/40 dark:border-white/5 flex items-center justify-center px-4 sticky top-0 z-30 backdrop-blur-xl transition-all duration-300 ease-ios">
            <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-slate-900 dark:bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">M</div>
              Montra
            </span>
          </div>
        )}

        <div className="h-full overflow-y-auto p-4 md:p-8 pb-32 md:pb-8 custom-scrollbar">
          <div className="max-w-6xl mx-auto">
             {/* Keyed container for page transitions */}
            <div key={currentView} className="animate-page-enter">
              {renderView()}
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation Card */}
      {showNav && (
        <nav className="md:hidden fixed bottom-5 left-4 right-4 h-16 glass-panel bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-2xl z-40 flex items-center justify-between px-6 shadow-2xl shadow-slate-300/20 dark:shadow-black/50 border border-white/40 dark:border-white/10 ring-1 ring-black/5 dark:ring-white/5">
          {NAV_ITEMS.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id as View)}
                className={`relative flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 ease-out active:scale-90 ${
                  isActive 
                    ? 'text-indigo-600 dark:text-indigo-400' 
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                <div className={`transition-all duration-300 ${isActive ? 'scale-110 -translate-y-1' : ''}`}>
                  <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                {isActive && (
                   <span className="absolute -bottom-1 w-1 h-1 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-scale-in" />
                )}
              </button>
            )
          })}
        </nav>
      )}

      {/* Floating Action Button (Mobile) - Positioned above Bottom Nav */}
      {showNav && (
        <button 
          onClick={() => setModalOpen(true)}
          className={`
            md:hidden fixed bottom-24 right-5 w-14 h-14 bg-slate-900 dark:bg-indigo-600 text-white rounded-full 
            shadow-xl shadow-indigo-500/30 flex items-center justify-center 
            transition-all duration-500 ease-ios z-50 hover:scale-110 active:scale-95 border-2 border-white/20
          `}
        >
          <Plus size={26} />
        </button>
      )}

      {/* Transaction Modal */}
      <TransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setModalOpen(false)} 
        onSave={addTransaction} 
        currency={settings.currency}
      />
    </div>
  );
};

export default App;
