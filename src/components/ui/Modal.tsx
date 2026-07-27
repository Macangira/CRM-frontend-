import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';
import gsap from 'gsap';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'lg'
}) => {
  const backdropRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleCloseWithGSAP();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);

      // GSAP Spring & Scale Entrance Animation
      if (backdropRef.current && cardRef.current) {
        gsap.fromTo(
          backdropRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.3, ease: 'power2.out' }
        );
        gsap.fromTo(
          cardRef.current,
          { scale: 0.82, y: 35, opacity: 0 },
          { scale: 1, y: 0, opacity: 1, duration: 0.4, ease: 'back.out(1.4)' }
        );
      }
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleCloseWithGSAP = () => {
    if (backdropRef.current && cardRef.current) {
      gsap.to(cardRef.current, {
        scale: 0.85,
        y: 25,
        opacity: 0,
        duration: 0.2,
        ease: 'power2.in'
      });
      gsap.to(backdropRef.current, {
        opacity: 0,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: onClose
      });
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-6xl'
  };

  const modalContent = (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/45 dark:bg-black/70 backdrop-blur-md overflow-y-auto"
      style={{ zIndex: 9999 }}
    >
      <div
        ref={cardRef}
        className={`w-full ${sizes[size]} my-auto bg-white/85 dark:bg-zinc-950/80 backdrop-blur-2xl border border-white/80 dark:border-white/10 rounded-2xl shadow-2xl shadow-slate-950/30 dark:shadow-black/80 flex flex-col max-h-[85vh] overflow-hidden transform relative text-left`}
      >
        {/* Glowing Gradient Accent Line */}
        <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200/80 dark:border-white/10 shrink-0 bg-white/40 dark:bg-white/[0.03]">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">{title}</h3>
            {description && <p className="text-xs text-zinc-400 mt-0.5">{description}</p>}
          </div>
          <button
            onClick={handleCloseWithGSAP}
            className="text-zinc-400 hover:text-white p-1.5 rounded-xl hover:bg-zinc-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body with Internal Scrollbar */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {children}
        </div>

        {/* Fixed Footer at bottom of card */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-3.5 bg-white/40 dark:bg-white/[0.02] border-t border-zinc-200/80 dark:border-white/10 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};
