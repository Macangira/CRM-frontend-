import React from 'react';

export interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  showText?: boolean;
  subtitleText?: string;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showSubtitle = true,
  showText = true,
  subtitleText = 'Softwares',
  className = ''
}) => {
  const iconSizes = {
    sm: { box: 'w-8 h-8', title: 'text-base', sub: 'text-[10px]' },
    md: { box: 'w-11 h-11', title: 'text-xl', sub: 'text-xs' },
    lg: { box: 'w-14 h-14', title: 'text-2xl', sub: 'text-sm' }
  }[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* 3D Geometric Isometric Spirehub Icon Container */}
      <div className={`relative shrink-0 flex items-center justify-center ${iconSizes.box}`}>
        <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-md">
          <defs>
            {/* Left Bracket Magenta/Violet Gradient */}
            <linearGradient id="spirePurpleMain" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e0e7ff" />
              <stop offset="20%" stopColor="#c026d3" />
              <stop offset="70%" stopColor="#9333ea" />
              <stop offset="100%" stopColor="#6b21a8" />
            </linearGradient>

            {/* Left Bracket Top Light Facet */}
            <linearGradient id="spirePurpleTop" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f472b6" />
              <stop offset="100%" stopColor="#c026d3" />
            </linearGradient>

            {/* Right Bracket Cyan/Teal Gradient */}
            <linearGradient id="spireCyanMain" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ecfeff" />
              <stop offset="20%" stopColor="#22d3ee" />
              <stop offset="70%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#0e7490" />
            </linearGradient>

            {/* Right Bracket Top Light Facet */}
            <linearGradient id="spireCyanTop" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#67e8f9" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>

          {/* LEFT ISOMETRIC BRACKET [ (Purple Faceted) */}
          {/* Main Body */}
          <path
            d="M 22 25 L 48 10 L 48 30 L 36 38 L 36 82 L 48 90 L 48 110 L 22 95 Z"
            fill="url(#spirePurpleMain)"
          />
          {/* Top 3D Facet */}
          <path
            d="M 22 25 L 48 10 L 48 30 L 36 38 Z"
            fill="url(#spirePurpleTop)"
          />
          {/* Inner Shadow Edge */}
          <path
            d="M 36 38 L 48 30 L 48 90 L 36 82 Z"
            fill="#581c87"
            opacity="0.35"
          />

          {/* RIGHT ISOMETRIC BRACKET ] (Cyan Faceted) */}
          {/* Main Body */}
          <path
            d="M 98 25 L 72 10 L 72 30 L 84 38 L 84 82 L 72 90 L 72 110 L 98 95 Z"
            fill="url(#spireCyanMain)"
          />
          {/* Top 3D Facet */}
          <path
            d="M 98 25 L 72 10 L 72 30 L 84 38 Z"
            fill="url(#spireCyanTop)"
          />
          {/* Inner Shadow Edge */}
          <path
            d="M 84 38 L 72 30 L 72 90 L 84 82 Z"
            fill="#155e75"
            opacity="0.35"
          />

          {/* CENTER TECH CONSTELLATION NODES */}
          <rect x="50" y="50" width="8" height="8" rx="2" fill="#e0e7ff" />
          <rect x="62" y="50" width="8" height="8" rx="2" fill="#22d3ee" />
          <rect x="62" y="62" width="8" height="8" rx="2" fill="#06b6d4" />
          <rect x="50" y="62" width="8" height="8" rx="2" fill="#c026d3" />

          {/* Connecting Circuit Trace Lines */}
          <line x1="54" y1="54" x2="66" y2="66" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" />
          <line x1="66" y1="54" x2="54" y2="66" stroke="#e0e7ff" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>

      {/* SpireCRM Typography Matching Image Format */}
      {showText && (
        <div className="flex flex-col justify-center leading-none">
          <div className={`font-black tracking-tight flex items-center ${iconSizes.title}`}>
            <span className="text-zinc-900 dark:text-white font-extrabold">Spire</span>
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent ml-0.5">CRM</span>
          </div>
          {showSubtitle && (
            <span className={`font-semibold text-zinc-500 dark:text-zinc-400 mt-1 tracking-wider ${iconSizes.sub}`}>
              {subtitleText}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
