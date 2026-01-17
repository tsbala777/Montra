import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, TrendingUp, TrendingDown, Wallet, CreditCard, PiggyBank, ShoppingCart, Car, Coffee, Smartphone } from 'lucide-react';

// --- HELPER COMPONENTS (ICONS) ---

const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.022 35.026 44 30.038 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
);


// --- TYPE DEFINITIONS ---

export interface Testimonial {
    avatarSrc: string;
    name: string;
    handle: string;
    text: string;
}

interface SignInPageProps {
    mode?: 'login' | 'signup';
    title?: React.ReactNode;
    description?: React.ReactNode;
    heroImageSrc?: string;
    testimonials?: Testimonial[];
    onSignIn?: (event: React.FormEvent<HTMLFormElement>) => void;
    onGoogleSignIn?: () => void;
    onResetPassword?: () => void;
    onCreateAccount?: () => void;
    onSwitchToLogin?: () => void;
}

// --- FLOATING FEATURE CARDS ---

// Shared animation config
// We use a large x range to ensure it goes off-screen.
// "Left to Right" means starting from negative x and going to positive x.
// Shared animation config
// We use a large x range to ensure it goes off-screen.
// "Left to Right" means starting from negative x and going to positive x.
const floatAnimation = (delay: number, duration: number) => ({
    initial: { x: -400, opacity: 0 },
    animate: {
        x: ['-50%', '350%'], // Move across the container
        opacity: [0, 1, 1, 0] // Fade in/out at edges
    },
    transition: {
        duration: duration,
        repeat: Infinity,
        repeatDelay: 0,
        delay: delay,
        ease: "linear"
    }
});

const MonthlyExpenseCard = () => (
    <motion.div
        {...floatAnimation(0, 30)}
        style={{ top: '5%' }}
        whileHover={{ scale: 0.9, zIndex: 40, transition: { duration: 0.3 } }}
        className="auth-card absolute left-0 scale-[0.65] bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-2xl shadow-2xl w-80"
    >
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
                <img src="/logo.png" alt="Montra Logo" className="w-8 h-8 object-contain" />
                <span className="text-sm font-semibold text-white/90">Monthly Summary</span>
            </div>
            <span className="text-xs text-emerald-400 font-medium">Jan 2026</span>
        </div>
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs text-white/60">Income</span>
                </div>
                <span className="text-white font-bold">₹45,000</span>
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-rose-400" />
                    <span className="text-xs text-white/60">Expenses</span>
                </div>
                <span className="text-white font-bold">₹28,450</span>
            </div>
            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-400 to-teal-400 h-full w-[63%] rounded-full transition-all duration-1000"></div>
            </div>
            <p className="text-xs text-white/50 text-center">63% of budget used</p>
        </div>
    </motion.div>
);

const BudgetCategoriesCard = () => (
    <motion.div
        {...floatAnimation(6, 32)}
        style={{ top: '25%' }}
        whileHover={{ scale: 0.9, zIndex: 40, transition: { duration: 0.3 } }}
        className="auth-card absolute left-0 scale-[0.75] bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-2xl shadow-2xl w-72"
    >
        <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-gradient-to-br from-blue-400/30 to-indigo-500/30 rounded-xl">
                <PiggyBank className="w-5 h-5 text-blue-300" />
            </div>
            <span className="text-sm font-semibold text-white/90">Budget Categories</span>
        </div>
        <div className="space-y-3">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400/30 to-amber-500/30 flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 text-orange-300" />
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-white/80 font-medium">Groceries</span>
                        <span className="text-xs text-white/60">₹8,200</span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400/30 to-violet-500/30 flex items-center justify-center">
                    <Car className="w-5 h-5 text-purple-300" />
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-white/80 font-medium">Transport</span>
                        <span className="text-xs text-white/60">₹3,500</span>
                    </div>
                </div>
            </div>
        </div>
    </motion.div>
);

const TransactionCard = () => (
    <motion.div
        {...floatAnimation(12, 28)}
        style={{ top: '45%' }}
        whileHover={{ scale: 0.9, zIndex: 40, transition: { duration: 0.3 } }}
        className="auth-card absolute left-0 scale-[0.7] bg-white/10 backdrop-blur-xl border border-white/20 p-5 rounded-2xl shadow-2xl w-72"
    >
        <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-gradient-to-br from-cyan-400/30 to-sky-500/30 rounded-xl">
                <CreditCard className="w-5 h-5 text-cyan-300" />
            </div>
            <span className="text-sm font-semibold text-white/90">Recent Transactions</span>
        </div>
        <div className="space-y-3">
            <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white text-xs font-bold">SP</div>
                    <div>
                        <p className="text-xs font-medium text-white/90">Spotify Premium</p>
                        <p className="text-[10px] text-white/50">Subscription</p>
                    </div>
                </div>
                <span className="text-rose-400 font-semibold text-sm">-₹149</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold">₹</div>
                    <div>
                        <p className="text-xs font-medium text-white/90">Salary Credit</p>
                        <p className="text-[10px] text-white/50">Income</p>
                    </div>
                </div>
                <span className="text-emerald-400 font-semibold text-sm">+₹45,000</span>
            </div>
        </div>
    </motion.div>
);

