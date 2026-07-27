import React from 'react';
import { Card } from '../ui/card';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: number;
  changeLabel?: string;
  subtext?: string;
  className?: string;
  hoverColorTheme?: 'cyan' | 'blue' | 'purple' | 'amber';
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  change,
  changeLabel,
  subtext,
  className = '',
  hoverColorTheme = 'cyan',
  onClick
}) => {
  const isPositive = change !== undefined ? change >= 0 : true;
  const displayChange = change !== undefined ? change : 8.4;

  const sparklineColor = isPositive ? 'text-blue-500 group-hover:text-white transition-colors duration-300' : 'text-pink-500 group-hover:text-white transition-colors duration-300';
  const changeTextColor = isPositive ? 'text-emerald-400 group-hover:text-white transition-colors duration-300' : 'text-pink-500 group-hover:text-white transition-colors duration-300';

  const iconColor = 'text-zinc-600 group-hover:text-white transition-colors duration-300';
  const titleColor = 'text-zinc-600 group-hover:text-white/70 transition-colors duration-300';
  const valueColor = 'text-zinc-100 group-hover:text-white transition-colors duration-300';

  const themeGradients = {
    cyan: 'bg-gradient-to-br from-[#1cd8d2] to-[#93edc7] shadow-[0_0_20px_rgba(28,216,210,0.3)]',
    blue: 'bg-gradient-to-br from-blue-500 to-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.3)]',
    purple: 'bg-gradient-to-br from-purple-500 to-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.3)]',
    amber: 'bg-gradient-to-br from-amber-500 to-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
  };

  const hoverBgClass = themeGradients[hoverColorTheme];

  return (
    <Card 
      onClick={onClick} 
      className={`relative overflow-hidden cursor-pointer group glass-noise bg-zinc-900/30 backdrop-blur-3xl border-white/20 hover:border-transparent shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] transition-all duration-300 ${className}`}
    >
      {/* Hover Background Layer */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${hoverBgClass} rounded-2xl`} />
      
      <div className="flex items-center gap-4 px-5 py-4 h-full relative z-10">
        {/* Left Icon */}
        <div className={`flex items-center justify-center shrink-0 ${iconColor}`}>
          {React.isValidElement(icon) ? React.cloneElement(icon as any, { className: 'w-7 h-7' }) : icon}
        </div>
        
        {/* Right Content */}
        <div className="flex-1 flex flex-col justify-center">
          
          {/* Top Row: Value + Title (BTC) */}
          <div className="flex items-baseline gap-2">
            <span className={`text-[19px] font-bold tracking-tight ${valueColor}`}>
              {value}
            </span>
            <span className={`text-[11px] font-bold uppercase tracking-wider ${titleColor}`}>
              {title}
            </span>
          </div>
          
          {/* Bottom Row: Sparkline + Percentage */}
          <div className="flex items-center gap-3 mt-1">
            <svg width="40" height="12" viewBox="0 0 40 12" className={`opacity-80 ${sparklineColor}`}>
              <path 
                d={isPositive ? "M0 10 Q 5 12, 10 7 T 20 5 T 30 9 T 40 2" : "M0 2 Q 5 6, 10 10 T 20 8 T 30 12 T 40 10"} 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
              />
            </svg>
            <div className={`flex items-center gap-0.5 text-[10px] font-bold ${changeTextColor}`}>
              {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {isPositive ? '+' : ''}{displayChange}%
            </div>
          </div>
          
        </div>
      </div>
    </Card>
  );
};
