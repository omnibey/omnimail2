'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  Inbox, Mail, ShieldCheck, Coins, 
  BarChart3, Activity, Zap, RefreshCw,
  Copy, Check
} from 'lucide-react';
import { QuickEmailGenerator } from '@/components/QuickEmailGenerator';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmailAddress, Message, UserProfile } from '@/types';

type UserTab = 'mailboxes' | 'analytics' | 'credits';

export default function DashboardOverviewPage() {
  const [activeTab, setActiveTab] = useState<UserTab>('mailboxes');
  const [activeEmail, setActiveEmail] = useState<EmailAddress | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [copiedOtp, setCopiedOtp] = useState<string | null>(null);

  const loadDashboardData = useCallback(async () => {
    try {
      const [userRes, emailsRes, msgsRes] = await Promise.all([
        fetch('/api/auth/session').then(r => r.json()),
        fetch('/api/email/generate?userId=user-demo-1').then(r => r.json()),
        fetch('/api/inbox?userId=user-demo-1').then(r => r.json()),
      ]);

      if (userRes.user) setUser(userRes.user);
      if (emailsRes.emails?.length > 0) setActiveEmail(emailsRes.emails[0]);
      if (msgsRes.messages) setMessages(msgsRes.messages);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        const [userRes, emailsRes, msgsRes] = await Promise.all([
          fetch('/api/auth/session').then(r => r.json()),
          fetch('/api/email/generate?userId=user-demo-1').then(r => r.json()),
          fetch('/api/inbox?userId=user-demo-1').then(r => r.json()),
        ]);

        if (!ignore) {
          if (userRes.user) setUser(userRes.user);
          if (emailsRes.emails?.length > 0) setActiveEmail(emailsRes.emails[0]);
          if (msgsRes.messages) setMessages(msgsRes.messages);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      }
    }
    init();
    return () => {
      ignore = true;
    };
  }, []);

  const totalOtps = messages.filter(m => Boolean(m.detected_otp)).length;

  const copyOtp = (otp: string) => {
    navigator.clipboard.writeText(otp);
    setCopiedOtp(otp);
    setTimeout(() => setCopiedOtp(null), 2000);
  };

  return (
    <div className="space-y-6 vela-page-enter">
      {/* Header & Multi-Dashboard Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--t0)]">
              Welcome back, {user?.name || 'Alex Rivera'}
            </h1>
            <span className="px-2 py-0.5 rounded-[6px] text-[10px] font-mono font-bold bg-[var(--acc-soft)] text-[var(--acc)] border border-[var(--acc)]/30">
              PRO TIER
            </span>
          </div>
          <p className="mt-1 text-xs text-[var(--t2)] font-medium">
            Active temporary mailboxes, extracted verification OTPs, and dynamic catch-all routing.
          </p>
        </div>

        {/* Dashboard Tabs Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-1 rounded-[13px] border border-[var(--line)] bg-[var(--bg-inset)]">
            <button
              onClick={() => setActiveTab('mailboxes')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-[9px] text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'mailboxes'
                  ? 'bg-[var(--acc)] text-white shadow-sm shadow-[var(--acc-soft)]'
                  : 'text-[var(--t1)] hover:text-[var(--t0)] hover:bg-[var(--bg-3)]'
              }`}
            >
              <Inbox className="w-3.5 h-3.5" />
              <span>Mailboxes & Inboxes</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-[9px] text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-[var(--acc)] text-white shadow-sm shadow-[var(--acc-soft)]'
                  : 'text-[var(--t1)] hover:text-[var(--t0)] hover:bg-[var(--bg-3)]'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Usage Telemetry</span>
            </button>

            <button
              onClick={() => setActiveTab('credits')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-[9px] text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'credits'
                  ? 'bg-[var(--acc)] text-white shadow-sm shadow-[var(--acc-soft)]'
                  : 'text-[var(--t1)] hover:text-[var(--t0)] hover:bg-[var(--bg-3)]'
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Credits & Top-Up</span>
            </button>
          </div>

          <Link href="/dashboard/credits">
            <Button variant="primary" size="sm" leftIcon={<Coins className="w-4 h-4" />}>
              Add Credits
            </Button>
          </Link>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: MAILBOXES & LIVE INBOXES
      ========================================================================= */}
      {activeTab === 'mailboxes' && (
        <div className="space-y-6 animate-fade-in">
          {/* Quick Email Generator */}
          <QuickEmailGenerator
            initialEmail={activeEmail}
            userId={user?.id || 'user-demo-1'}
            onEmailChanged={(email) => {
              setActiveEmail(email);
              loadDashboardData();
            }}
            onMessageReceived={loadDashboardData}
          />

          {/* Metric Cards 4x1 */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4" hoverEffect>
              <div className="flex items-center justify-between text-[var(--t2)] text-xs font-extrabold uppercase mb-1">
                <span>Credit Balance</span>
                <Coins className="w-4 h-4 text-[var(--acc)]" />
              </div>
              <div className="text-2xl font-extrabold text-[var(--t0)] font-mono">
                {user?.credits ?? 45}
              </div>
              <div className="text-[11px] text-[var(--ok)] mt-1 font-bold">
                15 credits bonus active
              </div>
            </Card>

            <Card className="p-4" hoverEffect>
              <div className="flex items-center justify-between text-[var(--t2)] text-xs font-extrabold uppercase mb-1">
                <span>Received Messages</span>
                <Mail className="w-4 h-4 text-[#56a8ff]" />
              </div>
              <div className="text-2xl font-extrabold text-[var(--t0)] font-mono">
                {messages.length}
              </div>
              <div className="text-[11px] text-[var(--t2)] mt-1">
                Stored in memory
              </div>
            </Card>

            <Card className="p-4" hoverEffect>
              <div className="flex items-center justify-between text-[var(--t2)] text-xs font-extrabold uppercase mb-1">
                <span>Extracted OTPs</span>
                <ShieldCheck className="w-4 h-4 text-[var(--ok)]" />
              </div>
              <div className="text-2xl font-extrabold text-[var(--ok)] font-mono">
                {totalOtps}
              </div>
              <div className="text-[11px] text-[var(--ok)] mt-1 font-bold">
                Instant 1-click copy
              </div>
            </Card>

            <Card className="p-4" hoverEffect>
              <div className="flex items-center justify-between text-[var(--t2)] text-xs font-extrabold uppercase mb-1">
                <span>Mail Routing Status</span>
                <Activity className="w-4 h-4 text-[#f7b84e]" />
              </div>
              <div className="text-2xl font-extrabold text-[var(--t0)] font-mono">
                Active
              </div>
              <div className="text-[11px] text-[var(--t2)] mt-1">
                mail.omnibey.com
              </div>
            </Card>
          </div>

          {/* Live Inbox Feed with OTP Fast Copy */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-extrabold text-[var(--t0)]">
                  Live Inbox Stream
                </h3>
                <p className="text-xs text-[var(--t2)]">
                  Incoming verification messages for {activeEmail ? activeEmail.email_address : 'your mailboxes'}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={loadDashboardData}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Refresh
              </Button>
            </div>

            {messages.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-[var(--bg-3)] border border-[var(--line)] flex items-center justify-center mx-auto text-[var(--t2)] mb-3">
                  <Inbox className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-[var(--t0)]">No messages yet</h4>
                <p className="text-xs text-[var(--t2)] mt-1 max-w-sm mx-auto">
                  Send a verification email or click any simulation button in the generator above.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.slice(0, 6).map((msg) => (
                  <div
                    key={msg.id}
                    className="p-4 rounded-[14px] border border-[var(--line)] bg-[var(--bg-3)]/60 hover:bg-[var(--bg-3)] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[var(--t0)] truncate">
                          {msg.sender}
                        </span>
                        <span className="text-[11px] text-[var(--t2)] font-mono">
                          {new Date(msg.received_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="text-sm font-semibold text-[var(--t0)] mt-1 truncate">
                        {msg.subject}
                      </div>
                      <div className="text-xs text-[var(--t1)] mt-0.5 line-clamp-1">
                        {msg.body_text}
                      </div>
                    </div>

                    {msg.detected_otp && (
                      <div className="shrink-0 flex items-center gap-2">
                        <div className="px-3 py-1.5 rounded-[9px] bg-[var(--ok-soft)] border border-[var(--ok)]/30 text-[var(--ok)] font-mono font-extrabold text-sm flex items-center gap-2">
                          <Zap className="w-3.5 h-3.5" />
                          <span>{msg.detected_otp}</span>
                        </div>
                        <button
                          onClick={() => copyOtp(msg.detected_otp!)}
                          className="px-3 py-1.5 rounded-[9px] bg-[var(--ok)] hover:opacity-90 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 transition-all"
                        >
                          {copiedOtp === msg.detected_otp ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy OTP</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* =========================================================================
          TAB 2: USAGE TELEMETRY & ANALYTICS
      ========================================================================= */}
      {activeTab === 'analytics' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="p-6 lg:col-span-2">
              <h3 className="text-sm font-bold text-[var(--t0)] mb-1">
                Your Email Activity over 7 Days
              </h3>
              <p className="text-xs text-[var(--t2)] mb-5">
                Daily volume of received emails and heuristic OTP extractions
              </p>

              <div className="h-52 w-full flex items-end justify-between gap-3 pt-4">
                {[
                  { day: 'Mon', count: 4, otps: 3 },
                  { day: 'Tue', count: 8, otps: 7 },
                  { day: 'Wed', count: 12, otps: 11 },
                  { day: 'Thu', count: 7, otps: 6 },
                  { day: 'Fri', count: 15, otps: 14 },
                  { day: 'Sat', count: 18, otps: 16 },
                  { day: 'Sun', count: 10, otps: 9 },
                ].map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full gap-2">
                    <div className="w-full flex items-end justify-center gap-1 h-full">
                      <div
                        className="w-1/2 rounded-t-[6px] bg-[var(--acc)] hover:bg-[var(--acc-2)] transition-all"
                        style={{ height: `${(item.count / 20) * 100}%` }}
                      />
                      <div
                        className="w-1/2 rounded-t-[6px] bg-[var(--ok)] hover:opacity-90 transition-all"
                        style={{ height: `${(item.otps / 20) * 100}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-mono text-[var(--t2)]">{item.day}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-sm font-bold text-[var(--t0)] mb-1">
                Top Service Domains
              </h3>
              <p className="text-xs text-[var(--t2)] mb-5">
                Most frequent OTP senders
              </p>

              <div className="space-y-4">
                {[
                  { name: 'discord.com', count: '14 emails', pct: 45, color: 'bg-[var(--acc)]' },
                  { name: 'github.com', count: '9 emails', pct: 30, color: 'bg-[#56a8ff]' },
                  { name: 'openai.com', count: '5 emails', pct: 15, color: 'bg-[var(--ok)]' },
                  { name: 'telegram.org', count: '3 emails', pct: 10, color: 'bg-[#f7b84e]' },
                ].map((d, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[var(--t0)]">{d.name}</span>
                      <span className="text-[var(--t2)] font-mono">{d.count}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[var(--bg-3)] overflow-hidden">
                      <div className={`h-full ${d.color} rounded-full`} style={{ width: `${d.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: CREDITS & TOP-UP DASHBOARD
      ========================================================================= */}
      {activeTab === 'credits' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 border border-[var(--acc)]/30 bg-[var(--acc)]/5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase text-[var(--acc)]">Starter Pack</span>
                <Badge variant="primary" size="sm">Popular</Badge>
              </div>
              <div className="mt-4 text-3xl font-extrabold text-[var(--t0)] font-mono">
                ৳100 <span className="text-xs text-[var(--t2)] font-sans">BDT</span>
              </div>
              <p className="text-xs text-[var(--t1)] mt-2">
                100 Mailbox Credits + Standard Catch-all Routing
              </p>
              <Link href="/dashboard/credits" className="block mt-6">
                <Button variant="primary" size="sm" className="w-full">
                  Top-up Starter
                </Button>
              </Link>
            </Card>

            <Card className="p-6 border border-[var(--ok)]/30 bg-[var(--ok)]/5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase text-[var(--ok)]">Pro Powerpack</span>
                <Badge variant="success" size="sm">Best Value</Badge>
              </div>
              <div className="mt-4 text-3xl font-extrabold text-[var(--t0)] font-mono">
                ৳250 <span className="text-xs text-[var(--t2)] font-sans">BDT</span>
              </div>
              <p className="text-xs text-[var(--t1)] mt-2">
                300 Mailbox Credits + High-Priority Postfix Workers
              </p>
              <Link href="/dashboard/credits" className="block mt-6">
                <Button variant="success" size="sm" className="w-full">
                  Top-up Pro
                </Button>
              </Link>
            </Card>

            <Card className="p-6 border border-[#f7b84e]/30 bg-[#f7b84e]/5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase text-[#f7b84e]">Enterprise</span>
                <Badge variant="warning" size="sm">Dedicated</Badge>
              </div>
              <div className="mt-4 text-3xl font-extrabold text-[var(--t0)] font-mono">
                ৳500 <span className="text-xs text-[var(--t2)] font-sans">BDT</span>
              </div>
              <p className="text-xs text-[var(--t1)] mt-2">
                750 Mailbox Credits + Custom Domain Catch-all Support
              </p>
              <Link href="/dashboard/credits" className="block mt-6">
                <Button variant="secondary" size="sm" className="w-full">
                  Top-up Enterprise
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
