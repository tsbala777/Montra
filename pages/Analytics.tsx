import React, { useState, useMemo } from 'react';
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    BarChart,
    Bar,
    LineChart,
    Line,
    Legend
} from 'recharts';
import { Transaction, Category, Budget, SavingsGoal } from '../types';
import { CATEGORY_ICONS, CATEGORY_COLORS } from '../constants';
import {
    TrendingUp,
    TrendingDown,
    Activity,
    Zap,
    Target,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Sparkles,
    PieChart as PieChartIcon,
    BarChart3,
    Layers,
    Wallet,
    DollarSign,
    Clock,
    AlertCircle,
    CheckCircle2,
    Flame,
    PlusCircle,
    ArrowRight,
    CreditCard,
    Receipt,
    Banknote
} from 'lucide-react';

interface Props {
    transactions: Transaction[];
    budgets: Budget[];
    goals: SavingsGoal[];
    currency: string;
}

// Color palette for charts
const CHART_COLORS = [
    '#6366f1', // indigo
    '#8b5cf6', // violet
    '#a855f7', // purple
    '#ec4899', // pink
    '#f43f5e', // rose
    '#ef4444', // red
    '#f97316', // orange
    '#eab308', // yellow
    '#22c55e', // green
    '#14b8a6', // teal
    '#06b6d4', // cyan
    '#3b82f6', // blue
];

const CustomPieTooltip = ({ active, payload, currency }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-slate-900/95 backdrop-blur-xl text-white text-xs p-3 rounded-xl shadow-2xl border border-white/10">
                <p className="font-bold mb-1 text-sm">{data.name}</p>
                <p className="text-indigo-300 font-mono">{currency}{data.value.toLocaleString()}</p>
                <p className="text-slate-400 mt-1">{data.percentage}% of total</p>
            </div>
        );
    }
    return null;
};

