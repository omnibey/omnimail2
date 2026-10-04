'use client';

import React, { useState, useEffect } from 'react';
import { History, ShieldCheck, Mail, Info, Clock, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmailAddress, Message } from '@/types';

export default function HistoryPage() {
  const [emails, setEmails] = useState<EmailAddress[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/email/generate?userId=user-demo-1').then(r => r.json()),
      fetch('/api/inbox?userId=user-demo-1').then(r => r.json()),
    ])
      .then(([emailData, msgData]) => {
        if (emailData.emails) setEmails(emailData.emails);
        if (msgData.messages) setMessages(msgData.messages);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Helper to extract observed domain from sender email e.g. "security@discord.com" -> "discord.com"
  const getObservedDomain = (sender: string) => {
    const parts = sender.split('@');
    return parts.length > 1 ? parts[1].replace(/[<>]/g, '').trim() : 'Unknown';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <History className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          Email Usage & Domain Telemetry History
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Audit log separating user-reported categories from observed sender domains.
        </p>
      </div>

      {/* Compliance Information Card */}
      <div className="rounded-xl border border-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-950/20 p-4 text-xs text-indigo-900 dark:text-indigo-300 leading-relaxed flex items-start gap-3">
        <Info className="w-5 h-5 shrink-0 text-indigo-600 dark:text-indigo-400 mt-0.5" />
        <div>
          <strong className="font-semibold">Privacy & Attribution Notice: </strong>
          OmniMail does not monitor your browser or assume which site you visit. We clearly separate
          <span className="font-semibold underline ml-1">User Reported Tags</span> from the
          <span className="font-semibold underline ml-1">Observed Sender Domain</span> extracted from received headers.
        </div>
      </div>

      {/* Usage Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Temporary Mailbox</th>
                <th className="px-5 py-3.5">User Reported Tag</th>
                <th className="px-5 py-3.5">Observed Sender Domain</th>
                <th className="px-5 py-3.5">Messages / OTP</th>
                <th className="px-5 py-3.5">Provider</th>
                <th className="px-5 py-3.5">Created At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {emails.map((email) => {
                // Find matching messages for this email to find observed domain
                const relatedMsgs = messages.filter(m => m.email_address_id === email.id);
                const observedDomains = Array.from(new Set(relatedMsgs.map(m => getObservedDomain(m.sender))));

                return (
                  <tr key={email.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-slate-900 dark:text-white">
                      {email.email_address}
                    </td>

                    <td className="px-5 py-4">
                      {email.user_service_tag ? (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                          <span>User tag:</span>
                          <strong>{email.user_service_tag}</strong>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">None specified</span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      {observedDomains.length > 0 ? (
                        <div className="space-y-1">
                          {observedDomains.map((dom, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-semibold">
                              <span>Observed:</span>
                              <code>{dom}</code>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No incoming mail yet</span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span>{email.message_count} msgs</span>
                        <span>•</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {email.otp_count} OTPs
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-slate-500">
                      OmniBey Mail Gateway
                    </td>

                    <td className="px-5 py-4 text-slate-400">
                      {new Date(email.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
