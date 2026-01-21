// ... imports ...
import React, { useState, useEffect } from 'react';

import { View, Transaction, TransactionType, Category, Budget, SavingsGoal, UserSettings } from './types';
import { NAV_ITEMS, PRESET_TAGS } from './constants';

import { TransactionModal } from './components/TransactionModal';
import { TopNavbar } from './components/TopNavbar';
import { Plus, Loader2 } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { InstallPrompt } from './components/InstallPrompt';
import { NetworkStatus } from './components/NetworkStatus';
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
import { ConfirmationProvider, useConfirmation } from './contexts/ConfirmationContext';

// Lazy load pages
const Dashboard = React.lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })));
const TransactionsList = React.lazy(() => import('./pages/TransactionsList').then(module => ({ default: module.TransactionsList })));
const Budgets = React.lazy(() => import('./pages/Budgets').then(module => ({ default: module.Budgets })));
const Goals = React.lazy(() => import('./pages/Goals').then(module => ({ default: module.Goals })));
const Analytics = React.lazy(() => import('./pages/Analytics').then(module => ({ default: module.Analytics })));
const Investments = React.lazy(() => import('./pages/Investments').then(module => ({ default: module.Investments })));
const Settings = React.lazy(() => import('./pages/Settings').then(module => ({ default: module.Settings })));
const Auth = React.lazy(() => import('./pages/Auth').then(module => ({ default: module.Auth })));



const DEFAULT_SETTINGS: UserSettings = {
  currency: '₹',
  language: 'en',
  theme: 'vibrant',
  isDarkMode: false,
  investmentAmount: 0,
  investments: [],
  profile: {
    name: '',
    email: '',
    phone: '',
    avatar: '',
    bio: ''
  }
};

