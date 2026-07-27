import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hoverEffect = false
}) => {
  const isClickable = !!onClick || hoverEffect;

  return (
    <div
      onClick={onClick}
      className={`crm-card glass-noise bg-white/70 dark:bg-zinc-900/40 backdrop-blur-3xl border border-white/80 dark:border-white/20 rounded-2xl p-5 shadow-[0_12px_32px_-18px_rgba(15,23,42,0.35)] dark:shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] transition-all duration-300 ${
        isClickable
          ? 'cursor-pointer hover:border-blue-400/60 dark:hover:border-cyan-400/40 hover:shadow-cyan-500/10 hover:-translate-y-1 active:translate-y-0'
          : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
