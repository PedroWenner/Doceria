import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

export default function GlassCard({ children, className = '' }: GlassCardProps) {
  return (
    <div className={`backdrop-blur-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] shadow-xl rounded-2xl p-8 ${className}`}>
      {children}
    </div>
  );
}
