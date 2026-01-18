import React, { useState, useEffect, useRef } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, LabelList, BarChart, Bar, LineChart, Line } from 'recharts';
import { Transaction, Category, Budget, SavingsGoal, UserProfile } from '../types';
import { GlassCard, GlassButton } from '../components/ui/Glass';
import { CreditCardWidget } from '../components/CreditCardWidget';
import { CATEGORY_ICONS, CATEGORY_COLORS, GOAL_ICON_COMPONENTS } from '../constants';
import { TrendingUp, TrendingDown, ArrowUpRight, Wallet, MoreHorizontal, Calendar, PieChart as PieChartIcon, Activity, Plus, X, Landmark, Target, AlertCircle } from 'lucide-react';

interface Props {
  transactions: Transaction[];
  budgets: Budget[];
  goals: SavingsGoal[];
  profile: UserProfile;
  onAddTransaction: (type: 'income' | 'expense') => void;
  onNavigate?: (view: string) => void;
  currency: string;
  isDarkMode: boolean;
  investmentAmount: number;
  onUpdateInvestment: (amount: number) => void;
}

const CustomTooltip = ({ active, payload, currency }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 text-white text-xs p-2 rounded-lg shadow-xl">
        <p className="font-bold mb-1">{data.fullDateLabel}</p>
        <p className="text-emerald-400 font-mono">{currency}{data.amount.toFixed(2)}</p>
      </div>
    );
  }
  return null;
};

