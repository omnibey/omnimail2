'use client';

import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  leftIcon,
  rightIcon,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-bold rounded-[13px] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--acc)] focus:ring-offset-1 focus:ring-offset-[var(--bg-0)] disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98] cursor-pointer';

  const variants = {
    primary:
      'bg-[var(--acc)] hover:bg-[var(--acc-2)] text-white shadow-[0_10px_24px_-10px_var(--acc-soft)] border border-[var(--acc)]/30',
    secondary:
      'bg-[var(--bg-3)] hover:bg-[var(--bg-2)] text-[var(--t0)] border border-[var(--line)] hover:border-[var(--line-2)] shadow-sm',
    outline:
      'bg-transparent border border-[var(--line)] text-[var(--t0)] hover:bg-[var(--bg-3)] hover:border-[var(--line-2)]',
    ghost:
      'bg-transparent hover:bg-[var(--bg-3)] text-[var(--t1)] hover:text-[var(--t0)]',
    danger:
      'bg-[var(--bad)] hover:opacity-90 text-white shadow-sm border border-[var(--bad)]/30',
    success:
      'bg-[var(--ok)] hover:opacity-90 text-white shadow-sm border border-[var(--ok)]/30',
  };

  const sizes = {
    sm: 'text-xs h-8 px-3 gap-1.5',
    md: 'text-[13px] h-10 px-4 gap-2',
    lg: 'text-sm h-11 px-5 gap-2.5',
  };

  return (
    <button
      className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-0.5 mr-2 h-3.5 w-3.5 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : leftIcon ? (
        <span className="shrink-0">{leftIcon}</span>
      ) : null}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
