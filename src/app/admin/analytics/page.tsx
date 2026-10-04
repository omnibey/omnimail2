'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Mail, MessageSquare, DollarSign, Activity } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function AdminAnalyticsPage() {
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
  } | null>(null);

  useEffect(() => {
    fetch('/api/admin/metrics')
      .then(res => res.json())
      .then(data => {
        if (data.metrics) setMetrics(data.metrics);
      });
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <BarChart3 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          SaaS Performance & Growth Analytics
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Telemetry on user growth, mailbox generation frequency, OTP extraction success, and manual payment revenue.
        </p>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Conversion Rate
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            18.4%
          </div>
          <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" /> +2.3% this week
          </div>
        </Card>

        <Card className="p-5">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            OTP Extraction Rate
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            96.8%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Heuristic pattern matching
          </div>
        </Card>

        <Card className="p-5">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Average Order Value
          </div>
          <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
            ৳250 BDT
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            bKash & Nagad majority
          </div>
        </Card>

        <Card className="p-5">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Average Mailbox Lifespan
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            48 mins
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Auto-purged after expiry
          </div>
        </Card>
      </div>

      {/* Visual Chart Mockups using clean Tailwind CSS bars */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Daily Message Volume & OTP Detections
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            Aggregated traffic over the past 7 days
          </p>

          <div className="h-48 flex items-end justify-between gap-3 pt-4 border-b border-slate-200 dark:border-slate-800">
            {[
              { day: 'Mon', msgs: 65, otps: 52 },
              { day: 'Tue', msgs: 82, otps: 71 },
              { day: 'Wed', msgs: 95, otps: 84 },
              { day: 'Thu', msgs: 110, otps: 98 },
              { day: 'Fri', msgs: 145, otps: 130 },
              { day: 'Sat', msgs: 160, otps: 142 },
              { day: 'Sun', msgs: 175, otps: 158 },
            ].map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <div className="w-full flex items-end justify-center gap-1">
                  <div
                    className="w-1/2 bg-indigo-500 rounded-t"
                    style={{ height: `${(d.msgs / 200) * 100}%` }}
                    title={`Messages: ${d.msgs}`}
                  />
                  <div
                    className="w-1/2 bg-emerald-500 rounded-t"
                    style={{ height: `${(d.otps / 200) * 100}%` }}
                    title={`OTPs: ${d.otps}`}
                  />
                </div>
                <span className="text-[10px] text-slate-400">{d.day}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-6 mt-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-indigo-500" />
              <span className="text-slate-600 dark:text-slate-300">Total Messages</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-emerald-500" />
              <span className="text-slate-600 dark:text-slate-300">Extracted OTPs</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Revenue Distribution by Payment Channel
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            Manual gateway settlement share
          </p>

          <div className="space-y-4 pt-2">
            {[
              { method: 'bKash Send Money', pct: 54, amount: '৳2,450', color: 'bg-pink-600' },
              { method: 'Nagad Personal', pct: 28, amount: '৳1,250', color: 'bg-amber-600' },
              { method: 'Binance Pay / USDT', pct: 12, amount: '৳550', color: 'bg-yellow-500' },
              { method: 'Rocket & Upay', pct: 6, amount: '৳280', color: 'bg-purple-600' },
            ].map((ch, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-900 dark:text-white">{ch.method}</span>
                  <span className="text-slate-500">{ch.amount} ({ch.pct}%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className={`h-full ${ch.color} rounded-full`} style={{ width: `${ch.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
