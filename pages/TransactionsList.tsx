
import React, { useMemo, useState } from 'react';
import { Transaction, Category, TransactionType } from '../types';
import { GlassCard, GlassInput, GlassSelect } from '../components/ui/Glass';
import { CATEGORY_ICONS, CATEGORY_COLORS } from '../constants';
import { Search, Trash2, Filter, Calendar, ListFilter } from 'lucide-react';

interface Props {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  currency: string;
}

export const TransactionsList: React.FC<Props> = ({ transactions, onDelete, currency }) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | Category>('all');
  const [dateFilter, setDateFilter] = useState('all');
  
  const [showFilters, setShowFilters] = useState(false);

  const filteredTransactions = useMemo(() => {
    return [...transactions]
      .filter(t => {
        // Search filter
        const matchesSearch = t.description.toLowerCase().includes(search.toLowerCase()) || 
          t.category.toLowerCase().includes(search.toLowerCase()) ||
          (t.source && t.source.toLowerCase().includes(search.toLowerCase()));
        
        // Type filter
        const matchesType = typeFilter === 'all' || t.type === typeFilter;

        // Category filter
        const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;

        // Date filter
        let matchesDate = true;
        if (dateFilter !== 'all') {
          const tDate = new Date(t.date);
          const now = new Date();
          
          if (dateFilter === 'today') {
            matchesDate = tDate.toDateString() === now.toDateString();
          } else if (dateFilter === 'week') {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            matchesDate = tDate >= weekAgo;
          } else if (dateFilter === 'month') {
            const monthAgo = new Date();
            monthAgo.setDate(monthAgo.getDate() - 30);
            matchesDate = tDate >= monthAgo;
          }
        }

        return matchesSearch && matchesType && matchesCategory && matchesDate;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, search, typeFilter, categoryFilter, dateFilter]);

  const resetFilters = () => {
    setSearch('');
    setTypeFilter('all');
    setCategoryFilter('all');
    setDateFilter('all');
  };

  const hasActiveFilters = search !== '' || typeFilter !== 'all' || categoryFilter !== 'all' || dateFilter !== 'all';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Transactions</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">History of your logs and income.</p>
        </div>
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${showFilters ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-lg' : 'bg-white/50 dark:bg-white/10 text-slate-500 dark:text-slate-400 hover:bg-white/80 dark:hover:bg-white/15'}`}
        >
          <Filter size={14} />
          {showFilters ? 'Hide' : 'Filters'}
        </button>
      </div>

      <div className="space-y-4 relative z-20">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
          <GlassInput 
            placeholder="Search by name, category, or source..." 
            className="pl-11"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 animate-slide-up">
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                <ListFilter size={10} /> Type
              </label>
              <GlassSelect value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as any)}>
                <option value="all">All Types</option>
                <option value="expense">Expenses Only</option>
                <option value="income">Income Only</option>
              </GlassSelect>
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                <Calendar size={10} /> Date Range
              </label>
              <GlassSelect value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </GlassSelect>
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                <Filter size={10} /> Category
              </label>
              <GlassSelect value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as any)}>
                <option value="all">All Categories</option>
                {Object.values(Category).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </GlassSelect>
            </div>
          </div>
        )}

        {hasActiveFilters && (
          <div className="flex items-center justify-between animate-fade-in">
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              Found {filteredTransactions.length} results
            </p>
            <button 
              onClick={resetFilters}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      <div className="space-y-3 relative z-10">
        {filteredTransactions.length === 0 ? (
           <div className="text-center py-24 glass-panel rounded-3xl border-dashed border-2 border-slate-200 dark:border-white/5 bg-white/30 dark:bg-transparent">
             <div className="text-4xl mb-4 opacity-40">🔍</div>
             <p className="text-slate-500 dark:text-slate-400 font-medium">No matches found for your criteria.</p>
             <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Try adjusting your filters or search term.</p>
           </div>
        ) : (
          filteredTransactions.map((t) => (
            <GlassCard key={t.id} className="p-4 flex items-center justify-between group hover:bg-white/80 dark:hover:bg-white/5 transition-all cursor-default border-white/60 dark:border-white/5 gap-3">
              <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm shrink-0 ${CATEGORY_COLORS[t.category]}`}>
                  {CATEGORY_ICONS[t.category]}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2 truncate">
                    {t.description}
                  </h4>
                  <div className="flex items-center gap-2 overflow-hidden">
                    {t.type === 'income' && t.source && (
                        <span className="shrink-0 text-[9px] md:text-[10px] bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">
                          {t.source}
                        </span>
                      )}
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium truncate">
                      {new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • {t.category}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 md:gap-5 shrink-0">
                <span className={`text-sm font-bold tracking-tight whitespace-nowrap ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                  {t.type === 'income' ? '+' : '-'}{currency}{t.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <button 
                  onClick={() => onDelete(t.id)}
                  className="p-2 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all opacity-100 md:opacity-0 group-hover:opacity-100 scale-90"
                  aria-label="Delete transaction"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
};
