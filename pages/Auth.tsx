
import React, { useState, useEffect } from 'react';
import { GlassCard, GlassButton, GlassInput } from '../components/ui/Glass';
import { Mail, Lock, User, GraduationCap, ArrowRight, Github, Sparkles, ShieldCheck, Eye, EyeOff, ShieldAlert, Check } from 'lucide-react';
import { View } from '../types';

interface Props {
  onLogin: (name: string, rememberMe: boolean) => void;
  currentView: 'login' | 'signup';
  onSwitch: (view: 'login' | 'signup') => void;
}

export const Auth: React.FC<Props> = ({ onLogin, currentView, onSwitch }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem('montra_user_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  // Transition between views
  const handleSwitch = (view: 'login' | 'signup') => {
    if (view === currentView) return;
    setIsAnimating(true);
    setTimeout(() => {
      onSwitch(view);
      setIsAnimating(false);
    }, 200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (rememberMe) {
      localStorage.setItem('montra_user_email', email);
    } else {
      localStorage.removeItem('montra_user_email');
    }
    
    // Simulate API call
    setTimeout(() => {
      onLogin(name || email.split('@')[0], rememberMe);
      setIsLoading(false);
    }, 1500);
  };

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-slate-200 dark:bg-white/5' };
    let score = 0;
    if (pass.length > 5) score++;
    if (pass.length > 8) score++;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score++;

    const results = [
      { score: 0, label: 'Too Short', color: 'bg-red-400' },
      { score: 1, label: 'Weak', color: 'bg-orange-400' },
      { score: 2, label: 'Fair', color: 'bg-amber-400' },
      { score: 3, label: 'Strong', color: 'bg-indigo-500' },
      { score: 4, label: 'Invincible', color: 'bg-emerald-500' },
    ];
    return results[score];
  };

  const strength = getPasswordStrength(password);

  return (
    <div className="min-h-[90vh] flex items-center justify-center p-4">
      <style>
        {`
          @keyframes slide-reveal {
            from { transform: translateY(10px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          @keyframes glow-pulse {
            0%, 100% { box-shadow: 0 0 5px rgba(99, 102, 241, 0.2); }
            50% { box-shadow: 0 0 15px rgba(99, 102, 241, 0.4); }
          }
          .animate-reveal { animation: slide-reveal 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
          .input-glow:focus-within {
            animation: glow-pulse 2s infinite;
          }
          .primary-button-shine {
            position: relative;
            overflow: hidden;
          }
          .primary-button-shine::after {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
            transform: rotate(45deg);
            transition: 0.5s;
            opacity: 0;
          }
          .primary-button-shine:hover::after {
            left: 100%;
            top: 100%;
            opacity: 1;
          }
        `}
      </style>

      <div className="w-full max-w-[440px]">
        {/* Header Section */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-indigo-500/30 blur-3xl rounded-full scale-150 animate-pulse" />
            <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-slate-900 dark:bg-indigo-600 text-white shadow-2xl transform hover:rotate-6 transition-transform duration-500 cursor-default">
              <GraduationCap size={40} />
            </div>
            <div className="absolute -top-1 -right-1 bg-amber-400 text-slate-900 p-1.5 rounded-full shadow-lg border-2 border-white dark:border-slate-900">
              <Sparkles size={14} fill="currentColor" />
            </div>
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-2">Montra</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium px-6 leading-relaxed">
            The intelligent companion for your student financial journey.
          </p>
        </div>

        <GlassCard className={`p-8 shadow-2xl dark:shadow-none border-white/80 dark:border-white/10 relative transition-all duration-300 ${isAnimating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
          {/* Loading State */}
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl z-50 flex flex-col items-center justify-center animate-fade-in rounded-2xl">
              <div className="relative mb-6">
                <div className="w-16 h-16 border-4 border-slate-100 dark:border-white/10 border-t-indigo-600 rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <ShieldCheck size={24} className="text-indigo-600 animate-pulse" />
                </div>
              </div>
              <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest mb-1">Authenticating</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Securing your session</p>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="relative flex bg-slate-100/50 dark:bg-white/5 p-1 rounded-2xl mb-8">
            <div 
              className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-white dark:bg-white/10 shadow-sm rounded-xl transition-transform duration-300 ease-out"
              style={{ transform: currentView === 'login' ? 'translateX(0)' : 'translateX(100%)' }}
            />
            <button 
              onClick={() => handleSwitch('login')}
              className={`relative z-10 flex-1 py-2.5 text-xs font-black transition-colors duration-300 ${currentView === 'login' ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}
            >
              LOG IN
            </button>
            <button 
              onClick={() => handleSwitch('signup')}
              className={`relative z-10 flex-1 py-2.5 text-xs font-black transition-colors duration-300 ${currentView === 'signup' ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}
            >
              SIGN UP
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {currentView === 'signup' && (
              <div className="space-y-1.5 animate-reveal">
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] ml-1">Student Name</label>
                <div className="relative group input-glow rounded-xl">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                  </div>
                  <GlassInput 
                    type="text" 
                    placeholder="Alex Johnson" 
                    className="pl-12 py-3.5"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={currentView === 'signup'}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5 animate-reveal" style={{ animationDelay: '0.1s' }}>
              <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] ml-1">University Email</label>
              <div className="relative group input-glow rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                </div>
                <GlassInput 
                  type="email" 
                  placeholder="alex@university.edu" 
                  className="pl-12 py-3.5"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5 animate-reveal" style={{ animationDelay: '0.2s' }}>
              <div className="flex justify-between items-center px-1">
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">Secure Password</label>
                {currentView === 'login' && (
                  <button type="button" className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors">FORGOT?</button>
                )}
              </div>
              <div className="relative group input-glow rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                </div>
                <GlassInput 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  className="pl-12 pr-12 py-3.5"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              {/* Dynamic Strength Indicator */}
              {currentView === 'signup' && password.length > 0 && (
                <div className="animate-reveal px-1 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1">
                      <ShieldAlert size={10} className={strength.score > 2 ? 'text-indigo-500' : 'text-amber-500'} />
                      Security Level
                    </span>
                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${strength.color} text-white transition-all duration-300`}>
                      {strength.label}
                    </span>
                  </div>
                  <div className="flex gap-1.5 h-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div 
                        key={i} 
                        className={`h-full flex-1 rounded-full transition-all duration-500 ${strength.score >= i ? strength.color : 'bg-slate-100 dark:bg-white/5'}`} 
                        style={{ boxShadow: strength.score >= i ? `0 0 10px ${strength.color.replace('bg-', '')}40` : 'none' }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Remember Me Checkbox */}
            {currentView === 'login' && (
              <div className="flex items-center gap-2 animate-reveal" style={{ animationDelay: '0.25s' }}>
                <button
                  type="button"
                  onClick={() => setRememberMe(!rememberMe)}
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${rememberMe ? 'bg-indigo-600 border-indigo-600 dark:bg-indigo-500 dark:border-indigo-500' : 'bg-white/50 dark:bg-white/5 border-slate-300 dark:border-white/20'}`}
                >
                  {rememberMe && <Check size={10} className="text-white" strokeWidth={4} />}
                </button>
                <label onClick={() => setRememberMe(!rememberMe)} className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer select-none">
                  Remember me
                </label>
              </div>
            )}

            <div className="pt-2 animate-reveal" style={{ animationDelay: '0.3s' }}>
              <GlassButton type="submit" className="w-full py-4 text-sm font-black bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white shadow-xl shadow-indigo-500/20 dark:shadow-none transform active:scale-[0.98] transition-all border-none group primary-button-shine">
                {currentView === 'login' ? 'SIGN IN TO MONTRA' : 'CREATE STUDENT ACCOUNT'}
                <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </GlassButton>
            </div>
          </form>

          <div className="relative my-10 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100 dark:border-white/5"></div></div>
            <div className="relative flex justify-center text-[9px] uppercase font-black"><span className="bg-white dark:bg-slate-900 px-4 text-slate-400 dark:text-slate-500 tracking-[0.3em]">OR</span></div>
          </div>

          <div className="grid grid-cols-2 gap-4 animate-reveal" style={{ animationDelay: '0.5s' }}>
            <button 
              type="button" 
              className="group relative flex items-center justify-center gap-3 py-3.5 rounded-2xl bg-white/40 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 backdrop-blur-md transition-all hover:bg-white/80 dark:hover:bg-white/10 hover:shadow-lg text-slate-700 dark:text-slate-200 font-black text-[11px] active:scale-[0.97]"
            >
              <div className="flex items-center justify-center p-1 bg-white dark:bg-slate-800 rounded-lg shadow-sm group-hover:scale-110 transition-transform">
                <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </div>
              GOOGLE
            </button>
            <button 
              type="button" 
              className="group relative flex items-center justify-center gap-3 py-3.5 rounded-2xl bg-white/40 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 backdrop-blur-md transition-all hover:bg-white/80 dark:hover:bg-white/10 hover:shadow-lg text-slate-700 dark:text-slate-200 font-black text-[11px] active:scale-[0.97]"
            >
              <div className="flex items-center justify-center p-1 bg-white dark:bg-slate-800 rounded-lg shadow-sm group-hover:scale-110 transition-transform">
                <Github size={16} className="text-slate-900 dark:text-white" />
              </div>
              GITHUB
            </button>
          </div>

          <div className="text-center mt-10 space-y-4 animate-fade-in delay-500">
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest leading-loose max-w-[300px] mx-auto">
              By continuing, you agree to our <button className="text-indigo-600 dark:text-indigo-400 hover:underline">Terms</button> and <button className="text-indigo-600 dark:text-indigo-400 hover:underline">Privacy Policy</button>.
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
