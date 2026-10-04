'use client';

import React, { useState } from 'react';
import { Settings, Bell, Clock, Shield, Sparkles, Check } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function SettingsPage() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [defaultLifespan, setDefaultLifespan] = useState('60');
  const [telegramAlerts, setTelegramAlerts] = useState(true);
  const [autoCopyOtp, setAutoCopyOtp] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          Dashboard & Mailbox Preferences
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Configure temporary mailbox defaults, notification alerts, and security options.
        </p>
      </div>

      {saved && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 p-3 text-xs text-emerald-700 dark:text-emerald-300">
          <Check className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>Preferences successfully saved.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <Card className="p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Mailbox Defaults
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Default Mailbox Lifetime
            </label>
            <select
              value={defaultLifespan}
              onChange={(e) => setDefaultLifespan(e.target.value)}
              className="w-full sm:w-64 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <option value="15">15 Minutes</option>
              <option value="30">30 Minutes</option>
              <option value="60">60 Minutes (Recommended)</option>
              <option value="180">3 Hours</option>
              <option value="1440">24 Hours</option>
            </select>
            <p className="mt-1 text-[11px] text-slate-400">
              New addresses generated will start with this countdown timer. You can extend it at any time.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-900 dark:text-white">
                  Real-Time Live Inbox Auto-Polling
                </div>
                <div className="text-[11px] text-slate-500">
                  Automatically check for incoming messages and OTPs every 5 seconds.
                </div>
              </div>
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-900 dark:text-white">
                  Auto-Copy Extracted Verification Codes
                </div>
                <div className="text-[11px] text-slate-500">
                  Automatically copy high-confidence OTPs directly to clipboard upon email arrival.
                </div>
              </div>
              <input
                type="checkbox"
                checked={autoCopyOtp}
                onChange={(e) => setAutoCopyOtp(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Notifications & Alerts
          </h2>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-900 dark:text-white">
                Telegram Payment & Order Status Notifications
              </div>
              <div className="text-[11px] text-slate-500">
                Receive instant notifications when an admin verifies and approves your top-up.
              </div>
            </div>
            <input
              type="checkbox"
              checked={telegramAlerts}
              onChange={(e) => setTelegramAlerts(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
          </div>
        </Card>

        <Button type="submit" variant="primary" size="md">
          Save Settings
        </Button>
      </form>
    </div>
  );
}
