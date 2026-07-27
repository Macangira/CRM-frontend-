import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  onNavigate?: (href: string) => void;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, onNavigate }) => {
  return (
    <nav className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
      <button
        onClick={() => onNavigate && onNavigate('/dashboard')}
        className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
      </button>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600" />
          {item.href && index < items.length - 1 ? (
            <button
              onClick={() => onNavigate && onNavigate(item.href!)}
              className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors font-medium"
            >
              {item.label}
            </button>
          ) : (
            <span className="font-semibold text-slate-800 dark:text-slate-200">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
