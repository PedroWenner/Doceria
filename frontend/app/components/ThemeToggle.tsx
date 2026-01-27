'use client';

import { useTheme } from '@/app/context/ThemeContext';

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-brand-gold/20 hover:bg-brand-gold/40 text-brand-choco transition-all flex items-center justify-center w-10 h-10 border border-brand-gold/30"
            title={theme === 'light' ? 'Switch to Dark Luxury' : 'Switch to High Visibility'}
        >
            {theme === 'light' ? '🌙' : '☀️'}
        </button>
    );
}
