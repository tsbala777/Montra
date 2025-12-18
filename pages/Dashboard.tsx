
import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, LabelList } from 'recharts';
import { Transaction, Category, Budget, SavingsGoal, UserProfile } from '../types';
import { GlassCard, GlassButton } from '../components/ui/Glass';
import { CATEGORY_ICONS, CATEGORY_COLORS } from '../constants';
import { getFinancialInsight } from '../services/geminiService';
import { Sparkles, TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';

interface Props {
  transactions: Transaction[];
  budgets: Budget[];
  goals: SavingsGoal[];
  profile: UserProfile;
  onAddTransaction: () => void;
  currency: string;
  isDarkMode: boolean;
}

const CustomTooltip = ({ active, payload, currency }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const breakdownEntries = Object.entries(data.breakdown || {}) as [Category, number][];
    
    return (
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-white/60 dark:border-white/10 p-4 rounded-2xl shadow-2xl dark:shadow-black/50 min-w-[210px] animate-fade-in z-50 ring-1 ring-slate-900/5">
        <div className="flex justify-between items-center mb-2 border-b border-slate-100 dark:border-white/5 pb-2">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{data.fullDateLabel}</p>
        </div>
        
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Daily Spending</span>
          <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{currency}{data.amount.toFixed(2)}</span>
        </div>
        
        {breakdownEntries.length > 0 ? (
          <div className="space-y-2">
            {breakdownEntries.sort((a, b) => b[1] - a[1]).map(([cat, amt]) => (
              <div key={cat} className="flex justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center scale-75 ${CATEGORY_COLORS[cat]}`}>
                    {React.cloneElement(CATEGORY_ICONS[cat] as React.ReactElement<any>, { size: 12 })}
                  </div>
                  <span className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold">{cat}</span>
                </div>
                <span className="text-[11px] text-slate-800 dark:text-slate-100 font-bold">{currency}{amt.toFixed(2)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[10px] text-slate-400 italic py-2">No expenses recorded</p>
        )}
      </div>
    );
  }
  return null;
};

const CustomDataLabel = (props: any) => {
  const { x, y, value, index, currency } = props;
  if (!value || value === 0) return null;

  // Anti-collision: alternate label height slightly for every other point
  const yOffset = index % 2 === 0 ? -30 : -45;

  return (
    <g>
      <rect 
        x={x - 22} 
        y={y + yOffset} 
        width={44} 
        height={18} 
        rx={9} 
        className="fill-white dark:fill-slate-800 drop-shadow-sm pointer-events-none"
      />
      <text 
        x={x} 
        y={y + yOffset + 11} 
        className="fill-indigo-600 dark:fill-indigo-400 text-[10px] font-extrabold pointer-events-none"
        textAnchor="middle" 
        dominantBaseline="middle" 
      >
        {currency}{Math.round(value)}
      </text>
      {/* Connector line for the taller labels */}
      {index % 2 !== 0 && (
        <line x1={x} y1={y} x2={x} y2={y + yOffset + 18} className="stroke-indigo-600 dark:stroke-indigo-400 opacity-20" strokeWidth={1} strokeDasharray="2 2" />
      )}
    </g>
  );
};

export const Dashboard: React.FC<Props> = ({ transactions, budgets, goals, profile, onAddTransaction, currency, isDarkMode }) => {
  const [insight, setInsight] = useState<string>('');
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);
  const [hoveredData, setHoveredData] = useState<any>(null);

  // Define dynamic colors based on theme
  const chartColor = isDarkMode ? '#818cf8' : '#6366f1'; // Indigo 400 for dark, Indigo 500 for light
  const axisColor = isDarkMode ? '#94a3b8' : '#94a3b8'; // Slate 400 works well for both, but could use #64748b (slate 500) for light
  const dotStrokeColor = isDarkMode ? '#0f172a' : '#fff'; // Slate 900 (bg) for dark mode cutout effect, White for light

  useEffect(() => {
    if (transactions.length > 0) {
      setIsLoadingInsight(true);
      // Pass the full context to Gemini
      getFinancialInsight(transactions, budgets, goals, profile)
        .then(setInsight)
        .catch(() => setInsight("Could not load insight."))
        .finally(() => setIsLoadingInsight(false));
    }
  }, [transactions, budgets, goals, profile]);

  const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const expenses = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const balance = income - expenses;

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const chartData = last7Days.map(date => {
    const dayTransactions = transactions.filter(t => t.date.startsWith(date) && t.type === 'expense');
    const dayTotal = dayTransactions.reduce((acc, t) => acc + t.amount, 0);
    const breakdown = dayTransactions.reduce((acc, t) => {
      acc[t.category as Category] = (acc[t.category as Category] || 0) + t.amount;
      return acc;
    }, {} as Record<Category, number>);
    return {
      date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      fullDateLabel: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      amount: dayTotal,
      breakdown: breakdown
    };
  });

  const getActiveCategories = () => {
    if (hoveredData && hoveredData.breakdown && Object.keys(hoveredData.breakdown).length > 0) {
      return Object.entries(hoveredData.breakdown as Record<string, number>).sort(([, a], [, b]) => b - a).slice(0, 4);
    }
    const expensesByCategory = transactions.filter(t => t.type === 'expense').reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);
    return (Object.entries(expensesByCategory) as [string, number][]).sort(([, a], [, b]) => b - a).slice(0, 4);
  };

  const topCategories = getActiveCategories();
  const totalInContext = hoveredData ? hoveredData.amount : expenses;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-1">
            Good Morning{profile.name ? `, ${profile.name.split(' ')[0]}` : ''}
          </h1>
          <div className="flex items-center gap-2 text-sm md:text-base text-slate-500 dark:text-slate-400 font-light">
             {profile.school && (
               <>
                 <span className="font-semibold text-slate-700 dark:text-slate-300">{profile.school}</span>
                 <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
               </>
             )}
             <span>Financial overview</span>
          </div>
        </div>
        <GlassButton onClick={onAddTransaction} className="shadow-emerald-100 dark:shadow-emerald-900/10 w-full md:w-auto">
          + Quick Add
        </GlassButton>
      </div>

      <div className="relative overflow-hidden rounded-2xl p-[1px] bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 dark:from-indigo-900/50 dark:via-purple-900/50 dark:to-pink-900/50">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl p-4 flex items-start gap-3 relative">
           <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg shadow-indigo-200 dark:shadow-none shrink-0">
             <Sparkles className="w-4 h-4 text-white" />
           </div>
           <div>
             <h3 className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 uppercase tracking-wider mb-1">
               Montra AI Insight
             </h3>
             <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
               {isLoadingInsight ? <span className="animate-pulse">Analyzing spending habits...</span> : insight || "Add data for insights!"}
             </p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <GlassCard hoverEffect className="relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 dark:text-white transition-opacity"><TrendingUp size={80} /></div>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">Total Balance</p>
          <h2 className="text-3xl font-semibold text-slate-800 dark:text-white">{currency}{balance.toFixed(2)}</h2>
          <div className="mt-4 text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
            <span className="text-emerald-500 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded flex items-center gap-0.5"><ArrowUpRight size={10} /> +2.5%</span> vs last month
          </div>
        </GlassCard>
        <GlassCard hoverEffect>
           <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">Income</p>
           <h2 className="text-3xl font-semibold text-emerald-600 dark:text-emerald-400">+{currency}{income.toFixed(2)}</h2>
        </GlassCard>
        <GlassCard hoverEffect>
           <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">Expenses</p>
           <h2 className="text-3xl font-semibold text-red-500 dark:text-red-400">-{currency}{expenses.toFixed(2)}</h2>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="md:col-span-2 flex flex-col h-80 relative group">
          <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-6 flex items-center gap-2">
            Weekly Activity
            {hoveredData && <span className="text-[10px] bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full animate-pulse">Inspecting {hoveredData.date}</span>}
          </h3>
          <div className="flex-1 w-full min-h-0 relative">
            <div className="absolute inset-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 50, right: 20, left: 10, bottom: 0 }} onMouseMove={(e: any) => e?.activePayload && setHoveredData(e.activePayload[0].payload)} onMouseLeave={() => setHoveredData(null)}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColor} stopOpacity={0.25}/><stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: axisColor, fontWeight: 500}} dy={10} />
                  <YAxis hide domain={[0, (dataMax: number) => (dataMax === 0 ? 100 : dataMax * 1.6)]} />
                  <Tooltip content={<CustomTooltip currency={currency} />} cursor={{ stroke: chartColor, strokeOpacity: 0.15, strokeWidth: 2 }} />
                  <Area type="monotone" dataKey="amount" stroke={chartColor} strokeWidth={2.5} fillOpacity={1} fill="url(#colorAmount)" activeDot={{ r: 6, strokeWidth: 3, stroke: dotStrokeColor, fill: chartColor, className: 'shadow-lg' }} isAnimationActive={true} animationDuration={1200}>
                    <LabelList dataKey="amount" content={<CustomDataLabel currency={currency} />} />
                  </Area>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </GlassCard>

        <GlassCard className={`h-80 flex flex-col transition-all duration-300 ${hoveredData ? 'ring-2 ring-indigo-500/20 dark:ring-indigo-500/40 shadow-xl scale-[1.02]' : ''}`}>
          <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-1">{hoveredData ? `Daily Details` : 'Spending Mix'}</h3>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mb-4">{hoveredData ? `${hoveredData.fullDateLabel}` : 'Top Categories (7d)'}</p>
          <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
            {topCategories.length > 0 ? topCategories.map(([cat, amount]) => {
               const percentage = totalInContext > 0 ? Math.round((amount / totalInContext) * 100) : 0;
               return (
                <div key={cat} className="group animate-fade-in">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm ${CATEGORY_COLORS[cat as Category]}`}>
                        {React.cloneElement(CATEGORY_ICONS[cat as Category] as React.ReactElement<any>, { size: 14 })}
                      </div>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{cat}</span>
                    </div>
                    <div className="text-right"><span className="block text-sm font-bold text-slate-800 dark:text-white">{currency}{amount.toFixed(0)}</span></div>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100/50 dark:bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-700 ease-out ${CATEGORY_COLORS[cat as Category].split(' ')[0]}`} style={{ width: `${percentage}%` }} />
                  </div>
                </div>
               );
            }) : <div className="h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-600 text-sm gap-2"><TrendingDown size={32} strokeWidth={1} /><p className="font-medium">No activity recorded</p></div>}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
