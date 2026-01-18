import React, { useEffect, useState } from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { Wifi, WifiOff } from 'lucide-react';

export const NetworkStatus = ({ className }: { className?: string }) => {
    const isOnline = useOnlineStatus();
    const [showBackOnline, setShowBackOnline] = useState(false);

    // Default positioning classes if none provided
    const containerClasses = className || "fixed bottom-20 left-1/2 transform -translate-x-1/2 md:bottom-24";

    useEffect(() => {
        if (isOnline) {
            setShowBackOnline(true);
            const timer = setTimeout(() => setShowBackOnline(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [isOnline]);

    if (!isOnline) {
        return (
            <div className={`${containerClasses} z-50 animate-in fade-in slide-in-from-bottom-4`}>
                <div className="bg-slate-900/90 dark:bg-slate-800/90 backdrop-blur-md text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 border border-white/10 text-sm font-medium">
                    <WifiOff size={16} className="text-red-400" />
                    <span>You are offline</span>
                </div>
            </div>
        );
    }

    if (showBackOnline) {
        return (
            <div className={`${containerClasses} z-50 animate-in fade-in slide-in-from-bottom-4`}>
                <div className="bg-emerald-600/90 backdrop-blur-md text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 border border-white/10 text-sm font-medium">
                    <Wifi size={16} />
                    <span>Back online</span>
                </div>
            </div>
        );
    }

    return null;
};
