
import React, { useState, useEffect } from 'react';
import { GlassCard, GlassButton, GlassInput, GlassSelect } from './ui/Glass';
import { Category, Transaction, TransactionType } from '../types';
import { X, CheckCircle2, Coins, Sparkles as SparklesIcon, Receipt, Flame, BellRing } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (t: Omit<Transaction, 'id'>) => void;
  currency: string;
}

export const TransactionModal: React.FC<Props> = ({ isOpen, onClose, onSave, currency }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState<Category>(Category.FOOD);
  const [isSuccess, setIsSuccess] = useState(false);
  const [xpProgress, setXpProgress] = useState(45);
  const [displayXp, setDisplayXp] = useState(850);

  // Confetti particles state
  const [particles, setParticles] = useState<{ id: number; color: string; angle: number; delay: number }[]>([]);

  useEffect(() => {
    if (isSuccess) {
      // 1. Confetti Burst
      const colors = ['bg-indigo-400', 'bg-purple-400', 'bg-emerald-400', 'bg-pink-400', 'bg-amber-400', 'bg-sky-400'];
      const newParticles = Array.from({ length: 16 }).map((_, i) => ({
        id: i,
        color: colors[i % colors.length],
        angle: (i * (360 / 16)) + (Math.random() * 15 - 7.5),
        delay: Math.random() * 0.15
      }));
      setParticles(newParticles);
      
      // 2. Animate XP bar & Numerical Counter
      setTimeout(() => {
        setXpProgress(60);
        // Count up animation logic
        let current = 850;
        const target = 865;
        const interval = setInterval(() => {
          if (current < target) {
            current += 1;
            setDisplayXp(current);
          } else {
            clearInterval(interval);
          }
        }, 40);
      }, 300);
    } else {
      setParticles([]);
      setXpProgress(45);
      setDisplayXp(850);
    }
  }, [isSuccess]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    onSave({
      description,
      amount: parseFloat(amount),
      type,
      category,
      date: new Date().toISOString(),
      source: type === 'income' ? source : undefined
    });
    
    // Show success animation
    setIsSuccess(true);
    
    // Reset and close after a delay
    setTimeout(() => {
      setDescription('');
      setAmount('');
      setSource('');
      setIsSuccess(false);
      onClose();
    }, 3200);
  };

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === 'income') {
      setCategory(Category.INCOME);
    } else {
      setCategory(Category.FOOD);
    }
  };

  const INCOME_CATEGORIES = [Category.INCOME, Category.INCOME_SOURCE, Category.SCHOLARSHIP, Category.GIFT];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md w-[95%] md:w-full">
        <style>
          {`
            @keyframes confetti-burst {
              0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
              100% { transform: translate(calc(-50% + var(--tw-translate-x)), calc(-50% + var(--tw-translate-y))) scale(1); opacity: 0; }
            }
            @keyframes coin-spin-3d {
              0% { transform: rotateY(0deg); }
              100% { transform: rotateY(1080deg); }
            }
            @keyframes float-up-fade {
              0% { transform: translate(-50%, 0); opacity: 0; }
              20% { opacity: 1; }
              100% { transform: translate(-50%, -100px); opacity: 0; }
            }
            @keyframes shimmer {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(100%); }
            }
            @keyframes ping-soft {
              0% { transform: scale(1); opacity: 0.8; }
              100% { transform: scale(1.8); opacity: 0; }
            }
            @keyframes toast-in {
              0% { transform: translateY(-100%) scale(0.9); opacity: 0; }
              100% { transform: translateY(0) scale(1); opacity: 1; }
            }
            .confetti-particle {
              animation: confetti-burst 0.9s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
            }
            .animate-coin-spin-3d {
              animation: coin-spin-3d 1.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
              transform-style: preserve-3d;
            }
            .animate-float-up-fade {
              animation: float-up-fade 2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
            }
            .shimmer-bar::after {
              content: '';
              position: absolute;
              top: 0; left: 0; right: 0; bottom: 0;
              background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
              animation: shimmer 1.5s infinite;
            }
            .animate-toast-in {
              animation: toast-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
            }
          `}
        </style>
        <GlassCard className={`bg-white/95 dark:bg-slate-900/95 shadow-2xl border-white/50 dark:border-white/5 transition-all duration-500 overflow-visible ${isSuccess ? 'scale-105' : 'scale-100'}`}>
          {isSuccess ? (
            <div className="py-10 flex flex-col items-center justify-center animate-fade-in text-center relative">
              
              {/* Toast Notification Banner at Top */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-full px-6 z-30 pointer-events-none">
                <div className="bg-slate-900 dark:bg-indigo-600 text-white px-4 py-2 rounded-2xl shadow-xl flex items-center justify-center gap-2 animate-toast-in border border-slate-800 dark:border-indigo-500/50">
                  <BellRing size={14} className="text-indigo-400 dark:text-white" />
                  <span className="text-xs font-bold uppercase tracking-wider">Transaction Saved!</span>
                </div>
              </div>

              {/* Confetti Burst */}
              {particles.map((p) => {
                const distance = 130 + Math.random() * 70;
                const rad = (p.angle * Math.PI) / 180;
                const x = Math.cos(rad) * distance;
                const y = Math.sin(rad) * distance;
                return (
                  <div
                    key={p.id}
                    className={`absolute top-1/2 left-1/2 w-2.5 h-2.5 rounded-full confetti-particle ${p.color} z-10`}
                    style={{
                      '--tw-translate-x': `${x}px`,
                      '--tw-translate-y': `${y}px`,
                      animationDelay: `${p.delay}s`,
                    } as React.CSSProperties}
                  />
                );
              })}

              {/* Floating XP Indicator */}
              <div className="absolute top-1/2 left-1/2 pointer-events-none z-20">
                 <div className="animate-float-up-fade text-indigo-600 dark:text-indigo-400 font-bold text-xl drop-shadow-md flex items-center gap-2 whitespace-nowrap bg-white/95 dark:bg-slate-800/95 px-4 py-1.5 rounded-full border border-indigo-100 dark:border-indigo-500/20 shadow-xl">
                   <SparklesIcon size={18} className="text-amber-400" fill="currentColor" />
                   +15 Student XP
                 </div>
              </div>

              <div className="relative mb-8 mt-6">
                {/* Visual "Ding" Pulse */}
                <div className="absolute inset-0 bg-indigo-400/30 rounded-full" style={{ animation: 'ping-soft 1s ease-out forwards', animationDelay: '0.4s' }} />
                
                <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full scale-150 animate-pulse" />
                <div className="relative bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-7 rounded-full shadow-2xl shadow-indigo-200 dark:shadow-none animate-coin-spin-3d">
                  <Coins size={52} />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-full shadow-lg animate-bounce ring-4 ring-white dark:ring-slate-900">
                  <CheckCircle2 size={24} />
                </div>
              </div>
              
              <div className="space-y-5 w-full px-8">
                <div>
                  <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Level Up Soon!</h2>
                  <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                    {type === 'expense' 
                      ? "Wise tracking habits detected." 
                      : "Your future self is high-fiving you! 💰"}
                  </p>
                </div>

                {/* Level Progress Bar with Shimmer & Counter */}
                <div className="space-y-2.5 bg-slate-50/50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                  <div className="flex justify-between items-center text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    <span className="flex items-center gap-1.5">
                      <SparklesIcon size={12} className="text-indigo-400 dark:text-indigo-400" />
                      Lvl 4 Scholar
                    </span>
                    <span className="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-md transition-all duration-300">
                      {displayXp} / 1200 XP
                    </span>
                  </div>
                  <div className="h-3 w-full bg-slate-200/50 dark:bg-white/10 rounded-full overflow-hidden shadow-inner p-0.5 relative">
                    <div 
                      className={`h-full bg-gradient-to-r from-indigo-500 via-indigo-400 to-purple-600 rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(79,70,229,0.4)] relative overflow-hidden ${isSuccess ? 'shimmer-bar' : ''}`}
                      style={{ width: `${xpProgress}%` }}
                    />
                  </div>
                </div>

                {/* Streak Badge */}
                <div className="inline-flex items-center gap-2 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 px-5 py-2 rounded-full text-xs font-bold border border-amber-100 dark:border-amber-500/20 animate-slide-up shadow-sm">
                  <Flame size={16} className="fill-current animate-pulse text-orange-500" />
                  5 Day Logging Streak!
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-slide-up">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-slate-100/80 dark:bg-white/5 rounded-xl">
                    <Receipt className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">New Transaction</h2>
                </div>
                <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="flex bg-slate-100/50 dark:bg-white/5 p-1 rounded-xl">
                  <button
                    type="button"
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${type === 'expense' ? 'bg-white dark:bg-white/10 shadow-sm text-slate-800 dark:text-white' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
                    onClick={() => handleTypeChange('expense')}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${type === 'income' ? 'bg-white dark:bg-white/10 shadow-sm text-slate-800 dark:text-white' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
                    onClick={() => handleTypeChange('income')}
                  >
                    Income
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-bold">{currency}</span>
                    <GlassInput 
                      type="number" 
                      step="0.01" 
                      placeholder="0.00" 
                      className="pl-8 text-lg font-bold"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      autoFocus
                    />
                  </div>
                </div>

                {type === 'income' && (
                  <div className="animate-fade-in space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Source</label>
                    <GlassInput 
                      type="text" 
                      placeholder="e.g. Scholarship, Paycheck..." 
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Description</label>
                  <GlassInput 
                    type="text" 
                    placeholder="What did you buy?" 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Category</label>
                  <div className="relative z-50">
                    <GlassSelect value={category} onChange={(e) => setCategory(e.target.value as Category)}>
                      {Object.values(Category).filter(c => {
                        const isIncomeCat = INCOME_CATEGORIES.includes(c);
                        return type === 'income' ? isIncomeCat : !isIncomeCat;
                      }).map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </GlassSelect>
                  </div>
                </div>

                <div className="pt-2">
                  <GlassButton type="submit" className="w-full py-4 text-base font-bold shadow-indigo-100 dark:shadow-none bg-indigo-600 hover:bg-indigo-700 text-white border-none">
                    Log Transaction
                  </GlassButton>
                </div>
              </form>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
};
