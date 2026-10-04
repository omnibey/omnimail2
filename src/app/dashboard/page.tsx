'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Inbox, Mail, ShieldCheck, Coins, CreditCard, 
  ArrowRight, Clock, Plus, ExternalLink, Sparkles 
} from 'lucide-react';
import { QuickEmailGenerator } from '@/components/QuickEmailGenerator';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmailAddress, Message, Payment, UserProfile } from '@/types';

export default function DashboardOverviewPage() {
  const [activeEmail, setActiveEmail] = useState<EmailAddress | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch session
      const userRes = await fetch('/api/auth/session');
      const userData = await userRes.json();
      if (userData.user) setUser(userData.user);

      // Fetch user's emails
      const emailsRes = await fetch('/api/email/generate?userId=user-demo-1');
      const emailsData = await emailsRes.json();
      if (emailsData.emails && emailsData.emails.length > 0) {
        setActiveEmail(emailsData.emails[0]);
      }

      // Fetch user's messages
      const msgsRes = await fetch('/api/inbox?userId=user-demo-1');
      const msgsData = await msgsRes.json();
      if (msgsData.messages) setMessages(msgsData.messages);

      // Fetch user's payments
      const payRes = await fetch('/api/payments/history?userId=user-demo-1');
      const payData = await payRes.json();
      if (payData.payments) setRecentPayments(payData.payments);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const totalOtps = messages.filter(m => Boolean(m.detected_otp)).length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Welcome back, {user?.name || 'Alex'}
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Manage your temporary mailboxes, extracted OTP codes, and credit packages.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/dashboard/credits">
            <Button variant="primary" size="sm" leftIcon={<Coins className="w-4 h-4" />}>
              Add Credits
            </Button>
          </Link>
          <Link href="/dashboard/inbox">
            <Button variant="outline" size="sm" leftIcon={<Inbox className="w-4 h-4" />}>
              View Live Inbox
            </Button>
          </Link>
        </div>
      </div>

      {/* Hero Quick Email Generator */}
      <QuickEmailGenerator
        initialEmail={activeEmail}
        userId={user?.id || 'user-demo-1'}
        onEmailChanged={(email) => {
          setActiveEmail(email);
          loadDashboardData();
        }}
        onMessageReceived={loadDashboardData}
      />

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5" hoverEffect>
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Inbox Messages</span>
            <Inbox className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {messages.length}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Across active mailboxes
          </div>
        </Card>

        <Card className="p-5" hoverEffect>
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Detected OTPs</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {totalOtps}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Verification codes parsed
          </div>
        </Card>

        <Card className="p-5" hoverEffect>
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Available Credits</span>
            <Coins className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {user?.credits ?? 45}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            1 credit / new address
          </div>
        </Card>

        <Card className="p-5" hoverEffect>
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Orders</span>
            <CreditCard className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {recentPayments.filter(p => p.status === 'pending').length}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Awaiting manual approval
          </div>
        </Card>
      </div>

      {/* Two-Column Overview: Recent Messages & Recent Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Messages Card */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Recent Inbox Activity
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Latest messages received in your mailboxes
              </p>
            </div>
            <Link
              href="/dashboard/inbox"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              Open Inbox <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {messages.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No messages received yet. Use the simulator above to test.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {messages.slice(0, 3).map((msg) => (
                <div key={msg.id} className="py-3 flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                        {msg.sender}
                      </span>
                      {msg.detected_otp && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                          OTP: {msg.detected_otp}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {msg.subject}
                    </p>
                  </div>
                  <span className="text-[11px] text-slate-400 shrink-0">
                    {new Date(msg.received_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Payment Orders */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Recent Payment Orders
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Top-up history & manual verification status
              </p>
            </div>
            <Link
              href="/dashboard/payments"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              View Orders <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentPayments.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No payment transactions submitted yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentPayments.slice(0, 3).map((pay) => (
                <div key={pay.id} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-slate-900 dark:text-white">
                        {pay.payment_ref}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                        {pay.payment_method}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {pay.package_name || `${pay.amount} ${pay.currency}`}
                    </p>
                  </div>

                  <div className="text-right">
                    <Badge
                      variant={
                        pay.status === 'approved'
                          ? 'success'
                          : pay.status === 'rejected'
                          ? 'danger'
                          : 'warning'
                      }
                      size="sm"
                    >
                      {pay.status}
                    </Badge>
                    <div className="text-[10px] text-slate-400 mt-1">
                      {new Date(pay.submitted_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
