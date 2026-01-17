
import React, { useState, useEffect } from 'react';
import { SavingsGoal, PRESET_GOAL_ICONS } from '../types';
import { GOAL_ICON_COMPONENTS } from '../constants';
import { GlassCard, GlassButton, GlassInput } from '../components/ui/Glass';
import { Target, Plus, Trash2, ArrowUpRight, CheckCircle2, Rocket, Compass, Sparkles, Wand2, Calendar, TrendingUp, Pencil, ChevronLeft, ChevronRight } from 'lucide-react';
import { GoalModal } from '../components/GoalModal';

interface Props {
  goals: SavingsGoal[];
  onAddGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  onUpdateGoal: (id: string, amount: number) => void;
  onEditGoal?: (goal: SavingsGoal) => void;
  onDeleteGoal: (id: string) => void;
  currency: string;
}

export const Goals: React.FC<Props> = ({ goals, onAddGoal, onUpdateGoal, onEditGoal, onDeleteGoal, currency }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [contribution, setContribution] = useState<Record<string, string>>({});

  // Reset state when opening modal (Handled inside modal now)

  /* Handlers moved to Modal */

  const startEdit = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setIsAdding(true);
  };

  const handleContribute = (id: string) => {
    const amount = parseFloat(contribution[id] || '0');
    if (isNaN(amount) || amount <= 0) return;
    onUpdateGoal(id, amount);
    setContribution({ ...contribution, [id]: '' });
  };



  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Savings Goals</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Big things start with small savings.</p>
        </div>
        {!isAdding && goals.length > 0 && (
          <GlassButton onClick={() => setIsAdding(true)}>
            <Plus size={20} />
            <span className="hidden md:inline">New Goal</span>
            <span className="md:hidden">New</span>
          </GlassButton>
        )}
      </div>

      <GoalModal
        isOpen={isAdding}
        onClose={() => { setIsAdding(false); setEditingGoal(null); }}
        onSave={(data) => {
          onAddGoal({ ...data, currentAmount: 0 });
          setIsAdding(false);
        }}
        onUpdate={(data) => {
          if (onEditGoal) onEditGoal(data);
          setIsAdding(false);
          setEditingGoal(null);
        }}
        currency={currency}
        initialData={editingGoal}
      />

      {
        goals.length === 0 && !isAdding ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-fade-in">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-[#2563EB]/10 blur-3xl rounded-full" />
              <div className="relative flex gap-4">
                <div className="bg-white dark:bg-slate-800 glass-panel p-6 rounded-3xl shadow-xl animate-float border-white/50 dark:border-white/5" style={{ animationDelay: '0s' }}>
                  <Rocket className="w-12 h-12 text-[#2563EB]" strokeWidth={1.5} />
                </div>
                <div className="bg-white dark:bg-slate-800 glass-panel p-6 rounded-3xl shadow-xl animate-float mt-8 border-white/50 dark:border-white/5" style={{ animationDelay: '1.5s' }}>
                  <Compass className="w-12 h-12 text-sky-500" strokeWidth={1.5} />
                </div>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">Dreams don't have to wait.</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-8 leading-relaxed font-medium">
              What are you dreaming of? A new laptop, a spring break trip, or just an emergency fund? Start small, dream big.
            </p>
            <GlassButton onClick={() => setIsAdding(true)} className="px-8 py-4 text-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 shadow-xl dark:shadow-none scale-105 hover:scale-110 active:scale-95 transition-all border-none font-bold">
              <Plus size={24} className="mr-1" />
              Start Your Savings Journey
            </GlassButton>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {goals.map((goal) => {
              const percentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
              const isCompleted = percentage >= 100;
              const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0);
              const IconComponent = GOAL_ICON_COMPONENTS[goal.icon] || Target;

              return (

                <GlassCard key={goal.id} className="relative group overflow-visible flex flex-col justify-between border-white/40 dark:border-white/5 p-6 transition-all duration-300 hover:shadow-[0_8px_32px_0_rgba(37,99,235,0.1)] hover:-translate-y-1">
                  {/* Glow Effect Removed */}

                  <div className="relative">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-blue-600 dark:bg-blue-500 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                          <div className="text-white">
                            <IconComponent size={32} />
                          </div>
                        </div>
                        <div className="min-w-0 pt-1">
                          <h4 className="font-bold text-slate-800 dark:text-white text-lg leading-tight truncate mb-1">{goal.name}</h4>
                          <div className="flex items-center gap-2">
                            {isCompleted ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider border border-emerald-100 dark:border-emerald-500/20">
                                <Sparkles size={14} fill="currentColor" /> Completed
                              </span>
                            ) : (
                              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                {currency}{remaining.toLocaleString(undefined, { maximumFractionDigits: 0 })} left
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/50 dark:bg-slate-800/50 rounded-lg p-1 backdrop-blur-sm">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/50 dark:bg-slate-800/50 rounded-lg p-1 backdrop-blur-sm">
                          <button onClick={() => startEdit(goal)} className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors rounded-md hover:bg-white dark:hover:bg-slate-700">
                            <Pencil size={18} />
                          </button>
                          <button onClick={() => onDeleteGoal(goal.id)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors rounded-md hover:bg-white dark:hover:bg-slate-700">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Progress Section */}
                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between text-sm items-end">
                        <span className="font-black text-2xl text-slate-800 dark:text-white">{currency}{goal.currentAmount.toLocaleString()}</span>
                        <span className="text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-wider mb-1">Target: {currency}{goal.targetAmount.toLocaleString()}</span>
                      </div>

                      <div className="h-3 w-full bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden shadow-inner">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ease-out relative ${isCompleted
                            ? 'bg-gradient-to-r from-emerald-400 to-teal-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                            : 'bg-[#2563EB] shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                            }`}
                          style={{ width: `${percentage}%` }}
                        >
                          <div className="absolute inset-0 bg-white/20 animate-pulse-slow" />
                        </div>
                      </div>
                    </div>

                    {/* Calendar & Save Pace Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {/* Calendar Card */}
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-2xl p-4 border border-blue-100 dark:border-blue-900/30">
                        <div className="flex items-center gap-2 mb-3">
                          <Calendar size={16} className="text-blue-600 dark:text-blue-400" />
                          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Target Date</span>
                        </div>
                        <div className="text-center mb-3">
                          <div className="text-2xl font-black text-slate-800 dark:text-white mb-1">
                            {goal.deadline
                              ? new Date(goal.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                              : 'Not Set'
                            }
                          </div>
                          {goal.deadline && (
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {new Date(goal.deadline).toLocaleDateString('en-US', { year: 'numeric' })}
                            </div>
                          )}
                        </div>
                        <div className="pt-3 border-t border-blue-100 dark:border-blue-900/30 flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Time Left</span>
                          <span className="text-sm font-black text-slate-800 dark:text-white">
                            {goal.deadline
                              ? (() => {
                                const days = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                                return days > 0 ? `${days} Day${days !== 1 ? 's' : ''}` : 'Today';
                              })()
                              : '∞'
                            }
                          </span>
                        </div>
                      </div>

                      {/* Save Pace Card */}
                      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-900/30">
                        <div className="flex items-center gap-2 mb-3">
                          <TrendingUp size={16} className="text-emerald-600 dark:text-emerald-400" />
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Save Pace</span>
                        </div>
                        <div className="text-center mb-3">
                          <div className="text-2xl font-black text-slate-800 dark:text-white mb-1">
                            {goal.deadline && goal.targetAmount > goal.currentAmount
                              ? (() => {
                                const days = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                                const remaining = goal.targetAmount - goal.currentAmount;
                                const pace = days > 0 ? remaining / days : remaining;
                                return `${currency}${Math.ceil(pace).toLocaleString()}`;
                              })()
                              : '-'
                            }
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">per day</div>
                        </div>
                        <div className="pt-3 border-t border-emerald-100 dark:border-emerald-900/30 text-center">
                          <p className="text-[10px] font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
                            To reach your goal by {goal.deadline ? new Date(goal.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'target date'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-white/5">
                      <div className="relative flex-1 group/input">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-xs font-bold transition-colors group-focus-within/input:text-[#2563EB]">{currency}</span>
                        <input
                          type="number"
                          placeholder="Add funds..."
                          className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl pl-7 pr-3 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]/50 transition-all text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"
                          value={contribution[goal.id] || ''}
                          onChange={(e) => setContribution({ ...contribution, [goal.id]: e.target.value })}
                        />
                      </div>
                      <button
                        onClick={() => handleContribute(goal.id)}
                        disabled={isCompleted}
                        className={`p-2.5 rounded-xl transition-all flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 ${isCompleted
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 cursor-default border border-emerald-100 dark:border-emerald-500/20'
                          : 'bg-[#2563EB] text-white shadow-blue-500/30 hover:shadow-blue-500/50'
                          }`}
                      >
                        {isCompleted ? <CheckCircle2 size={20} /> : <ArrowUpRight size={20} />}
                      </button>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )
      }
    </div >
  );
};
