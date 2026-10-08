'use client';

import React, { useState, useEffect } from 'react';
import { History, Info, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { EmailAddress, Message } from '@/types';

export default function HistoryPage() {
  const [emails, setEmails] = useState<EmailAddress[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/email/generate?userId=user-demo-1').then((r) => r.json()),
      fetch('/api/inbox?userId=user-demo-1').then((r) => r.json()),
    ])
      .then(([emailData, msgData]) => {
        if (emailData.emails) setEmails(emailData.emails);
        if (msgData.messages) setMessages(msgData.messages);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const getObservedDomain = (sender: string) => {
    const parts = sender.split('@');
    return parts.length > 1 ? parts[1].replace(/[<>]/g, '').trim() : 'Unknown';
  };

  return (
    <div className="space-y-6 animate-fade-in text-[var(--t0)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--t0)] flex items-center gap-2.5">
            <History className="w-6 h-6 text-[var(--acc)]" />
            Email Usage & Domain Telemetry History
          </h1>
          <p className="mt-1 text-xs text-[var(--t2)] font-medium">
            Audit log separating user-reported tags from observed incoming sender domains.
          </p>
        </div>

        <Button
          onClick={loadData}
          variant="outline"
          size="sm"
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
        >
          Refresh
        </Button>
      </div>

      {/* Compliance Information Card */}
      <div className="rounded-[14px] border border-[var(--acc)]/30 bg-[var(--acc-soft)] p-4 text-xs text-[var(--t0)] leading-relaxed flex items-start gap-3">
        <Info className="w-5 h-5 shrink-0 text-[var(--acc)] mt-0.5" />
        <div>
          <strong className="font-bold">Privacy & Attribution Notice: </strong>
          OmniMail does not monitor your browser navigation or assume external websites. We strictly distinguish
          <span className="font-bold underline ml-1">User-Reported Tags</span> from the actual
          <span className="font-bold underline ml-1">Observed Sender Domain</span> parsed securely from received email headers.
        </div>
      </div>

      {/* Usage Table */}
      {loading ? (
        <TableSkeleton rows={5} />
      ) : (
        <Card className="overflow-hidden bg-[var(--bg-2)] border-[var(--line)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--bg-3)] border-b border-[var(--line)] font-bold text-[var(--t2)] uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Temporary Mailbox</th>
                  <th className="px-5 py-3.5">User-Reported Tag</th>
                  <th className="px-5 py-3.5">Observed Sender Domain</th>
                  <th className="px-5 py-3.5">Messages / OTP</th>
                  <th className="px-5 py-3.5">Provider</th>
                  <th className="px-5 py-3.5">Created At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)] font-medium">
                {emails.map((email) => {
                  const relatedMsgs = messages.filter((m) => m.email_address_id === email.id);
                  const observedDomains = Array.from(new Set(relatedMsgs.map((m) => getObservedDomain(m.sender))));

                  return (
                    <tr key={email.id} className="hover:bg-[var(--bg-3)]/60 transition-colors">
                      <td className="px-5 py-4 font-mono font-bold text-[var(--t0)]">
                        {email.email_address}
                      </td>

                      <td className="px-5 py-4">
                        {email.user_service_tag ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-[var(--bg-3)] border border-[var(--line)] text-[var(--t0)] font-medium">
                            <span className="text-[var(--t2)] text-[11px]">Tag:</span>
                            <strong className="font-bold">{email.user_service_tag}</strong>
                          </div>
                        ) : (
                          <span className="text-[var(--t2)] italic">None specified</span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        {observedDomains.length > 0 ? (
                          <div className="space-y-1">
                            {observedDomains.map((dom, i) => (
                              <div key={i} className="flex items-center gap-1.5 text-[var(--acc)] font-mono font-semibold">
                                <span className="text-[var(--t2)] font-sans text-[11px]">Observed:</span>
                                <code>{dom}</code>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[var(--t2)] italic">No incoming mail yet</span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-[var(--t1)]">
                        <div className="flex items-center gap-2">
                          <span className="font-mono">{email.message_count} msgs</span>
                          <span>•</span>
                          <span className="font-bold text-[var(--ok)] font-mono">
                            {email.otp_count} OTPs
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-[var(--t2)]">
                        OmniBey Mail Gateway
                      </td>

                      <td className="px-5 py-4 text-[var(--t2)] font-mono">
                        {new Date(email.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
