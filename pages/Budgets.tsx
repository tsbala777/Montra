
import React, { useMemo, useState } from 'react';
import { Transaction, Category, Budget } from '../types';
import { GlassCard, GlassButton, GlassInput, GlassSelect } from '../components/ui/Glass';
import { CATEGORY_ICONS, CATEGORY_COLORS } from '../constants';
import { Plus, Pencil, Trash2, PiggyBank, Sparkles, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine, CartesianGrid } from 'recharts';
import { BudgetModal } from '../components/BudgetModal';

interface Props {
  transactions: Transaction[];
  budgets: Budget[];
  onSaveBudget: (budget: Budget) => void;
  onDeleteBudget: (category: Category) => void;
  currency: string;
}

const CustomTooltip = ({ active, payload, label, currency }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-white/60 dark:border-white/10 p-3 rounded-xl shadow-xl">
        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-sm font-bold text-slate-800 dark:text-white">
          <span className="text-[#2563EB] mr-1">●</span>
          {currency}{payload[0].value.toFixed(2)} Spent
        </p>
      </div>
    );
  }
  return null;
};

export const Budgets: React.FC<Props> = ({ transactions, budgets, onSaveBudget, onDeleteBudget, currency }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  // Define which categories are considered income and should be filtered out of budgets

  // Define which categories are considered income and should be filtered out of budgets
  const INCOME_CATEGORIES = [Category.INCOME, Category.INCOME_SOURCE, Category.SCHOLARSHIP, Category.GIFT];

  // Calculate actual spending per category for current month
  const spendingData = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // 1. Spending by Category
    const byCategory: Record<string, number> = {};

    // 2. Daily Trend Data
    // Get all transactions that fall into budgeted categories
    const relevantTransactions = transactions.filter(t => {
      const d = new Date(t.date);
      const isBudgeted = budgets.some(b => b.category === t.category);
      return t.type === 'expense' && d.getMonth() === currentMonth && d.getFullYear() === currentYear && isBudgeted;
    });

    // Populate byCategory map
    transactions.forEach(t => {
      const d = new Date(t.date);
      if (t.type === 'expense' && d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
      }
    });

    // Build Chart Data (Cumulative Daily)
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const chartData = [];
    let runningTotal = 0;
    const today = now.getDate(); // Only plot up to today

    for (let day = 1; day <= today; day++) {
      const daySpending = relevantTransactions
        .filter(t => new Date(t.date).getDate() === day)
        .reduce((sum, t) => sum + t.amount, 0);

      runningTotal += daySpending;

      chartData.push({
        day: day,
        label: new Date(currentYear, currentMonth, day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        spent: runningTotal
      });
    }

    const totalBudgetLimit = budgets.reduce((sum, b) => sum + b.limit, 0);
    const totalSpentBudgeted = relevantTransactions.reduce((sum, t) => sum + t.amount, 0);

    return {
      byCategory,
      chartData,
      totalBudgetLimit,
      totalSpentBudgeted
    };
  }, [transactions, budgets]);

  const handleSave = (budget: Budget) => {
    onSaveBudget(budget);
    setIsAdding(false);
    setEditingBudget(null);
  };

  const startEdit = (b: Budget) => {
    setEditingBudget(b);
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
            <Plus size={20} />
            <span className="hidden md:inline">Set Budget</span>
            <span className="md:hidden">New</span>
          </GlassButton>
        )}
      </div>

      <BudgetModal
        isOpen={isAdding}
        onClose={() => { setIsAdding(false); setEditingBudget(null); }}
        onSave={handleSave}
        currency={currency}
        initialData={editingBudget}
        existingCategories={budgets.map(b => b.category)}
      />

      {budgets.length > 0 && spendingData.chartData.length > 0 && (
        <GlassCard className="p-6 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp size={24} className="text-[#2563EB]" />
                Spending Trend
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                Cumulative spending for budgeted categories this month.
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Total Budget</p>
              <p className="text-xl font-black text-slate-900 dark:text-white">{currency}{spendingData.totalBudgetLimit.toLocaleString()}</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={spendingData.chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  minTickGap={30}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                />
                <Tooltip content={<CustomTooltip currency={currency} />} />
                <ReferenceLine y={spendingData.totalBudgetLimit} stroke="#10b981" strokeDasharray="3 3" label={{ position: 'top', value: 'Limit', fill: '#10b981', fontSize: 10, fontWeight: 'bold' }} />
                <Area
                  type="monotone"
                  dataKey="spent"
                  stroke="#2563EB"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorSpent)"
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      )}

      {budgets.length === 0 && !isAdding ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-fade-in">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-[#2563EB]/10 blur-3xl rounded-full" />
            <div className="relative bg-white dark:bg-slate-900 glass-panel p-8 rounded-[2.5rem] shadow-2xl animate-float">
              <PiggyBank className="w-20 h-20 text-[#2563EB]" strokeWidth={1.5} />
            </div>
            <div className="absolute -top-2 -right-2 p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl shadow-lg animate-pulse">
              <Sparkles size={24} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">Your money, your rules.</h2>
          <p className="text-slate-600 dark:text-slate-300 font-bold max-w-sm mb-8 leading-relaxed">
            Stop wondering where your money went and start telling it where to go. Create a budget to track your limits effortlessly.
          </p>
          <GlassButton onClick={() => setIsAdding(true)} className="px-8 py-4 text-lg font-bold bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 shadow-xl scale-105 hover:scale-110 active:scale-95 transition-all border-none">
            <Plus size={20} className="mr-1" />
            Create Your First Budget
          </GlassButton>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {budgets.map((budget) => {
            const spent = spendingData.byCategory[budget.category] || 0;
            const remaining = budget.limit - spent;
            const rawPercentage = (spent / budget.limit) * 100;
            const widthPercentage = Math.min(rawPercentage, 100);

            const isNearLimit = rawPercentage >= 85 && rawPercentage < 100;
            const isOverLimit = rawPercentage >= 100;

            let barGradient = 'from-emerald-400 to-emerald-600';
            let shadowColor = 'shadow-emerald-500/30';
            let statusIcon = <CheckCircle2 size={16} />;
            let statusText = 'On Track';
            let statusColor = 'text-emerald-600 dark:text-emerald-400';
            let statusBg = 'bg-emerald-50 dark:bg-emerald-500/10';

            if (isOverLimit) {
              barGradient = 'from-red-500 to-rose-600';
              shadowColor = 'shadow-red-500/30';
              statusIcon = <AlertTriangle size={16} />;
              statusText = 'Exceeded';
              statusColor = 'text-red-600 dark:text-red-400';
              statusBg = 'bg-red-50 dark:bg-red-500/10';
            } else if (isNearLimit) {
              barGradient = 'from-amber-400 to-orange-500';
              shadowColor = 'shadow-orange-500/30';
              statusIcon = <AlertTriangle size={16} />;
              statusText = 'Near Limit';
              statusColor = 'text-amber-600 dark:text-amber-400';
              statusBg = 'bg-amber-50 dark:bg-amber-500/10';
            }

            return (
              <GlassCard key={budget.category} hoverEffect className="relative group overflow-visible border-white/40 dark:border-white/5 p-6 transition-all duration-300 hover:shadow-[0_8px_32px_0_rgba(37,99,235,0.1)] hover:-translate-y-1">
                {/* Futuristic Glow Effect Removed */}

                <div className="relative">
                  {/* Card Header with Edit/Delete */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/10 dark:shadow-none border border-white/50 dark:border-white/10 backdrop-blur-md relative overflow-hidden group-hover:scale-105 transition-transform duration-300`}>
                        <div className={`absolute inset-0 opacity-20 ${CATEGORY_COLORS[budget.category].replace('bg-', 'bg-')}`} />
                        <div className="relative z-10 text-slate-700 dark:text-white/90">
                          {React.cloneElement(CATEGORY_ICONS[budget.category] as React.ReactElement<any>, { size: 26 })}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-bold text-lg text-slate-800 dark:text-white leading-tight mb-1">{budget.category}</h4>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Limit: {currency}{budget.limit.toFixed(0)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button onClick={() => startEdit(budget)} className="p-2 text-slate-400 hover:text-[#2563EB] transition-colors rounded-xl hover:bg-white/50 dark:hover:bg-slate-800/50"><Pencil size={18} /></button>
                      <button onClick={() => onDeleteBudget(budget.category)} className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-xl hover:bg-white/50 dark:hover:bg-slate-800/50"><Trash2 size={18} /></button>
                    </div>
                  </div>

                  {/* Progress Section */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-end text-sm">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-widest mb-1">Spent</span>
                        <span className="font-black text-slate-900 dark:text-white text-xl leading-none">{currency}{spent.toFixed(2)}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-widest mb-1">Left</span>
                        <span className={`font-black text-xl leading-none ${remaining < 0 ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
                          {remaining < 0 ? '-' : ''}{currency}{Math.abs(remaining).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Futuristic Bar */}
                    <div className="relative h-3 w-full bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden shadow-inner">
                      <div
                        className={`relative h-full transition-all duration-1000 ease-out rounded-full ${isOverLimit
                          ? 'bg-gradient-to-r from-red-500 to-rose-600 shadow-[0_0_12px_rgba(239,68,68,0.6)]'
                          : isNearLimit
                            ? 'bg-gradient-to-r from-amber-400 to-orange-500 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                            : 'bg-[#2563EB] shadow-[0_0_12px_rgba(37,99,235,0.5)]'
                          }`}
                        style={{ width: `${widthPercentage}%` }}
                      >
                        <div className="absolute inset-0 bg-white/20 animate-pulse-slow" />
                      </div>
                    </div>

                    {/* Footer Status */}
                    <div className="flex justify-between items-center pt-2">
                      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide backdrop-blur-sm ${statusBg} ${statusColor} ring-1 ring-inset ring-white/10`}>
                        {statusIcon}
                        {statusText}
                      </div>
                      <span className="text-xs font-bold text-slate-400 dark:text-slate-500">{rawPercentage.toFixed(0)}%</span>
                    </div>
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
