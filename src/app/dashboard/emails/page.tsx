'use client';

import React, { useState, useEffect } from 'react';
import { 
  Mail, Plus, Copy, Check, Clock, Trash2, 
  Sparkles, RefreshCw 
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MailboxListSkeleton } from '@/components/ui/Skeleton';
import { LottieLoader } from '@/components/ui/LottieLoader';
import { toast } from '@/components/ui/toast';
import { EmailAddress } from '@/types';

export default function EmailsPage() {
  const [emails, setEmails] = useState<EmailAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [customPrefix, setCustomPrefix] = useState('');
  const [customTag, setCustomTag] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [messageToast, setMessageToast] = useState<string | null>(null);
  const [now] = useState(() => Date.now());

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/email/generate?userId=user-demo-1');
      const data = await res.json();
      if (data.emails) setEmails(data.emails);
    } catch (err) {
      console.error('Failed to fetch mailboxes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  const handleCopy = (id: string, email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedId(id);
    toast.success('Email copied to clipboard!', { description: email });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsGenerating(true);
      const res = await fetch('/api/email/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user-demo-1',
          customPrefix: customPrefix.trim() || undefined,
          userServiceTag: customTag.trim() || undefined,
          expiresInMinutes: 60,
        }),
      });
      const data = await res.json();
      if (data.success && data.emailAddress) {
        setEmails([data.emailAddress, ...emails]);
        setCustomPrefix('');
        setCustomTag('');
        setMessageToast(`Created temporary mailbox ${data.emailAddress.email_address}`);
        toast.success('Temporary mailbox created!', {
          description: data.emailAddress.email_address,
        });
        setTimeout(() => setMessageToast(null), 3500);
      }
    } catch {
      setMessageToast('Failed to create mailbox.');
      toast.error('Failed to create mailbox');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExtend = async (emailId: string) => {
    try {
      const res = await fetch('/api/email/extend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailAddressId: emailId, additionalMinutes: 60 }),
      });
      const data = await res.json();
      if (data.success && data.emailAddress) {
        setEmails(emails.map((e) => (e.id === emailId ? data.emailAddress : e)));
        setMessageToast('Mailbox lifetime extended by 60 minutes.');
        toast.success('Mailbox extended!', {
          description: 'Added 60 minutes to active inbox lifetime.',
        });
        setTimeout(() => setMessageToast(null), 3000);
      }
    } catch {
      setMessageToast('Failed to extend mailbox lifetime.');
      toast.error('Failed to extend mailbox');
    }
  };

  const handleDelete = async (emailId: string) => {
    try {
      await fetch('/api/email/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailAddressId: emailId, userId: 'user-demo-1' }),
      });
      setEmails(emails.filter((e) => e.id !== emailId));
      setMessageToast('Temporary mailbox permanently deleted.');
      toast.error('Temporary mailbox deleted', {
        description: 'Mailbox and associated messages were permanently removed.',
      });
      setTimeout(() => setMessageToast(null), 2500);
    } catch {
      setMessageToast('Failed to delete mailbox.');
      toast.error('Failed to delete mailbox');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-[var(--t0)]">
      {isGenerating && (
        <LottieLoader
          overlay
          size="md"
          text="Instantiating temporary mailbox..."
          subtext="Configuring catch-all DNS routing on mail.omnibey.com..."
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--t0)] flex items-center gap-2.5">
            <Mail className="w-6 h-6 text-[var(--acc)]" />
            Temporary Email Mailboxes
          </h1>
          <p className="mt-1 text-xs text-[var(--t2)] font-medium">
            Dynamically instantiated catch-all mailboxes. Manage lifetimes, tags, and incoming messages.
          </p>
        </div>

        <Button
          onClick={fetchEmails}
          variant="outline"
          size="sm"
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
        >
          Refresh
        </Button>
      </div>

      {messageToast && (
        <div className="flex items-center gap-2.5 rounded-[12px] bg-[var(--acc-soft)] border border-[var(--acc)]/30 p-3.5 text-xs text-[var(--acc)] font-bold animate-fade-in">
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>{messageToast}</span>
        </div>
      )}

      {/* Creation Box */}
      <Card className="p-5 bg-[var(--bg-2)] border-[var(--line)]">
        <form onSubmit={handleGenerate} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-5">
            <label className="block text-xs font-bold text-[var(--t1)] mb-1 uppercase tracking-wider">
              Custom Prefix (Optional)
            </label>
            <div className="flex rounded-[11px] border border-[var(--line)] bg-[var(--bg-3)] overflow-hidden text-xs">
              <input
                type="text"
                placeholder="e.g. quickbox99"
                value={customPrefix}
                onChange={(e) => setCustomPrefix(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                className="w-full px-3 py-2 bg-transparent text-[var(--t0)] placeholder-[var(--t2)] focus:outline-none font-mono"
              />
              <span className="px-3 py-2 bg-[var(--bg-inset)] border-l border-[var(--line)] text-[var(--t2)] font-mono font-medium">
                @omnibey.com
              </span>
            </div>
          </div>

          <div className="sm:col-span-4">
            <label className="block text-xs font-bold text-[var(--t1)] mb-1 uppercase tracking-wider">
              Service Tag (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Discord, OpenAI, Steam"
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              className="w-full px-3 py-2 rounded-[11px] border border-[var(--line)] bg-[var(--bg-3)] text-[var(--t0)] placeholder-[var(--t2)] text-xs focus:outline-none focus:border-[var(--acc)] font-medium"
            />
          </div>

          <div className="sm:col-span-3">
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full"
              isLoading={isGenerating}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Generate Mailbox
            </Button>
          </div>
        </form>
      </Card>

      {/* Email List */}
      {loading ? (
        <MailboxListSkeleton />
      ) : emails.length === 0 ? (
        <Card className="p-12 text-center text-[var(--t2)] bg-[var(--bg-2)] border-[var(--line)]">
          <Mail className="w-8 h-8 mx-auto mb-2 text-[var(--t2)] opacity-60" />
          <h3 className="text-sm font-bold text-[var(--t0)]">No active mailboxes</h3>
          <p className="text-xs text-[var(--t2)] mt-1 max-w-sm mx-auto">
            Generate your first disposable email address using the form above.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {emails.map((e) => {
            const isExpired = new Date(e.expires_at).getTime() < now || e.status === 'expired';

            return (
              <Card key={e.id} className="p-4 bg-[var(--bg-2)] border-[var(--line)]" hoverEffect>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm sm:text-base font-bold text-[var(--t0)]">
                        {e.email_address}
                      </span>
                      <Badge variant={isExpired ? 'danger' : 'success'} size="sm">
                        {isExpired ? 'Expired' : 'Active'}
                      </Badge>
                      {e.user_service_tag && (
                        <Badge variant="neutral" size="sm">
                          Tag: {e.user_service_tag}
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--t2)]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Expires: {new Date(e.expires_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span>•</span>
                      <span>Messages: <strong className="text-[var(--t0)]">{e.message_count}</strong></span>
                      <span>•</span>
                      <span>OTPs: <strong className="text-[var(--ok)]">{e.otp_count}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      onClick={() => handleCopy(e.id, e.email_address)}
                      variant="outline"
                      size="sm"
                      leftIcon={copiedId === e.id ? <Check className="w-3.5 h-3.5 text-[var(--ok)]" /> : <Copy className="w-3.5 h-3.5" />}
                    >
                      {copiedId === e.id ? 'Copied' : 'Copy'}
                    </Button>

                    <Button
                      onClick={() => handleExtend(e.id)}
                      variant="ghost"
                      size="sm"
                      title="Extend lifetime by 60 minutes"
                    >
                      +60m
                    </Button>

                    <button
                      onClick={() => handleDelete(e.id)}
                      className="p-2 text-[var(--bad)] hover:bg-[var(--bad-soft)] rounded-[10px] transition-colors cursor-pointer"
                      title="Delete mailbox"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
