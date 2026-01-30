import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

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

    const isFirstPage = currentPage === 1;
    const isLastPage = currentPage === lastPage;

    // Helper specific to Pro Max design: Subtle button utility
    const buttonBaseClass = "relative inline-flex items-center justify-center h-9 min-w-[36px] px-2.5 text-sm font-medium transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-slate-900 focus:ring-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed";
    const activeClass = "z-10 bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-900 shadow-md shadow-slate-200 dark:shadow-slate-900/50 scale-105";
    const inactiveClass = "text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700";

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-1 mt-4">

            {/* Info Section - Left */}
            <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                {total && perPage ? (
                    <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-100 dark:border-slate-800/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                        Mostrando <span className="font-bold text-slate-900 dark:text-slate-200">{((currentPage - 1) * perPage) + 1}-{Math.min(currentPage * perPage, total)}</span> de <span className="font-bold text-slate-900 dark:text-slate-200">{total}</span>
                    </div>
                ) : (
                    <span>Página {currentPage} de {lastPage}</span>
                )}
            </div>

            {/* Controls Section - Right */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100/50 dark:bg-slate-900/50 rounded-xl border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-sm">

                {/* First Page */}
                <button
                    onClick={() => onPageChange(1)}
                    disabled={isFirstPage}
                    className={`${buttonBaseClass} ${inactiveClass}`}
                    title="Primeira Página"
                >
                    <ChevronsLeft size={16} />
                </button>

                {/* Previous */}
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={isFirstPage}
                    className={`${buttonBaseClass} ${inactiveClass}`}
                    title="Página Anterior"
                >
                    <ChevronLeft size={16} />
                </button>

                {/* Page Numbers */}
                <div className="hidden sm:flex items-center gap-1 mx-1">
                    {getPageNumbers()[0] > 1 && (
                        <>
                            <span className="mx-1 text-slate-400 text-xs">...</span>
                        </>
                    )}

                    {getPageNumbers().map(page => (
                        <button
                            key={page}
                            onClick={() => onPageChange(page)}
                            className={`${buttonBaseClass} ${currentPage === page ? activeClass : inactiveClass}`}
                        >
                            {page}
                        </button>
                    ))}

                    {getPageNumbers()[getPageNumbers().length - 1] < lastPage && (
                        <>
                            <span className="mx-1 text-slate-400 text-xs">...</span>
                        </>
                    )}
                </div>

                {/* Mobile Page Display (Simple) */}
                <div className="sm:hidden flex items-center px-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    <span className="bg-white dark:bg-slate-800 px-3 py-1 rounded-md border border-slate-200 dark:border-slate-700 shadow-sm">
                        {currentPage} / {lastPage}
                    </span>
                </div>

                {/* Next */}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={isLastPage}
                    className={`${buttonBaseClass} ${inactiveClass}`}
                    title="Próxima Página"
                >
                    <ChevronRight size={16} />
                </button>

                {/* Last Page */}
                <button
                    onClick={() => onPageChange(lastPage)}
                    disabled={isLastPage}
                    className={`${buttonBaseClass} ${inactiveClass}`}
                    title="Última Página"
                >
                    <ChevronsRight size={16} />
                </button>
            </div>
        </div>
    );
}
