import React, { useEffect, useState } from 'react';
import { Download, X, Share } from 'lucide-react';

export const InstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    // FORCE VISIBLE FOR DEBUGGING as requested (user needs to see card)
    const [isVisible, setIsVisible] = useState(true);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // Check if it's iOS
        const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        setIsIOS(isIosDevice);

        const handler = (e: Event) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            // Update UI notify the user they can install the PWA
            setIsVisible(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsVisible(false);
        }

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setIsVisible(false);
        }

        setDeferredPrompt(null);
    };

    if (!isVisible && !isIOS) return null;

    // iOS prompt logic (since iOS doesn't support beforeinstallprompt)
    // We can show a hint for iOS users if they are not in standalone mode
    // But for now, let's focus on the standard Android/Desktop flow or if isIOS is explicitly true and not standalone
    // Note: iOS detection + standalone check is tricky. 
    // Let's refine: If it is iOS and NOT standalone, we *could* show a custom instruction.
    // For this MVP "pop", let's handle the standard event first. 

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 z-[9999] animate-in slide-in-from-bottom-10 fade-in duration-500">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-5 border border-slate-200 dark:border-slate-700 flex flex-col gap-4">
                <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                        <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/30">
                            <Download className="text-white w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Install Montra</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm leading-tight mt-1">
                                Install app for a better experience, offline access, and easier access.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                        <X size={20} />
                    </button>
                </div>

                <button
                    onClick={() => {
                        if (deferredPrompt) {
                            handleInstallClick();
                        } else {
                            alert("This is a preview. In a real scenario, this button triggers the browser's install prompt.");
                        }
                    }}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors shadow-lg shadow-indigo-500/20 active:scale-95 transform duration-200"
                >
                    Install Application
                </button>
            </div>
        </div>
    );
};
