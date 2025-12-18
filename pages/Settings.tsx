
import React, { useState } from 'react';
import { UserSettings } from '../types';
import { GlassCard, GlassButton, GlassInput, GlassSelect } from '../components/ui/Glass';
import { User, Globe, Palette, Database, Download, Trash2, ShieldCheck, Github, Moon, Sun, GraduationCap } from 'lucide-react';

interface Props {
  settings: UserSettings;
  onUpdateSettings: (settings: UserSettings) => void;
  onResetData: () => void;
  transactions: any[];
}

export const Settings: React.FC<Props> = ({ settings, onUpdateSettings, onResetData, transactions }) => {
  const [isResetConfirm, setIsResetConfirm] = useState(false);

  const handleProfileChange = (key: string, value: string) => {
    onUpdateSettings({
      ...settings,
      profile: { ...settings.profile, [key]: value }
    });
  };

  const exportData = () => {
    const dataStr = JSON.stringify({ transactions, settings }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
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
    <div className="space-y-6 animate-fade-in pb-24 md:pb-0">
      <header>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Personalize your Montra experience.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <User size={16} />
            <h3 className="text-xs font-bold uppercase tracking-widest">Student Profile</h3>
          </div>
          <GlassCard className="space-y-4">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-indigo-100 dark:shadow-indigo-900/20">
                {settings.profile.name ? settings.profile.name.charAt(0).toUpperCase() : 'S'}
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-white">{settings.profile.name || 'Student'}</h4>
                <p className="text-xs text-slate-400">{settings.profile.school || 'University Not Set'}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                   <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
                   <GlassInput 
                    value={settings.profile.name} 
                    onChange={(e) => handleProfileChange('name', e.target.value)}
                    placeholder="Your name"
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">University</label>
                <div className="relative">
                   <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
                   <GlassInput 
                    value={settings.profile.school} 
                    onChange={(e) => handleProfileChange('school', e.target.value)}
                    placeholder="e.g. Stanford"
                    className="pl-10"
                   />
                </div>
              </div>
            </div>
          </GlassCard>

          <div className="flex items-center gap-2 text-slate-400 mt-6 mb-2">
            <Globe size={16} />
            <h3 className="text-xs font-bold uppercase tracking-widest">Localization</h3>
          </div>
          <GlassCard className="relative z-20">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-medium text-slate-800 dark:text-white">Primary Currency</h4>
                <p className="text-xs text-slate-400">Used for all calculations and displays.</p>
              </div>
              <div className="w-32">
                <GlassSelect 
                  value={settings.currency} 
                  onChange={(e) => onUpdateSettings({...settings, currency: e.target.value})}
                >
                  <option value="$">USD ($)</option>
                  <option value="€">EUR (€)</option>
                  <option value="£">GBP (£)</option>
                  <option value="¥">JPY (¥)</option>
                  <option value="₹">INR (₹)</option>
                </GlassSelect>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Preferences & Data Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Palette size={16} />
            <h3 className="text-xs font-bold uppercase tracking-widest">Interface</h3>
          </div>
          <GlassCard className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-slate-800 dark:text-white">Visual Style</h4>
                <p className="text-xs text-slate-400">Adjust the transparency effects.</p>
              </div>
              <div className="flex p-1 bg-slate-100 dark:bg-white/5 rounded-lg transition-colors">
                <button 
                  onClick={() => onUpdateSettings({...settings, theme: 'minimalist'})}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${settings.theme === 'minimalist' ? 'bg-white dark:bg-white/20 shadow-sm text-slate-800 dark:text-white' : 'text-slate-400'}`}
                >
                  Minimal
                </button>
                <button 
                  onClick={() => onUpdateSettings({...settings, theme: 'vibrant'})}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${settings.theme === 'vibrant' ? 'bg-white dark:bg-white/20 shadow-sm text-slate-800 dark:text-white' : 'text-slate-400'}`}
                >
                  Vibrant
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg transition-colors ${settings.isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-amber-100 text-amber-600'}`}>
                  {settings.isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-800 dark:text-white">Dark Mode</h4>
                  <p className="text-xs text-slate-400">Easier on your eyes at night.</p>
                </div>
              </div>
              <button 
                onClick={toggleDarkMode}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${settings.isDarkMode ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
              >
                <span 
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${settings.isDarkMode ? 'translate-x-5' : 'translate-x-0'}`}
                />
              </button>
            </div>
          </GlassCard>

          <div className="flex items-center gap-2 text-slate-400 mt-6 mb-2">
            <Database size={16} />
            <h3 className="text-xs font-bold uppercase tracking-widest">Data Management</h3>
          </div>
          <GlassCard className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-slate-800 dark:text-white">Cloud Backup</h4>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <ShieldCheck size={12} className="text-emerald-500" />
                  Local data is encrypted
                </p>
              </div>
              <GlassButton variant="secondary" onClick={exportData}>
                <Download size={16} />
                Export JSON
              </GlassButton>
            </div>
            <hr className="border-slate-100 dark:border-white/5" />
            {!isResetConfirm ? (
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-red-600 dark:text-red-400">Danger Zone</h4>
                  <p className="text-xs text-slate-400">Permanently delete all data.</p>
                </div>
                <GlassButton variant="danger" onClick={() => setIsResetConfirm(true)}>
                  <Trash2 size={16} />
                  Reset App
                </GlassButton>
              </div>
            ) : (
              <div className="bg-red-50/50 dark:bg-red-950/20 p-4 rounded-xl border border-red-100 dark:border-red-900/30 animate-slide-up">
                <p className="text-xs font-bold text-red-600 dark:text-red-400 mb-3">Are you absolutely sure? This cannot be undone.</p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => { onResetData(); setIsResetConfirm(false); }} 
                    className="flex-1 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-colors"
                  >
                    Yes, Delete Everything
                  </button>
                  <button 
                    onClick={() => setIsResetConfirm(false)}
                    className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </GlassCard>

          <div className="pt-6">
            <div className="flex items-center justify-center gap-4 text-slate-300 dark:text-slate-600">
               <div className="flex items-center gap-1.5 grayscale opacity-50">
                 <Github size={14} />
                 <span className="text-[10px] font-bold uppercase tracking-wider">v1.2.0 Stable</span>
               </div>
               <div className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
               <span className="text-[10px] font-bold uppercase opacity-50 tracking-wider">Made for students</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
