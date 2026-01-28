'use client';

import { useLanguage } from '../context/LanguageContext';

export default function LanguageToggle() {
    const { language, toggleLanguage } = useLanguage();

    return (
        <button
            onClick={toggleLanguage}
            className="rounded-full bg-brand-gold/20 hover:bg-brand-gold/40 transition-all flex items-center justify-center w-10 h-10 border border-brand-gold/30 hover:scale-110 overflow-hidden"
            title="Mudar Idioma / Toggle Language"
        >
            <img
                src={language === 'pt' ? 'https://flagcdn.com/w80/br.png' : 'https://flagcdn.com/w80/us.png'}
                alt={language === 'pt' ? 'Português' : 'English'}
                className="w-full h-full object-cover"
            />
        </button>
    );
}
