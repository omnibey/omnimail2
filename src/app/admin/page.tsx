'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldAlert, Users, Mail, MessageSquare, 
  CreditCard, Coins, CheckCircle, AlertTriangle, 
  ArrowRight, ShieldCheck, Activity, DollarSign 
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { AuditLog, Payment } from '@/types';

export default function AdminOverviewPage() {
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
  const [pendingPayments, setPendingPayments] = useState<Payment[]>([]);

  useEffect(() => {
    fetch('/api/admin/metrics')
      .then(res => res.json())
      .then(data => {
        if (data.metrics) setMetrics(data.metrics);
        if (data.auditLogs) setAuditLogs(data.auditLogs);
        if (data.recentPayments) {
          setPendingPayments(data.recentPayments.filter((p: Payment) => p.status === 'pending'));
        }
      })
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              OmniBey Admin Control Center
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
              Root Level
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            System health, active temporary mailboxes, manual payment reviews, and immutable audit logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/payments">
            <Button variant="danger" size="sm" leftIcon={<CreditCard className="w-4 h-4" />}>
              Review Pending Payments ({metrics?.pendingPayments || 0})
            </Button>
          </Link>
          <Link href="/admin/audit-logs">
            <Button variant="outline" size="sm">
              Audit Logs
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards 4x2 Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4" hoverEffect>
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
            <span>Total Users</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {metrics?.totalUsers ?? '—'}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
            Active & Verified
          </div>
        </Card>

        <Card className="p-4" hoverEffect>
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
            <span>Active Mailboxes</span>
            <Mail className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-2xl font-extrabold text-cyan-600 dark:text-cyan-400">
            {metrics?.activeEmails ?? '—'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Expired: {metrics?.expiredEmails ?? 0}
          </div>
        </Card>

        <Card className="p-4" hoverEffect>
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
            <span>Total Messages</span>
            <MessageSquare className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {metrics?.totalMessages ?? '—'}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
            {metrics?.otpDetections ?? 0} OTPs Extracted
          </div>
        </Card>

        <Card className="p-4" hoverEffect>
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
            <span>Total Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            ৳{metrics?.totalRevenue ?? 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Approved: {metrics?.approvedPaymentsCount ?? 0} orders
          </div>
        </Card>
      </div>

      {/* System Health & Provider Status Banner */}
      <Card className="p-5 border-emerald-500/20 bg-emerald-500/5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>OmniBey Gateway Status:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase text-xs">
                  Operational (99.98% uptime)
                </span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Catch-all routing at <code>mail.omnibey.com</code> • Supabase PostgreSQL RLS Active
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              Real-Time Event Bus Live
            </span>
          </div>
        </div>
      </Card>

      {/* Two Column Section: Pending Payments & Recent Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Payments Alert */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-amber-500" />
                Payments Requiring Verification
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                bKash, Nagad, Rocket, Upay, and Binance transactions
              </p>
            </div>
            <Link
              href="/admin/payments"
              className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
            >
              Verify Queue <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {pendingPayments.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              All payment submissions have been reviewed and verified.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingPayments.map((p) => (
                <div
                  key={p.id}
                  className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/20 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2 font-mono font-bold text-slate-900 dark:text-white">
                      <span>{p.payment_ref}</span>
                      <span className="uppercase text-[10px] bg-amber-500/20 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded">
                        {p.payment_method}
                      </span>
                    </div>
                    <div className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                      Sender: {p.sender_identifier} • ৳{p.amount}
                    </div>
                  </div>

                  <Link href="/admin/payments">
                    <Button variant="primary" size="sm">
                      Inspect
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Audit Trail */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-500" />
                Administrative Audit Trail
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Immutable security logs of admin decisions
              </p>
            </div>
            <Link
              href="/admin/audit-logs"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              All Logs <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {auditLogs.slice(0, 4).map((log) => (
              <div key={log.id} className="py-2.5 flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white font-mono">
                    {log.action}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Target: {log.target_type} ({log.target_id})
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 whitespace-nowrap">
                  {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