const CustomAreaTooltip = ({ active, payload, label, currency }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900/95 backdrop-blur-xl text-white text-xs p-3 rounded-xl shadow-2xl border border-white/10">
                <p className="font-bold mb-2 text-sm">{label}</p>
                {payload.map((item: any, index: number) => (
                    <p key={index} className="font-mono" style={{ color: item.color }}>
                        {item.name}: {currency}{item.value.toLocaleString()}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export const Analytics: React.FC<Props> = ({ transactions, budgets, goals, currency }) => {
    const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
    const [chartType, setChartType] = useState<'area' | 'bar'>('area');

    // Date calculations
    const now = new Date();
    const getStartDate = () => {
        switch (timeRange) {
            case 'week':
                const weekStart = new Date(now);
                weekStart.setDate(now.getDate() - 7);
                return weekStart;
            case 'month':
                return new Date(now.getFullYear(), now.getMonth(), 1);
            case 'year':
                return new Date(now.getFullYear(), 0, 1);
        }
    };

    const startDate = getStartDate();
    const filteredTransactions = transactions.filter(t => new Date(t.date) >= startDate);

    // Calculate key metrics
    const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const totalExpenses = filteredTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const netSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

    // All-time calculations
    const allTimeIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const allTimeExpenses = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const netWorth = allTimeIncome - allTimeExpenses;

    // Average daily spending
    const daysSinceStart = Math.max(1, Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    const avgDailySpending = totalExpenses / daysSinceStart;

    // Category breakdown for pie chart
    const categoryData = useMemo(() => {
        const expensesByCategory: Record<string, number> = {};
        filteredTransactions
            .filter(t => t.type === 'expense')
            .forEach(t => {
                const cat = t.category as string;
                expensesByCategory[cat] = (expensesByCategory[cat] || 0) + t.amount;
            });

        const sorted = Object.entries(expensesByCategory)
            .map(([name, value]) => ({
                name,
                value,
                percentage: Math.round((value / totalExpenses) * 100) || 0
            }))
            .sort((a, b) => b.value - a.value);

        return sorted;
    }, [filteredTransactions, totalExpenses]);

    // Top spending category
    const topCategory = categoryData[0]?.name || 'N/A';
    const topCategoryAmount = categoryData[0]?.value || 0;

    // Income vs Expenses trend data
    const trendData = useMemo(() => {
        const groupBy = timeRange === 'week' ? 'day' : timeRange === 'month' ? 'week' : 'month';
        const groups: Record<string, { income: number; expenses: number }> = {};

        filteredTransactions.forEach(t => {
            const date = new Date(t.date);
            let key: string;

            if (groupBy === 'day') {
                key = date.toLocaleDateString('en-US', { weekday: 'short' });
            } else if (groupBy === 'week') {
                const weekNum = Math.ceil((date.getDate() + 1) / 7);
                key = `Week ${weekNum}`;
            } else {
                key = date.toLocaleDateString('en-US', { month: 'short' });
            }

            if (!groups[key]) {
                groups[key] = { income: 0, expenses: 0 };
            }

            if (t.type === 'income') {
                groups[key].income += t.amount;
            } else {
                groups[key].expenses += t.amount;
            }
        });

        return Object.entries(groups).map(([name, data]) => ({
            name,
            income: data.income,
            expenses: data.expenses,
            net: data.income - data.expenses
        }));
    }, [filteredTransactions, timeRange]);

    // Day of week spending pattern
    const dayOfWeekData = useMemo(() => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const spending: Record<string, number> = {};
        days.forEach(d => spending[d] = 0);

        filteredTransactions
            .filter(t => t.type === 'expense')
            .forEach(t => {
                const dayName = new Date(t.date).toLocaleDateString('en-US', { weekday: 'short' });
                spending[dayName] += t.amount;
            });

        const maxSpending = Math.max(...Object.values(spending), 1);

        return days.map(day => ({
            day,
            amount: spending[day],
            intensity: Math.round((spending[day] / maxSpending) * 100)
        }));
    }, [filteredTransactions]);

    // Financial health score (0-100)
    const healthScore = useMemo(() => {
        let score = 50; // Base score

        // Savings rate impact (+/- 20)
        if (savingsRate >= 20) score += 20;
        else if (savingsRate >= 10) score += 10;
        else if (savingsRate >= 0) score += 5;
        else score -= 10;

        // Budget adherence impact (+/- 15)
        const budgetCategories = budgets.map(b => b.category);
        let withinBudget = 0;
        budgetCategories.forEach(cat => {
            const spent = categoryData.find(c => c.name === cat)?.value || 0;
            const limit = budgets.find(b => b.category === cat)?.limit || 0;
            if (spent <= limit) withinBudget++;
        });
        if (budgets.length > 0) {
            const adherenceRate = withinBudget / budgets.length;
            score += Math.round(adherenceRate * 15);
        }

        // Transaction diversity (+5)
        if (categoryData.length >= 3) score += 5;

        // Consistent spending pattern (+10)
        const spendingVariance = dayOfWeekData.map(d => d.amount);
        const avgSpending = spendingVariance.reduce((a, b) => a + b, 0) / 7;
        const variance = spendingVariance.reduce((acc, val) => acc + Math.pow(val - avgSpending, 2), 0) / 7;
        if (variance < avgSpending * 2) score += 10;

        return Math.max(0, Math.min(100, score));
    }, [savingsRate, budgets, categoryData, dayOfWeekData]);

    const getHealthLabel = (score: number) => {
        if (score >= 80) return { label: 'Excellent', color: 'text-emerald-500', bg: 'bg-emerald-500' };
        if (score >= 60) return { label: 'Good', color: 'text-blue-500', bg: 'bg-blue-500' };
        if (score >= 40) return { label: 'Fair', color: 'text-yellow-500', bg: 'bg-yellow-500' };
        return { label: 'Needs Work', color: 'text-red-500', bg: 'bg-red-500' };
    };

    const health = getHealthLabel(healthScore);

    // Monthly comparison calculations
    const monthlyComparison = useMemo(() => {
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const lastMonthStart = new Date(currentYear, currentMonth - 1, 1);
        const lastMonthEnd = new Date(currentYear, currentMonth, 0);
        const currentMonthStart = new Date(currentYear, currentMonth, 1);

        const lastMonthTxns = transactions.filter(t => {
            const date = new Date(t.date);
            return date >= lastMonthStart && date <= lastMonthEnd;
        });
        const currentMonthTxns = transactions.filter(t => {
            const date = new Date(t.date);
            return date >= currentMonthStart;
        });

        const lastMonthIncome = lastMonthTxns.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
        const lastMonthExpenses = lastMonthTxns.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
        const currentMonthIncome = currentMonthTxns.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
        const currentMonthExpenses = currentMonthTxns.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

        const incomeChange = lastMonthIncome > 0 ? Math.round(((currentMonthIncome - lastMonthIncome) / lastMonthIncome) * 100) : 0;
        const expenseChange = lastMonthExpenses > 0 ? Math.round(((currentMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100) : 0;

        return {
            lastMonthIncome, lastMonthExpenses,
            currentMonthIncome, currentMonthExpenses,
            incomeChange, expenseChange
        };
    }, [transactions, now]);

    // Top transactions (largest expenses)
    const topTransactions = useMemo(() => {
        return [...filteredTransactions]
            .filter(t => t.type === 'expense')
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5);
    }, [filteredTransactions]);

    // Income breakdown by category
    const incomeBreakdown = useMemo(() => {
        const incomeByCategory: Record<string, number> = {};
        filteredTransactions
            .filter(t => t.type === 'income')
            .forEach(t => {
                const cat = t.category as string;
                incomeByCategory[cat] = (incomeByCategory[cat] || 0) + t.amount;
            });

        return Object.entries(incomeByCategory)
            .map(([name, value]) => ({
                name,
                value,
                percentage: totalIncome > 0 ? Math.round((value / totalIncome) * 100) : 0
            }))
            .sort((a, b) => b.value - a.value);
    }, [filteredTransactions, totalIncome]);

    // Cash flow forecast
    const cashFlowForecast = useMemo(() => {
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const dayOfMonth = now.getDate();
        const daysRemaining = daysInMonth - dayOfMonth;

        const projectedExpenses = avgDailySpending * daysRemaining;
        const projectedMonthlyTotal = totalExpenses + projectedExpenses;
        const projectedSavings = totalIncome - projectedMonthlyTotal;

        return {
            daysRemaining,
            projectedExpenses: Math.round(projectedExpenses),
            projectedMonthlyTotal: Math.round(projectedMonthlyTotal),
            projectedSavings: Math.round(projectedSavings),
            onTrack: projectedSavings >= 0
        };
    }, [now, avgDailySpending, totalExpenses, totalIncome]);

    // Peak spending day
    const peakSpendingDay = useMemo(() => {
        const maxDay = dayOfWeekData.reduce((max, day) =>
            day.amount > max.amount ? day : max, dayOfWeekData[0]);
        return maxDay;
    }, [dayOfWeekData]);

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            {/* Header Section */}
            <div className="relative">
                <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Track your financial insights</p>
                    </div>

                    {/* Time Range Selector */}
                    <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                        {(['week', 'month', 'year'] as const).map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${timeRange === range
                                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                    }`}
                            >
                                {range.charAt(0).toUpperCase() + range.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Net Worth */}
                <div className="group bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-800 transition-all duration-300">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900/50 dark:to-indigo-800/50 rounded-lg flex items-center justify-center">
                            <Wallet size={16} className="text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Net Worth</span>
                    </div>
                    <p className={`text-xl font-bold ${netWorth >= 0 ? 'text-slate-900 dark:text-white' : 'text-red-500'}`}>
                        {currency}{Math.abs(netWorth).toLocaleString()}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                        {netWorth >= 0 ? (
                            <ArrowUpRight size={14} className="text-emerald-500" />
                        ) : (
                            <ArrowDownRight size={14} className="text-red-500" />
                        )}
                        <span className={`text-xs font-medium ${netWorth >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            All time
                        </span>
                    </div>
                </div>

                {/* Average Daily Spending */}
                <div className="group bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-lg hover:border-purple-200 dark:hover:border-purple-800 transition-all duration-300">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/50 dark:to-purple-800/50 rounded-lg flex items-center justify-center">
                            <Activity size={16} className="text-purple-600 dark:text-purple-400" />
                        </div>
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Avg. Daily</span>
                    </div>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">
                        {currency}{avgDailySpending.toFixed(0)}
                    </p>
                    <p className="text-xs text-slate-400 mt-2">spending per day</p>
                </div>

                {/* Top Category */}
                <div className="group bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-lg hover:border-pink-200 dark:hover:border-pink-800 transition-all duration-300">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-900/50 dark:to-pink-800/50 rounded-lg flex items-center justify-center">
                            <Flame size={16} className="text-pink-600 dark:text-pink-400" />
                        </div>
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Top Spend</span>
                    </div>
                    <p className="text-lg font-bold text-slate-900 dark:text-white truncate">
                        {topCategory}
                    </p>
                    <p className="text-xs text-pink-500 mt-2">
                        {currency}{topCategoryAmount.toLocaleString()}
                    </p>
                </div>

                {/* Financial Health Score */}
                <div className="group bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-lg hover:border-emerald-200 dark:hover:border-emerald-800 transition-all duration-300">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/50 dark:to-emerald-800/50 rounded-lg flex items-center justify-center">
                            <Target size={16} className="text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Health Score</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <p className="text-xl font-bold text-slate-900 dark:text-white">{healthScore}</p>
                        <span className="text-sm text-slate-400">/100</span>
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                        <span className={`text-xs font-semibold ${health.color}`}>{health.label}</span>
                    </div>
                </div>
            </div>

            {/* Main Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Income vs Expenses Trend */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Income vs Expenses</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Track your cash flow over time</p>
                        </div>
                        <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                            <button
                                onClick={() => setChartType('area')}
                                className={`p-2 rounded-md transition-all ${chartType === 'area'
                                    ? 'bg-white dark:bg-slate-700 shadow-sm'
                                    : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                <Layers size={16} />
                            </button>
                            <button
                                onClick={() => setChartType('bar')}
                                className={`p-2 rounded-md transition-all ${chartType === 'bar'
                                    ? 'bg-white dark:bg-slate-700 shadow-sm'
                                    : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                <BarChart3 size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Summary Stats */}
                    <div className="flex flex-wrap gap-6 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-emerald-500" />
                            <div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Total Income</p>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">{currency}{totalIncome.toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-rose-500" />
                            <div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Total Expenses</p>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">{currency}{totalExpenses.toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-indigo-500" />
                            <div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Net Savings</p>
                                <p className={`text-sm font-bold ${netSavings >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                    {netSavings >= 0 ? '+' : ''}{currency}{netSavings.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="h-64">
                        {totalIncome === 0 && totalExpenses === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 dark:bg-white/5 rounded-xl border border-dashed border-slate-200 dark:border-white/10">
                                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mb-3">
                                    <PlusCircle size={24} />
                                </div>
                                <h3 className="font-semibold text-slate-900 dark:text-white">No data available</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                                    Start adding transactions to visualize your cash flow trend here.
                                </p>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                {chartType === 'area' ? (
                                    <AreaChart data={trendData}>
                                        <defs>
                                            <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                                                <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.3} />
                                                <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 12, fill: '#94a3b8' }}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 12, fill: '#94a3b8' }}
                                            tickFormatter={(value) => `${currency}${value}`}
                                        />
                                        <Tooltip content={<CustomAreaTooltip currency={currency} />} />
                                        <Area
                                            type="monotone"
                                            dataKey="income"
                                            stroke="#22c55e"
                                            strokeWidth={2}
                                            fill="url(#incomeGradient)"
                                            name="Income"
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="expenses"
                                            stroke="#f43f5e"
                                            strokeWidth={2}
                                            fill="url(#expenseGradient)"
                                            name="Expenses"
                                        />
                                    </AreaChart>
                                ) : (
                                    <BarChart data={trendData}>
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 12, fill: '#94a3b8' }}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 12, fill: '#94a3b8' }}
                                            tickFormatter={(value) => `${currency}${value}`}
                                        />
                                        <Tooltip content={<CustomAreaTooltip currency={currency} />} />
                                        <Bar dataKey="income" fill="#22c55e" radius={[4, 4, 0, 0]} name="Income" />
                                        <Bar dataKey="expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Expenses" />
                                    </BarChart>
                                )}
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Spending Breakdown */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Spending Breakdown</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">By category</p>
                        </div>
                        <PieChartIcon size={18} className="text-slate-400" />
                    </div>

                    {categoryData.length > 0 ? (
                        <>
                            <div className="h-48 mb-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={categoryData}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={75}
                                            paddingAngle={2}
                                        >
                                            {categoryData.map((entry, index) => (
                                                <Cell
                                                    key={entry.name}
                                                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                                                    className="hover:opacity-80 transition-opacity cursor-pointer"
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomPieTooltip currency={currency} />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Category List */}
                            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                                {categoryData.slice(0, 6).map((cat, index) => (
                                    <div key={cat.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                                            />
                                            <span className="text-sm text-slate-700 dark:text-slate-300 truncate max-w-[100px]">
                                                {cat.name}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                                {currency}{cat.value.toLocaleString()}
                                            </p>
                                            <p className="text-xs text-slate-400">{cat.percentage}%</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="h-48 flex flex-col items-center justify-center text-center p-4 bg-slate-50/50 dark:bg-white/5 rounded-xl border border-dashed border-slate-200 dark:border-white/10">
                            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mb-2">
                                <PlusCircle size={20} />
                            </div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">Start Spending?</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[150px]">
                                Add expenses to see a breakdown by category.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Weekly Pattern + Savings Rate */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Spending Pattern by Day */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Weekly Pattern</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Your spending by day of week</p>
                        </div>
                        <Calendar size={18} className="text-slate-400" />
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                        {dayOfWeekData.map((day) => (
                            <div key={day.day} className="text-center">
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{day.day}</p>
                                <div className="relative h-24 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
                                    <div
                                        className="absolute bottom-0 left-0 right-0 bg-[#2563EB] rounded-lg transition-all duration-500"
                                        style={{ height: `${day.intensity}%` }}
                                    />
                                </div>
                                <p className="text-xs font-semibold text-slate-900 dark:text-white mt-2">
                                    {currency}{day.amount.toFixed(0)}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Savings Overview */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Savings Overview</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Your financial efficiency</p>
                        </div>
                        <Sparkles size={18} className="text-slate-400" />
                    </div>

                    {/* Savings Rate Ring */}
                    <div className="flex items-center justify-center mb-6">
                        <div className="relative">
                            <svg className="w-32 h-32 transform -rotate-90">
                                <circle
                                    cx="64"
                                    cy="64"
                                    r="56"
                                    stroke="currentColor"
                                    className="text-slate-100 dark:text-slate-800"
                                    strokeWidth="12"
                                    fill="none"
                                />
                                <circle
                                    cx="64"
                                    cy="64"
                                    r="56"
                                    stroke="url(#savingsGradient)"
                                    strokeWidth="12"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeDasharray={`${Math.max(0, savingsRate) * 3.52} 352`}
                                    className="transition-all duration-1000"
                                />
                                <defs>
                                    <linearGradient id="savingsGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#2563EB" />
                                        <stop offset="100%" stopColor="#2563EB" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                    <p className={`text-2xl font-bold ${savingsRate >= 0 ? 'text-slate-900 dark:text-white' : 'text-red-500'}`}>
                                        {savingsRate}%
                                    </p>
                                    <p className="text-xs text-slate-500">saved</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl">
                            <div className="flex items-center gap-2 mb-1">
                                <TrendingUp size={14} className="text-emerald-600" />
                                <span className="text-xs text-emerald-600 dark:text-emerald-400">Income</span>
                            </div>
                            <p className="text-lg font-bold text-slate-900 dark:text-white">
                                {currency}{totalIncome.toLocaleString()}
                            </p>
                        </div>
                        <div className="bg-rose-50 dark:bg-rose-900/20 p-4 rounded-xl">
                            <div className="flex items-center gap-2 mb-1">
                                <TrendingDown size={14} className="text-rose-600" />
                                <span className="text-xs text-rose-600 dark:text-rose-400">Expenses</span>
                            </div>
                            <p className="text-lg font-bold text-slate-900 dark:text-white">
                                {currency}{totalExpenses.toLocaleString()}
                            </p>
                        </div>
                    </div>

                    {/* Tip */}
                    <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-start gap-3">
                        <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Zap size={16} className="text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">Pro Tip</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {savingsRate >= 20
                                    ? "Great job! You're saving more than 20% of your income. Keep it up!"
                                    : savingsRate >= 10
                                        ? "You're on track! Try to increase your savings rate to 20% for better financial health."
                                        : savingsRate >= 0
                                            ? "Consider reducing expenses or increasing income to boost your savings."
                                            : "Your expenses exceed income. Review your spending to avoid debt."}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Budget vs Actual */}
            {budgets.length > 0 && (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Budget vs Actual</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">How you're tracking against your budgets</p>
                        </div>
                        <Target size={18} className="text-slate-400" />
                    </div>

                    <div className="space-y-4">
                        {budgets.map((budget, index) => {
                            const spent = categoryData.find(c => c.name === budget.category)?.value || 0;
                            const percentage = Math.min((spent / budget.limit) * 100, 100);
                            const isOver = spent > budget.limit;

                            return (
                                <div key={index} className="group">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                {budget.category}
                                            </span>
                                            {isOver && (
                                                <AlertCircle size={14} className="text-red-500" />
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-sm font-semibold ${isOver ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
                                                {currency}{spent.toLocaleString()}
                                            </span>
                                            <span className="text-sm text-slate-400"> / {currency}{budget.limit.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${isOver
                                                ? 'bg-gradient-to-r from-red-400 to-red-500'
                                                : percentage > 80
                                                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                                                    : 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                                                }`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Enhanced Analytics Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Monthly Comparison Card */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Monthly Comparison</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">This month vs last month</p>
                        </div>
                        <Calendar size={18} className="text-slate-400" />
                    </div>

                    <div className="space-y-6">
                        {/* Income Comparison */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Income</span>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${monthlyComparison.incomeChange >= 0 ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                                        {monthlyComparison.incomeChange >= 0 ? '+' : ''}{monthlyComparison.incomeChange}%
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <p className="text-xs text-slate-400 mb-1">Last Month</p>
                                    <p className="text-lg font-bold text-slate-500">{currency}{monthlyComparison.lastMonthIncome.toLocaleString()}</p>
                                </div>
                                <ArrowRight size={16} className="text-slate-300" />
                                <div className="flex-1 text-right">
                                    <p className="text-xs text-slate-400 mb-1">This Month</p>
                                    <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{currency}{monthlyComparison.currentMonthIncome.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Expenses Comparison */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Expenses</span>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${monthlyComparison.expenseChange <= 0 ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                                        {monthlyComparison.expenseChange >= 0 ? '+' : ''}{monthlyComparison.expenseChange}%
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <p className="text-xs text-slate-400 mb-1">Last Month</p>
                                    <p className="text-lg font-bold text-slate-500">{currency}{monthlyComparison.lastMonthExpenses.toLocaleString()}</p>
                                </div>
                                <ArrowRight size={16} className="text-slate-300" />
                                <div className="flex-1 text-right">
                                    <p className="text-xs text-slate-400 mb-1">This Month</p>
                                    <p className="text-lg font-bold text-rose-600 dark:text-rose-400">{currency}{monthlyComparison.currentMonthExpenses.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cash Flow Forecast Card */}
                <div className={`p-6 rounded-2xl shadow-sm border ${cashFlowForecast.onTrack ? 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border-emerald-100 dark:border-emerald-900/30' : 'bg-gradient-to-br from-rose-50 to-orange-50 dark:from-rose-950/20 dark:to-orange-950/20 border-rose-100 dark:border-rose-900/30'}`}>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Cash Flow Forecast</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{cashFlowForecast.daysRemaining} days left this month</p>
                        </div>
                        {cashFlowForecast.onTrack ? (
                            <CheckCircle2 size={24} className="text-emerald-500" />
                        ) : (
                            <AlertCircle size={24} className="text-rose-500" />
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-white/60 dark:bg-slate-800/60 p-4 rounded-xl">
                            <p className="text-xs font-medium text-slate-500 mb-1">Projected Expenses</p>
                            <p className="text-xl font-bold text-slate-800 dark:text-white">{currency}{cashFlowForecast.projectedMonthlyTotal.toLocaleString()}</p>
                        </div>
                        <div className="bg-white/60 dark:bg-slate-800/60 p-4 rounded-xl">
                            <p className="text-xs font-medium text-slate-500 mb-1">Projected Savings</p>
                            <p className={`text-xl font-bold ${cashFlowForecast.projectedSavings >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {currency}{Math.abs(cashFlowForecast.projectedSavings).toLocaleString()}
                            </p>
                        </div>
                    </div>

                    <p className={`text-sm font-medium ${cashFlowForecast.onTrack ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>
                        {cashFlowForecast.onTrack
                            ? `You're on track to save ${currency}${cashFlowForecast.projectedSavings.toLocaleString()} this month!`
                            : `Warning: You may overspend by ${currency}${Math.abs(cashFlowForecast.projectedSavings).toLocaleString()} this month.`
                        }
                    </p>
                </div>

            </div>

            {/* Top Transactions & Spending Patterns Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Top Transactions Card */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Top Expenses</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Biggest transactions this period</p>
                        </div>
                        <Receipt size={18} className="text-slate-400" />
                    </div>

                    <div className="space-y-3">
                        {topTransactions.length === 0 ? (
                            <p className="text-center text-slate-400 py-8">No transactions yet</p>
                        ) : (
                            topTransactions.map((t, idx) => (
                                <div key={t.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${idx === 0 ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800 dark:text-white truncate max-w-[150px]">{t.description}</p>
                                            <p className="text-xs text-slate-500">{t.category} • {new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                                        </div>
                                    </div>
                                    <span className="text-sm font-bold text-rose-600 dark:text-rose-400">-{currency}{t.amount.toLocaleString()}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Spending Patterns Card */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Spending Patterns</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Peak day: <span className="font-semibold text-indigo-600">{peakSpendingDay?.day}</span></p>
                        </div>
                        <Activity size={18} className="text-slate-400" />
                    </div>

                    <div className="space-y-3">
                        {dayOfWeekData.map((day) => (
                            <div key={day.day} className="flex items-center gap-3">
                                <span className="w-10 text-xs font-medium text-slate-500">{day.day}</span>
                                <div className="flex-1 h-6 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${day.day === peakSpendingDay?.day ? 'bg-gradient-to-r from-indigo-500 to-purple-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                                        style={{ width: `${day.intensity}%` }}
                                    />
                                </div>
                                <span className="w-20 text-xs font-bold text-slate-600 dark:text-slate-400 text-right">{currency}{day.amount.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* Goals Progress & Income Breakdown Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Goals Progress Card */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Goals Progress</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Track your savings goals</p>
                        </div>
                        <Target size={18} className="text-slate-400" />
                    </div>

                    <div className="space-y-4">
                        {goals.length === 0 ? (
                            <p className="text-center text-slate-400 py-8">No active goals</p>
                        ) : (
                            goals.slice(0, 4).map((goal) => {
                                const percentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
                                const isComplete = goal.currentAmount >= goal.targetAmount;
                                const daysLeft = goal.deadline
                                    ? Math.max(0, Math.ceil((new Date(goal.deadline).getTime() - now.getTime()) / (1000 * 3600 * 24)))
                                    : null;

                                return (
                                    <div key={goal.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                {isComplete ? (
                                                    <CheckCircle2 size={16} className="text-emerald-500" />
                                                ) : (
                                                    <Target size={16} className="text-indigo-500" />
                                                )}
                                                <span className="text-sm font-bold text-slate-800 dark:text-white">{goal.name}</span>
                                            </div>
                                            <span className={`text-xs font-bold ${isComplete ? 'text-emerald-500' : 'text-indigo-600 dark:text-indigo-400'}`}>
                                                {percentage.toFixed(0)}%
                                            </span>
                                        </div>
                                        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${isComplete ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-slate-500">
                                            <span>{currency}{goal.currentAmount.toLocaleString()} / {currency}{goal.targetAmount.toLocaleString()}</span>
                                            {daysLeft !== null && !isComplete && (
                                                <span className={daysLeft <= 7 ? 'text-rose-500 font-semibold' : ''}>
                                                    {daysLeft} days left
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Income Sources Breakdown */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Income Sources</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Where your money comes from</p>
                        </div>
                        <Banknote size={18} className="text-slate-400" />
                    </div>

                    <div className="space-y-3">
                        {incomeBreakdown.length === 0 ? (
                            <p className="text-center text-slate-400 py-8">No income recorded</p>
                        ) : (
                            incomeBreakdown.slice(0, 5).map((source, idx) => (
                                <div key={source.name} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-8 h-8 rounded-full flex items-center justify-center"
                                            style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] + '20', color: CHART_COLORS[idx % CHART_COLORS.length] }}
                                        >
                                            <DollarSign size={16} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800 dark:text-white">{source.name}</p>
                                            <p className="text-xs text-slate-500">{source.percentage}% of income</p>
                                        </div>
                                    </div>
                                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">+{currency}{source.value.toLocaleString()}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};
