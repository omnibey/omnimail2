'use client';

import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral' | 'outline' | 'info';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'neutral',
  size = 'md',
  ...props
}) => {
  const base = 'inline-flex items-center font-bold rounded-[8px] tracking-wide select-none';

  const variants = {
    primary: 'bg-[var(--acc-soft)] text-[var(--acc)] border border-[var(--acc)]/30',
    success: 'bg-[var(--ok-soft)] text-[var(--ok)] border border-[var(--ok)]/30',
    warning: 'bg-[var(--warn-soft)] text-[var(--warn)] border border-[var(--warn)]/30',
    danger: 'bg-[var(--bad-soft)] text-[var(--bad)] border border-[var(--bad)]/30',
    info: 'bg-[var(--info-soft)] text-[var(--info)] border border-[var(--info)]/30',
    neutral: 'bg-[var(--bg-3)] text-[var(--t1)] border border-[var(--line)]',
    outline: 'bg-transparent text-[var(--t1)] border border-[var(--line)]',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-0.5 gap-1.5',
  };

  return (
    <span className={twMerge(clsx(base, variants[variant], sizes[size], className))} {...props}>
      {children}
    </span>
  );
};
