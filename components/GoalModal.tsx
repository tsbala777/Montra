import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { SavingsGoal, PRESET_GOAL_ICONS } from '../types';
import { GOAL_ICON_COMPONENTS } from '../constants';
import { X, Target, Calendar as CalendarIcon, ChevronRight } from 'lucide-react';
import { Calendar } from './ui/calendar';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (goal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => void;
    onUpdate?: (goal: SavingsGoal) => void; // For editing
    currency: string;
    initialData?: SavingsGoal | null;
}

export const GoalModal: React.FC<Props> = ({ isOpen, onClose, onSave, onUpdate, currency, initialData }) => {
    const [name, setName] = useState('');
    const [target, setTarget] = useState('');
    const [deadline, setDeadline] = useState('');
    const [selectedIcon, setSelectedIcon] = useState<string>('target');
    const [isAnimatingIcon, setIsAnimatingIcon] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setName(initialData.name);
                setTarget(initialData.targetAmount.toString());
                setDeadline(initialData.deadline || '');
                setSelectedIcon(initialData.icon);
            } else {
                setName('');
                setTarget('');
                setDeadline('');
                setSelectedIcon('target');
            }
        }
    }, [isOpen, initialData]);

    // Simple "AI" matcher reused from Goals.tsx
    const getSmartIcon = (text: string): string => {
        const lowerName = text.toLowerCase();
        if (lowerName.match(/laptop|mac|pc|computer|tech|ipad|electronics/)) return 'tech';
        if (lowerName.match(/phone|iphone|mobile/)) return 'phone';
        if (lowerName.match(/camera|lens|photo|video/)) return 'camera';
        if (lowerName.match(/game|console|ps5|xbox|switch|playstation/)) return 'game';
        if (lowerName.match(/watch|apple watch|fitbit/)) return 'watch';
        if (lowerName.match(/trip|travel|fly|plane|flight|vacation|break|holiday/)) return 'travel';
        if (lowerName.match(/beach|sea|ocean|summer|resort/)) return 'vacation';
        if (lowerName.match(/camp|hike|tent|outdoor|nature/)) return 'camping';
        if (lowerName.match(/car|tesla|bmw|toyota|jeep|drive/)) return 'car';
        if (lowerName.match(/bike|cycle|bicycle/)) return 'bike';
        if (lowerName.match(/house|rent|dorm|apartment|home|furniture|bed|sofa/)) return 'home';
        if (lowerName.match(/tuition|school|college|debt|loan|book|class/)) return 'education';
        if (lowerName.match(/concert|music|ticket|festival|guitar|piano/)) return 'music';
        if (lowerName.match(/shoe|sneaker|jordan|nike|adidas|boot|clothes|dress|fashion/)) return 'fashion';
        if (lowerName.match(/food|dinner|date|restaurant|pizza|burger/)) return 'food';
        if (lowerName.match(/dog|cat|pet|vet/)) return 'pet';
        if (lowerName.match(/gift|present|christmas|birthday/)) return 'gift';
        if (lowerName.match(/emergency|safe|fund/)) return 'savings';
        if (lowerName.match(/job|work|internship/)) return 'work';
        if (lowerName.match(/art|paint|draw/)) return 'art';
        return 'target';
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value;
        setName(newName);

        // Auto-select icon logic only if adding new
        if (!initialData) {
            const suggestedIcon = getSmartIcon(newName);
            if (suggestedIcon !== 'target') {
                setSelectedIcon(suggestedIcon);
                setIsAnimatingIcon(true);
                setTimeout(() => setIsAnimatingIcon(false), 1000);
            }
        }
    };

    const handleSave = () => {
        if (!name || !target) return;

        const goalData = {
            name,
            targetAmount: parseFloat(target),
            icon: selectedIcon,
            deadline: deadline || undefined,
        };

        if (initialData && onUpdate) {
            onUpdate({ ...initialData, ...goalData });
        } else {
            onSave(goalData);
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            {createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/25 dark:bg-black/60 backdrop-blur-sm" onClick={onClose} />

                    <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden transition-all animate-scale-in flex flex-col max-h-[90vh]">
                        <style>
                            {`
            @keyframes scale-in { 0% { transform: scale(0.95); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
            @keyframes slide-up { 0% { transform: translateY(100%); } 100% { transform: translateY(0); } }
            .animate-scale-in { animation: scale-in 0.2s ease-out forwards; }
            .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
          `}
                        </style>

                        {/* Fixed Header */}
                        <div className="flex-none flex justify-between items-center px-6 pt-6 pb-2 z-10 bg-white dark:bg-slate-900">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                {initialData ? 'Edit Goal' : 'New Goal'}
                            </h2>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">

                            {/* Target Amount Input */}
                            <div className="text-center py-2">
                                <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mb-2">Target Amount</p>
                                <div className="flex items-center justify-center gap-2">
                                    <span className="text-3xl font-bold text-slate-900 dark:text-white">{currency}</span>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={target}
                                        onChange={(e) => setTarget(e.target.value)}
                                        autoFocus
                                        className="text-4xl font-black text-slate-900 dark:text-white bg-transparent border-none outline-none text-left w-40 placeholder:text-slate-200 dark:placeholder:text-slate-700"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                {/* Name Input */}
                                <div>
                                    <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block ml-1 mb-2">Goal Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. New MacBook"
                                        value={name}
                                        onChange={handleNameChange}
                                        className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-3 font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:font-normal"
                                    />
                                </div>

                                {/* Deadline */}
                                <div>
                                    <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block ml-1 mb-2">Target Date (Optional)</label>
                                    <button
                                        type="button"
                                        onClick={() => setShowCalendar(true)}
                                        className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-3 font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all flex items-center justify-between hover:bg-slate-200 dark:hover:bg-slate-700"
                                    >
                                        <span className={deadline ? '' : 'text-slate-400 dark:text-slate-500'}>
                                            {deadline
                                                ? new Date(deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                                                : 'Select Date'
                                            }
                                        </span>
                                        <CalendarIcon size={16} className="text-slate-400" />
                                    </button>
                                </div>

                                {/* Icon Selector */}
                                <div>
                                    <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block ml-1 mb-2">Icon</label>
                                    <div className="flex gap-2 overflow-x-auto custom-scrollbar py-1">
                                        {PRESET_GOAL_ICONS.map((iconKey) => {
                                            const IconComponent = GOAL_ICON_COMPONENTS[iconKey] || Target;
                                            return (
                                                <button
                                                    key={iconKey}
                                                    type="button"
                                                    onClick={() => setSelectedIcon(iconKey)}
                                                    className={`
                                                        w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200
                                                        ${selectedIcon === iconKey
                                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                                                        }
                                                        ${isAnimatingIcon && selectedIcon === iconKey ? 'animate-bounce' : ''}
                                                    `}
                                                >
                                                    <IconComponent size={20} />
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2 pb-4">
                                <button
                                    onClick={handleSave}
                                    disabled={!name || !target}
                                    className={`w-full py-4 rounded-xl text-lg font-bold transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 ${name && target
                                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/25'
                                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none'
                                        }`}
                                >
                                    Save Goal
                                </button>
                            </div>

                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Calendar Overlay */}
            {showCalendar && createPortal(
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
                    onClick={() => setShowCalendar(false)}
                >
                    <div
                        className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl animate-scale-in max-w-sm w-full overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Quick Date Selection */}
                        <div className="p-3 border-b border-slate-200 dark:border-slate-700">
                            <div className="grid grid-cols-2 gap-2">
                                {(() => {
                                    const today = new Date();
                                    const nextWeek = new Date();
                                    nextWeek.setDate(nextWeek.getDate() + 7);
                                    const nextMonth = new Date();
                                    nextMonth.setMonth(nextMonth.getMonth() + 1);

                                    const formatDate = (date: Date) => {
                                        const year = date.getFullYear();
                                        const month = String(date.getMonth() + 1).padStart(2, '0');
                                        const day = String(date.getDate()).padStart(2, '0');
                                        return `${year}-${month}-${day}`;
                                    };

                                    const nextWeekStr = formatDate(nextWeek);
                                    const nextMonthStr = formatDate(nextMonth);

                                    const activeClass = "px-3 py-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors";
                                    const inactiveClass = "px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors";

                                    return (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setDeadline(nextWeekStr);
                                                    setShowCalendar(false);
                                                }}
                                                className={deadline === nextWeekStr ? activeClass : inactiveClass}
                                            >
                                                Next Week
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setDeadline(nextMonthStr);
                                                    setShowCalendar(false);
                                                }}
                                                className={deadline === nextMonthStr ? activeClass : inactiveClass}
                                            >
                                                Next Month
                                            </button>
                                        </>
                                    );
                                })()}
                            </div>
                        </div>

                        <Calendar
                            mode="single"
                            selected={deadline ? new Date(deadline) : undefined}
                            onSelect={(selectedDate) => {
                                if (selectedDate) {
                                    const year = selectedDate.getFullYear();
                                    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                                    const day = String(selectedDate.getDate()).padStart(2, '0');
                                    setDeadline(`${year}-${month}-${day}`);
                                    setShowCalendar(false);
                                }
                            }}
                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                            className="p-4"
                        />
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};
