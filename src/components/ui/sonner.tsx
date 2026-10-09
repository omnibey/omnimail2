'use client';

import React from 'react';
import { Toaster as Sonner, toast } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

export const Toaster: React.FC<ToasterProps> = ({ ...props }) => {
  return (
    <Sonner
      className="toaster group"
      position="bottom-right"
      richColors
      closeButton
      toastOptions={{
        style: {
          borderRadius: '13px',
          padding: '12px 16px',
        },
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-[var(--bg-1)] group-[.toaster]:text-[var(--t0)] group-[.toaster]:border-[var(--line)] group-[.toaster]:shadow-2xl group-[.toaster]:backdrop-blur-xl group-[.toaster]:font-sans text-xs font-semibold',
          description: 'group-[.toast]:text-[var(--t2)] text-[11px] font-normal mt-0.5',
          actionButton:
            'group-[.toast]:bg-[var(--acc)] group-[.toast]:text-white font-bold text-xs rounded-[9px] px-3 py-1.5',
          cancelButton:
            'group-[.toast]:bg-[var(--bg-3)] group-[.toast]:text-[var(--t1)] text-xs rounded-[9px] px-3 py-1.5',
          closeButton:
            '!bg-[var(--bg-3)] !border-[var(--line)] !text-[var(--t2)] hover:!text-[var(--t0)] !transition-colors',
          success:
            '!bg-[var(--bg-1)] !border-[var(--ok)]/40 !text-[var(--t0)] [&_[data-icon]]:!text-[var(--ok)]',
          error:
            '!bg-[var(--bg-1)] !border-[var(--bad)]/40 !text-[var(--t0)] [&_[data-icon]]:!text-[var(--bad)]',
          warning:
            '!bg-[var(--bg-1)] !border-[var(--warn)]/40 !text-[var(--t0)] [&_[data-icon]]:!text-[var(--warn)]',
          info:
            '!bg-[var(--bg-1)] !border-[var(--info)]/40 !text-[var(--t0)] [&_[data-icon]]:!text-[var(--info)]',
        },
      }}
      {...props}
    />
  );
};

export { toast };
export default Toaster;
