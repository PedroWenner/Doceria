import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    lastPage: number;
    onPageChange: (page: number) => void;
    total?: number;
    perPage?: number;
}

export default function Pagination({
    currentPage,
    lastPage,
    onPageChange,
    total,
    perPage
}: PaginationProps) {
    if (lastPage <= 1) return null;

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        let start = Math.max(1, currentPage - 2);
        let end = Math.min(lastPage, start + maxVisible - 1);

        if (end - start < maxVisible - 1) {
            start = Math.max(1, end - maxVisible + 1);
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    };

    return (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-4 border-t border-slate-200 dark:border-slate-800">
            <div className="text-sm text-slate-500 dark:text-slate-400">
                {total && perPage ? (
                    <>
                        Mostrando <span className="font-semibold text-slate-900 dark:text-slate-200">{((currentPage - 1) * perPage) + 1}</span> a <span className="font-semibold text-slate-900 dark:text-slate-200">{Math.min(currentPage * perPage, total)}</span> de <span className="font-semibold text-slate-900 dark:text-slate-200">{total}</span> resultados
                    </>
                ) : (
                    <>Página {currentPage} de {lastPage}</>
                )}
            </div>

            <div className="flex items-center gap-1">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft size={18} />
                </button>

                {getPageNumbers().map(page => (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`
                            min-w-[36px] h-9 px-3 rounded-lg text-sm font-semibold transition-all
                            ${currentPage === page
                                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm'
                                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                            }
                        `}
                    >
                        {page}
                    </button>
                ))}

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === lastPage}
                    className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
}
