'use client';

import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  glass?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hoverEffect = false,
  glass = false,
  ...props
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'rounded-2xl border transition-all duration-200',
          glass
            ? 'glass-panel text-slate-100'
            : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-sm',
          hoverEffect && 'hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700/80',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
