'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Copy, Check, RefreshCw, Clock, Plus, 
  Send, Sparkles, Mail, Lock, ShieldCheck, ArrowRight
} from 'lucide-react';
import { toast } from '@/components/ui/toast';
import { EmailAddress } from '@/types';

export interface QuickEmailGeneratorProps {
  initialEmail?: EmailAddress | null;
  userId?: string;
  onEmailChanged?: (email: EmailAddress) => void;
  onMessageReceived?: () => void;
}

function formatCountdown(expiresAt: string, now: number): { formatted: string; isExpiringSoon: boolean; isExpired: boolean } {
  const diff = new Date(expiresAt).getTime() - now;
  if (diff <= 0) {
    return { formatted: '00:00', isExpiringSoon: true, isExpired: true };
  }
  const totalSeconds = Math.floor(diff / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return {
    formatted: `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
    isExpiringSoon: minutes < 5,
    isExpired: false,
  };
}

export const QuickEmailGenerator: React.FC<QuickEmailGeneratorProps> = ({
  initialEmail,
  userId = 'user-demo-1',
  onEmailChanged,
  onMessageReceived,
}) => {
  const [mailboxTab, setMailboxTab] = useState<'temporary' | 'permanent'>('temporary');
  const [generatedEmail, setGeneratedEmail] = useState<EmailAddress | null>(null);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExtending, setIsExtending] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [now, setNow] = useState<number>(() => Date.now());

  // Permanent tab email state
  const [permanentAlias, setPermanentAlias] = useState('myname');

  const currentEmail = generatedEmail ?? initialEmail ?? null;
  const displayAddress = currentEmail ? currentEmail.email_address : 'quickbox47@omnibey.com';

  // Real-time clock tick for countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const countdown = currentEmail && currentEmail.status === 'active'
    ? formatCountdown(currentEmail.expires_at, now)
    : { formatted: '57:43', isExpiringSoon: false, isExpired: false };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(displayAddress);
    setCopied(true);
    setFeedbackMsg('Email address copied to clipboard!');
    toast.success('Email copied to clipboard!', {
      description: displayAddress,
    });
    setTimeout(() => {
      setCopied(false);
      setFeedbackMsg(null);
    }, 2500);
  };

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      const res = await fetch('/api/email/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          expiresInMinutes: 60,
        }),
      });
      const data = await res.json();
      if (data.success && data.emailAddress) {
        setGeneratedEmail(data.emailAddress);
        onEmailChanged?.(data.emailAddress);
        setFeedbackMsg(`Generated new address: ${data.emailAddress.email_address}`);
        toast.success('New temporary email created!', {
          description: data.emailAddress.email_address,
        });
        setTimeout(() => setFeedbackMsg(null), 3000);
      }
    } catch {
      setFeedbackMsg('Failed to generate email');
      toast.error('Failed to generate email address');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExtend = async () => {
    if (!currentEmail) {
      toast.success('Extended mailbox lifetime!', {
        description: 'Added 60 minutes to active inbox lifetime.',
      });
      return;
    }
    try {
      setIsExtending(true);
      const res = await fetch('/api/email/extend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailAddressId: currentEmail.id,
          additionalMinutes: 60,
        }),
      });
      const data = await res.json();
      if (data.success && data.emailAddress) {
        setGeneratedEmail(data.emailAddress);
        setFeedbackMsg('Extended lifetime by 60 minutes!');
        toast.success('Mailbox extended successfully!', {
          description: 'Added 60 minutes to active inbox lifetime.',
        });
        setTimeout(() => setFeedbackMsg(null), 3000);
      }
    } catch {
      setFeedbackMsg('Failed to extend lifetime');
      toast.error('Failed to extend mailbox lifetime');
    } finally {
      setIsExtending(false);
    }
  };

  const handleSimulateIncoming = async (service: string = 'Discord') => {
    if (!currentEmail) {
      toast.success(`Verification email simulated from ${service}!`, {
        description: `OTP code: 849204 sent to ${displayAddress}. Check your dashboard.`,
      });
      return;
    }
    try {
      setIsSimulating(true);
      const res = await fetch('/api/email/simulate-incoming', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailAddressId: currentEmail.id,
          customService: service,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg(`Received test OTP message from ${service}!`);
        toast.success(`Verification email sent from ${service}!`, {
          description: 'New incoming message arrived in your dashboard inbox.',
        });
        onMessageReceived?.();
        setTimeout(() => setFeedbackMsg(null), 4000);
      }
    } catch {
      setFeedbackMsg('Failed to simulate test email');
      toast.error('Failed to send test simulation email');
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-[20px] border border-[var(--line)] bg-[var(--bg-1)] p-5 sm:p-7 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.12)] dark:shadow-[0_25px_60px_-20px_rgba(0,0,0,0.65)] backdrop-blur-xl transition-all">
      {/* Decorative radial gradient glow */}
      <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-gradient-to-br from-[#6366F1]/20 via-[#4F46E5]/10 to-transparent blur-3xl pointer-events-none" />

      {/* Tabs at the very top: [⚡ Temporary] and [🔒 Permanent] */}
      <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[var(--line)]">
        <button
          type="button"
          onClick={() => setMailboxTab('temporary')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-[10px] text-xs font-bold transition-all cursor-pointer ${
            mailboxTab === 'temporary'
              ? 'bg-gradient-to-r from-[#6366F1]/15 to-[#4F46E5]/15 text-[#6366F1] dark:text-[#818cf8] border border-[#6366F1]/35 shadow-sm'
              : 'text-[var(--t2)] opacity-70 hover:opacity-100 hover:text-[var(--t0)] hover:bg-[var(--bg-3)] border border-transparent'
          }`}
        >
          <span>⚡</span>
          <span>Temporary</span>
        </button>

        <button
          type="button"
          onClick={() => setMailboxTab('permanent')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-[10px] text-xs font-bold transition-all cursor-pointer ${
            mailboxTab === 'permanent'
              ? 'bg-gradient-to-r from-[#6366F1]/15 to-[#4F46E5]/15 text-[#6366F1] dark:text-[#818cf8] border border-[#6366F1]/35 shadow-sm'
              : 'text-[var(--t2)] opacity-70 hover:opacity-100 hover:text-[var(--t0)] hover:bg-[var(--bg-3)] border border-transparent'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Permanent</span>
        </button>
      </div>

      {/* TAB 1: TEMPORARY MAILBOX CARD */}
      {mailboxTab === 'temporary' ? (
        <div className="space-y-4 animate-fade-in">
          {/* Header Info: Left title & catch-all, Right green pill countdown & '+' icon */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[#6366F1]/15 text-[#6366F1] dark:text-[#818cf8]">
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-[var(--t0)] leading-tight">
                  Active Temporary Mailbox
                </h2>
                <p className="text-xs text-[var(--t2)] font-medium">
                  Catch-all routing via mail.omnibey.com
                </p>
              </div>
            </div>

            {/* Right: Green pill badge & '+' icon */}
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#10b981]/12 text-[#10b981] border border-[#10b981]/25">
                <Clock className="w-3.5 h-3.5 animate-pulse" />
                <span>
                  Expires in: <strong>{countdown.formatted}</strong>
                </span>
              </div>

              <button
                type="button"
                onClick={handleExtend}
                disabled={isExtending}
                title="Extend by 60 minutes"
                className="p-1 rounded-[8px] text-[var(--t2)] hover:text-[#6366F1] hover:bg-[var(--bg-3)] transition-colors cursor-pointer"
                aria-label="Extend mailbox lifetime"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Middle: Prominent email field + Purple Copy button + Bordered New button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative flex-1 group">
              <input
                type="text"
                readOnly
                value={displayAddress}
                className="w-full font-mono text-sm sm:text-base font-bold text-[var(--t0)] bg-[var(--bg-3)] border border-[var(--line)] rounded-[13px] px-4 py-3 focus:outline-none focus:border-[#6366F1] select-all transition-all shadow-inner"
              />
            </div>

            <div className="flex items-center gap-2">
              {/* Copy button (Purple) */}
              <button
                type="button"
                onClick={copyToClipboard}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-3 rounded-[12px] bg-[#6366F1] hover:bg-[#4F46E5] text-white font-bold text-xs shadow-md shadow-[#6366F1]/25 active:scale-95 transition-all cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>

              {/* New button (Bordered) */}
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                title="Generate a brand new temporary mailbox"
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-3 rounded-[12px] border border-[var(--line-2)] bg-[var(--bg-1)] hover:bg-[var(--bg-3)] text-[var(--t0)] font-bold text-xs active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>New</span>
              </button>
            </div>
          </div>

          {/* Feedback Msg */}
          {feedbackMsg && (
            <div className="flex items-center gap-2 rounded-[11px] bg-[#6366F1]/10 border border-[#6366F1]/25 px-3 py-1.5 text-xs text-[#6366F1] dark:text-[#818cf8] font-bold animate-fade-in">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>{feedbackMsg}</span>
            </div>
          )}

          {/* Bottom Row: Instant Test Simulation (Left) & Messages/OTPs count (Right) */}
          <div className="pt-3 border-t border-[var(--line)] flex flex-wrap items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-2 text-[var(--t2)] font-medium">
              <Send className="w-3.5 h-3.5 text-[#6366F1]" />
              <span className="font-semibold text-[var(--t1)]">Instant Test Simulation:</span>
              <button
                type="button"
                onClick={() => handleSimulateIncoming('Discord')}
                disabled={isSimulating}
                className="font-bold text-[#6366F1] dark:text-[#818cf8] hover:underline cursor-pointer"
              >
                Discord OTP
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => handleSimulateIncoming('GitHub')}
                disabled={isSimulating}
                className="font-bold text-[#6366F1] dark:text-[#818cf8] hover:underline cursor-pointer"
              >
                GitHub
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => handleSimulateIncoming('OpenAI')}
                disabled={isSimulating}
                className="font-bold text-[#6366F1] dark:text-[#818cf8] hover:underline cursor-pointer"
              >
                OpenAI
              </button>
            </div>

            <div className="text-[var(--t2)] text-[11px] font-mono">
              Messages: <strong className="text-[var(--t0)]">{currentEmail?.message_count || 0}</strong> | OTPs:{' '}
              <strong className="text-[#10b981]">{currentEmail?.otp_count || 0}</strong>
            </div>
          </div>
        </div>
      ) : (
        /* TAB 2: PERMANENT INBOX PREVIEW CARD */
        <div className="space-y-4 animate-fade-in">
          {/* Header Info */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[#6366F1]/15 text-[#6366F1]">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-[var(--t0)] leading-tight">
                  Permanent Private Mailbox
                </h2>
                <p className="text-xs text-[var(--t2)] font-medium">
                  Custom personal alias with lifetime zero-spam retention
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#6366F1]/12 text-[#6366F1] dark:text-[#818cf8] border border-[#6366F1]/25">
              <span>Lifetime • Never Expires</span>
            </div>
          </div>

          {/* Middle: Custom Alias Box */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative flex-1 flex items-center bg-[var(--bg-3)] border border-[var(--line)] rounded-[13px] px-3 py-2 shadow-inner">
              <input
                type="text"
                value={permanentAlias}
                onChange={(e) => setPermanentAlias(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''))}
                placeholder="choose-alias"
                className="flex-1 font-mono text-sm sm:text-base font-bold text-[var(--t0)] bg-transparent focus:outline-none"
              />
              <span className="font-mono text-xs sm:text-sm text-[var(--t2)] font-bold select-none pr-1">
                @omnibey.com
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/signup" className="flex-1 sm:flex-initial">
                <button
                  type="button"
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-3 rounded-[12px] bg-gradient-to-r from-[#6366F1] to-[#4F46E5] text-white font-bold text-xs shadow-md shadow-[#6366F1]/25 active:scale-95 transition-all cursor-pointer"
                >
                  <span>Claim Alias</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </Link>
              <Link href="/login" className="flex-1 sm:flex-initial">
                <button
                  type="button"
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-3 rounded-[12px] border border-[var(--line-2)] bg-[var(--bg-1)] hover:bg-[var(--bg-3)] text-[var(--t0)] font-bold text-xs active:scale-95 transition-all cursor-pointer"
                >
                  Sign In
                </button>
              </Link>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="pt-3 border-t border-[var(--line)] flex flex-wrap items-center justify-between gap-2.5 text-xs text-[var(--t2)]">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
              <span>Zero-knowledge client encryption • Automated OTP alerts</span>
            </div>
            <div className="font-mono text-[11px]">
              Available on <strong className="text-[var(--t0)]">OmniMail Pro</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickEmailGenerator;
