'use client';

import React, { useState, useEffect } from 'react';
import { 
  Copy, Check, RefreshCw, Clock, PlusCircle, 
  Send, Sparkles, AlertCircle, Mail 
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

export const QuickEmailGenerator: React.FC<QuickEmailGeneratorProps> = ({
  initialEmail,
  userId = 'user-demo-1',
  onEmailChanged,
  onMessageReceived,
}) => {
  const [currentEmail, setCurrentEmail] = useState<EmailAddress | null>(initialEmail || null);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('00:00');
  const [isExpiringSoon, setIsExpiringSoon] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExtending, setIsExtending] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [serviceTag, setServiceTag] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // If initialEmail changes, update state
  useEffect(() => {
    if (initialEmail) {
      setCurrentEmail(initialEmail);
    }
  }, [initialEmail]);

  // Countdown timer calculation
  useEffect(() => {
    if (!currentEmail || currentEmail.status !== 'active') {
      setTimeLeft('Expired');
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const expiry = new Date(currentEmail.expires_at).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeLeft('00:00');
        setIsExpiringSoon(true);
        setCurrentEmail(prev => prev ? { ...prev, status: 'expired' } : null);
        clearInterval(interval);
      } else {
        const totalSeconds = Math.floor(diff / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        setIsExpiringSoon(minutes < 5);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentEmail]);

  const copyToClipboard = () => {
    if (!currentEmail) return;
    navigator.clipboard.writeText(currentEmail.email_address);
    setCopied(true);
    setFeedbackMsg('Email copied to clipboard!');
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
          userServiceTag: serviceTag || undefined,
          expiresInMinutes: 60,
        }),
      });
      const data = await res.json();
      if (data.success && data.emailAddress) {
        setCurrentEmail(data.emailAddress);
        onEmailChanged?.(data.emailAddress);
        setFeedbackMsg(`Generated new address: ${data.emailAddress.email_address}`);
        setTimeout(() => setFeedbackMsg(null), 3000);
      }
    } catch {
      setFeedbackMsg('Error generating mailbox');
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
        setCurrentEmail(data.emailAddress);
        setFeedbackMsg('Mailbox lifetime extended by 60 minutes.');
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
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 md:p-6 shadow-xl shadow-slate-900/5 transition-all">
      {/* Decorative gradient glow */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 h-40 w-40 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 blur-3xl pointer-events-none" />

      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
            <Mail className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Active Temporary Mailbox
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Catch-all routing via mail.omnibey.com
            </p>
          </div>
        </div>

        {/* Expiration countdown pill */}
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium ${
            isExpiringSoon
              ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20 dark:bg-rose-500/20 dark:text-rose-400'
              : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400'
          }`}>
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            <span>Expires in: <strong>{timeLeft}</strong></span>
          </div>

          <button
            onClick={handleExtend}
            disabled={isExtending || !currentEmail}
            title="Extend by 60 minutes"
            className="p-1 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
            className="w-full font-mono text-base md:text-lg font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 select-all transition-all"
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
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 text-xs text-indigo-700 dark:text-indigo-300 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Simulator Tools & Quick Tags for fast testing */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
          <Send className="w-3.5 h-3.5 text-indigo-500" />
          <span>Instant Test Simulation:</span>
          <button
            onClick={() => handleSimulateIncoming('Discord')}
            disabled={isSimulating || !currentEmail}
            className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Discord OTP
          </button>
          <span>•</span>
          <button
            onClick={() => handleSimulateIncoming('GitHub')}
            disabled={isSimulating || !currentEmail}
            className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            GitHub
          </button>
          <span>•</span>
          <button
            onClick={() => handleSimulateIncoming('OpenAI')}
            disabled={isSimulating || !currentEmail}
            className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            OpenAI
          </button>
        </div>

        <div className="text-slate-400 text-[11px]">
          Messages: <strong className="text-slate-700 dark:text-slate-200">{currentEmail?.message_count || 0}</strong> | OTPs: <strong className="text-emerald-600 dark:text-emerald-400">{currentEmail?.otp_count || 0}</strong>
        </div>
      </div>
    </div>
  );
};
