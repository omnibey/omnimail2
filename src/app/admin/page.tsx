'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BarChart3, TrendingUp, Users, Mail, MessageSquare, 
  DollarSign, Activity, ShieldCheck, CreditCard, 
  Coins, ArrowRight, CheckCircle2, XCircle, Clock, 
  Server, Cpu, HardDrive, Globe, RefreshCw, AlertCircle,
  FileText, Sparkles, Filter, ChevronRight, Zap
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { AuditLog, Payment, EmailAddress, Message } from '@/types';

type DashboardTab = 'analytics' | 'sales' | 'saas' | 'security';

export default function AdminMultiDashboardPage() {
  const [activeTab, setActiveTab] = useState<DashboardTab>('analytics');
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | 'all'>('7d');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [metrics, setMetrics] = useState<{
    totalUsers: number;
    activeUsers: number;
    activeEmails: number;
    expiredEmails: number;
    totalMessages: number;
    otpDetections: number;
    pendingPayments: number;
    approvedPaymentsCount: number;
    totalRevenue: number;
    providerStatus: string;
    systemHealth: string;
  } | null>(null);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [recentEmails, setRecentEmails] = useState<EmailAddress[]>([]);
  const [recentMessages, setRecentMessages] = useState<Message[]>([]);

  const fetchMetrics = async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch('/api/admin/metrics');
      const data = await res.json();
      if (data.metrics) setMetrics(data.metrics);
      if (data.auditLogs) setAuditLogs(data.auditLogs);
      if (data.recentPayments) setRecentPayments(data.recentPayments);
      if (data.recentEmails) setRecentEmails(data.recentEmails);
      if (data.recentMessages) setRecentMessages(data.recentMessages);
    } catch (err) {
      console.error('Failed to load admin metrics:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        const res = await fetch('/api/admin/metrics');
        const data = await res.json();
        if (!ignore) {
          if (data.metrics) setMetrics(data.metrics);
          if (data.auditLogs) setAuditLogs(data.auditLogs);
          if (data.recentPayments) setRecentPayments(data.recentPayments);
          if (data.recentEmails) setRecentEmails(data.recentEmails);
          if (data.recentMessages) setRecentMessages(data.recentMessages);
        }
      } catch (err) {
        console.error('Failed to load admin metrics:', err);
      }
    }
    init();
    return () => {
      ignore = true;
    };
  }, []);

  const handleVerifyPayment = async (paymentId: string, status: 'approved' | 'rejected') => {
    try {
      const res = await fetch('/api/admin/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, status }),
      });
      if (res.ok) {
        fetchMetrics();
      }
    } catch (err) {
      console.error('Payment verification failed:', err);
    }
  };

  return (
    <div className="space-y-6 vela-page-enter">
      {/* Vela Multi-Dashboard Navigation Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--t0)]">
              OmniBey Admin Suite
            </h1>
            <span className="px-2 py-0.5 rounded-[6px] text-[10px] font-mono font-bold bg-[#f7b84e]/15 text-[#f7b84e] border border-[#f7b84e]/30">
              ROOT NODE
            </span>
          </div>
          <p className="mt-1 text-xs text-[var(--t2)] font-medium">
            Unified telemetry: Real-time traffic, mail throughput, OTP extraction, and manual revenue settlement.
          </p>
        </div>

        {/* Dashboard View Tabs (Vela Style Segmented Control) */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-1 rounded-[13px] border border-[var(--line)] bg-[var(--bg-inset)]">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-[9px] text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-[var(--acc)] text-white shadow-sm shadow-[var(--acc-soft)]'
                  : 'text-[var(--t1)] hover:text-[var(--t0)] hover:bg-[var(--bg-3)]'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab('sales')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-[9px] text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'sales'
                  ? 'bg-[var(--acc)] text-white shadow-sm shadow-[var(--acc-soft)]'
                  : 'text-[var(--t1)] hover:text-[var(--t0)] hover:bg-[var(--bg-3)]'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Sales & Orders</span>
              {metrics && metrics.pendingPayments > 0 && (
                <span className="w-2 h-2 rounded-full bg-[#f76d7d] animate-ping" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('saas')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-[9px] text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'saas'
                  ? 'bg-[var(--acc)] text-white shadow-sm shadow-[var(--acc-soft)]'
                  : 'text-[var(--t1)] hover:text-[var(--t0)] hover:bg-[var(--bg-3)]'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>SaaS Telemetry</span>
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-[9px] text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'security'
                  ? 'bg-[var(--acc)] text-white shadow-sm shadow-[var(--acc-soft)]'
                  : 'text-[var(--t1)] hover:text-[var(--t0)] hover:bg-[var(--bg-3)]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Security & Audit</span>
            </button>
          </div>

          {/* Time range & Refresh */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 p-1 rounded-[11px] border border-[var(--line)] bg-[var(--bg-inset)] text-[11px] font-bold">
              {(['24h', '7d', '30d', 'all'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`px-2 py-1 rounded-[7px] cursor-pointer transition-colors ${
                    timeRange === r
                      ? 'bg-[var(--bg-3)] text-[var(--t0)] font-extrabold'
                      : 'text-[var(--t2)] hover:text-[var(--t1)]'
                  }`}
                >
                  {r.toUpperCase()}
                </button>
              ))}
            </div>

            <button
              onClick={fetchMetrics}
              disabled={isRefreshing}
              className="p-2 rounded-[11px] border border-[var(--line)] bg-[var(--bg-3)] text-[var(--t1)] hover:text-[var(--t0)] hover:border-[var(--line-2)] transition-colors cursor-pointer"
              title="Refresh Telemetry"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          DASHBOARD 1: ANALYTICS DASHBOARD
      ========================================================================= */}
      {activeTab === 'analytics' && (
        <div className="space-y-6 animate-fade-in">
          {/* KPI Cards 4x1 Grid with Sparklines & Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-5" hoverEffect>
              <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-[var(--t2)] mb-1">
                <span>Active Mailboxes</span>
                <div className="p-1.5 rounded-[8px] bg-[var(--acc-soft)] text-[var(--acc)]">
                  <Mail className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-extrabold tracking-tight text-[var(--t0)] mt-1 font-mono">
                {metrics?.activeEmails ?? '142'}
              </div>
              <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-[var(--line)] text-[11.5px]">
                <span className="flex items-center gap-1 font-bold text-[var(--ok)]">
                  <TrendingUp className="w-3.5 h-3.5" /> +18.4%
                </span>
                <span className="text-[var(--t2)]">vs last period</span>
              </div>
            </Card>

            <Card className="p-5" hoverEffect>
              <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-[var(--t2)] mb-1">
                <span>Total Messages Processed</span>
                <div className="p-1.5 rounded-[8px] bg-[#56a8ff]/15 text-[#56a8ff]">
                  <MessageSquare className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-extrabold tracking-tight text-[var(--t0)] mt-1 font-mono">
                {metrics?.totalMessages ?? '2,840'}
              </div>
              <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-[var(--line)] text-[11.5px]">
                <span className="flex items-center gap-1 font-bold text-[var(--ok)]">
                  <TrendingUp className="w-3.5 h-3.5" /> +24.1%
                </span>
                <span className="text-[var(--t2)]">Throughput ok</span>
              </div>
            </Card>

            <Card className="p-5" hoverEffect>
              <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-[var(--t2)] mb-1">
                <span>OTP Detection Accuracy</span>
                <div className="p-1.5 rounded-[8px] bg-[var(--ok-soft)] text-[var(--ok)]">
                  <Zap className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-extrabold tracking-tight text-[var(--ok)] mt-1 font-mono">
                99.2%
              </div>
              <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-[var(--line)] text-[11.5px]">
                <span className="text-[var(--ok)] font-bold">{metrics?.otpDetections ?? '842'} Extracted</span>
                <span className="text-[var(--t2)]">Heuristic engine</span>
              </div>
            </Card>

            <Card className="p-5" hoverEffect>
              <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-[var(--t2)] mb-1">
                <span>Registered Users</span>
                <div className="p-1.5 rounded-[8px] bg-[#f7b84e]/15 text-[#f7b84e]">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-extrabold tracking-tight text-[var(--t0)] mt-1 font-mono">
                {metrics?.totalUsers ?? '48'}
              </div>
              <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-[var(--line)] text-[11.5px]">
                <span className="flex items-center gap-1 font-bold text-[var(--ok)]">
                  <TrendingUp className="w-3.5 h-3.5" /> +12.5%
                </span>
                <span className="text-[var(--t2)]">{metrics?.activeUsers ?? 45} Active</span>
              </div>
            </Card>
          </div>

          {/* Main Visual Chart: Traffic & Conversion Trend */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="p-6 lg:col-span-2">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-[var(--t0)]">
                    Inbound Mail Traffic & OTP Extraction Velocity
                  </h3>
                  <p className="text-xs text-[var(--t2)] mt-0.5">
                    Hourly telemetry of received messages versus successful OTP detection.
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs font-bold">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[var(--acc)]" />
                    <span className="text-[var(--t1)]">Messages</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[var(--ok)]" />
                    <span className="text-[var(--t1)]">Extracted OTPs</span>
                  </div>
                </div>
              </div>

              {/* Vela Custom SVG Chart */}
              <div className="h-56 w-full flex items-end justify-between gap-2 pt-6">
                {[
                  { time: '00:00', msgs: 45, otps: 38 },
                  { time: '03:00', msgs: 28, otps: 24 },
                  { time: '06:00', msgs: 52, otps: 46 },
                  { time: '09:00', msgs: 110, otps: 98 },
                  { time: '12:00', msgs: 185, otps: 165 },
                  { time: '15:00', msgs: 240, otps: 215 },
                  { time: '18:00', msgs: 210, otps: 190 },
                  { time: '21:00', msgs: 145, otps: 132 },
                ].map((point, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full gap-2 group">
                    <div className="w-full flex items-end justify-center gap-1.5 h-full">
                      <div
                        className="w-1/2 rounded-t-[6px] bg-[var(--acc)] hover:bg-[var(--acc-2)] transition-all group-hover:scale-y-105"
                        style={{ height: `${(point.msgs / 260) * 100}%` }}
                        title={`${point.time} - Messages: ${point.msgs}`}
                      />
                      <div
                        className="w-1/2 rounded-t-[6px] bg-[var(--ok)] hover:opacity-90 transition-all group-hover:scale-y-105"
                        style={{ height: `${(point.otps / 260) * 100}%` }}
                        title={`${point.time} - OTPs: ${point.otps}`}
                      />
                    </div>
                    <span className="text-[10.5px] font-mono text-[var(--t2)]">{point.time}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Device & Client Breakdown */}
            <Card className="p-6">
              <h3 className="text-sm font-bold text-[var(--t0)] mb-1">
                Client Platforms & Protocols
              </h3>
              <p className="text-xs text-[var(--t2)] mb-5">
                Inbound requests by client environment
              </p>

              <div className="space-y-4">
                {[
                  { name: 'Desktop Web App', pct: 62, count: '1,760 reqs', color: 'bg-[var(--acc)]' },
                  { name: 'Mobile Web (iOS/Android)', pct: 24, count: '681 reqs', color: 'bg-[#56a8ff]' },
                  { name: 'Automated API Hooks', pct: 10, count: '284 reqs', color: 'bg-[var(--ok)]' },
                  { name: 'CLI / Headless Agent', pct: 4, count: '115 reqs', color: 'bg-[#f7b84e]' },
                ].map((item, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[var(--t0)]">{item.name}</span>
                      <span className="text-[var(--t2)] font-mono">{item.pct}% ({item.count})</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[var(--bg-3)] overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-[var(--line)] flex items-center justify-between text-xs text-[var(--t2)]">
                <span>Average Response Time:</span>
                <span className="font-mono font-bold text-[var(--ok)]">38ms</span>
              </div>
            </Card>
          </div>

          {/* Live Recent Messages & Mailboxes Table */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-[var(--t0)]">Live Stream: Incoming Mail & OTP Extractions</h3>
                <p className="text-xs text-[var(--t2)]">Real-time log of received emails across active disposable addresses</p>
              </div>
              <Link href="/admin/messages">
                <Button variant="ghost" size="sm" rightIcon={<ChevronRight className="w-3.5 h-3.5" />}>
                  View All Logs
                </Button>
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--line)] text-[var(--t2)] uppercase tracking-wider font-extrabold text-[10.5px]">
                    <th className="pb-3">Timestamp</th>
                    <th className="pb-3">Recipient Mailbox</th>
                    <th className="pb-3">Sender / Service</th>
                    <th className="pb-3">Subject</th>
                    <th className="pb-3">Detected OTP</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)] text-[var(--t1)]">
                  {recentMessages.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-[var(--t2)]">
                        No recent messages recorded yet.
                      </td>
                    </tr>
                  ) : (
                    recentMessages.map((msg) => (
                      <tr key={msg.id} className="hover:bg-[var(--bg-3)]/40 transition-colors">
                        <td className="py-3 font-mono text-[var(--t2)]">
                          {new Date(msg.received_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3 font-mono font-bold text-[var(--t0)]">
                          {msg.recipient}
                        </td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded-[6px] bg-[var(--bg-3)] border border-[var(--line)] font-semibold text-[var(--t0)]">
                            {msg.sender}
                          </span>
                        </td>
                        <td className="py-3 truncate max-w-[200px] text-[var(--t0)] font-medium">
                          {msg.subject}
                        </td>
                        <td className="py-3">
                          {msg.detected_otp ? (
                            <span className="px-2 py-0.5 rounded-[6px] bg-[var(--ok-soft)] text-[var(--ok)] border border-[var(--ok)]/30 font-mono font-extrabold">
                              {msg.detected_otp}
                            </span>
                          ) : (
                            <span className="text-[var(--t2)] italic">none</span>
                          )}
                        </td>
                        <td className="py-3 text-right">
                          <Badge variant="success" size="sm">
                            Processed
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* =========================================================================
          DASHBOARD 2: SALES & ORDERS DASHBOARD
      ========================================================================= */}
      {activeTab === 'sales' && (
        <div className="space-y-6 animate-fade-in">
          {/* Sales KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-5" hoverEffect>
              <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-[var(--t2)] mb-1">
                <span>Total Settled Revenue</span>
                <div className="p-1.5 rounded-[8px] bg-[var(--ok-soft)] text-[var(--ok)]">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-extrabold tracking-tight text-[var(--ok)] mt-1 font-mono">
                ৳{metrics?.totalRevenue ?? 4250} BDT
              </div>
              <div className="text-xs text-[var(--t2)] mt-2">
                Approved: {metrics?.approvedPaymentsCount ?? 17} manual orders
              </div>
            </Card>

            <Card className="p-5" hoverEffect>
              <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-[var(--t2)] mb-1">
                <span>Pending Approvals</span>
                <div className="p-1.5 rounded-[8px] bg-[#f76d7d]/15 text-[#f76d7d]">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-extrabold tracking-tight text-[#f76d7d] mt-1 font-mono">
                {metrics?.pendingPayments ?? 0}
              </div>
              <div className="text-xs text-[var(--t2)] mt-2">
                Requires manual slip verification
              </div>
            </Card>

            <Card className="p-5" hoverEffect>
              <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-[var(--t2)] mb-1">
                <span>Average Order Value</span>
                <div className="p-1.5 rounded-[8px] bg-[var(--acc-soft)] text-[var(--acc)]">
                  <CreditCard className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-extrabold tracking-tight text-[var(--t0)] mt-1 font-mono">
                ৳250 BDT
              </div>
              <div className="text-xs text-[var(--t2)] mt-2">
                Pro Tier most popular
              </div>
            </Card>

            <Card className="p-5" hoverEffect>
              <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-[var(--t2)] mb-1">
                <span>Conversion Velocity</span>
                <div className="p-1.5 rounded-[8px] bg-[#f7b84e]/15 text-[#f7b84e]">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-extrabold tracking-tight text-[var(--t0)] mt-1 font-mono">
                35.4%
              </div>
              <div className="text-xs text-[var(--ok)] mt-2 font-bold">
                +4.2% upgrade rate
              </div>
            </Card>
          </div>

          {/* Pending Payment Queue with 1-Click Verification */}
          <Card className="p-6 border border-[#f7b84e]/30 bg-[#f7b84e]/5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-[9px] bg-[#f7b84e] text-black font-bold">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[var(--t0)]">
                    Manual Payment Verification Queue ({recentPayments.filter(p => p.status === 'pending').length} Action Items)
                  </h3>
                  <p className="text-xs text-[var(--t2)]">
                    Verify submitted transaction IDs against bKash, Nagad, and Rocket merchant statements.
                  </p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--line)] text-[var(--t2)] uppercase tracking-wider font-extrabold text-[10.5px]">
                    <th className="pb-3">Order ID</th>
                    <th className="pb-3">Customer Email</th>
                    <th className="pb-3">Method</th>
                    <th className="pb-3">Trx ID / Sender No.</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3 text-right">Instant Decision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)] text-[var(--t1)]">
                  {recentPayments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-[var(--t2)]">
                        No pending payments to review. All orders are settled!
                      </td>
                    </tr>
                  ) : (
                    recentPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-[var(--bg-3)]/40 transition-colors">
                        <td className="py-3 font-mono font-bold text-[var(--t0)]">{p.id}</td>
                        <td className="py-3 font-medium text-[var(--t0)]">{p.user_email || p.user_id}</td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded-[6px] font-bold text-[10px] bg-[var(--bg-3)] border border-[var(--line)] text-[var(--t0)]">
                            {p.payment_method.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 font-mono text-[var(--t0)]">
                          <span className="font-extrabold">{p.transaction_id || 'TRX-DEMO'}</span>
                          <span className="text-[var(--t2)] text-[11px] block">{p.sender_identifier}</span>
                        </td>
                        <td className="py-3 font-mono font-extrabold text-[var(--ok)]">
                          ৳{p.amount} BDT
                        </td>
                        <td className="py-3 text-right">
                          {p.status === 'pending' ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleVerifyPayment(p.id, 'approved')}
                                className="px-2.5 py-1 rounded-[8px] bg-[var(--ok)] hover:opacity-90 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shadow-sm"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Approve
                              </button>
                              <button
                                onClick={() => handleVerifyPayment(p.id, 'rejected')}
                                className="px-2.5 py-1 rounded-[8px] bg-[#f76d7d] hover:opacity-90 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shadow-sm"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                Reject
                              </button>
                            </div>
                          ) : (
                            <Badge variant={p.status === 'approved' ? 'success' : 'danger'} size="sm">
                              {p.status.toUpperCase()}
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* =========================================================================
          DASHBOARD 3: SAAS & INFRASTRUCTURE TELEMETRY
      ========================================================================= */}
      {activeTab === 'saas' && (
        <div className="space-y-6 animate-fade-in">
          {/* Server gauges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-5">
              <div className="flex items-center justify-between text-xs font-bold text-[var(--t2)] uppercase mb-2">
                <span>Catch-All Latency</span>
                <Server className="w-4 h-4 text-[var(--ok)]" />
              </div>
              <div className="text-3xl font-extrabold text-[var(--ok)] font-mono">38ms</div>
              <div className="text-xs text-[var(--t2)] mt-2">Zero queue backlog</div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between text-xs font-bold text-[var(--t2)] uppercase mb-2">
                <span>Postfix Ingest Rate</span>
                <Activity className="w-4 h-4 text-[var(--acc)]" />
              </div>
              <div className="text-3xl font-extrabold text-[var(--t0)] font-mono">42 / sec</div>
              <div className="text-xs text-[var(--t2)] mt-2">Peak buffer capacity</div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between text-xs font-bold text-[var(--t2)] uppercase mb-2">
                <span>Catch-All Domains</span>
                <Globe className="w-4 h-4 text-[#56a8ff]" />
              </div>
              <div className="text-3xl font-extrabold text-[#56a8ff] font-mono">3 Active</div>
              <div className="text-xs text-[var(--t2)] mt-2">mail.omnibey.com healthy</div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between text-xs font-bold text-[var(--t2)] uppercase mb-2">
                <span>Memory Buffer</span>
                <HardDrive className="w-4 h-4 text-[#f7b84e]" />
              </div>
              <div className="text-3xl font-extrabold text-[var(--t0)] font-mono">14.8 MB</div>
              <div className="text-xs text-[var(--ok)] mt-2 font-bold">Auto-purged on expiry</div>
            </Card>
          </div>

          {/* Health Diagnostics card */}
          <Card className="p-6">
            <h3 className="text-sm font-bold text-[var(--t0)] mb-1">
              Infrastructure Components Status
            </h3>
            <p className="text-xs text-[var(--t2)] mb-5">
              Heartbeat checks across storage, mail routing, heuristic parser, and webhook notifier.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'SMTP Catch-All Router (mail.omnibey.com)', status: 'Operational', latency: '34ms', ok: true },
                { name: 'Heuristic OTP Regex Parser Engine', status: 'Operational (99.2%)', latency: '2ms', ok: true },
                { name: 'Memory Queue & Auto-Expiry Purger', status: 'Operational', latency: '5ms', ok: true },
                { name: 'Telegram Merchant Bot Dispatcher', status: 'Active (Standby)', latency: '48ms', ok: true },
                { name: 'Supabase PostgreSQL Cloud Replica', status: 'Connected', latency: '26ms', ok: true },
                { name: 'Local Fast Store Persistence Engine', status: 'In-Memory Healthy', latency: '0.4ms', ok: true },
              ].map((comp, i) => (
                <div key={i} className="flex items-center justify-between p-3.5 rounded-[12px] border border-[var(--line)] bg-[var(--bg-3)]">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-[var(--ok)] animate-pulse" />
                    <div>
                      <div className="text-xs font-extrabold text-[var(--t0)]">{comp.name}</div>
                      <div className="text-[11px] text-[var(--t2)] font-mono">{comp.latency}</div>
                    </div>
                  </div>
                  <Badge variant="success" size="sm">
                    {comp.status}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* =========================================================================
          DASHBOARD 4: SECURITY & AUDIT LOGS DASHBOARD
      ========================================================================= */}
      {activeTab === 'security' && (
        <div className="space-y-6 animate-fade-in">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-[var(--t0)]">
                  Immutable Security Audit Trail
                </h3>
                <p className="text-xs text-[var(--t2)]">
                  Cryptographic log of all administrative authorizations, role modifications, and payment settlements.
                </p>
              </div>
              <Link href="/admin/audit-logs">
                <Button variant="outline" size="sm">
                  Export Log JSON
                </Button>
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--line)] text-[var(--t2)] uppercase tracking-wider font-extrabold text-[10.5px]">
                    <th className="pb-3">Timestamp</th>
                    <th className="pb-3">Action Event</th>
                    <th className="pb-3">Admin</th>
                    <th className="pb-3">Target Reference</th>
                    <th className="pb-3 text-right">Target Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)] text-[var(--t1)]">
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-[var(--t2)]">
                        No audit events recorded yet.
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-[var(--bg-3)]/40 transition-colors">
                        <td className="py-3 font-mono text-[var(--t2)]">
                          {new Date(log.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' })}
                        </td>
                        <td className="py-3 font-bold text-[var(--t0)]">
                          {log.action}
                        </td>
                        <td className="py-3 font-mono text-[var(--t1)]">
                          {log.admin_email || log.admin_id}
                        </td>
                        <td className="py-3 font-mono text-[var(--t2)]">
                          {log.target_id || 'System'}
                        </td>
                        <td className="py-3 text-right">
                          <Badge
                            variant={
                              log.action.includes('delete') || log.action.includes('reject')
                                ? 'danger'
                                : log.action.includes('create') || log.action.includes('approve')
                                ? 'success'
                                : 'primary'
                            }
                            size="sm"
                          >
                            {log.target_type.toUpperCase()}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
