'use client';

import * as React from 'react';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { format, isValid, parse } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';
import { cn } from '@/app/lib/utils';
import { Calendar } from '@/app/components/ui/calendar';
import { useLanguage } from '@/app/context/LanguageContext';

interface Props {
    label?: string;
    value: string; // ISO string 'yyyy-MM-dd'
    onChange: (value: string) => void;
    min?: string;
    max?: string;
    className?: string;
    placeholder?: string;
}

export default function ProDatePicker({ label, value, onChange, className = '', placeholder = 'Selecione uma data' }: Props) {
    const { language } = useLanguage();
    const [isOpen, setIsOpen] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Selected day for Calendar
    const selectedDate = value ? parse(value, 'yyyy-MM-dd', new Date()) : undefined;

    // Click outside handler
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleSelect = (date: Date | undefined) => {
        if (date) {
            onChange(format(date, 'yyyy-MM-dd'));
            setIsOpen(false);
        } else {
            onChange('');
        }
    };

    const displayValue = value && isValid(new Date(value))
        ? format(new Date(value), 'PPP', { locale: language === 'pt' ? ptBR : enUS })
        : '';

    return (
        <div className={cn("space-y-1.5", className)} ref={containerRef}>
            {label && (
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5  tracking-wide">
                    {label}
                </label>
            )}

            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        "w-full h-10 pl-10 pr-3 flex items-center text-left",
                        "bg-white dark:bg-slate-900",
                        "border border-slate-200 dark:border-slate-800",
                        "rounded-xl text-sm font-medium",
                        "shadow-sm transition-all duration-200",
                        "hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md hover:bg-slate-50/50 dark:hover:bg-slate-800/50",
                        "focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-slate-100/10",
                        isOpen && "ring-2 ring-slate-900/10 dark:ring-slate-100/10 border-slate-900 dark:border-slate-100 z-10",
                        !value && "text-slate-500 italic",
                        value && "text-slate-900 dark:text-slate-100 font-semibold"
                    )}
                >
                    <CalendarIcon size={16} className="absolute left-3 text-slate-400" />
                    {displayValue || placeholder}
                </button>

                {value && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onChange('');
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X size={14} />
                    </button>
                )}

                {/* Popover Content */}
                {isOpen && (
                    <div className="absolute top-full mb-2 left-0 z-50 mt-2 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 animate-in fade-in zoom-in-95 duration-200 user-select-none">
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={handleSelect}
                            initialFocus
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
