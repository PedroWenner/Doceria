import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

export default function GlassCard({ children, className = '' }: GlassCardProps) {
  return (
    <div className={`backdrop-blur-xl bg-white/30 border border-white/50 shadow-xl rounded-2xl p-8 ${className}`}>
      {children}
    </div>
  );
}
