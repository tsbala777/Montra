
import React, { useState, useEffect } from 'react';
import { SavingsGoal, PRESET_GOAL_ICONS } from '../types';
import { GOAL_ICON_COMPONENTS } from '../constants';
import { GlassCard, GlassButton, GlassInput } from '../components/ui/Glass';
import { Target, Plus, Trash2, ArrowUpRight, CheckCircle2, Rocket, Compass, Sparkles, Wand2, Calendar, TrendingUp, Pencil, ChevronLeft, ChevronRight } from 'lucide-react';

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
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<string>('target');
  const [deadline, setDeadline] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [contribution, setContribution] = useState<Record<string, string>>({});
  const [isAnimatingIcon, setIsAnimatingIcon] = useState(false);

  // Reset state when opening modal
  useEffect(() => {
    if (isAdding && !editingId) {
      setSelectedIcon('target');
      setName('');
      setTarget('');
      setDeadline('');
    }
  }, [isAdding, editingId]);

  const handleSave = () => {
    if (!name || !target) return;

    const goalData = {
      name,
      targetAmount: parseFloat(target),
      icon: selectedIcon,
      deadline: deadline || undefined,
    };

    if (editingId && onEditGoal) {
      const existing = goals.find(g => g.id === editingId);
      if (existing) {
        onEditGoal({ ...existing, ...goalData });
      }
    } else {
      onAddGoal({ ...goalData, currentAmount: 0 });
    }
    setIsAdding(false);
    setEditingId(null);
  };

  const handleStartEdit = (goal: SavingsGoal) => {
    setEditingId(goal.id);
    setName(goal.name);
    setTarget(goal.targetAmount.toString());
    setSelectedIcon(goal.icon);
    setDeadline(goal.deadline || '');
    setIsAdding(true);
  };

  const handleContribute = (id: string) => {
    const amount = parseFloat(contribution[id] || '0');
    if (isNaN(amount) || amount <= 0) return;
    onUpdateGoal(id, amount);
    setContribution({ ...contribution, [id]: '' });
  };

  // Simple "AI" matcher that guesses the icon key based on the name
  const getSmartIcon = (text: string): string => {
    const lowerName = text.toLowerCase();

    // Tech
    if (lowerName.match(/laptop|mac|pc|computer|tech|ipad|electronics/)) return 'tech';
    if (lowerName.match(/phone|iphone|mobile/)) return 'phone';
    if (lowerName.match(/camera|lens|photo|video/)) return 'camera';
    if (lowerName.match(/game|console|ps5|xbox|switch|playstation/)) return 'game';
    if (lowerName.match(/watch|apple watch|fitbit/)) return 'watch';

    // Travel
    if (lowerName.match(/trip|travel|fly|plane|flight|vacation|break|holiday/)) return 'travel';
    if (lowerName.match(/beach|sea|ocean|summer|resort/)) return 'vacation';
    if (lowerName.match(/camp|hike|tent|outdoor|nature/)) return 'camping';

    // Transport
    if (lowerName.match(/car|tesla|bmw|toyota|jeep|drive/)) return 'car';
    if (lowerName.match(/bike|cycle|bicycle/)) return 'bike';

    // Lifestyle
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

    return 'target'; // Default
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);

    // Auto-select icon
    const suggestedIcon = getSmartIcon(newName);
    if (suggestedIcon !== 'target') {
      setSelectedIcon(suggestedIcon);
      // Optional: Add a subtle animation trigger here if desired, 
      // but without the separate button logic
      setIsAnimatingIcon(true);
      setTimeout(() => setIsAnimatingIcon(false), 1000);
    }
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

      {isAdding && (
        <GlassCard className="animate-slide-up border-indigo-100 dark:border-indigo-500/20 bg-white/90 dark:bg-slate-900/90 shadow-xl relative z-20">
          <h3 className="text-lg font-bold mb-6 text-slate-900 dark:text-white flex items-center gap-2">
            {editingId ? <Pencil className="text-indigo-500" size={24} /> : <Target className="text-indigo-500" size={24} />}
            {editingId ? 'Edit Goal' : 'Set a New Target'}
          </h3>

          <div className="space-y-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Goal Name</label>
                <div className="relative">
                  <GlassInput
                    placeholder="e.g. New MacBook Pro"
                    value={name}
                    onChange={handleNameChange}
                    className="font-medium"
                    autoFocus
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Target Amount ({currency})</label>
                <GlassInput
                  type="number"
                  placeholder="2000.00"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="font-medium"
                />
              </div>

              <div className="space-y-1.5 col-span-1 md:col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Target Date (Optional)</label>
                <GlassInput
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="font-medium"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            {/* Icon Selector */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Choose Icon</label>
              <div className="p-1 bg-slate-100/50 dark:bg-white/5 rounded-2xl border border-slate-200/50 dark:border-white/5">
                <div className="flex gap-2 overflow-x-auto custom-scrollbar p-2">
                  {PRESET_GOAL_ICONS.map((iconKey) => {
                    const IconComponent = GOAL_ICON_COMPONENTS[iconKey] || Target;
                    return (
                      <button
                        key={iconKey}
                        onClick={() => setSelectedIcon(iconKey)}
                        className={`
                          w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300
                          ${selectedIcon === iconKey
                            ? 'bg-white dark:bg-slate-700 shadow-lg scale-110 ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900 text-indigo-500 dark:text-indigo-400'
                            : 'hover:bg-white/50 dark:hover:bg-white/10 opacity-70 hover:opacity-100 grayscale hover:grayscale-0 text-slate-500 dark:text-slate-400'
                          }
                          ${isAnimatingIcon && selectedIcon === iconKey ? 'animate-bounce' : ''}
                        `}
                      >
                        <IconComponent size={24} />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <GlassButton onClick={handleSave} className="flex-1 font-bold py-3">{editingId ? 'Save Changes' : 'Create Goal'}</GlassButton>
            <GlassButton variant="secondary" onClick={() => { setIsAdding(false); setEditingId(null); }} className="px-8 font-bold">Cancel</GlassButton>
          </div>
        </GlassCard>
      )
      }

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
            <GlassButton onClick={() => setIsAdding(true)} className="px-8 py-4 text-lg bg-[#2563EB] shadow-blue-100 dark:shadow-none scale-105 hover:scale-110 active:scale-95 transition-all border-none text-white font-bold">
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
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/10 dark:shadow-none border border-white/50 dark:border-white/10 backdrop-blur-md relative overflow-hidden group-hover:scale-110 transition-transform duration-300">
                          <div className="absolute inset-0 bg-[#2563EB]/5 dark:bg-[#2563EB]/20 group-hover:bg-[#2563EB]/10 transition-colors" />
                          <div className="relative z-10 text-[#2563EB] dark:text-blue-400 drop-shadow-sm">
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
                        <button onClick={() => handleStartEdit(goal)} className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors rounded-md hover:bg-white dark:hover:bg-slate-700">
                          <Pencil size={18} />
                        </button>
                        <button onClick={() => onDeleteGoal(goal.id)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors rounded-md hover:bg-white dark:hover:bg-slate-700">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

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


                    {/* New Visual Design: Split Card */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                      {/* Left Panel: Mini Calendar Layout */}
                      <div className="flex-1 bg-blue-50/50 dark:bg-slate-800/50 rounded-2xl p-4 border border-blue-100 dark:border-white/5">
                        <div className="flex items-center justify-between mb-4">
                          <button className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"><ChevronLeft size={16} /></button>
                          <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                            {goal.deadline
                              ? new Date(goal.deadline).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                              : new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                            }
                          </span>
                          <button className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"><ChevronRight size={16} /></button>
                        </div>

                        {/* Detailed Calendar Grid Mockup */}
                        <div className="grid grid-cols-7 gap-1 text-center mb-2">
                          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                            <span key={d} className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">{d}</span>
                          ))}
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-600 dark:text-slate-400">
                          {/* Mock Calendar Days - simplified visuals */}
                          {Array.from({ length: 31 }, (_, i) => i + 1).slice(0, 15).map(d => (
                            <span key={d} className="p-1 opacity-50">{d}</span>
                          ))}
                          <span className="p-1 bg-blue-600 text-white rounded-full shadow-md shadow-blue-500/30 font-bold">16</span>
                          {Array.from({ length: 31 }, (_, i) => i + 1).slice(16, 31).map(d => (
                            <span key={d} className="p-1 text-blue-600 dark:text-blue-400 font-bold">{d}</span>
                          ))}
                        </div>

                        <div className="mt-4 pt-3 border-t border-blue-100 dark:border-white/5 flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Time Left</span>
                          <span className="text-xs font-black text-slate-800 dark:text-white">
                            {goal.deadline
                              ? Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) + ' Days'
                              : 'No Deadline'
                            }
                          </span>
                        </div>
                      </div>

                      {/* Right Panel: Save Pace & Visuals */}
                      <div className="flex-1 bg-emerald-50/50 dark:bg-emerald-500/5 rounded-2xl p-4 border border-emerald-100 dark:border-white/5 flex flex-col justify-between">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp size={16} className="text-emerald-500" />
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Save Pace</span>
                        </div>

                        <div className="mb-auto">
                          <h4 className="text-lg font-black text-slate-800 dark:text-white mb-1">
                            {currency}{(() => {
                              const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0);
                              const days = goal.deadline ? Math.max(1, Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 3600 * 24))) : 30;
                              return (remaining / days).toFixed(0);
                            })()} / day
                          </h4>
                          <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                            To reach your goal by {goal.deadline ? new Date(goal.deadline).toLocaleDateString() : 'target date'}.
                          </p>
                        </div>

                        <div className="h-32 w-full mt-4 bg-emerald-100/50 dark:bg-emerald-500/10 rounded-xl relative overflow-hidden">
                          {/* Abstract decorative graph */}
                          <div className="absolute inset-0 flex items-end">
                            <div className="w-1/4 h-[40%] bg-emerald-400/20 rounded-t"></div>
                            <div className="w-1/4 h-[60%] bg-emerald-400/30 rounded-t"></div>
                            <div className="w-1/4 h-[50%] bg-emerald-400/40 rounded-t"></div>
                            <div className="w-1/4 h-[80%] bg-emerald-400/50 rounded-t"></div>
                          </div>
                        </div>
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
                </GlassCard>
              );
            })}
          </div>
        )
      }
    </div >
  );
};
