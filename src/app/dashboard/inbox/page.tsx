'use client';

import React, { useState, useEffect } from 'react';
import { 
  Inbox, RefreshCw, Trash2, Mail, Clock, 
  Send, ShieldCheck, CheckCheck, Eye, Search, AlertCircle 
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { OTPBadge } from '@/components/OTPBadge';
import { Message, EmailAddress } from '@/types';

export default function InboxPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [emails, setEmails] = useState<EmailAddress[]>([]);
  const [selectedEmailFilter, setSelectedEmailFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  const fetchInbox = async () => {
    try {
      setLoading(true);
      const url = selectedEmailFilter !== 'all'
        ? `/api/inbox?emailAddressId=${selectedEmailFilter}`
        : '/api/inbox?userId=user-demo-1';

      const res = await fetch(url);
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages);
        if (data.messages.length > 0 && !selectedMessage) {
          setSelectedMessage(data.messages[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load inbox:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmails = async () => {
    try {
      const res = await fetch('/api/email/generate?userId=user-demo-1');
      const data = await res.json();
      if (data.emails) setEmails(data.emails);
    } catch {}
  };

  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        const url = selectedEmailFilter !== 'all'
          ? `/api/inbox?emailAddressId=${selectedEmailFilter}`
          : '/api/inbox?userId=user-demo-1';

        const [msgsRes, emailsRes] = await Promise.all([
          fetch(url).then(r => r.json()),
          fetch('/api/email/generate?userId=user-demo-1').then(r => r.json()),
        ]);

        if (!ignore) {
          if (msgsRes.messages) {
            setMessages(msgsRes.messages);
            if (msgsRes.messages.length > 0 && !selectedMessage) {
              setSelectedMessage(msgsRes.messages[0]);
            }
          }
          if (emailsRes.emails) setEmails(emailsRes.emails);
        }
      } catch (err) {
        console.error('Failed to load inbox:', err);
      }
    }
    init();
    return () => {
      ignore = true;
    };
  }, [selectedEmailFilter, selectedMessage]);

  const handleSelectMessage = async (msg: Message) => {
    setSelectedMessage(msg);
    if (!msg.is_read) {
      // mark read
      fetch('/api/inbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_read', messageId: msg.id }),
      }).catch(() => {});

      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, is_read: true } : m));
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await fetch('/api/inbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', messageId }),
      });
      setMessages(prev => prev.filter(m => m.id !== messageId));
      if (selectedMessage?.id === messageId) {
        const remaining = messages.filter(m => m.id !== messageId);
        setSelectedMessage(remaining.length > 0 ? remaining[0] : null);
      }
    } catch (err) {
      console.error('Failed to delete message:', err);
    }
  };

  const handleSimulateIncoming = async () => {
    const targetEmailId = selectedEmailFilter !== 'all' 
      ? selectedEmailFilter 
      : (emails[0]?.id || 'email-1');

    try {
      setIsSimulating(true);
      const res = await fetch('/api/email/simulate-incoming', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailAddressId: targetEmailId }),
      });
      const data = await res.json();
      if (data.success && data.message) {
        setMessages(prev => [data.message, ...prev]);
        setSelectedMessage(data.message);
      }
    } catch (err) {
      console.error('Simulation failed:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const filteredMessages = messages.filter(m =>
    m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.detected_otp && m.detected_otp.includes(searchQuery))
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Inbox className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Live Temporary Inbox
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Real-time delivery from mail.omnibey.com with heuristic verification code extraction
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleSimulateIncoming}
            variant="outline"
            size="sm"
            isLoading={isSimulating}
            leftIcon={<Send className="w-3.5 h-3.5 text-indigo-500" />}
          >
            Simulate Incoming Email
          </Button>

          <Button
            onClick={fetchInbox}
            variant="ghost"
            size="sm"
            isLoading={loading}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by sender, subject, or verification OTP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>

        {emails.length > 0 && (
          <select
            value={selectedEmailFilter}
            onChange={(e) => setSelectedEmailFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          >
            <option value="all">All Mailboxes ({messages.length} messages)</option>
            {emails.map(e => (
              <option key={e.id} value={e.id}>
                {e.email_address}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Inbox Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
        {/* Left Column: Messages List */}
        <div className="lg:col-span-5 space-y-2">
          {filteredMessages.length === 0 ? (
            <Card className="p-8 text-center text-slate-400">
              <Mail className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No messages in inbox</p>
              <p className="text-xs text-slate-400 mt-1">
                Emails dispatched to your active temporary address will appear here automatically.
              </p>
              <div className="mt-4">
                <Button onClick={handleSimulateIncoming} variant="primary" size="sm">
                  Send Test Verification Message
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredMessages.map((msg) => {
                const isSelected = selectedMessage?.id === msg.id;
                return (
                  <div
                    key={msg.id}
                    onClick={() => handleSelectMessage(msg)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all duration-150 ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 shadow-sm'
                        : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          {!msg.is_read && (
                            <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" title="Unread" />
                          )}
                          <span className={`text-xs font-bold truncate ${isSelected ? 'text-indigo-900 dark:text-indigo-200' : 'text-slate-900 dark:text-white'}`}>
                            {msg.sender}
                          </span>
                        </div>
                        <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate mt-1">
                          {msg.subject}
                        </h3>
                      </div>

                      <div className="text-[10px] text-slate-400 shrink-0 text-right">
                        {new Date(msg.received_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    {msg.detected_otp && (
                      <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                        <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          OTP: {msg.detected_otp}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {msg.otp_confidence} confidence
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Message Detail View */}
        <div className="lg:col-span-7">
          {selectedMessage ? (
            <Card className="p-6 h-full flex flex-col justify-between">
              <div>
                {/* Header Information */}
                <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="min-w-0 flex-1">
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      {selectedMessage.subject}
                    </h2>
                    <div className="mt-2 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                      <div>
                        From: <strong className="text-slate-800 dark:text-slate-200 font-semibold">{selectedMessage.sender}</strong>
                      </div>
                      <div>
                        To: <span className="font-mono text-indigo-600 dark:text-indigo-400">{selectedMessage.recipient}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Received: {new Date(selectedMessage.received_at).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteMessage(selectedMessage.id)}
                    className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Delete message"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Highlighted OTP Detected Card if present */}
                {selectedMessage.detected_otp && (
                  <div className="mt-4">
                    <OTPBadge
                      code={selectedMessage.detected_otp}
                      confidence={selectedMessage.otp_confidence || 'high'}
                    />
                  </div>
                )}

                {/* Email Body Content */}
                <div className="mt-6 text-sm text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed">
                  {selectedMessage.body_html ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: selectedMessage.body_html }}
                      className="prose prose-sm dark:prose-invert max-w-none"
                    />
                  ) : (
                    <div>{selectedMessage.body_text}</div>
                  )}
                </div>
              </div>

              {/* Email Footer Metadata */}
              <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>Message ID: {selectedMessage.id}</span>
                <span>Encrypted transit • OmniBey Gate</span>
              </div>
            </Card>
          ) : (
            <Card className="p-12 text-center text-slate-400 flex flex-col items-center justify-center h-full">
              <Eye className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Select an email from the list
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Click on any message on the left to read its complete content and inspect detected verification codes.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
