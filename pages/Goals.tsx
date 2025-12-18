
import React, { useState } from 'react';
import { SavingsGoal } from '../types';
import { GlassCard, GlassButton, GlassInput } from '../components/ui/Glass';
import { Target, Plus, Trash2, ArrowUpRight, CheckCircle2, Rocket, Compass } from 'lucide-react';

interface Props {
  goals: SavingsGoal[];
  onAddGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  onUpdateGoal: (id: string, amount: number) => void;
  onDeleteGoal: (id: string) => void;
  currency: string;
}

export const Goals: React.FC<Props> = ({ goals, onAddGoal, onUpdateGoal, onDeleteGoal, currency }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [contribution, setContribution] = useState<Record<string, string>>({});

  const handleAdd = () => {
    if (!name || !target) return;
    onAddGoal({
      name,
      targetAmount: parseFloat(target),
      currentAmount: 0,
      icon: '🎯'
    });
    setName('');
    setTarget('');
    setIsAdding(false);
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
            <Plus size={18} />
            <span className="hidden md:inline">New Goal</span>
            <span className="md:hidden">New</span>
          </GlassButton>
        )}
      </div>

      {isAdding && (
        <GlassCard className="animate-slide-up border-indigo-100 dark:border-indigo-500/20 bg-white/90 dark:bg-slate-900/90 shadow-xl">
          <h3 className="text-lg font-medium mb-4 text-slate-800 dark:text-white">Set a New Target</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Goal Name</label>
              <GlassInput 
                placeholder="e.g. Summer Backpacking" 
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Target Amount ({currency})</label>
              <GlassInput 
                type="number" 
                placeholder="0.00" 
                value={target}
                onChange={(e) => setTarget(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <GlassButton onClick={handleAdd} className="flex-1">Create Goal</GlassButton>
            <GlassButton variant="secondary" onClick={() => setIsAdding(false)} className="px-6">Cancel</GlassButton>
          </div>
        </GlassCard>
      )}

      {goals.length === 0 && !isAdding ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-fade-in">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-purple-500/10 blur-3xl rounded-full" />
            <div className="relative flex gap-4">
              <div className="bg-white dark:bg-slate-800 glass-panel p-6 rounded-3xl shadow-xl animate-float border-white/50 dark:border-white/5" style={{ animationDelay: '0s' }}>
                <Rocket className="w-10 h-10 text-indigo-500" strokeWidth={1.5} />
              </div>
              <div className="bg-white dark:bg-slate-800 glass-panel p-6 rounded-3xl shadow-xl animate-float mt-8 border-white/50 dark:border-white/5" style={{ animationDelay: '1.5s' }}>
                <Compass className="w-10 h-10 text-purple-500" strokeWidth={1.5} />
              </div>
            </div>
          </div>
          <h2 className="text-2xl font-medium text-slate-800 dark:text-white mb-3 tracking-tight">Dreams don't have to wait.</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-8 leading-relaxed">
            What are you dreaming of? A new laptop, a spring break trip, or just an emergency fund? Start small, dream big.
          </p>
          <GlassButton onClick={() => setIsAdding(true)} className="px-8 py-4 text-lg bg-gradient-to-r from-indigo-600 to-purple-600 shadow-indigo-100 dark:shadow-none scale-105 hover:scale-110 active:scale-95 transition-all border-none text-white">
            <Plus size={20} className="mr-1" />
            Start Your Savings Journey
          </GlassButton>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map((goal) => {
            const percentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
            const isCompleted = percentage >= 100;
            const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0);

            return (
              <GlassCard key={goal.id} className="relative group overflow-hidden flex flex-col justify-between border-white/60 dark:border-white/5">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/20 text-2xl flex items-center justify-center shadow-inner dark:shadow-none shrink-0">
                        {goal.icon}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-slate-800 dark:text-white text-lg leading-tight truncate">{goal.name}</h4>
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium uppercase tracking-tighter">
                          {isCompleted ? 'Goal Reached!' : `${currency}${remaining.toFixed(0)} to go`}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => onDeleteGoal(goal.id)}
                      className="p-2 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition-colors opacity-100 md:opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="font-bold text-slate-700 dark:text-slate-200">{currency}{goal.currentAmount.toLocaleString()}</span>
                      <span className="text-slate-400 dark:text-slate-500">of {currency}{goal.targetAmount.toLocaleString()}</span>
                    </div>
                    <div className="h-3 w-full bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden shadow-inner p-0.5">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${
                          isCompleted 
                            ? 'bg-gradient-to-r from-emerald-400 to-teal-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                            : 'bg-gradient-to-r from-indigo-500 to-purple-600'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-xs">{currency}</span>
                    <input 
                      type="number"
                      placeholder="Add..."
                      className="w-full bg-white/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-white/10 rounded-xl pl-6 pr-3 py-2 text-xs outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"
                      value={contribution[goal.id] || ''}
                      onChange={(e) => setContribution({ ...contribution, [goal.id]: e.target.value })}
                    />
                  </div>
                  <button 
                    onClick={() => handleContribute(goal.id)}
                    disabled={isCompleted}
                    className={`p-2 rounded-xl transition-all flex items-center justify-center ${
                      isCompleted 
                        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 cursor-default' 
                        : 'bg-slate-900 dark:bg-indigo-600 text-white hover:bg-slate-800 dark:hover:bg-indigo-700 active:scale-95'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 size={18} /> : <ArrowUpRight size={18} />}
                  </button>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
};