const IncomeExpenseChart = () => (
    <motion.div
        {...floatAnimation(18, 35)}
        style={{ top: '65%' }}
        whileHover={{ scale: 0.9, zIndex: 40, transition: { duration: 0.3 } }}
        className="auth-card absolute left-0 scale-[0.6] bg-white/10 backdrop-blur-xl border border-white/20 p-5 rounded-2xl shadow-2xl w-52"
    >
        <p className="text-xs text-white/60 font-medium mb-3 text-center">Income vs Expense</p>
        <div className="flex items-end justify-center gap-3 h-24">
            <div className="flex flex-col items-center gap-1">
                <div className="w-8 bg-gradient-to-t from-emerald-500 to-teal-400 rounded-t-lg" style={{ height: '80px' }}></div>
                <span className="text-[10px] text-white/50">Income</span>
            </div>
            <div className="flex flex-col items-center gap-1">
                <div className="w-8 bg-gradient-to-t from-rose-500 to-pink-400 rounded-t-lg" style={{ height: '50px' }}></div>
                <span className="text-[10px] text-white/50">Expense</span>
            </div>
        </div>
    </motion.div>
);

const InvestmentCard = () => (
    <motion.div
        {...floatAnimation(24, 30)}
        style={{ top: '80%' }}
        whileHover={{ scale: 0.9, zIndex: 40, transition: { duration: 0.3 } }}
        className="auth-card absolute left-0 scale-[0.55] bg-white/10 backdrop-blur-xl border border-white/20 p-5 rounded-2xl shadow-2xl w-60"
    >
        <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-amber-400/30 to-orange-500/30 rounded-xl">
                <TrendingUp className="w-5 h-5 text-amber-300" />
            </div>
            <div>
                <p className="text-xs text-white/60 font-medium">Investments</p>
                <p className="text-sm font-bold text-white">₹1,25,000</p>
            </div>
        </div>
        <div className="flex items-center justify-between">
            <div className="px-2 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                +12.5%
            </div>
            <div className="flex gap-1 items-end h-8">
                <div className="w-1.5 h-3 bg-white/20 rounded-t-sm"></div>
                <div className="w-1.5 h-5 bg-white/20 rounded-t-sm"></div>
                <div className="w-1.5 h-4 bg-white/20 rounded-t-sm"></div>
                <div className="w-1.5 h-7 bg-gradient-to-t from-emerald-500 to-teal-400 rounded-t-sm"></div>
            </div>
        </div>
    </motion.div>
);

// --- MOBILE HERO ---

