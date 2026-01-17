import React from 'react';
import { UserProfile } from '../types';

interface CreditCardProps {
    balance: number;
    currency: string;
    profile: UserProfile;
    cardHolder?: string;
}

export const CreditCardWidget: React.FC<CreditCardProps> = ({ balance, currency, profile, cardHolder }) => {
    return (
        <div className="relative w-full h-full min-h-[220px] rounded-3xl overflow-hidden shadow-2xl transition-transform duration-300 hover:scale-[1.02]">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-blue-700 to-indigo-900" />

            {/* Texture/Noise overlay (optional) */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />

            {/* Decorative Circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/20 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none" />

            {/* Content */}
            <div className="relative z-10 p-6 md:p-8 flex flex-col h-full justify-between text-white">

                {/* Top Row */}
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <p className="text-white/60 text-xs font-medium tracking-widest uppercase">Total Balance</p>
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                            {currency}{balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </h2>
                    </div>
                    <div className="flex -space-x-3">
                        <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/10" />
                        <div className="w-8 h-8 rounded-full bg-white/40 backdrop-blur-md border border-white/10" />
                    </div>
                </div>

                {/* Middle Row (Chip) */}
                <div className="flex items-center gap-4">
                    <div className="w-12 h-9 rounded-lg bg-yellow-200/20 border border-yellow-100/30 flex items-center justify-center overflow-hidden relative">
                        {profile.avatar ? (
                            <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <>
                                <div className="absolute inset-0 bg-gradient-to-tr from-yellow-500/20 to-transparent" />
                                <div className="w-8 h-5 border border-yellow-100/20 rounded opacity-50" />
                            </>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <span className="text-white/40 text-2xl tracking-widest">****</span>
                        <span className="text-white/40 text-2xl tracking-widest">****</span>
                        <span className="text-white/40 text-2xl tracking-widest">****</span>
                        <span className="text-white/90 text-xl font-mono tracking-widest">{profile.cardLastFour || '4223'}</span>
                    </div>
                </div>

                {/* Bottom Row */}
                <div className="flex justify-between items-end">
                    <div>
                        <p className="text-white/50 text-[10px] uppercase tracking-wider mb-0.5">Card Holder</p>
                        <p className="font-medium text-lg tracking-wide">{cardHolder || profile.name || 'Montra User'}</p>
                    </div>
                    <div className="flex flex-col items-end">
                        <p className="text-white/50 text-[10px] uppercase tracking-wider mb-0.5">Expires</p>
                        <p className="font-medium">12/28</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
