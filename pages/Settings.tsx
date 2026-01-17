import React, { useState, useRef } from 'react';
import { UserSettings } from '../types';
import { GlassInput, GlassSelect } from '../components/ui/Glass';
import { Download, Trash2, Moon, Sun, Laptop, LogOut, ChevronRight, Camera, Mail, Phone, User, Pencil } from 'lucide-react';
import { MagicBentoGrid, MagicBentoCard } from '../components/MagicBento';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  settings: UserSettings;
  onUpdateSettings: (settings: UserSettings) => void;
  onResetData: () => void;
  onLogout: () => void;
  transactions: any[];
}

export const Settings: React.FC<Props> = ({ settings, onUpdateSettings, onResetData, onLogout, transactions }) => {
  const { user } = useAuth();
  const [isResetConfirm, setIsResetConfirm] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleProfileChange = (key: string, value: string) => {
    onUpdateSettings({
      ...settings,
      profile: { ...settings.profile, [key]: value }
    });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleProfileChange('avatar', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const exportData = () => {
    const dataStr = JSON.stringify({ transactions, settings }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `montra_backup_${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const toggleDarkMode = () => {
    onUpdateSettings({
      ...settings,
      isDarkMode: !settings.isDarkMode
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24 md:pb-0">
      <header className="mb-4 pl-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400">Manage your workspace and preferences.</p>
      </header>

      <MagicBentoGrid enableSpotlight={false}>

        {/* Profile Card (Large) - Horizontal Layout */}
        <MagicBentoCard
          title="Profile"
          colSpan={2}
          rowSpan={1}
          enableStars={false}
          clickEffect={true}
          className="bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 shadow-sm"
        >
          <div className="flex items-center gap-6 mt-2 h-full">
            {/* Avatar Section */}
            <div className="relative group shrink-0">
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <button
                onClick={() => avatarInputRef.current?.click()}
                className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-white text-2xl font-bold shadow-sm ring-4 ring-white dark:ring-white/5 overflow-hidden transition-all hover:ring-indigo-500/50 dark:hover:ring-indigo-400/50 cursor-pointer"
              >
                {settings.profile.avatar ? (
                  <img src={settings.profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  settings.profile.name ? settings.profile.name.charAt(0).toUpperCase() : <User size={28} />
                )}
              </button>
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                <Camera size={20} className="text-white" />
              </div>
            </div>

            {/* Info Section */}
            <div className="flex-1 min-w-0">
              <div className="relative group/name w-full max-w-sm mb-1">
                <input
                  type="text"
                  value={settings.profile.name}
                  onChange={(e) => handleProfileChange('name', e.target.value)}
                  placeholder="Your Name"
                  className="w-full text-2xl font-bold text-slate-900 dark:text-white bg-transparent border-none outline-none focus:ring-0 placeholder:text-slate-300 dark:placeholder:text-slate-600 px-0 py-0"
                />
                <Pencil size={14} className="absolute -right-5 top-1/2 -translate-y-1/2 text-slate-400 opacity-0 group-hover/name:opacity-100 transition-opacity pointer-events-none" />
              </div>
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm mb-3">
                <Mail size={14} />
                <span className="truncate">{user?.email || settings.profile.email || 'No email connected'}</span>
              </div>


              <div className="mt-2 w-full">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 block">Card ending in</label>
                <GlassInput
                  placeholder="Last 4"
                  maxLength={4}
                  value={settings.profile.cardLastFour || ''}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                    handleProfileChange('cardLastFour', val);
                  }}
                  className="text-xs py-2 bg-slate-50 dark:bg-white/5 border-none font-mono tracking-widest"
                />
              </div>
            </div>
          </div>
        </MagicBentoCard>

        {/* Appearance Card */}
        <MagicBentoCard
          title="Appearance"
          colSpan={1}
          rowSpan={1}
          enableStars={false}
          clickEffect={true}
          className="bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 shadow-sm"
        >
          <div className="space-y-3 mt-4">
            <button
              onClick={toggleDarkMode}
              className="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-all group border border-slate-200 dark:border-white/5"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg transition-colors ${settings.isDarkMode ? 'bg-indigo-500/20 text-indigo-300' : 'bg-amber-100 text-amber-600'}`}>
                  {settings.isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-white/90">Dark Mode</span>
              </div>
              <div className={`w-10 h-6 rounded-full flex items-center p-1 transition-colors ${settings.isDarkMode ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}>
                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${settings.isDarkMode ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
            </button>

            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-all border border-slate-200 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-200 dark:bg-white/5 text-slate-500 dark:text-white/70">
                  <Laptop size={18} />
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-white/90">Style</span>
              </div>
              <div className="flex bg-slate-200 dark:bg-black/40 p-1 rounded-lg">
                <button
                  onClick={() => onUpdateSettings({ ...settings, theme: 'minimalist' })}
                  className={`px-2 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${settings.theme === 'minimalist' ? 'bg-white dark:bg-white/20 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-white/40 hover:text-slate-700 dark:hover:text-white/60'}`}
                >
                  Mini
                </button>
                <button
                  onClick={() => onUpdateSettings({ ...settings, theme: 'vibrant' })}
                  className={`px-2 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${settings.theme === 'vibrant' ? 'bg-white dark:bg-white/20 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-white/40 hover:text-slate-700 dark:hover:text-white/60'}`}
                >
                  Vib
                </button>
              </div>
            </div>
          </div>
        </MagicBentoCard>

        {/* Regional & Currency */}
        <MagicBentoCard
          title="Regional"
          colSpan={1}
          enableStars={false}
          clickEffect={true}
          className="bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 shadow-sm z-10 !overflow-visible"
        >
          <div className="mt-4 flex flex-col justify-center h-4/5 overflow-visible">
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl font-bold font-mono">
                  {settings.currency}
                </div>
                <div>
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">Currency</div>
                  <div className="text-sm text-slate-500 dark:text-white/50">Primary</div>
                </div>
              </div>
              <GlassSelect
                value={settings.currency}
                onChange={(e) => onUpdateSettings({ ...settings, currency: e.target.value })}
                className="w-24 text-xs"
                align="right"
              >
                <option value="$">($) USD</option>
                <option value="€">(€) EUR</option>
                <option value="£">(£) GBP</option>
                <option value="¥">(¥) JPY</option>
                <option value="₹">(₹) INR</option>
              </GlassSelect>
            </div>
          </div>
        </MagicBentoCard>

        {/* Data & Security */}
        <MagicBentoCard
          title="Data Control"
          colSpan={1}
          enableStars={false}
          clickEffect={true}
          className="relative overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 shadow-sm"
        >
          <div className="mt-4 space-y-3 z-10 relative">
            <button onClick={exportData} className="w-full flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 border border-blue-200 dark:border-blue-500/20 rounded-xl text-blue-600 dark:text-blue-300 transition-all group">
              <div className="flex items-center gap-3">
                <Download size={18} />
                <span className="text-sm font-bold">Export Data</span>
              </div>
              <ChevronRight size={16} className="opacity-50 group-hover:opacity-100 transition-opacity" />
            </button>

            {!isResetConfirm ? (
              <button onClick={() => setIsResetConfirm(true)} className="w-full flex items-center justify-between p-3 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 border border-red-200 dark:border-red-500/20 rounded-xl text-red-600 dark:text-red-300 transition-all group">
                <div className="flex items-center gap-3">
                  <Trash2 size={18} />
                  <span className="text-sm font-bold">Reset Data</span>
                </div>
                <ChevronRight size={16} className="opacity-50 group-hover:opacity-100 transition-opacity" />
              </button>
            ) : (
              <div className="p-3 bg-red-50 dark:bg-red-900/40 rounded-xl border border-red-200 dark:border-red-500/30 animate-in fade-in zoom-in duration-200">
                <p className="text-[10px] text-red-600 dark:text-red-200 mb-2 text-center uppercase font-bold tracking-wider">Confirm Delete?</p>
                <div className="flex gap-2">
                  <button onClick={() => { onResetData(); setIsResetConfirm(false); }} className="flex-1 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-bold">Yes</button>
                  <button onClick={() => setIsResetConfirm(false)} className="flex-1 py-1.5 bg-white border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white rounded text-xs">No</button>
                </div>
              </div>
            )}
          </div>
        </MagicBentoCard>

        {/* Account / Logout */}
        <MagicBentoCard
          colSpan={1}
          enableStars={false}
          className="flex items-center justify-center cursor-pointer group bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 shadow-sm"
        >
          <div onClick={onLogout} className="flex flex-col items-center justify-center gap-3 h-full w-full py-6">
            <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-white/5 group-hover:bg-slate-100 dark:group-hover:bg-white/10 flex items-center justify-center transition-all duration-500 group-hover:scale-110 border border-slate-200 dark:border-white/5 group-hover:border-slate-300 dark:group-hover:border-white/20">
              <LogOut size={32} className="text-slate-400 dark:text-white/70 group-hover:text-slate-600 dark:group-hover:text-white transition-colors ml-1" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">Sign Out</h3>
              <p className="text-xs text-slate-500 dark:text-white/40 group-hover:text-slate-700 dark:group-hover:text-white/60 transition-colors">End session securely</p>
            </div>
          </div>
        </MagicBentoCard>

        {/* Placeholder / Extra Info */}
        <MagicBentoCard
          title="Montra Pro"
          description="Coming soon"
          colSpan={2}
          enableStars={false}
          clickEffect={true}
          className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/80 dark:to-purple-900/80 border-indigo-100 dark:border-indigo-500/30 shadow-sm relative overflow-hidden group"
        >
          <div className="h-full flex items-center justify-between relative mt-2">
            <div className="space-y-3 max-w-[65%] relative z-10">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-yellow-100 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-400/30 text-yellow-700 dark:text-yellow-300 text-[10px] font-extrabold uppercase tracking-widest shadow-sm">
                Early Access
              </div>
              <p className="text-sm font-medium text-slate-600 dark:text-amber-100/80 leading-relaxed text-balance">
                Unlock advanced analytics, AI insights, and unlimited budget goals.
              </p>
            </div>
            {/* Watermark */}
            <div className="absolute -right-4 -bottom-4 text-[10rem] opacity-10 dark:opacity-10 pointer-events-none select-none font-black text-blue-900 dark:text-white leading-none mix-blend-overlay">
              PRO
            </div>

            {/* Shine Effect Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/0 to-white/20 dark:to-yellow-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          </div>
        </MagicBentoCard>

      </MagicBentoGrid>
    </div >
  );
};
