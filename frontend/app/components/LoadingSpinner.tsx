'use client';

export default function LoadingSpinner() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] w-full">
            <div className="w-12 h-12 border-4 border-brand-pink/30 border-t-brand-choco rounded-full animate-spin mb-4"></div>
            <p className="text-brand-choco font-bold animate-pulse">Carregando...</p>
        </div>
    );
}
