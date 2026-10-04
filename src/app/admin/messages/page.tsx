'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, Search, ShieldCheck, Mail } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Message } from '@/types';

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/admin/metrics')
      .then(res => res.json())
      .then(data => {
        if (data.recentMessages) setMessages(data.recentMessages);
      })
      .catch(console.error);
  }, []);

  const filtered = messages.filter(m =>
    m.subject.toLowerCase().includes(search.toLowerCase()) ||
    m.sender.toLowerCase().includes(search.toLowerCase()) ||
    m.recipient.toLowerCase().includes(search.toLowerCase()) ||
    (m.detected_otp && m.detected_otp.includes(search))
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <MessageSquare className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            System Message & OTP Logs
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Incoming message transit logs with heuristic OTP verification detection.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search sender, recipient, or OTP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Sender</th>
                <th className="px-5 py-3.5">Recipient</th>
                <th className="px-5 py-3.5">Subject</th>
                <th className="px-5 py-3.5">Detected OTP</th>
                <th className="px-5 py-3.5">Received At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {filtered.map((msg) => (
                <tr key={msg.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-4 font-semibold text-slate-900 dark:text-white">
                    {msg.sender}
                  </td>
                  <td className="px-5 py-4 font-mono text-indigo-600 dark:text-indigo-400">
                    {msg.recipient}
                  </td>
                  <td className="px-5 py-4 text-slate-700 dark:text-slate-300 max-w-xs truncate">
                    {msg.subject}
                  </td>
                  <td className="px-5 py-4">
                    {msg.detected_otp ? (
                      <div className="inline-flex items-center gap-1.5 font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{msg.detected_otp}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">None</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-slate-400 whitespace-nowrap">
                    {new Date(msg.received_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
