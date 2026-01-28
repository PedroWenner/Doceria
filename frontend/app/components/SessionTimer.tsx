'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { getTokenExpiration } from '../utils/jwt';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function SessionTimer() {
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const { logout } = useAuth();
    const { t } = useLanguage();

    useEffect(() => {
        const token = Cookies.get('auth_token');
        if (!token) return;

        const exp = getTokenExpiration(token);
        if (!exp) return;

        const calculateTimeLeft = () => {
            const now = Math.floor(Date.now() / 1000);
            const remaining = exp - now;

            if (remaining <= 0) {
                logout();
                return 0;
            }
            return remaining;
        };

        setTimeLeft(calculateTimeLeft());

        const interval = setInterval(() => {
            const remaining = calculateTimeLeft();
            setTimeLeft(remaining);
        }, 1000);

        return () => clearInterval(interval);
    }, [logout]);

    if (timeLeft === null) return null;

    // Format time mm:ss or hh:mm:ss
    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;

        if (h > 0) {
            return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // Visual logic: alert color if < 5 min
    const isUrgent = timeLeft < 300; // 5 minutes

    return (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-white/30 backdrop-blur-sm border border-brand-gold/10 mb-4 transition-colors hover:bg-white/50 group">
            <div className={`
                flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs border-2 shadow-sm transition-colors
                ${isUrgent
                    ? 'border-red-400 text-red-600 bg-red-50 animate-pulse'
                    : 'border-brand-gold text-brand-choco bg-brand-cream/50'}
            `}>
                ⏳
            </div>
            <div>
                <span className="block text-[10px] uppercase font-bold tracking-wider text-brand-choco/60">
                    {t('sidebar.session_expires')}
                </span>
                <span className={`text-sm font-mono font-bold ${isUrgent ? 'text-red-600' : 'text-brand-choco'}`}>
                    {formatTime(timeLeft)}
                </span>
            </div>
        </div>
    );
}
