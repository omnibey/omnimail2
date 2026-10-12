'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
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

  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
    '2xl': 'max-w-3xl',
    '3xl': 'max-w-4xl',
    '4xl': 'max-w-5xl',
    '5xl': 'max-w-6xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className={`relative w-full ${maxWidths[maxWidth]} max-h-[92vh] flex flex-col rounded-[22px] bg-[var(--bg-1)] border border-[var(--line)] shadow-[var(--shadow)] p-5 sm:p-6 z-10 animate-slide-up text-[var(--t0)]`}
      >
        <div className="flex items-start justify-between pb-4 border-b border-[var(--line)]">
          <div>
            {title && (
              <h3 className="text-lg font-bold text-[var(--t0)]">
                {title}
              </h3>
            )}
            {description && (
              <p className="mt-1 text-xs text-[var(--t2)] font-medium">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-[10px] p-1.5 text-[var(--t2)] hover:text-[var(--t0)] hover:bg-[var(--bg-3)] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 flex-1 overflow-y-auto pr-1">{children}</div>
      </div>
    </div>
  );
};

