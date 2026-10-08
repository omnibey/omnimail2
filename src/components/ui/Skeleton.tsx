'use client';

import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: 'rect' | 'circle' | 'text';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rect',
  ...props
}) => {
  const variantStyles = {
    rect: 'rounded-[12px]',
    circle: 'rounded-full',
    text: 'rounded-[6px] h-3.5',
  };

  return (
    <div
      className={`skeleton-shimmer ${variantStyles[variant]} ${className}`}
      {...props}
    />
  );
};

export const MetricsGridSkeleton: React.FC = () => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="p-4 rounded-[18px] border border-[var(--line)] bg-[var(--bg-2)] space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-20" />
          <Skeleton variant="circle" className="w-5 h-5" />
        </div>
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-2.5 w-24" />
      </div>
    ))}
  </div>
);

export const MailboxListSkeleton: React.FC = () => (
  <div className="space-y-3 animate-fade-in">
    {[1, 2, 3].map((i) => (
      <div key={i} className="p-4 rounded-[18px] border border-[var(--line)] bg-[var(--bg-2)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-48 font-mono" />
            <Skeleton className="h-5 w-16 rounded-[8px]" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-20 rounded-[10px]" />
          <Skeleton className="h-8 w-14 rounded-[10px]" />
          <Skeleton className="h-8 w-8 rounded-[10px]" />
        </div>
      </div>
    ))}
  </div>
);

export const InboxSplitSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px] animate-fade-in">
    {/* Left column list */}
    <div className="lg:col-span-5 space-y-2.5">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="p-4 rounded-[16px] border border-[var(--line)] bg-[var(--bg-2)] space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-2.5 w-12" />
          </div>
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-3 w-full" />
          <div className="pt-2 border-t border-[var(--line)] flex items-center justify-between">
            <Skeleton className="h-5 w-24 rounded-[6px]" />
            <Skeleton className="h-2.5 w-16" />
          </div>
        </div>
      ))}
    </div>

    {/* Right column view */}
    <div className="lg:col-span-7">
      <div className="p-6 rounded-[18px] border border-[var(--line)] bg-[var(--bg-2)] h-full space-y-4">
        <div className="pb-4 border-b border-[var(--line)] space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-3.5 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
        <Skeleton className="h-20 w-full rounded-[14px]" />
        <div className="space-y-2 pt-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    </div>
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="rounded-[18px] border border-[var(--line)] bg-[var(--bg-2)] overflow-hidden animate-fade-in">
    <div className="p-4 border-b border-[var(--line)] bg-[var(--bg-3)]/60 flex items-center justify-between">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-20" />
    </div>
    <div className="divide-y divide-[var(--line)]">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 flex items-center justify-between gap-4">
          <Skeleton className="h-4 w-36 font-mono" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-20 rounded-[8px]" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  </div>
);

export const PackagesGridSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
    {[1, 2, 3].map((i) => (
      <div key={i} className="p-6 rounded-[18px] border border-[var(--line)] bg-[var(--bg-2)] space-y-5">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-3.5 w-48" />
        <Skeleton className="h-8 w-24" />
        <div className="space-y-2.5 pt-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
          <Skeleton className="h-3 w-4/6" />
        </div>
        <Skeleton className="h-10 w-full rounded-[13px]" />
      </div>
    ))}
  </div>
);
