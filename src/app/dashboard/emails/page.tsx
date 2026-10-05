'use client';

import React, { useState, useEffect } from 'react';
import { 
  Mail, Plus, Copy, Check, Clock, Trash2, 
  ExternalLink, Sparkles, AlertCircle 
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmailAddress } from '@/types';

export default function EmailsPage() {
  const [emails, setEmails] = useState<EmailAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [customPrefix, setCustomPrefix] = useState('');
  const [customTag, setCustomTag] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [messageToast, setMessageToast] = useState<string | null>(null);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/email/generate?userId=user-demo-1');
      const data = await res.json();
      if (data.emails) setEmails(data.emails);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const [now] = useState(() => Date.now());

  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        const res = await fetch('/api/email/generate?userId=user-demo-1');
        const data = await res.json();
        if (!ignore && data.emails) setEmails(data.emails);
      } catch (err) {
        console.error(err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    init();
    return () => {
      ignore = true;
    };
  }, []);

  const handleCopy = (id: string, email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedId(id);
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
          customPrefix: customPrefix || undefined,
          userServiceTag: customTag || undefined,
          expiresInMinutes: 60,
        }),
      });
      const data = await res.json();
      if (data.success && data.emailAddress) {
        setEmails([data.emailAddress, ...emails]);
        setCustomPrefix('');
        setCustomTag('');
        setMessageToast(`Created temporary mailbox ${data.emailAddress.email_address}`);
        setTimeout(() => setMessageToast(null), 3000);
      }
    } catch {
      setMessageToast('Failed to create mailbox');
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
        setEmails(emails.map(e => e.id === emailId ? data.emailAddress : e));
        setMessageToast('Mailbox expiration extended by 60 minutes.');
        setTimeout(() => setMessageToast(null), 3000);
      }
    } catch {}
  };

  const handleDelete = async (emailId: string) => {
    try {
      await fetch('/api/email/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailAddressId: emailId, userId: 'user-demo-1' }),
      });
      setEmails(emails.filter(e => e.id !== emailId));
      setMessageToast('Temporary email deleted.');
      setTimeout(() => setMessageToast(null), 2500);
    } catch {}
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Mail className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Temporary Email Mailboxes
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Dynamically instantiated catch-all mailboxes. Manage lifetimes, tags, and message counts.
          </p>
        </div>
      </div>

      {messageToast && (
        <div className="flex items-center gap-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 p-3 text-xs text-indigo-700 dark:text-indigo-300">
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>{messageToast}</span>
        </div>
      )}

      {/* Creation Box */}
      <Card className="p-5">
        <form onSubmit={handleGenerate} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Custom Prefix (Optional)
            </label>
            <div className="flex rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden text-xs">
              <input
                type="text"
                placeholder="e.g. quickbox99"
                value={customPrefix}
                onChange={(e) => setCustomPrefix(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                className="w-full px-3 py-2 bg-transparent focus:outline-none"
              />
              <span className="px-3 py-2 bg-slate-100 dark:bg-slate-900 text-slate-500 font-mono">
                @omnibey.com
              </span>
            </div>
          </div>

          <div className="sm:col-span-4">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Service Tag (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Discord, OpenAI Signup"
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
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
      <div className="space-y-3">
        {emails.map((e) => {
          const isExpired = new Date(e.expires_at).getTime() < now || e.status === 'expired';

          return (
            <Card key={e.id} className="p-4" hoverEffect>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                      {e.email_address}
                    </span>
                    <Badge variant={isExpired ? 'danger' : 'success'} size="sm">
                      {isExpired ? 'Expired' : 'Active'}
                    </Badge>
                    {e.user_service_tag && (
                      <Badge variant="neutral" size="sm">
                        {e.user_service_tag}
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Expires: {new Date(e.expires_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span>•</span>
                    <span>Messages: <strong className="text-slate-700 dark:text-slate-200">{e.message_count}</strong></span>
                    <span>•</span>
                    <span>OTPs: <strong className="text-emerald-600 dark:text-emerald-400">{e.otp_count}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handleCopy(e.id, e.email_address)}
                    variant="outline"
                    size="sm"
                    leftIcon={copiedId === e.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  >
                    {copiedId === e.id ? 'Copied' : 'Copy'}
                  </Button>

                  <Button
                    onClick={() => handleExtend(e.id)}
                    variant="ghost"
                    size="sm"
                    title="Extend expiration by 60 mins"
                  >
                    +60m
                  </Button>

                  <button
                    onClick={() => handleDelete(e.id)}
                    className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
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
    </div>
  );
}
