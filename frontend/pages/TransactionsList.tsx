import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType } from '../types';
import { CATEGORY_ICONS, CATEGORY_COLORS } from '../constants';
import { Search, Filter, Trash2, ArrowUpDown, Calendar, ChevronDown, Download, Pencil, Check, Plus, Wallet, Tag } from 'lucide-react';
import { Fragment } from 'react';

interface Props {
    transactions: Transaction[];
    onDelete: (id: string) => void;
    onEdit: (t: Transaction) => void;
    onAddTransaction: () => void;
    currency: string;
}

export const TransactionsList: React.FC<Props> = ({ transactions, onDelete, onEdit, onAddTransaction, currency }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<'all' | TransactionType>('all');
    const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
    const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

    const filteredTransactions = useMemo(() => {
        return transactions
            .filter((t) => {
                const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    t.category.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesType = filterType === 'all' || t.type === filterType;
                const matchesCategory = selectedCategory === 'All Categories' || t.category === selectedCategory;
                return matchesSearch && matchesType && matchesCategory;
            })
            .sort((a, b) => {
                const timeA = new Date(a.date).getTime();
                const timeB = new Date(b.date).getTime();
                return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
            });
    }, [transactions, searchTerm, filterType, selectedCategory, sortOrder]);

    const categoriesList = ['All Categories', ...Object.keys(CATEGORY_ICONS)];

    return (
        <div className="space-y-8 pb-24 animate-fade-in max-w-7xl mx-auto font-sans">

            {/* Header Section */}
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                        All Expenses
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium hidden md:block">
                        Manage and view all your expenses
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium text-xs md:hidden">
                        Manage and view all your expenses
                    </p>
                </div>

                {/* Actions Placeholder */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={onAddTransaction}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-95 whitespace-nowrap"
                    >
                        <Plus size={18} strokeWidth={2.5} />
                        Add New
                    </button>
                </div>
            </div>

            {/* Glass Container */}
            <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl rounded-[2rem] border border-white/20 dark:border-white/5 shadow-2xl shadow-indigo-500/5">

                {/* Controls Bar */}
                <div className="relative z-50 p-4 border-b border-slate-200/60 dark:border-white/5 flex flex-col gap-4 bg-slate-50/50 dark:bg-white/5 backdrop-blur-sm">

                    {/* Row 1: Search & Sort */}
                    <div className="flex flex-col md:flex-row justify-between gap-4 w-full">
                        {/* Search */}
                        <div className="relative w-full md:flex-1 group">
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                <Search className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-sm"
                            />
                        </div>

                        {/* Sort Button */}
                        <button
                            onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                            className="hidden md:flex items-center gap-2 px-4 py-2 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-white/5 transition-all shadow-sm active:scale-95 whitespace-nowrap"
                        >
                            <ArrowUpDown size={14} />
                            {sortOrder === 'desc' ? 'Newest' : 'Oldest'}
                        </button>
                    </div>

                    {/* Row 2: Filters */}
                    <div className="flex flex-col md:flex-row justify-between gap-4 w-full">
                        {/* Sliding Segmented Control */}
                        <div className="bg-slate-100 dark:bg-black/40 p-1 rounded-2xl flex items-center relative w-full md:max-w-sm h-12">
                            {/* Sliding Background */}
                            <div
                                className={`absolute top-1 bottom-1 rounded-xl bg-white dark:bg-indigo-600 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none transition-all duration-300 ease-ios`}
                                style={{
                                    width: 'calc((100% - 8px) / 3)',
                                    left: filterType === 'all'
                                        ? '4px'
                                        : filterType === 'income'
                                            ? 'calc(4px + (100% - 8px) / 3)'
                                            : 'calc(4px + ((100% - 8px) / 3) * 2)'
                                }}
                            />

                            {['all', 'income', 'expense'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setFilterType(type as any)}
                                    className={`relative z-10 flex-1 h-full flex items-center justify-center text-xs font-bold uppercase tracking-widest transition-colors duration-200 ${filterType === type
                                        ? 'text-slate-900 dark:text-white'
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>

                        {/* Category Filter Dropdown */}
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <div className="relative w-full md:w-auto">
                                <button
                                    onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-white/5 transition-all shadow-sm active:scale-95 w-full md:min-w-[180px] justify-between h-12"
                                >
                                    <span className="truncate max-w-[120px]">{selectedCategory}</span>
                                    <ChevronDown size={14} className={`transition-transform duration-300 ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isCategoryDropdownOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-[90]"
                                            onClick={() => setIsCategoryDropdownOpen(false)}
                                        />
                                        <div className="absolute top-full mt-2 w-full md:w-56 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-100 dark:border-white/10 z-[100] py-2 max-h-64 overflow-y-auto custom-scrollbar animate-scale-in origin-top-right right-0 md:right-auto md:left-0 ring-1 ring-black/5">
                                            {categoriesList.map((cat) => (
                                                <button
                                                    key={cat}
                                                    onClick={() => {
                                                        setSelectedCategory(cat);
                                                        setIsCategoryDropdownOpen(false);
                                                    }}
                                                    className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center justify-between transition-colors"
                                                >
                                                    {cat}
                                                    {selectedCategory === cat && <Check size={14} className="text-indigo-600 dark:text-indigo-400" />}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Mobile Sort Button (Only visible on mobile) */}
                            <button
                                onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                                className="md:hidden flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-white/5 transition-all shadow-sm active:scale-95 h-10 w-full"
                            >
                                <ArrowUpDown size={14} />
                                {sortOrder === 'desc' ? 'Newest' : 'Oldest'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Data Grid Header */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-8 py-4 bg-slate-50/50 dark:bg-white/5 border-b border-slate-200 dark:border-white/5 text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                    <div className="col-span-4 text-left">Item</div>
                    <div className="col-span-2 text-left">Category</div>
                    <div className="col-span-3 text-left">Date</div>
                    <div className="col-span-2 text-right">Amount</div>
                    <div className="col-span-1 text-right">Actions</div>
                </div>

                {/* Data Grid Rows */}
                <div className="divide-y divide-slate-300 dark:divide-white/10">
                    {filteredTransactions.length === 0 ? (
                        <div className="text-center py-32">
                            <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl animate-bounce">
                                🔍
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No transactions found</h3>
                            <p className="text-slate-500 dark:text-slate-400">Try adjusting to filters or search terms.</p>
                        </div>
                    ) : (
                        filteredTransactions.map((t) => (
                            <div
                                key={t.id}
                                className="group relative grid grid-cols-1 md:grid-cols-12 gap-4 px-6 md:px-8 py-5 items-center hover:bg-slate-50/50 dark:hover:bg-white/5 transition-all duration-200"
                            >
                                {/* Mobile Actions (Absolute Top Right) */}
                                <div className="absolute top-3 right-4 md:hidden flex items-center gap-2">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onEdit(t); }}
                                        className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors"
                                    >
                                        <Pencil size={14} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onDelete(t.id); }}
                                        className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                                {/* Description Mobile: Full Width, Desktop: col-span-4 */}
                                <div className="col-span-1 md:col-span-4 flex items-start gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm ${CATEGORY_COLORS[t.category] || 'bg-slate-100 text-slate-500'}`}>
                                        {CATEGORY_ICONS[t.category] || '📦'}
                                    </div>
                                    <div className="min-w-0 flex flex-col items-start gap-1.5">
                                        <p className="font-bold text-slate-900 dark:text-white truncate text-sm md:text-base">
                                            {t.description}
                                        </p>

                                        <div className="flex items-center flex-wrap gap-2">
                                            {/* Wallet Badge */}
                                            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[10px] font-semibold text-slate-600 dark:text-slate-400">
                                                <Wallet size={10} className="text-slate-400" />
                                                <span className="uppercase tracking-wide">{t.wallet || 'Cash'}</span>
                                            </div>

                                            {/* Tags */}
                                            {(t.tags && t.tags.length > 0 ? t.tags : ['#expense']).map((tag, i) => (
                                                <div key={i} className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                                                    <Tag size={10} />
                                                    <span className="uppercase tracking-wide">{tag.replace('#', '')}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Mobile Only Meta */}
                                        <div className="md:hidden flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                            <span>{new Date(t.date).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Category (Desktop) */}
                                <div className="hidden md:flex col-span-2">
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/5">
                                        {t.category}
                                    </span>
                                </div>

                                {/* Date (Desktop) */}
                                <div className="hidden md:flex col-span-3 items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                                    <Calendar size={14} className="opacity-50" />
                                    {new Date(t.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                </div>

                                {/* Amount (Desktop & Mobile) */}
                                <div className="col-span-1 md:col-span-2 flex md:justify-end items-center justify-between md:block mt-2 md:mt-0">
                                    <span className="md:hidden text-sm font-bold text-slate-500">Amount</span>
                                    <span className={`text-base font-bold tracking-tight text-right block ${t.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {currency}{t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </span>
                                </div>

                                {/* Actions */}
                                <div className="hidden md:flex col-span-1 md:col-span-1 justify-end gap-2">
                                    <button
                                        onClick={() => onEdit(t)}
                                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-all"
                                        title="Edit Transaction"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button
                                        onClick={() => onDelete(t.id)}
                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                                        title="Delete Transaction"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
