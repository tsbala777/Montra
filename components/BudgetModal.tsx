import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Category, Budget } from '../types';
import { CATEGORY_ICONS, CATEGORY_COLORS } from '../constants';
import { X, ChevronRight, MoreHorizontal, CheckCircle2 } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (budget: Budget) => void;
    currency: string;
    initialData?: Budget | null;
    existingCategories?: string[];
}

const INCOME_CATEGORIES = [Category.INCOME, Category.INCOME_SOURCE, Category.SCHOLARSHIP, Category.GIFT];

export const BudgetModal: React.FC<Props> = ({ isOpen, onClose, onSave, currency, initialData, existingCategories = [] }) => {
    const [category, setCategory] = useState<Category>(Category.FOOD);
    const [limit, setLimit] = useState('');
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setCategory(initialData.category);
                setLimit(initialData.limit.toString());
            } else {
                const availableParams = Object.values(Category).filter(c =>
                    !INCOME_CATEGORIES.includes(c) && (!existingCategories.includes(c))
                );
                if (availableParams.length > 0) {
                    setCategory(availableParams[0]);
                } else {
                    setCategory(Category.FOOD);
                }
                setLimit('');
            }
            setShowCategoryPicker(false);
        }
    }, [isOpen, initialData, existingCategories]);
    if (!isOpen) return null;

    const handleSave = () => {
        if (!limit || parseFloat(limit) <= 0) return;
        onSave({
            category,
            limit: parseFloat(limit)
        });
        onClose();
    };

    const availableCategories = Object.values(Category).filter(c => !INCOME_CATEGORIES.includes(c));

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/25 dark:bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden transition-all animate-scale-in flex flex-col max-h-[90vh]">
                <style>
                    {`
            @keyframes scale-in {
              0% { transform: scale(0.95); opacity: 0; }
              100% { transform: scale(1); opacity: 1; }
            }
            @keyframes slide-up {
              0% { transform: translateY(100%); }
              100% { transform: translateY(0); }
            }
            .animate-scale-in { animation: scale-in 0.2s ease-out forwards; }
            .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
          `}
                </style>

                {/* Fixed Header */}
                <div className="flex-none flex justify-between items-center px-6 pt-6 pb-2 z-10 bg-white dark:bg-slate-900">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                        {initialData ? 'Edit Budget' : 'New Budget'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className={`flex-1 overflow-y-auto custom-scrollbar no-scrollbar p-6 space-y-6 transition-all ${showCategoryPicker ? 'pb-52' : ''}`}>

                    {/* Limit Input */}
                    <div className="text-center py-4">
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mb-2">Monthly Limit</p>
                        <div className="flex items-center justify-center gap-2">
                            <span className="text-3xl font-bold text-slate-900 dark:text-white">{currency}</span>
                            <input
                                type="number"
                                placeholder="0"
                                value={limit}
                                onChange={(e) => setLimit(e.target.value)}
                                autoFocus
                                className="text-4xl font-black text-slate-900 dark:text-white bg-transparent border-none outline-none text-left w-40 placeholder:text-slate-200 dark:placeholder:text-slate-700"
                            />
                        </div>
                    </div>

                    {/* Category Selector */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block ml-1">Category</label>

                        {!initialData ? (
                            <div className="relative">
                                <button
                                    onClick={() => setShowCategoryPicker(!showCategoryPicker)}
                                    className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 active:scale-[0.98] transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm text-indigo-500">
                                            {CATEGORY_ICONS[category] || <MoreHorizontal size={20} />}
                                        </div>
                                        <span className="font-bold text-slate-700 dark:text-white text-lg">{category}</span>
                                    </div>
                                    <ChevronRight className={`text-slate-400 transition-transform ${showCategoryPicker ? 'rotate-90' : ''}`} />
                                </button>

                                {showCategoryPicker && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-2xl shadow-xl z-20 border border-slate-100 dark:border-slate-700 max-h-60 overflow-y-auto p-2 custom-scrollbar animate-fade-in">
                                        <div className="grid grid-cols-1 gap-1">
                                            {availableCategories.map((cat) => {
                                                const isUsed = existingCategories.includes(cat) && cat !== category;
                                                return (
                                                    <button
                                                        key={cat}
                                                        disabled={isUsed}
                                                        onClick={() => {
                                                            setCategory(cat);
                                                            setShowCategoryPicker(false);
                                                        }}
                                                        className={`flex items-center gap-3 p-3 rounded-xl transition-all ${category === cat
                                                            ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
                                                            : isUsed
                                                                ? 'opacity-50 grayscale cursor-not-allowed'
                                                                : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-300'
                                                            }`}
                                                    >
                                                        <span className="scale-75">{CATEGORY_ICONS[cat]}</span>
                                                        <span className="font-bold text-sm">{cat}</span>
                                                        {isUsed && <span className="ml-auto text-[10px] uppercase font-bold text-slate-300">Used</span>}
                                                        {category === cat && <CheckCircle2 size={16} className="ml-auto text-indigo-500" />}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            // Read-only category when editing
                            <div className="flex items-center gap-3 p-4 bg-slate-100/50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 opacity-80 cursor-not-allowed">
                                <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm text-slate-400">
                                    {CATEGORY_ICONS[category]}
                                </div>
                                <span className="font-bold text-slate-500 dark:text-slate-400 text-lg">{category}</span>
                            </div>
                        )}
                    </div>

                    <div className="pt-4">
                        <button
                            onClick={handleSave}
                            disabled={!limit || parseFloat(limit) <= 0}
                            className={`w-full py-4 rounded-xl text-lg font-bold transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 ${limit && parseFloat(limit) > 0
                                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/25'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none'
                                }`}
                        >
                            Save Budget
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};
