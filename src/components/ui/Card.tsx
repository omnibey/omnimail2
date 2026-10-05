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
          'rounded-[18px] border transition-all duration-200',
          glass
            ? 'glass-panel text-[var(--t0)]'
            : 'bg-[var(--bg-2)] border-[var(--line)] shadow-[var(--shadow)] text-[var(--t0)]',
          hoverEffect && 'hover:border-[var(--line-2)] hover:shadow-lg hover:-translate-y-0.5',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
