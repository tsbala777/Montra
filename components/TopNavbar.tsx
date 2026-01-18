import React from 'react';
import { UserProfile, View } from '../types';
import { NAV_ITEMS } from '../constants';
import { Globe, LogOut, User } from 'lucide-react';

interface TopNavbarProps {
    currentView: View;
    onNavClick: (view: View) => void;
    onLogout: () => void;
    profile: UserProfile;
    email?: string;
    language?: string;
    onLanguageChange?: (lang: string) => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ currentView, onNavClick, onLogout, profile, email, language = 'en', onLanguageChange }) => {
    const [isLangOpen, setIsLangOpen] = React.useState(false);
    const langs = [
        { code: 'en', label: 'English', flag: '🇺🇸' },
        { code: 'es', label: 'Español', flag: '🇪🇸' },
        { code: 'fr', label: 'Français', flag: '🇫🇷' },
        { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
        { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
        { code: 'jp', label: '日本語', flag: '🇯🇵' },
    ];
    const currentLang = langs.find(l => l.code === language) || langs[0];
    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-[#01051B]/90 backdrop-blur-md border-b border-slate-200 dark:border-white/5 h-20 flex items-center justify-between px-4 md:px-8 transition-all duration-300">

            {/* Left: Logo & Navigation */}
            <div className="flex items-center gap-12">
                {/* Logo */}
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavClick('dashboard')}>
                    <img src="/logo.png" alt="Montra Logo" className="w-12 h-12 object-contain" />
                    <span className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Montra</span>
                </div>

                {/* Desktop Navigation Links */}
                <nav className="hidden md:flex items-center gap-8">
                    {NAV_ITEMS.map((item) => {
                        const isActive = currentView === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => onNavClick(item.id as View)}
                                className={`text-sm font-medium transition-colors hover:text-indigo-600 dark:hover:text-indigo-400 ${isActive
                                    ? 'text-slate-900 dark:text-white font-bold'
                                    : 'text-slate-500 dark:text-slate-400'
                                    }`}
                            >
                                {item.label}
                            </button>
                        )
                    })}
                </nav>
            </div>

            {/* Right: Actions & Profile */}
            <div className="flex items-center gap-6">

                {/* Language Selector */}
                <div className="relative hidden md:block">
                    <button
                        onClick={() => setIsLangOpen(!isLangOpen)}
                        className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm font-medium hover:text-slate-800 dark:hover:text-white cursor-pointer transition-colors px-2 py-1 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5"
                    >
                        <Globe size={18} />
                        <span className="uppercase">{currentLang.code}</span>
                    </button>

                    {/* Dropdown */}
                    {isLangOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsLangOpen(false)} />
                            <div className="absolute top-full right-0 mt-2 w-40 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                {langs.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => {
                                            onLanguageChange?.(lang.code);
                                            setIsLangOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${language === lang.code ? 'text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-900/10' : 'text-slate-600 dark:text-slate-300'}`}
                                    >
                                        <span className="text-base">{lang.flag}</span>
                                        <span>{lang.label}</span>
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Profile */}
                <div className="flex items-center gap-4 pl-6 border-l border-slate-200 dark:border-white/10">
                    <button
                        onClick={() => onNavClick('settings')}
                        className="flex items-center gap-4 hover:opacity-80 transition-opacity text-right"
                    >
                        <div className="hidden md:block">
                            <p className="text-sm font-bold text-slate-900 dark:text-white leading-none mb-1">{profile.name || 'Montra User'}</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{email || 'No email'}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center border-2 border-white dark:border-slate-800 shadow-sm overflow-hidden">
                            {/* Simple Avatar Placeholder */}
                            {profile.avatar ? (
                                <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <User size={26} className="text-indigo-600 dark:text-indigo-400" />
                            )}
                        </div>
                    </button>
                    <button
                        onClick={onLogout}
                        className="md:hidden p-2 text-slate-400 hover:text-red-500 transition-colors"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </div>
        </header>
    );
};
