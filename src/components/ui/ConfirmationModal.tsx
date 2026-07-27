import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, X, Info } from 'lucide-react';
import { Button } from './Button';

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
  icon
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, isLoading]);

  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      iconBg: 'bg-red-500/10 border-red-500/20 text-red-500',
      icon: <Trash2 className="w-5 h-5" />,
      buttonVariant: 'danger' as const,
      defaultConfirmText: 'Delete Record'
    },
    warning: {
      iconBg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
      icon: <AlertTriangle className="w-5 h-5" />,
      buttonVariant: 'primary' as const,
      defaultConfirmText: 'Proceed'
    },
    primary: {
      iconBg: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
      icon: <Info className="w-5 h-5" />,
      buttonVariant: 'primary' as const,
      defaultConfirmText: 'Confirm'
    }
  }[variant];

  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-zinc-950/80 backdrop-blur-md animate-fadeIn">
      {/* Modal Container */}
      <div
        className="w-full max-w-md bg-[#121215] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden transform transition-all animate-scaleUp space-y-5 p-6"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${variantStyles.iconBg} shrink-0`}>
              {icon || variantStyles.icon}
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100">{title}</h3>
              <span className="text-[11px] text-zinc-500 font-medium">Confirmation Required</span>
            </div>
          </div>

          <button
            disabled={isLoading}
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-100 p-1.5 rounded-lg hover:bg-zinc-800/60 transition-colors disabled:opacity-40"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Body */}
        <div className="text-xs text-zinc-300 leading-relaxed bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-3.5">
          {message}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
            className="text-zinc-300 border-zinc-700 hover:bg-zinc-800"
          >
            {cancelText}
          </Button>

          <Button
            type="button"
            variant={variantStyles.buttonVariant}
            size="sm"
            onClick={handleConfirm}
            isLoading={isLoading}
            disabled={isLoading}
            className={variant === 'danger' ? 'bg-red-600 hover:bg-red-500 text-white font-bold' : undefined}
          >
            {isLoading
              ? 'Processing...'
              : confirmText || variantStyles.defaultConfirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};