// Main App content component (uses auth context)
const AppContent = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { confirm } = useConfirmation();

  const [currentView, setCurrentView] = useState<View>('login');
  const [isModalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<TransactionType>('expense');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
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

    // Only set view to dashboard if we are currently in login/signup state, to preserve view on reload if possible (though simple state reset here)
    // Actually, simplifying: defaulting to dashboard on fresh auth load is standard.
    if (currentView === 'login' || currentView === 'signup') {
      setCurrentView('dashboard');
    }

    setDataLoading(true);

    // Subscribe to real-time updates
    const unsubTransactions = subscribeToTransactions(user.uid, (data) => {
      setTransactions(data);
    });

    const unsubSettings = subscribeToSettings(user.uid, (data) => {
      console.log('🔄 App received settings from Firestore:', {
        hasData: !!data,
        investmentsCount: data?.investments?.length || 0,
        investments: data?.investments
      });
      if (data) {
        setSettings(data);
      } else {
        // Save default settings with user name
        console.log('⚠️ No settings found, creating defaults');
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

  const handleSaveTransaction = async (t: Omit<Transaction, 'id'>) => {
    if (!user) return;

    // If editing, use existing ID, otherwise generate new one
    const id = editingTransaction ? editingTransaction.id : crypto.randomUUID();
    const transactionToSave = { ...t, id };

    await saveTransaction(user.uid, transactionToSave);

    // Check for new tags and save them
    if (transactionToSave.tags && transactionToSave.tags.length > 0) {
      const currentCustomTags = settings.customTags || [];
      const allKnownTags = new Set([...PRESET_TAGS, ...currentCustomTags]);

      const newTags = transactionToSave.tags.filter(tag => !allKnownTags.has(tag));

      if (newTags.length > 0) {
        const updatedCustomTags = [...currentCustomTags, ...newTags];
        const newSettings = { ...settings, customTags: updatedCustomTags };
        await handleUpdateSettings(newSettings);
      }
    }

    // Close modal and reset editing state
    setModalOpen(false);
    setEditingTransaction(null);
  };

  const handleEditTransaction = (t: Transaction) => {
    setEditingTransaction(t);
    setModalType(t.type);
    setModalOpen(true);
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!user) return;
    if (await confirm({
      title: 'Delete Transaction?',
      message: 'Are you sure you want to delete this transaction?',
      variant: 'danger'
    })) {
      try {
        await deleteTransactionFromDb(user.uid, id);
      } catch (error) {
        console.error('Failed to delete transaction:', error);
        alert('Failed to delete transaction. Please try again.');
      }
    }
  };

  const handleSaveBudget = async (budget: Budget) => {
    if (!user) return;
    await saveBudgetToDb(user.uid, budget);
  };

  const handleDeleteBudget = async (id: string) => {
    if (!user) return;
    if (await confirm({
      title: 'Delete Budget?',
      message: 'Are you sure you want to delete this budget?',
      variant: 'danger'
    })) {
      try {
        await deleteBudgetFromDb(user.uid, id);
      } catch (error) {
        console.error('Failed to delete budget:', error);
        alert('Failed to delete budget. Please try again.');
      }
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
    if (await confirm({
      title: 'Delete Goal?',
      message: 'Are you sure you want to delete this savings goal?',
      variant: 'danger'
    })) {
      try {
        await deleteGoalFromDb(user.uid, id);
      } catch (error) {
        console.error('Failed to delete goal:', error);
        alert('Failed to delete goal. Please try again.');
      }
    }
  };

  const handleEditGoal = async (goal: SavingsGoal) => {
    if (!user) return;
    await updateGoalInDb(user.uid, goal.id, goal);
  };

  const handleUpdateSettings = async (newSettings: UserSettings) => {
    if (!user) return;
    setSettings(newSettings);
    await saveUserSettings(user.uid, newSettings);
  };

  const handleDeleteTag = async (tagToDelete: string) => {
    if (!user) return;

    const isPreset = PRESET_TAGS.includes(tagToDelete);
    const newSettings = { ...settings };

    if (isPreset) {
      // Add to hidden tags
      const currentHiddenTags = settings.hiddenTags || [];
      if (!currentHiddenTags.includes(tagToDelete)) {
        newSettings.hiddenTags = [...currentHiddenTags, tagToDelete];
      }
    } else {
      // Remove from custom tags
      const currentCustomTags = settings.customTags || [];
      newSettings.customTags = currentCustomTags.filter(tag => tag !== tagToDelete);
    }

    await handleUpdateSettings(newSettings);
  };

  const resetData = async () => {
    if (!user) return;

    if (await confirm({
      title: 'Reset All Data?',
      message: 'Are you sure you want to delete ALL your data? This cannot be undone!',
      variant: 'danger',
      confirmText: 'Yes, Delete Everything'
    })) {
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
            onAddTransaction={(type) => {
              setEditingTransaction(null);
              setModalType(type);
              setModalOpen(true);
            }}
            currency={settings.currency}
            isDarkMode={settings.isDarkMode}
            investmentAmount={settings.investmentAmount}
            onUpdateInvestment={(amount) => {
              const newSettings = { ...settings, investmentAmount: amount };
              handleUpdateSettings(newSettings);
            }}
          />
        );
      case 'transactions':
        return (
          <TransactionsList
            transactions={transactions}
            onDelete={handleDeleteTransaction}
            onEdit={handleEditTransaction}
            onAddTransaction={() => {
              setEditingTransaction(null);
              setModalOpen(true);
            }}
            currency={settings.currency}
          />
        );
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
            onEditGoal={handleEditGoal}
            onDeleteGoal={handleDeleteGoal}
            currency={settings.currency}
          />
        );
      case 'analytics':
        return (
          <Analytics
            transactions={transactions}
            budgets={budgets}
            goals={goals}
            currency={settings.currency}
          />
        );
      case 'investments':
        return (
          <Investments
            investments={settings.investments || []}
            currency={settings.currency}
            onAddInvestment={(investment) => {
              const newInvestment = { ...investment, id: Date.now().toString() };
              const newSettings = {
                ...settings,
                investments: [...(settings.investments || []), newInvestment]
              };
              handleUpdateSettings(newSettings);
            }}
            onUpdateInvestment={(investment) => {
              const newInvestments = (settings.investments || []).map(inv =>
                inv.id === investment.id ? investment : inv
              );
              const newSettings = { ...settings, investments: newInvestments };
              handleUpdateSettings(newSettings);
            }}
            onDeleteInvestment={async (id) => {
              if (await confirm({
                title: 'Delete Investment?',
                message: 'Are you sure you want to remove this investment from your portfolio?',
                variant: 'danger'
              })) {
                const newInvestments = (settings.investments || []).filter(inv => inv.id !== id);
                const newSettings = { ...settings, investments: newInvestments };
                handleUpdateSettings(newSettings);
              }
            }}
          />
        );
      case 'settings':
        return (
          <Settings
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onResetData={resetData}
            onLogout={handleLogout}
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
            onAddTransaction={() => {
              setEditingTransaction(null);
              setModalOpen(true);
            }}
            onNavigate={(view) => setCurrentView(view as View)}
            currency={settings.currency}
            isDarkMode={settings.isDarkMode}
            investmentAmount={
              (settings.investments || []).reduce((acc, inv) => acc + (inv.currentValue * inv.quantity), 0)
            }
            onUpdateInvestment={() => { }}
          />
        );
    }
  };

  const showNav = user && currentView !== 'login' && currentView !== 'signup';

  return (
    <div className={`flex flex-col h-screen w-full overflow-hidden transition-colors duration-500 ${settings.isDarkMode ? 'dark' : 'bg-slate-50/50'} ${settings.theme === 'vibrant' ? 'vibrant-mode' : ''}`}>

      {/* Top Navbar (Desktop) */}
      {showNav && (
        <TopNavbar
          currentView={currentView}
          onNavClick={handleNavClick}
          onLogout={handleLogout}
          profile={settings.profile}
          email={user?.email || settings.profile.email}
          language={settings.language}
          onLanguageChange={(lang) => handleUpdateSettings({ ...settings, language: lang })}
        />
      )}

      {/* Main Content Wrapper */}
      <main
        className={`
          flex-1 h-full overflow-hidden relative 
          transition-all duration-500 ease-ios transform-gpu
        `}
      >

        {/* Content Container with Top Padding for Navbar */}
        <div className={`h-full overflow-y-auto px-4 pb-48 md:px-8 md:pb-8 custom-scrollbar ${showNav ? 'pt-32 md:pt-28' : 'pt-6 md:pt-8'}`}>
          <div className="max-w-7xl mx-auto">
            {/* Keyed container for page transitions */}
            <div key={currentView} className="animate-page-enter">
              <React.Suspense fallback={
                <div className="flex h-[50vh] w-full items-center justify-center">
                  <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                </div>
              }>
                {renderView()}
              </React.Suspense>
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
          onClick={() => {
            setEditingTransaction(null);
            setModalOpen(true);
          }}
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
        onClose={() => {
          setModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        currency={settings.currency}
        initialType={modalType}
        initialData={editingTransaction}
        availableTags={[...PRESET_TAGS, ...(settings.customTags || [])].filter(t => !(settings.hiddenTags || []).includes(t))}
        onDeleteTag={handleDeleteTag}
      />

      {/* Network Status - Global (Hidden on Desktop Login as it's shown in the card) */}
      <NetworkStatus
        className={currentView === 'login'
          ? "fixed bottom-20 left-1/2 transform -translate-x-1/2 md:hidden"
          : undefined
        }
      />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ConfirmationProvider>
          <AppContent />
        </ConfirmationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
