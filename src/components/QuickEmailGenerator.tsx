'use client';

import React, { useState, useEffect } from 'react';
import { 
  Copy, Check, RefreshCw, Clock, PlusCircle, 
  Send, Sparkles, Mail 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmailAddress } from '@/types';

interface QuickEmailGeneratorProps {
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
  const [generatedEmail, setGeneratedEmail] = useState<EmailAddress | null>(null);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExtending, setIsExtending] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [now, setNow] = useState<number>(() => Date.now());

  const currentEmail = generatedEmail ?? initialEmail ?? null;

  // Real-time clock tick for smooth countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const countdown = currentEmail && currentEmail.status === 'active'
    ? formatCountdown(currentEmail.expires_at, now)
    : { formatted: 'Expired', isExpiringSoon: true, isExpired: true };

  const copyToClipboard = () => {
    if (!currentEmail) return;
    navigator.clipboard.writeText(currentEmail.email_address);
    setCopied(true);
    setFeedbackMsg('Email address copied to clipboard!');
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
        setTimeout(() => setFeedbackMsg(null), 3000);
      }
    } catch {
      setFeedbackMsg('Failed to generate email');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExtend = async () => {
    if (!currentEmail) return;
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
        setTimeout(() => setFeedbackMsg(null), 3000);
      }
    } catch {
      setFeedbackMsg('Failed to extend lifetime');
    } finally {
      setIsExtending(false);
    }
  };

  const handleSimulateIncoming = async (service: string = 'Discord') => {
    if (!currentEmail) return;
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
        onMessageReceived?.();
        setTimeout(() => setFeedbackMsg(null), 4000);
      }
    } catch {
      setFeedbackMsg('Failed to simulate test email');
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-[18px] border border-[var(--line)] bg-[var(--bg-2)] p-5 md:p-6 shadow-[var(--shadow)] transition-all">
      {/* Decorative gradient glow */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 h-40 w-40 rounded-full bg-[var(--acc-soft)] blur-3xl pointer-events-none" />

      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--line)]">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[var(--acc-soft)] text-[var(--acc)]">
            <Mail className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-[var(--t0)]">
              Active Temporary Mailbox
            </h2>
            <p className="text-xs text-[var(--t2)] font-medium">
              Catch-all routing via mail.omnibey.com
            </p>
          </div>
        </div>

        {/* Expiration countdown pill */}
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold ${
              countdown.isExpiringSoon
                ? 'bg-[var(--bad-soft)] text-[var(--bad)] border border-[var(--bad)]/30'
                : 'bg-[var(--ok-soft)] text-[var(--ok)] border border-[var(--ok)]/30'
            }`}
          >
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            <span>Expires in: <strong>{countdown.formatted}</strong></span>
          </div>

          <button
            onClick={handleExtend}
            disabled={isExtending || !currentEmail}
            title="Extend by 60 minutes"
            className="p-1 rounded-[8px] text-[var(--t2)] hover:text-[var(--t0)] hover:bg-[var(--bg-3)] transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Email Address Display Box */}
      <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1 group">
          <input
            type="text"
            readOnly
            value={currentEmail ? currentEmail.email_address : 'Generating address...'}
            className="w-full font-mono text-sm md:text-base font-bold text-[var(--t0)] bg-[var(--bg-3)] border border-[var(--line)] rounded-[13px] px-4 py-3 focus:outline-none focus:border-[var(--acc)] select-all transition-all"
          />
          {currentEmail?.user_service_tag && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:block">
              <Badge variant="neutral" size="sm">
                Tag: {currentEmail.user_service_tag}
              </Badge>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            onClick={copyToClipboard}
            variant="primary"
            size="md"
            className="flex-1 sm:flex-initial"
            leftIcon={copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
          >
            {copied ? 'Copied!' : 'Copy'}
          </Button>

          <Button
            onClick={handleGenerate}
            variant="outline"
            size="md"
            isLoading={isGenerating}
            leftIcon={<RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />}
            title="Generate a brand new temporary mailbox"
          >
            New
          </Button>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedbackMsg && (
        <div className="mt-3 flex items-center gap-2 rounded-[11px] bg-[var(--acc-soft)] border border-[var(--acc)]/30 px-3 py-1.5 text-xs text-[var(--acc)] font-bold animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Simulator Tools & Quick Tags for fast testing */}
      <div className="mt-4 pt-3 border-t border-[var(--line)] flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-[var(--t2)] font-medium">
          <Send className="w-3.5 h-3.5 text-[var(--acc)]" />
          <span>Instant Test Simulation:</span>
          <button
            onClick={() => handleSimulateIncoming('Discord')}
            disabled={isSimulating || !currentEmail}
            className="font-bold text-[var(--acc)] hover:underline cursor-pointer"
          >
            Discord OTP
          </button>
          <span>•</span>
          <button
            onClick={() => handleSimulateIncoming('GitHub')}
            disabled={isSimulating || !currentEmail}
            className="font-bold text-[var(--acc)] hover:underline cursor-pointer"
          >
            GitHub
          </button>
          <span>•</span>
          <button
            onClick={() => handleSimulateIncoming('OpenAI')}
            disabled={isSimulating || !currentEmail}
            className="font-bold text-[var(--acc)] hover:underline cursor-pointer"
          >
            OpenAI
          </button>
        </div>

        <div className="text-[var(--t2)] text-[11px] font-mono">
          Messages: <strong className="text-[var(--t0)]">{currentEmail?.message_count || 0}</strong> | OTPs: <strong className="text-[var(--ok)]">{currentEmail?.otp_count || 0}</strong>
        </div>
      </div>
    </div>
  );
};