export const Dashboard: React.FC<Props> = ({ transactions, budgets, goals, profile, onAddTransaction, onNavigate, currency, isDarkMode, investmentAmount, onUpdateInvestment }) => {
  const [hoveredData, setHoveredData] = useState<any>(null);
  const [showInvestmentModal, setShowInvestmentModal] = useState(false);
  const [newInvestmentAmount, setNewInvestmentAmount] = useState('');
  const [graphStyle, setGraphStyle] = useState<'line' | 'bar' | 'area'>('line');

  // Fallback for undefined investmentAmount (for existing users without this field)
  const safeInvestmentAmount = investmentAmount ?? 0;

  // Auto-scroll logic for mobile carousel
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isInteracting, setIsInteracting] = useState(false);

  useEffect(() => {
    // Only run on mobile/tablet (less than 1024px)
    if (window.innerWidth >= 1024) return;

    const interval = setInterval(() => {
      if (isInteracting || !scrollContainerRef.current) return;

      const container = scrollContainerRef.current;
      const maxScroll = container.scrollWidth - container.clientWidth;

      // If we are at the end (or close), loop back to start smoothly
      if (container.scrollLeft >= maxScroll - 10) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        // Scroll to the next card (approx width of one card + gap)
        // Card min-width is ~85vw or 380px.
        const scrollAmount = container.clientWidth * 0.85;
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }, 3500); // 3.5 seconds interval

    return () => clearInterval(interval);
  }, [isInteracting]);

  // Current date info for period calculations
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Get start of current month and last month
  const currentMonthStart = new Date(currentYear, currentMonth, 1);
  const lastMonthStart = new Date(currentYear, currentMonth - 1, 1);
  const lastMonthEnd = new Date(currentYear, currentMonth, 0); // Last day of previous month

  // Filter transactions by period
  const currentMonthTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    return date >= currentMonthStart;
  });

  const lastMonthTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    return date >= lastMonthStart && date <= lastMonthEnd;
  });

  // Current month income & expenses
  const currentMonthIncome = currentMonthTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const currentMonthExpenses = currentMonthTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

  // Last month income & expenses
  const lastMonthIncome = lastMonthTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const lastMonthExpenses = lastMonthTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

  // Total (all-time) calculations
  const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const expenses = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const balance = income - expenses;

  // Calculate dynamic percentages
  // Income change: Compare current month income to last month income
  const incomeChange = lastMonthIncome > 0
    ? Math.round(((currentMonthIncome - lastMonthIncome) / lastMonthIncome) * 100)
    : currentMonthIncome > 0 ? 100 : 0;

  // Expense ratio: What percentage of income is being spent (current month)
  const expenseRatio = currentMonthIncome > 0
    ? Math.round((currentMonthExpenses / currentMonthIncome) * 100)
    : currentMonthExpenses > 0 ? 100 : 0;

  // Savings rate: What percentage of income is saved (balance as % of total income)
  const savingsRate = income > 0
    ? Math.round((balance / income) * 100)
    : 0;

  // Last 7 Days Data Generation
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const chartData = last7Days.map(date => {
    const dayTransactions = transactions.filter(t => t.date && t.date.startsWith(date) && t.type === 'expense');
    const dayTotal = dayTransactions.reduce((acc, t) => acc + t.amount, 0);
    return {
      date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      fullDateLabel: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      amount: dayTotal,
    };
  });

  const recentTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  // Smart Alerts Logic
  // 1. Budget Alerts: Find budgets with > 80% usage
  const budgetAlerts = budgets.map(budget => {
    const spent = currentMonthTransactions
      .filter(t => t.category === budget.category && t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const percentage = Math.min((spent / budget.limit) * 100, 100);
    return { ...budget, spent, percentage };
  }).filter(b => b.percentage >= 80).sort((a, b) => b.percentage - a.percentage).slice(0, 3);

  // 2. Goal Reminders: Find goals due in next 30 days
  const goalReminders = goals.filter(goal => {
    if (!goal.deadline) return false;
    const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
    return daysLeft >= 0 && daysLeft <= 30 && goal.currentAmount < goal.targetAmount;
  }).sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime()).slice(0, 3);

  return (
    <div className="space-y-8 animate-fade-in pb-10">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-0">Welcome, {profile.name || 'Back'}</h1>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => onAddTransaction('income')}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
          >
            <TrendingUp size={16} />
            Add Income
          </button>
          <button
            onClick={() => onAddTransaction('expense')}
            className="flex items-center gap-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-rose-500/20 transition-all active:scale-95"
          >
            <TrendingDown size={16} />
            Add Expense
          </button>
        </div>
      </div>

      {/* Mobile Carousel (Visible only on mobile/tablet) */}
      <div
        className="flex lg:hidden overflow-x-auto snap-x snap-mandatory gap-4 pb-6 -mx-4 px-4 scrollbar-none"
        ref={scrollContainerRef}
        onTouchStart={() => setIsInteracting(true)}
        onTouchEnd={() => setTimeout(() => setIsInteracting(false), 3000)}
        onMouseEnter={() => setIsInteracting(true)}
        onMouseLeave={() => setIsInteracting(false)}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="min-w-[90vw] sm:min-w-[380px] snap-center">
          <CreditCardWidget balance={balance} currency={currency} profile={profile} />
        </div>

        <div className="min-w-[85vw] sm:min-w-[380px] snap-center flex flex-col group">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between h-full min-h-[200px] hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Your Income</span>
              <Activity size={24} className="text-slate-300 ml-auto transition-colors group-hover:text-blue-500" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{currency}{income.toLocaleString()}</h3>
              <p className="text-xs text-slate-400">This month: {currency}{currentMonthIncome.toLocaleString()}</p>
              <p className="text-xs text-slate-500">Your Income Amount</p>
            </div>
            <div className="mt-4">
              <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${incomeChange >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                {incomeChange >= 0 ? '+' : ''}{incomeChange}% vs last month
              </span>
            </div>
          </div>
        </div>

        <div className="min-w-[85vw] sm:min-w-[380px] snap-center flex flex-col group">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between h-full min-h-[200px] hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Expenses</span>
              <PieChartIcon size={24} className="text-slate-300 ml-auto transition-colors group-hover:text-amber-500" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{currency}{expenses.toLocaleString()}</h3>
              <p className="text-xs text-slate-400">This month: {currency}{currentMonthExpenses.toLocaleString()}</p>
              <p className="text-xs text-slate-500">Your Total Spend</p>
            </div>
            <div className="mt-4">
              <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${expenseRatio <= 50 ? 'bg-emerald-100 text-emerald-700' : expenseRatio <= 80 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                {expenseRatio}% of income spent
              </span>
            </div>
          </div>
        </div>

        <div className="min-w-[85vw] sm:min-w-[380px] snap-center flex flex-col group">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between h-full min-h-[200px] hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Invested</span>
              <Landmark size={24} className="text-slate-300 ml-auto transition-colors group-hover:text-purple-500" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{currency}{safeInvestmentAmount.toLocaleString()}</h3>
              <p className="text-xs text-slate-400">Savings rate: {savingsRate}%</p>
              <p className="text-xs text-slate-500">Total money in your wallet</p>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="bg-purple-100 text-purple-700 text-[10px] px-2 py-1 rounded-full font-bold">Investment</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Grid: Credit Card + Stats (Desktop) */}
      <div className="hidden lg:grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Credit Card */}
        <div className="lg:col-span-1 h-full">
          <CreditCardWidget balance={balance} currency={currency} profile={profile} />
        </div>

        {/* Right Column: Key Stats */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Income Stat */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between h-full hover:shadow-md transition-shadow group">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Your Income</span>
              <Activity size={24} className="text-slate-300 ml-auto transition-colors group-hover:text-blue-500" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{currency}{income.toLocaleString()}</h3>
              <p className="text-xs text-slate-400">This month: {currency}{currentMonthIncome.toLocaleString()}</p>
              <p className="text-xs text-slate-500">Your Income Amount</p>
            </div>
            <div className="mt-4">
              <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${incomeChange >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                {incomeChange >= 0 ? '+' : ''}{incomeChange}% vs last month
              </span>
            </div>
          </div>

          {/* Expenses Stat */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between h-full hover:shadow-md transition-shadow group">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Expenses</span>
              <PieChartIcon size={24} className="text-slate-300 ml-auto transition-colors group-hover:text-amber-500" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{currency}{expenses.toLocaleString()}</h3>
              <p className="text-xs text-slate-400">This month: {currency}{currentMonthExpenses.toLocaleString()}</p>
              <p className="text-xs text-slate-500">Your Total Spend</p>
            </div>
            <div className="mt-4">
              <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${expenseRatio <= 50 ? 'bg-emerald-100 text-emerald-700' : expenseRatio <= 80 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                {expenseRatio}% of income spent
              </span>
            </div>
          </div>

          {/* Total Investment Stat */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between h-full hover:shadow-md transition-shadow group">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Invested</span>
              <Landmark size={24} className="text-slate-300 ml-auto transition-colors group-hover:text-purple-500" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{currency}{safeInvestmentAmount.toLocaleString()}</h3>
              <p className="text-xs text-slate-400">Savings rate: {savingsRate}%</p>
              <p className="text-xs text-slate-500">Total money in your wallet</p>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="bg-purple-100 text-purple-700 text-[10px] px-2 py-1 rounded-full font-bold">Investment</span>
            </div>
          </div>
        </div>
      </div>

      {/* Smart Alerts Section */}
      {(budgetAlerts.length > 0 || goalReminders.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Budget Watch */}
          {budgetAlerts.length > 0 && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-rose-100 dark:bg-rose-900/20 rounded-lg text-rose-500">
                  <Activity size={18} />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white">Budget Watch</h3>
              </div>

              <div className="space-y-4">
                {budgetAlerts.map((budget, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-bold text-slate-700 dark:text-slate-300">{budget.category}</span>
                      <span className={`font-bold ${budget.percentage >= 100 ? 'text-red-500' : 'text-amber-500'}`}>
                        {budget.percentage.toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${budget.percentage >= 100 ? 'bg-red-500' : 'bg-amber-500'}`}
                        style={{ width: `${budget.percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-400">
                      {currency}{budget.spent.toLocaleString()} spent of {currency}{budget.limit.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Main Content Grid: Analytics + Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Money Analytics (Chart) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Money Analytics</h3>
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 gap-1">
              {(['line', 'bar', 'area'] as const).map((style) => (
                <button
                  key={style}
                  onClick={() => setGraphStyle(style)}
                  className={`px-3 py-1 rounded-md text-xs font-bold capitalize transition-all ${graphStyle === style
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">{currency}{balance.toLocaleString()}</h2>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              {savingsRate > 0 ? (
                <>
                  <span>You're saving {savingsRate}% of your income</span>
                  <Target size={16} className="text-emerald-500" />
                </>
              ) : savingsRate === 0 ? (
                <span>Start tracking your income and expenses!</span>
              ) : (
                <>
                  <span>You're spending {Math.abs(savingsRate)}% more than you earn</span>
                  <AlertCircle size={16} className="text-red-500" />
                </>
              )}
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {graphStyle === 'line' && (
                <LineChart data={chartData}>
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                    dy={10}
                    interval={0}
                  />
                  <Tooltip
                    cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }}
                    content={<CustomTooltip currency={currency} />}
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#6366f1"
                    strokeWidth={4}
                    dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              )}
              {graphStyle === 'bar' && (
                <BarChart data={chartData}>
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                    dy={10}
                    interval={0}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
                    content={<CustomTooltip currency={currency} />}
                  />
                  <Bar
                    dataKey="amount"
                    fill="#6366f1"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              )}
              {graphStyle === 'area' && (
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                    dy={10}
                    interval={0}
                  />
                  <Tooltip
                    cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }}
                    content={<CustomTooltip currency={currency} />}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#6366f1"
                    fillOpacity={1}
                    fill="url(#colorAmount)"
                    strokeWidth={3}
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* All Transaction List */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Transactions</h3>
            <ArrowUpRight size={18} className="text-slate-400 hover:text-slate-600 cursor-pointer" />
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar max-h-[400px]">
            {recentTransactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between group cursor-pointer p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${CATEGORY_COLORS[t.category]}`}>
                    {CATEGORY_ICONS[t.category] || <MoreHorizontal size={20} />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-white truncate max-w-[120px]">{t.description}</p>
                    <p className="text-[10px] text-slate-500">{new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                  </div>
                </div>
                <span className={`text-sm font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>
                  {t.type === 'income' ? '+' : '-'}{currency}{t.amount.toLocaleString()}
                </span>
              </div>
            ))}

            {recentTransactions.length === 0 && (
              <div className="text-center py-10 text-slate-400">
                <p>No recent transactions</p>
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigate?.('transactions')}
            className="w-full mt-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            View All
          </button>
        </div>
      </div>

      {/* Goal Reminders & Savings Rate */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">

        {/* Goal Reminders Card */}
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <Target size={20} className="text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Goal Reminders</h3>
            </div>
          </div>

          <div className="space-y-4">
            {goals.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Target size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No active goals yet</p>
                <p className="text-xs mt-1">Start saving for something special!</p>
              </div>
            ) : (
              goals
                .filter(goal => goal.currentAmount < goal.targetAmount)
                .slice(0, 3)
                .map((goal) => {
                  const percentage = (goal.currentAmount / goal.targetAmount) * 100;
                  const remaining = goal.targetAmount - goal.currentAmount;
                  const daysLeft = goal.deadline
                    ? Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 3600 * 24))
                    : null;

                  return (
                    <div key={goal.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                            {GOAL_ICON_COMPONENTS[goal.icon] ? React.createElement(GOAL_ICON_COMPONENTS[goal.icon], { size: 18 }) : <Target size={18} />}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-slate-800 dark:text-white">{goal.name}</p>
                            <p className="text-xs text-slate-500">
                              {currency}{remaining.toLocaleString()} left
                              {daysLeft !== null && daysLeft > 0 && ` • ${daysLeft} days`}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{percentage.toFixed(0)}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })
            )}
          </div>

          {goals.filter(g => g.currentAmount < g.targetAmount).length > 3 && (
            <button className="w-full mt-4 py-2 text-sm font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors">
              View All Goals
            </button>
          )}
        </div>

        {/* Savings Rate Card */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 p-6 md:p-8 rounded-3xl shadow-sm border border-emerald-100 dark:border-emerald-900/30">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                <TrendingUp size={20} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Savings Performance</h3>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-end gap-2 mb-2">
              <span className="text-4xl font-black text-emerald-600 dark:text-emerald-400">
                {savingsRate >= 0 ? savingsRate : 0}%
              </span>
              {savingsRate > 0 && (
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                  Savings Rate
                </span>
              )}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {savingsRate > 0
                ? `You're saving ${savingsRate}% of your income this month!`
                : savingsRate === 0
                  ? 'Start tracking to see your savings rate'
                  : `Spending ${Math.abs(savingsRate)}% more than earning`
              }
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/50 dark:bg-slate-800/50 p-4 rounded-2xl">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">This Month</p>
              <p className="text-lg font-black text-slate-800 dark:text-white">{currency}{currentMonthIncome.toLocaleString()}</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Income</p>
            </div>
            <div className="bg-white/50 dark:bg-slate-800/50 p-4 rounded-2xl">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">This Month</p>
              <p className="text-lg font-black text-slate-800 dark:text-white">{currency}{currentMonthExpenses.toLocaleString()}</p>
              <p className="text-xs text-red-500 dark:text-red-400 font-semibold">Expenses</p>
            </div>
          </div>

          {savingsRate > 0 && (
            <div className="mt-4 p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                <TrendingUp size={14} />
                Keep it up! You're on track to save {currency}{(currentMonthIncome - currentMonthExpenses).toLocaleString()} this month.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Investment Modal */}
      {showInvestmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-sm mx-4 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                  <Landmark size={20} className="text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add Investment</h3>
              </div>
              <button
                onClick={() => {
                  setShowInvestmentModal(false);
                  setNewInvestmentAmount('');
                }}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <X size={16} className="text-slate-500" />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                Investment Amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{currency}</span>
                <input
                  type="number"
                  value={newInvestmentAmount}
                  onChange={(e) => setNewInvestmentAmount(e.target.value)}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-lg font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Current: {currency}{safeInvestmentAmount.toLocaleString()}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  const amount = parseFloat(newInvestmentAmount);
                  if (!isNaN(amount) && amount > 0) {
                    onUpdateInvestment(safeInvestmentAmount + amount);
                    setShowInvestmentModal(false);
                    setNewInvestmentAmount('');
                  }
                }}
                className="flex-1 py-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl font-bold text-sm hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
              >
                Add to Total
              </button>
              <button
                onClick={() => {
                  const amount = parseFloat(newInvestmentAmount);
                  if (!isNaN(amount) && amount >= 0) {
                    onUpdateInvestment(amount);
                    setShowInvestmentModal(false);
                    setNewInvestmentAmount('');
                  }
                }}
                className="flex-1 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-bold text-sm transition-colors"
              >
                Set as Total
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
