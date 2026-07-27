import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'md' | 'lg' | 'xl';
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md'
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    md: 'max-w-md',
    lg: 'max-w-xl',
    xl: 'max-w-2xl'
  };

  const drawerContent = (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/45 dark:bg-black/70 backdrop-blur-sm animate-fadeIn" style={{ zIndex: 9999 }}>
      <div className="absolute inset-0" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div
          className={`w-screen ${sizes[size]} bg-white/90 dark:bg-zinc-950/85 backdrop-blur-2xl text-zinc-900 dark:text-zinc-100 border-l border-white/80 dark:border-white/10 shadow-2xl shadow-slate-950/30 dark:shadow-black/80 flex flex-col animate-slideLeft`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-200/80 dark:border-white/10 bg-white/40 dark:bg-white/[0.03]">
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">{title}</h3>
              {description && <p className="text-xs text-zinc-400 mt-0.5">{description}</p>}
            </div>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white p-1.5 rounded-xl hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="flex items-center justify-end gap-3 px-6 py-4 bg-white/40 dark:bg-white/[0.02] border-t border-zinc-200/80 dark:border-white/10 shrink-0">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(drawerContent, document.body);
};
