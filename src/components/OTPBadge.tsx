'use client';

import React, { useState } from 'react';
import { ShieldCheck, Copy, Check, Info } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { OTPConfidence } from '@/types';

interface OTPBadgeProps {
  code: string;
  confidence?: OTPConfidence;
  className?: string;
}

export const OTPBadge: React.FC<OTPBadgeProps> = ({
  code,
  confidence = 'high',
  className = '',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const confidenceVariants: Record<OTPConfidence, 'success' | 'warning' | 'primary'> = {
    high: 'success',
    medium: 'warning',
    low: 'primary',
  };

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 transition-all duration-200 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Detected verification code
              </span>
              <Badge variant={confidenceVariants[confidence]} size="sm">
                {confidence} confidence
              </Badge>
            </div>
            <div className="mt-1 font-mono text-2xl font-bold tracking-widest text-slate-900 dark:text-white">
              {code}
            </div>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 active:scale-95 transition-all"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              <span>Copy Code</span>
            </>
          )}
        </button>
      </div>

      <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 border-t border-emerald-500/15 pt-2">
        <Info className="h-3.5 w-3.5 shrink-0 text-emerald-600/70 dark:text-emerald-400/70" />
        <span>Heuristic extraction estimate based on email message pattern matching.</span>
      </div>
    </div>
  );
};
