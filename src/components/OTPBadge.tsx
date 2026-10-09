'use client';

import React, { useState } from 'react';
import { ShieldCheck, Copy, Check, Info } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { toast } from '@/components/ui/toast';
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
    toast.success('OTP code copied to clipboard!', {
      description: `Verification token: ${code}`,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const confidenceVariants: Record<OTPConfidence, 'success' | 'warning' | 'primary'> = {
    high: 'success',
    medium: 'warning',
    low: 'primary',
  };

  return (
    <div
      className={`relative overflow-hidden rounded-[16px] border border-[var(--ok)]/30 bg-[var(--ok-soft)] p-4 transition-all duration-200 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] bg-[var(--ok)]/20 text-[var(--ok)] border border-[var(--ok)]/30">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--ok)]">
                Extracted OTP / Verification Code
              </span>
              <Badge variant={confidenceVariants[confidence]} size="sm">
                {confidence} confidence
              </Badge>
            </div>
            <div className="mt-1 font-mono text-2xl font-extrabold tracking-widest text-[var(--t0)]">
              {code}
            </div>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="inline-flex items-center justify-center gap-2 rounded-[11px] bg-[var(--ok)] px-4 py-2 text-xs font-extrabold text-white shadow-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              <span>Copy OTP</span>
            </>
          )}
        </button>
      </div>

      <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-[var(--t2)] border-t border-[var(--ok)]/15 pt-2 font-medium">
        <Info className="h-3.5 w-3.5 shrink-0 text-[var(--ok)]" />
        <span>Automatic heuristic verification code extraction engine.</span>
      </div>
    </div>
  );
};
