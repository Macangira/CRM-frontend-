import React from 'react';
import { Logo } from './Logo';

export interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  circle?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width,
  height,
  circle = false
}) => {
  const style: React.CSSProperties = {
    width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
    height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined
  };

  return (
    <div
      style={style}
      className={`animate-shimmer rounded-lg bg-zinc-800/80 ${circle ? 'rounded-full' : ''} ${className}`}
    />
  );
};

export const AbstractBrandLoader: React.FC<{ message?: string }> = ({
  message = 'Authenticating Enterprise Session...'
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-[#09090b] flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Ambient Radial Gradient Blur Spots */}
      <div className="absolute w-[500px] h-[500px] bg-gradient-to-tr from-purple-600/20 via-cyan-500/15 to-transparent rounded-full blur-[100px] pointer-events-none animate-pulse" />

      {/* Orbiting Abstract Loader Rings with 28px radial padding */}
      <div className="relative w-36 h-36 flex items-center justify-center">
        {/* Outer Orbit Ring (Magenta/Cyan gradient) */}
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-purple-500 border-r-cyan-400 animate-spin shadow-lg shadow-purple-500/20" style={{ animationDuration: '1.6s' }} />
        {/* Inner Counter Orbit Ring (Teal/Violet gradient) */}
        <div className="absolute inset-4 rounded-full border-2 border-transparent border-b-cyan-500 border-l-fuchsia-500 animate-spin shadow-lg shadow-cyan-500/20" style={{ animationDirection: 'reverse', animationDuration: '1.2s' }} />
        
        {/* Center Floating SpireCRM Brand Icon */}
        <div className="relative z-10 p-2 transform scale-110">
          <Logo size="sm" showSubtitle={false} />
        </div>
      </div>

      {/* Brand Typography & Status Message */}
      <div className="mt-7 text-center space-y-1 z-10">
        <div className="text-2xl font-extrabold text-white tracking-tight">
          Spire<span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">CRM</span>
        </div>
        <p className="text-xs font-semibold text-zinc-400 tracking-wider uppercase">{message}</p>
      </div>
    </div>
  );
};

/* 1. Card Skeleton Variant */
export const SkeletonCard: React.FC = () => {
  return (
    <div className="p-4 bg-[#121215] border border-zinc-800/80 rounded-xl space-y-3 shadow-sm">
      <div className="flex items-center justify-between">
        <Skeleton width={110} height={14} />
        <Skeleton circle width={28} height={28} />
      </div>
      <Skeleton width={140} height={24} />
      <Skeleton width={85} height={10} />
    </div>
  );
};

export const SkeletonCardGrid: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, idx) => (
        <SkeletonCard key={idx} />
      ))}
    </div>
  );
};

/* 2. Table Row Skeleton Variant */
export const SkeletonTableRow: React.FC<{ columnsCount?: number }> = ({ columnsCount = 5 }) => {
  return (
    <tr className="border-b border-zinc-800/50">
      {Array.from({ length: columnsCount }).map((_, colIdx) => (
        <td key={colIdx} className="px-4 py-3.5">
          {colIdx === 0 ? (
            <div className="flex items-center gap-3">
              <Skeleton circle width={32} height={32} />
              <div className="space-y-1.5">
                <Skeleton width={130} height={14} />
                <Skeleton width={80} height={10} />
              </div>
            </div>
          ) : colIdx === columnsCount - 1 ? (
            <Skeleton width={70} height={22} className="rounded-full" />
          ) : (
            <Skeleton width={100} height={14} />
          )}
        </td>
      ))}
    </tr>
  );
};

export const SkeletonTable: React.FC<{ rows?: number; cols?: number }> = ({ rows = 5, cols = 5 }) => {
  return (
    <div className="w-full bg-[#121215] border border-zinc-800/80 rounded-xl p-4 space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <Skeleton width={200} height={20} />
        <Skeleton width={120} height={32} />
      </div>
      {/* Table rows */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <tbody>
            {Array.from({ length: rows }).map((_, idx) => (
              <SkeletonTableRow key={idx} columnsCount={cols} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* 3. Detail Page / Drawer Skeleton Variant */
export const SkeletonDetailPage: React.FC = () => {
  return (
    <div className="p-6 bg-[#121215] border border-zinc-800/80 rounded-2xl space-y-6 animate-fadeIn">
      {/* Detail Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-800">
        <div className="flex items-center gap-4">
          <Skeleton circle width={56} height={56} />
          <div className="space-y-2">
            <Skeleton width={220} height={22} />
            <Skeleton width={160} height={12} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton width={100} height={36} className="rounded-xl" />
          <Skeleton width={110} height={36} className="rounded-xl" />
        </div>
      </div>

      {/* Grid of Detail Key-Value Fields */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="p-3.5 bg-zinc-900/60 border border-zinc-800/60 rounded-xl space-y-2">
            <Skeleton width={80} height={10} />
            <Skeleton width={110} height={16} />
          </div>
        ))}
      </div>

      {/* Detail Tabs Shimmer Bar */}
      <div className="flex gap-3 border-b border-zinc-800 pb-2">
        <Skeleton width={90} height={28} className="rounded-lg" />
        <Skeleton width={100} height={28} className="rounded-lg" />
        <Skeleton width={80} height={28} className="rounded-lg" />
      </div>

      {/* Detail Timeline Stream / Related List Shimmer */}
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className="p-4 bg-zinc-900/40 border border-zinc-800/40 rounded-xl flex items-start gap-3">
            <Skeleton circle width={28} height={28} />
            <div className="flex-1 space-y-2">
              <Skeleton width="60%" height={14} />
              <Skeleton width="40%" height={10} />
            </div>
            <Skeleton width={70} height={10} />
          </div>
        ))}
      </div>
    </div>
  );
};

/* 4. Complete Dashboard Skeleton Variant */
export const SkeletonDashboard: React.FC = () => {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Welcome Banner Skeleton */}
      <div className="p-6 bg-gradient-to-r from-zinc-900 to-zinc-800 rounded-2xl border border-zinc-800 space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton width={260} height={24} />
          <Skeleton width={90} height={20} className="rounded-full" />
        </div>
        <Skeleton width={380} height={14} />
      </div>

      {/* KPI Cards Grid */}
      <SkeletonCardGrid count={8} />

      {/* Analytics & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-5 bg-[#121215] border border-zinc-800/80 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton width={180} height={18} />
            <Skeleton width={80} height={20} className="rounded-full" />
          </div>
          <Skeleton height={200} className="w-full rounded-xl" />
        </div>

        <div className="p-5 bg-[#121215] border border-zinc-800/80 rounded-xl space-y-3">
          <Skeleton width={140} height={18} />
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="p-3 border border-zinc-800/60 rounded-xl space-y-2">
              <Skeleton width={160} height={14} />
              <Skeleton width={100} height={10} />
            </div>
          ))}
        </div>
      </div>

      {/* Recent Streams */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonTable rows={4} />
        <SkeletonTable rows={4} />
      </div>
    </div>
  );
};
