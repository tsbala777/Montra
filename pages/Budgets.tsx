
import React, { useMemo, useState } from 'react';
import { Transaction, Category, Budget } from '../types';
import { GlassCard, GlassButton, GlassInput, GlassSelect } from '../components/ui/Glass';
import { CATEGORY_ICONS, CATEGORY_COLORS } from '../constants';
import { Plus, Pencil, Trash2, PiggyBank, Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface Props {
  transactions: Transaction[];
  budgets: Budget[];
  onSaveBudget: (budget: Budget) => void;
  onDeleteBudget: (category: Category) => void;
  currency: string;
}

export const Budgets: React.FC<Props> = ({ transactions, budgets, onSaveBudget, onDeleteBudget, currency }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [limit, setLimit] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>(Category.FOOD);

  // Define which categories are considered income and should be filtered out of budgets
  const INCOME_CATEGORIES = [Category.INCOME, Category.INCOME_SOURCE, Category.SCHOLARSHIP, Category.GIFT];

  // Calculate actual spending per category for current month
  const spendingByCategory = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return transactions
      .filter(t => {
        const d = new Date(t.date);
        return t.type === 'expense' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);
  }, [transactions]);

  const handleSave = () => {
    if (!limit || parseFloat(limit) <= 0) return;
    onSaveBudget({
      category: editingCategory || selectedCategory,
      limit: parseFloat(limit)
    });
    setIsAdding(false);
    setEditingCategory(null);
    setLimit('');
  };

  const startEdit = (b: Budget) => {
    setEditingCategory(b.category);
    setLimit(b.limit.toString());
    setIsAdding(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Monthly Budgets</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 font-bold">Track your spending limits for this month.</p>
        </div>
        {!isAdding && budgets.length > 0 && (
          <GlassButton onClick={() => setIsAdding(true)} className="font-bold">
            <Plus size={18} />
            <span className="hidden md:inline">Set Budget</span>
            <span className="md:hidden">New</span>
          </GlassButton>
        )}
      </div>

      {isAdding && (
        <GlassCard className="animate-slide-up border-indigo-100 dark:border-indigo-500/20 bg-white/90 dark:bg-slate-900/90 shadow-xl">
          <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">{editingCategory ? `Edit ${editingCategory} Budget` : 'Create New Budget'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {!editingCategory && (
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5 uppercase tracking-wider">Category</label>
                <GlassSelect 
                  value={selectedCategory} 
                  onChange={(e) => setSelectedCategory(e.target.value as Category)}
                  className="font-bold text-slate-800 dark:text-slate-100"
                >
                  {Object.values(Category)
                    .filter(c => !INCOME_CATEGORIES.includes(c))
                    .map(cat => (
                      <option key={cat} value={cat} className="font-bold">{cat}</option>
                    ))
                  }
                </GlassSelect>
              </div>
            )}
            <div className={editingCategory ? 'col-span-2' : ''}>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5 uppercase tracking-wider">Monthly Limit ({currency})</label>
              <GlassInput 
                type="number" 
                placeholder="0.00" 
                value={limit} 
                onChange={(e) => setLimit(e.target.value)}
                autoFocus
                className="font-bold text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <GlassButton onClick={handleSave} className="flex-1 font-bold">Save Budget</GlassButton>
            <GlassButton variant="secondary" onClick={() => { setIsAdding(false); setEditingCategory(null); }} className="px-6 font-bold">Cancel</GlassButton>
          </div>
        </GlassCard>
      )}

      {budgets.length === 0 && !isAdding ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-fade-in">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-indigo-500/10 blur-3xl rounded-full" />
            <div className="relative bg-white dark:bg-slate-900 glass-panel p-8 rounded-[2.5rem] shadow-2xl animate-float">
              <PiggyBank className="w-16 h-16 text-indigo-500" strokeWidth={1.5} />
            </div>
            <div className="absolute -top-2 -right-2 p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl shadow-lg animate-pulse">
              <Sparkles size={20} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">Your money, your rules.</h2>
          <p className="text-slate-600 dark:text-slate-300 font-bold max-w-sm mb-8 leading-relaxed">
            Stop wondering where your money went and start telling it where to go. Create a budget to track your limits effortlessly.
          </p>
          <GlassButton onClick={() => setIsAdding(true)} className="px-8 py-4 text-lg font-bold shadow-indigo-100 dark:shadow-none scale-105 hover:scale-110 active:scale-95 transition-all">
            <Plus size={20} className="mr-1" />
            Create Your First Budget
          </GlassButton>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {budgets.map((budget) => {
            const spent = spendingByCategory[budget.category] || 0;
            const remaining = budget.limit - spent;
            const rawPercentage = (spent / budget.limit) * 100;
            const widthPercentage = Math.min(rawPercentage, 100);
            
            const isNearLimit = rawPercentage >= 85 && rawPercentage < 100;
            const isOverLimit = rawPercentage >= 100;

            let barGradient = 'from-emerald-400 to-emerald-600';
            let shadowColor = 'shadow-emerald-500/30';
            let statusIcon = <CheckCircle2 size={12} />;
            let statusText = 'On Track';
            let statusColor = 'text-emerald-600 dark:text-emerald-400';
            let statusBg = 'bg-emerald-50 dark:bg-emerald-500/10';

            if (isOverLimit) {
              barGradient = 'from-red-500 to-rose-600';
              shadowColor = 'shadow-red-500/30';
              statusIcon = <AlertTriangle size={12} />;
              statusText = 'Exceeded';
              statusColor = 'text-red-600 dark:text-red-400';
              statusBg = 'bg-red-50 dark:bg-red-500/10';
            } else if (isNearLimit) {
              barGradient = 'from-amber-400 to-orange-500';
              shadowColor = 'shadow-orange-500/30';
              statusIcon = <AlertTriangle size={12} />;
              statusText = 'Near Limit';
              statusColor = 'text-amber-600 dark:text-amber-400';
              statusBg = 'bg-amber-50 dark:bg-amber-500/10';
            }

            return (
              <GlassCard key={budget.category} hoverEffect className="relative group overflow-hidden border-white/60 dark:border-white/5 p-5">
                 {/* Card Header with Edit/Delete */}
                 <div className="flex justify-between items-start mb-5">
                    <div className="flex items-center gap-3">
                       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${CATEGORY_COLORS[budget.category]}`}>
                          {React.cloneElement(CATEGORY_ICONS[budget.category] as React.ReactElement<any>, { size: 20 })}
                       </div>
                       <div>
                          <h4 className="font-bold text-lg text-slate-800 dark:text-white leading-tight">{budget.category}</h4>
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">Budget: {currency}{budget.limit.toFixed(0)}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity bg-white/50 dark:bg-slate-800/50 rounded-lg p-1 backdrop-blur-sm">
                       <button onClick={() => startEdit(budget)} className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors rounded-md hover:bg-white dark:hover:bg-slate-700"><Pencil size={14} /></button>
                       <button onClick={() => onDeleteBudget(budget.category)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors rounded-md hover:bg-white dark:hover:bg-slate-700"><Trash2 size={14} /></button>
                    </div>
                 </div>

                 {/* Progress Section */}
                 <div className="space-y-3">
                    <div className="flex justify-between items-end text-sm">
                       <div className="flex flex-col">
                          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider mb-0.5">Spent</span>
                          <span className="font-bold text-slate-900 dark:text-white text-lg leading-none">{currency}{spent.toFixed(2)}</span>
                       </div>
                       <div className="flex flex-col items-end">
                           <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider mb-0.5">Remaining</span>
                           <span className={`font-bold text-lg leading-none ${remaining < 0 ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
                             {remaining < 0 ? '-' : ''}{currency}{Math.abs(remaining).toFixed(2)}
                           </span>
                       </div>
                    </div>

                    {/* The Bar */}
                    <div className="relative h-4 w-full bg-slate-100 dark:bg-slate-800/50 rounded-full overflow-hidden shadow-inner ring-1 ring-black/5 dark:ring-white/5">
                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(45deg,rgba(0,0,0,.05) 25%,transparent 25%,transparent 50%,rgba(0,0,0,.05) 50%,rgba(0,0,0,.05) 75%,transparent 75%,transparent)', backgroundSize: '1rem 1rem' }}></div>
                        <div 
                           className={`relative h-full bg-gradient-to-r ${barGradient} transition-all duration-1000 ease-out shadow-lg ${shadowColor}`}
                           style={{ width: `${widthPercentage}%` }}
                        >
                           <div className="absolute top-0 right-0 bottom-0 w-full bg-gradient-to-l from-white/20 to-transparent" />
                        </div>
                    </div>

                    {/* Footer Status */}
                    <div className="flex justify-between items-center pt-1">
                       <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${statusBg} ${statusColor}`}>
                          {statusIcon}
                          {statusText}
                       </div>
                       <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{rawPercentage.toFixed(0)}%</span>
                    </div>
                 </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
};
