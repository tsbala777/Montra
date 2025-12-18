
import React, { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
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
import { Plus, LogOut, Cloud, Loader2 } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import {
  subscribeToTransactions,
  subscribeToSettings,
  subscribeToBudgets,
  subscribeToGoals,
  saveTransaction,
  deleteTransaction as deleteTransactionFromDb,
  saveBudget as saveBudgetToDb,
  deleteBudget as deleteBudgetFromDb,
  saveGoal as saveGoalToDb,
  updateGoal as updateGoalInDb,
  deleteGoal as deleteGoalFromDb,
  saveUserSettings,
  deleteAllUserData
} from './services/firestoreService';

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

// Main App content component (uses auth context)
const AppContent = () => {
  const { user, loading: authLoading, signOut } = useAuth();

  const [currentView, setCurrentView] = useState<View>('login');
  const [isModalOpen, setModalOpen] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  // State for data
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);

  // Subscribe to Firestore data when user is authenticated
  useEffect(() => {
    if (!user) {
      setCurrentView('login');
      setDataLoading(false);
      return;
    }

    setCurrentView('dashboard');
    setDataLoading(true);

    // Subscribe to real-time updates
    const unsubTransactions = subscribeToTransactions(user.uid, (data) => {
      setTransactions(data);
    });

    const unsubSettings = subscribeToSettings(user.uid, (data) => {
      if (data) {
        setSettings(data);
      } else {
        // Save default settings with user name
        const newSettings = {
          ...DEFAULT_SETTINGS,
          profile: { ...DEFAULT_SETTINGS.profile, name: user.displayName || '' }
        };
        saveUserSettings(user.uid, newSettings);
        setSettings(newSettings);
      }
    });

    const unsubBudgets = subscribeToBudgets(user.uid, (data) => {
      setBudgets(data);
    });

    const unsubGoals = subscribeToGoals(user.uid, (data) => {
      setGoals(data);
    });

    setDataLoading(false);

    // Cleanup subscriptions
    return () => {
      unsubTransactions();
      unsubSettings();
      unsubBudgets();
      unsubGoals();
    };
  }, [user]);

  // Apply theme
  useEffect(() => {
    if (settings.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.isDarkMode]);

  const handleLogout = async () => {
    try {
      await signOut();
      setCurrentView('login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const addTransaction = async (t: Omit<Transaction, 'id'>) => {
    if (!user) return;
    const newTransaction = { ...t, id: crypto.randomUUID() };
    await saveTransaction(user.uid, newTransaction);
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!user) return;
    try {
      await deleteTransactionFromDb(user.uid, id);
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      alert('Failed to delete transaction. Please try again.');
    }
  };

  const handleSaveBudget = async (budget: Budget) => {
    if (!user) return;
    await saveBudgetToDb(user.uid, budget);
  };

  const handleDeleteBudget = async (category: Category) => {
    if (!user) return;
    try {
      await deleteBudgetFromDb(user.uid, category.toString());
    } catch (error) {
      console.error('Failed to delete budget:', error);
      alert('Failed to delete budget. Please try again.');
    }
  };

  const addGoal = async (g: Omit<SavingsGoal, 'id'>) => {
    if (!user) return;
    const newGoal = { ...g, id: crypto.randomUUID() };
    await saveGoalToDb(user.uid, newGoal);
  };

  const updateGoalAmount = async (id: string, amount: number) => {
    if (!user) return;
    const goal = goals.find(g => g.id === id);
    if (goal) {
      await updateGoalInDb(user.uid, id, { currentAmount: goal.currentAmount + amount });
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (!user) return;
    try {
      await deleteGoalFromDb(user.uid, id);
    } catch (error) {
      console.error('Failed to delete goal:', error);
      alert('Failed to delete goal. Please try again.');
    }
  };

  const handleUpdateSettings = async (newSettings: UserSettings) => {
    if (!user) return;
    setSettings(newSettings);
    await saveUserSettings(user.uid, newSettings);
  };

  const resetData = async () => {
    if (!user) return;
    if (confirm('Are you sure you want to delete ALL your data? This cannot be undone!')) {
      await deleteAllUserData(user.uid);
      // Reset local state
      setTransactions([]);
      setBudgets([]);
      setGoals([]);
      setSettings(DEFAULT_SETTINGS);
    }
  };

  const handleNavClick = (view: View) => {
    setCurrentView(view);
  };

  // Show loading screen while auth is initializing
  if (authLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Loading Montra...</p>
        </div>
      </div>
    );
  }

  const renderView = () => {
    if (!user) {
      return (
        <Auth
          currentView={currentView === 'signup' ? 'signup' : 'login'}
          onSwitch={(view) => setCurrentView(view as View)}
        />
      );
    }

    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard
            transactions={transactions}
            budgets={budgets}
            goals={goals}
            profile={settings.profile}
            onAddTransaction={() => setModalOpen(true)}
            currency={settings.currency}
            isDarkMode={settings.isDarkMode}
          />
        );
      case 'transactions':
        return <TransactionsList transactions={transactions} onDelete={handleDeleteTransaction} currency={settings.currency} />;
      case 'budgets':
        return (
          <Budgets
            transactions={transactions}
            budgets={budgets}
            onSaveBudget={handleSaveBudget}
            onDeleteBudget={handleDeleteBudget}
            currency={settings.currency}
          />
        );
      case 'goals':
        return (
          <Goals
            goals={goals}
            onAddGoal={addGoal}
            onUpdateGoal={updateGoalAmount}
            onDeleteGoal={handleDeleteGoal}
            currency={settings.currency}
          />
        );
      case 'settings':
        return (
          <Settings
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onResetData={resetData}
            transactions={transactions}
          />
        );
      default:
        return (
          <Dashboard
            transactions={transactions}
            budgets={budgets}
            goals={goals}
            profile={settings.profile}
            onAddTransaction={() => setModalOpen(true)}
            currency={settings.currency}
            isDarkMode={settings.isDarkMode}
          />
        );
    }
  };

  const showNav = user && currentView !== 'login' && currentView !== 'signup';

  return (
    <div className={`flex h-screen w-full overflow-hidden transition-colors duration-500 ${settings.isDarkMode ? 'dark' : 'bg-slate-50/50'} ${settings.theme === 'vibrant' ? 'vibrant-mode' : ''}`}>

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
                  className={`w-full flex items-center h-12 rounded-xl transition-all duration-300 ease-ios relative group/item overflow-hidden active:scale-95 ${isActive
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg shadow-indigo-500/20'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/10'
                    }`}
                >
                  <div className="w-14 flex items-center justify-center shrink-0">
                    <item.icon size={24} className={`transition-transform duration-300 ease-ios ${isActive ? '' : 'group-hover/item:scale-110'}`} />
                  </div>
                  <span className={`whitespace-nowrap font-medium text-sm transition-all duration-300 ease-ios absolute left-14 md:opacity-0 md:group-hover:opacity-100 md:transform md:translate-x-4 md:group-hover:translate-x-0 md:delay-75`}>
                    {item.label}
                  </span>
                </button>
              )
            })}
          </nav>

          {/* Footer Actions */}
          <div className="p-3 space-y-2 shrink-0 bg-gradient-to-t from-white/80 via-white/50 to-transparent dark:from-slate-900/50 dark:via-slate-900/20">
            {/* Cloud Indicator */}
            <div className="w-full md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-white/5 rounded-lg text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">
                <Cloud size={16} className="text-indigo-500" />
                Cloud Synced
              </div>
            </div>

            {/* Pro Tip Card */}
            <div className="w-full md:h-0 md:group-hover:h-auto overflow-hidden md:opacity-0 md:group-hover:opacity-100 transition-all duration-500 delay-100 ease-ios">
              <GlassCard className="bg-gradient-to-br from-indigo-500 to-purple-600 border-none text-white p-4 mb-2 shadow-lg shadow-indigo-500/20">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Plus size={18} />
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
                <LogOut size={24} />
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

        <div className="h-full overflow-y-auto px-4 pt-6 pb-48 md:p-8 custom-scrollbar">
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
                className={`relative flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 ease-out active:scale-90 ${isActive
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                  }`}
              >
                <div className={`transition-all duration-300 ${isActive ? 'scale-110 -translate-y-1' : ''}`}>
                  <item.icon size={26} strokeWidth={isActive ? 2.5 : 2} />
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
          <Plus size={32} />
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

// Root App component with AuthProvider
const App = () => {
  return (
    <AuthProvider>
      <AppContent />
      <Analytics />
    </AuthProvider>
  );
};

export default App;
