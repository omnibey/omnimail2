'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Search, Clock, Trash2, Eye } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmailAddress } from '@/types';

export default function AdminEmailsPage() {
  const [emails, setEmails] = useState<EmailAddress[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/admin/metrics')
      .then(res => res.json())
      .then(data => {
        if (data.recentEmails) setEmails(data.recentEmails);
      })
      .catch(console.error);
  }, []);

  const filtered = emails.filter(e =>
    e.email_address.toLowerCase().includes(search.toLowerCase()) ||
    (e.user_service_tag && e.user_service_tag.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Mail className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
            Global Generated Mailboxes
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Monitor all dynamic recipient mailboxes created across the platform.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search mailboxes..."
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
                <th className="px-5 py-3.5">Address</th>
                <th className="px-5 py-3.5">Tag</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Messages</th>
                <th className="px-5 py-3.5">OTPs</th>
                <th className="px-5 py-3.5">Expires</th>
                <th className="px-5 py-3.5">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {filtered.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-4 font-mono font-bold text-slate-900 dark:text-white">
                    {e.email_address}
                  </td>
                  <td className="px-5 py-4">
                    {e.user_service_tag || <span className="text-slate-400 italic">None</span>}
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant={e.status === 'active' ? 'success' : 'danger'} size="sm">
                      {e.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 font-semibold text-slate-900 dark:text-white">
                    {e.message_count}
                  </td>
                  <td className="px-5 py-4 font-bold text-emerald-600 dark:text-emerald-400">
                    {e.otp_count}
                  </td>
                  <td className="px-5 py-4 text-slate-500">
                    {new Date(e.expires_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-5 py-4 text-slate-400">
                    {new Date(e.created_at).toLocaleDateString()}
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
