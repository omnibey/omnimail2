'use client';

import React, { useState, useEffect } from 'react';
import { 
  Inbox, RefreshCw, Trash2, Mail, Clock, 
  Send, ShieldCheck, Eye, Search 
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { OTPBadge } from '@/components/OTPBadge';
import { InboxSplitSkeleton } from '@/components/ui/Skeleton';
import { Message, EmailAddress } from '@/types';

export default function InboxPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [emails, setEmails] = useState<EmailAddress[]>([]);
  const [selectedEmailFilter, setSelectedEmailFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        const url = selectedEmailFilter !== 'all'
          ? `/api/inbox?emailAddressId=${selectedEmailFilter}`
          : '/api/inbox?userId=user-demo-1';

        const [msgsRes, emailsRes] = await Promise.all([
          fetch(url).then((r) => r.json()),
          fetch('/api/email/generate?userId=user-demo-1').then((r) => r.json()),
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
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    init();
    return () => {
      ignore = true;
    };
  }, [selectedEmailFilter]);

  const handleSelectMessage = async (msg: Message) => {
    setSelectedMessage(msg);
    if (!msg.is_read) {
      fetch('/api/inbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_read', messageId: msg.id }),
      }).catch(() => {});

      setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, is_read: true } : m)));
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await fetch('/api/inbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', messageId }),
      });
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
      if (selectedMessage?.id === messageId) {
        const remaining = messages.filter((m) => m.id !== messageId);
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
        setMessages((prev) => [data.message, ...prev]);
        setSelectedMessage(data.message);
      }
    } catch (err) {
      console.error('Simulation failed:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const filteredMessages = messages.filter((m) =>
    m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.detected_otp && m.detected_otp.includes(searchQuery))
  );

  return (
    <div className="space-y-6 animate-fade-in text-[var(--t0)]">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--t0)] flex items-center gap-2.5">
            <Inbox className="w-6 h-6 text-[var(--acc)]" />
            Live Temporary Inbox
          </h1>
          <p className="mt-1 text-xs text-[var(--t2)] font-medium">
            Real-time delivery stream from mail.omnibey.com with heuristic verification code extraction.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleSimulateIncoming}
            variant="outline"
            size="sm"
            isLoading={isSimulating}
            leftIcon={<Send className="w-3.5 h-3.5 text-[var(--acc)]" />}
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
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--t2)]" />
          <input
            type="text"
            placeholder="Search by sender, subject, or verification OTP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-[11px] border border-[var(--line)] bg-[var(--bg-2)] text-[var(--t0)] placeholder-[var(--t2)] focus:outline-none focus:border-[var(--acc)] focus:ring-1 focus:ring-[var(--acc)] transition-all font-medium"
          />
        </div>

        {emails.length > 0 && (
          <select
            value={selectedEmailFilter}
            onChange={(e) => setSelectedEmailFilter(e.target.value)}
            className="px-3.5 py-2.5 text-xs rounded-[11px] border border-[var(--line)] bg-[var(--bg-2)] text-[var(--t0)] focus:outline-none focus:border-[var(--acc)] transition-all font-medium cursor-pointer"
          >
            <option value="all">All Mailboxes ({messages.length} messages)</option>
            {emails.map((e) => (
              <option key={e.id} value={e.id}>
                {e.email_address}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Inbox Split Layout */}
      {loading ? (
        <InboxSplitSkeleton />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
          {/* Left Column: Messages List */}
          <div className="lg:col-span-5 space-y-2">
            {filteredMessages.length === 0 ? (
              <Card className="p-8 text-center text-[var(--t2)] bg-[var(--bg-2)] border-[var(--line)]">
                <Mail className="w-8 h-8 mx-auto mb-2 text-[var(--t2)] opacity-60" />
                <p className="text-sm font-bold text-[var(--t0)]">No messages in inbox</p>
                <p className="text-xs text-[var(--t2)] mt-1">
                  Emails sent to your temporary address will appear here automatically.
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
                      className={`p-4 rounded-[14px] border cursor-pointer transition-all duration-150 ${
                        isSelected
                          ? 'border-[var(--acc)] bg-[var(--acc-soft)] shadow-sm'
                          : 'border-[var(--line)] bg-[var(--bg-2)] hover:border-[var(--line-2)] hover:bg-[var(--bg-3)]/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            {!msg.is_read && (
                              <span className="w-2 h-2 rounded-full bg-[var(--acc)] shrink-0" title="Unread" />
                            )}
                            <span className="text-xs font-bold truncate text-[var(--t0)]">
                              {msg.sender}
                            </span>
                          </div>
                          <h3 className="text-xs font-semibold text-[var(--t1)] truncate mt-1">
                            {msg.subject}
                          </h3>
                        </div>

                        <div className="text-[10px] text-[var(--t2)] shrink-0 font-mono text-right">
                          {new Date(msg.received_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>

                      {msg.detected_otp && (
                        <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-[var(--line)]">
                          <span className="text-[11px] font-mono font-bold text-[var(--ok)] bg-[var(--ok-soft)] px-2 py-0.5 rounded-[6px] border border-[var(--ok)]/30 flex items-center gap-1">
                            OTP: {msg.detected_otp}
                          </span>
                          <span className="text-[10px] text-[var(--t2)]">
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
              <Card className="p-6 h-full flex flex-col justify-between bg-[var(--bg-2)] border-[var(--line)]">
                <div>
                  {/* Header Information */}
                  <div className="flex items-start justify-between pb-4 border-b border-[var(--line)]">
                    <div className="min-w-0 flex-1">
                      <h2 className="text-base font-bold text-[var(--t0)]">
                        {selectedMessage.subject}
                      </h2>
                      <div className="mt-2 space-y-1 text-xs text-[var(--t2)]">
                        <div>
                          From: <strong className="text-[var(--t0)] font-semibold">{selectedMessage.sender}</strong>
                        </div>
                        <div>
                          To: <span className="font-mono text-[var(--acc)] font-medium">{selectedMessage.recipient}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-[var(--t2)] pt-0.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Received: {new Date(selectedMessage.received_at).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteMessage(selectedMessage.id)}
                      className="p-2 rounded-[10px] text-[var(--bad)] hover:bg-[var(--bad-soft)] transition-colors cursor-pointer"
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
                  <div className="mt-6 text-sm text-[var(--t0)] whitespace-pre-line leading-relaxed">
                    {selectedMessage.body_html ? (
                      <div
                        dangerouslySetInnerHTML={{ __html: selectedMessage.body_html }}
                        className="prose prose-sm dark:prose-invert max-w-none text-[var(--t0)]"
                      />
                    ) : (
                      <div>{selectedMessage.body_text}</div>
                    )}
                  </div>
                </div>

                {/* Email Footer Metadata */}
                <div className="mt-8 pt-4 border-t border-[var(--line)] flex items-center justify-between text-[11px] text-[var(--t2)]">
                  <span className="font-mono">ID: {selectedMessage.id}</span>
                  <span>Encrypted transit • OmniBey Gate</span>
                </div>
              </Card>
            ) : (
              <Card className="p-12 text-center text-[var(--t2)] flex flex-col items-center justify-center h-full bg-[var(--bg-2)] border-[var(--line)]">
                <Eye className="w-8 h-8 opacity-60 mb-2" />
                <p className="text-sm font-bold text-[var(--t0)]">
                  Select an email from the list
                </p>
                <p className="text-xs text-[var(--t2)] mt-1 max-w-xs">
                  Click on any message on the left to read its complete content and inspect detected verification codes.
                </p>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