const MobileHero = () => (
    <div className="md:hidden w-full bg-gradient-to-br from-blue-900 via-indigo-900 to-blue-950 p-6 pb-10 relative overflow-hidden shrink-0">
        {/* Animated gradient orbs */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-600/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-indigo-600/30 rounded-full blur-3xl animate-pulse delay-1000"></div>

        <div className="relative z-10 text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-lg px-4 py-2 rounded-full mb-4">
                <Wallet className="w-5 h-5 text-blue-400" />
                <span className="text-white font-bold text-lg">Montra</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">
                Track every rupee.
            </h2>
            <p className="text-xl font-light text-blue-200 mb-4">
                Control your future.
            </p>

            {/* Mini feature cards for mobile */}
            <div className="flex gap-3 justify-center mt-4">
                <div className="bg-white/10 backdrop-blur-lg border border-white/10 p-3 rounded-xl">
                    <TrendingUp className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                    <p className="text-[10px] text-white/70">Track Income</p>
                </div>
                <div className="bg-white/10 backdrop-blur-lg border border-white/10 p-3 rounded-xl">
                    <PiggyBank className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                    <p className="text-[10px] text-white/70">Save Smart</p>
                </div>
                <div className="bg-white/10 backdrop-blur-lg border border-white/10 p-3 rounded-xl">
                    <CreditCard className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                    <p className="text-[10px] text-white/70">Budget Easy</p>
                </div>
            </div>
        </div>
    </div>
);

// --- MAIN COMPONENT ---

export const SignInPage: React.FC<SignInPageProps> = ({
    mode: initialMode = 'login',
    title,
    description,
    heroImageSrc,
    testimonials = [],
    onSignIn,
    onGoogleSignIn,
    onResetPassword,
    onCreateAccount,
    onSwitchToLogin,
}) => {
    const mode = initialMode;
    const displayTitle = title || (mode === 'login' ? 'Welcome Back' : 'Create Account');
    const displayDescription = description || (mode === 'login' ? 'Sign in to manage your finances with ease.' : 'Start your journey to financial freedom today.');

    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 md:p-6 overflow-hidden font-sans">



            {/* MOBILE HEADER (When on small screens, show Mobile Header) */}
            {/* <MobileHero /> - Removed as per user request */}

            {/* CARD CONTAINER */}
            <div className="w-full max-w-5xl md:h-auto md:min-h-[600px] flex rounded-3xl md:rounded-[2.5rem] overflow-hidden z-10 transition-all duration-300 shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-[#0B1120]">

                {/* LEFT CARD (Visuals) - Hidden on mobile */}
                <div className="hidden md:block w-1/2 relative bg-blue-950 border-r border-white/10 overflow-hidden">
                    {/* Animated Gradient Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-indigo-900/40 to-slate-900/90"></div>
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>

                    {/* Animated gradient orbs - Brand Colors */}
                    <div className="absolute top-20 left-20 w-80 h-80 bg-blue-600/40 rounded-full blur-[100px] animate-pulse"></div>
                    <div className="absolute bottom-20 right-20 w-64 h-64 bg-indigo-500/40 rounded-full blur-[100px] animate-pulse delay-1000"></div>

                    {/* Floating Feature Cards */}
                    <MonthlyExpenseCard />
                    <BudgetCategoriesCard />
                    <TransactionCard />
                    <IncomeExpenseChart />
                    <InvestmentCard />

                    {/* Tagline */}
                    {/* Tagline */}
                    <div className="absolute bottom-10 left-0 w-full z-[100] flex justify-center px-6">
                        <div className="max-w-md w-full bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-xl shadow-blue-900/20 text-center">
                            <h2 className="text-3xl font-bold text-white mb-3 tracking-tight leading-tight">
                                Track every rupee.
                                <br />
                                <span className="bg-gradient-to-r from-blue-200 to-indigo-200 bg-clip-text text-transparent">
                                    Control your future.
                                </span>
                            </h2>
                            <p className="text-blue-100/80 text-sm font-light leading-relaxed">
                                Smart budgeting, expense tracking, and financial insights — all in one beautiful app.
                            </p>
                        </div>
                    </div>
                </div>

                {/* RIGHT CARD (Form) */}
                <div className="w-full md:w-1/2 flex items-center justify-center p-6 lg:p-8 relative bg-white dark:bg-[#0B1120] overflow-y-auto custom-scrollbar">
                    <div className="w-full max-w-[420px] space-y-6 my-auto">

                        {/* Logo for desktop and mobile */}
                        <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
                            <img src="/logo.png" alt="Montra Logo" className="w-24 h-24 object-contain" />
                            <span className="text-3xl font-bold text-slate-900 dark:text-white">Montra</span>
                        </div>

                        <div className="text-center md:text-left space-y-2">
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                                {displayTitle}
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 text-base">
                                {displayDescription}
                            </p>
                        </div>

                        <form className="space-y-4" onSubmit={onSignIn}>
                            {/* Name Input (Only for Signup) */}
                            {mode === 'signup' && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Full Name
                                    </label>
                                    <input
                                        name="name"
                                        type="text"
                                        placeholder="Enter your full name"
                                        className="auth-input w-full bg-transparent border border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 font-medium text-sm"
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Email Address
                                </label>
                                <input
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="name@example.com"
                                    className="auth-input w-full bg-transparent border border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 font-medium text-sm"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                                        placeholder="••••••••"
                                        className="auth-input w-full bg-transparent border border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 pr-12 font-medium text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {mode === 'signup' && (
                                    <p className="text-xs text-slate-500">Must be at least 8 characters</p>
                                )}
                            </div>

                            {mode === 'login' && (
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <div className="relative flex items-center">
                                            <input type="checkbox" name="rememberMe" className="peer sr-only" />
                                            <div className="w-4 h-4 border-2 border-slate-300 dark:border-zinc-600 rounded peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all"></div>
                                            <svg className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" viewBox="0 0 14 10" fill="none">
                                                <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">Remember me</span>
                                    </label>
                                    <a href="#" onClick={(e) => { e.preventDefault(); onResetPassword?.(); }} className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                                        Forgot password?
                                    </a>
                                </div>
                            )}

                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-indigo-500/25 active:scale-[0.98] transition-all duration-200 text-base"
                            >
                                {mode === 'login' ? 'Sign In' : 'Create Account'}
                            </button>
                        </form>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200 dark:border-zinc-800"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase tracking-wide font-medium">
                                <span className="px-4 bg-white dark:bg-zinc-900 text-slate-400">{mode === 'login' ? 'or continue with' : 'or sign up with'}</span>
                            </div>
                        </div>

                        <button
                            onClick={onGoogleSignIn}
                            className="w-full bg-white dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-slate-200 font-medium py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800 hover:border-slate-300 dark:hover:border-zinc-600 active:bg-slate-100 transition-all flex items-center justify-center gap-3 text-sm"
                        >
                            <GoogleIcon />
                            <span>Continue with Google</span>
                        </button>

                        <p className="text-center text-sm text-slate-600 dark:text-slate-400 pt-2">
                            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (mode === 'login') onCreateAccount?.(); else onSwitchToLogin?.();
                                }}
                                className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline transition-colors"
                            >
                                {mode === 'login' ? 'Sign up' : 'Sign in'}
                            </button>
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};
