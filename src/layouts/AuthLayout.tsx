import React from 'react';
import { Logo } from '../components/ui/Logo';

export interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-[#09090b] text-zinc-100 font-sans antialiased relative overflow-hidden">
      {/* Background Ambient Glows matching dark theme */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Centered Elevated Card Container with Background Ambient Shadow */}
      <div className="w-full max-w-md relative z-10 bg-[#12141d]/95 border border-zinc-800/90 rounded-3xl p-8 sm:p-10 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.95)] shadow-blue-500/10 backdrop-blur-xl animate-fadeIn space-y-6">
        {/* Card Brand Header with Spirehub Logo & SpireCRM Title */}
        <div className="pb-3 border-b border-zinc-800/60 flex items-center justify-between">
          <Logo size="md" subtitleText="Softwares Enterprise" />
        </div>

        {/* Title & Subtitle */}
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">{title}</h2>
          <p className="text-xs text-zinc-400 mt-1">{subtitle}</p>
        </div>

        {/* Form Content */}
        {children}
      </div>
    </div>
  );
};
