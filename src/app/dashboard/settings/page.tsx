'use client';

import React, { useState } from 'react';
import { Settings, Bell, Clock, Shield, Check } from 'lucide-react';
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
    <div className="space-y-6 max-w-4xl animate-fade-in text-[var(--t0)]">
      <div className="pb-4 border-b border-[var(--line)]">
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--t0)] flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-[var(--acc)]" />
          Dashboard & Mailbox Preferences
        </h1>
        <p className="mt-1 text-xs text-[var(--t2)] font-medium">
          Configure temporary mailbox defaults, notification alerts, and automated OTP preferences.
        </p>
      </div>

      {saved && (
        <div className="flex items-center gap-2.5 rounded-[12px] bg-[var(--ok-soft)] border border-[var(--ok)]/30 p-3.5 text-xs text-[var(--ok)] font-semibold animate-fade-in">
          <Check className="w-4 h-4 shrink-0 text-[var(--ok)]" />
          <span>Preferences successfully saved.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <Card className="p-6 space-y-4 bg-[var(--bg-2)] border-[var(--line)]">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[var(--acc)]" />
            <h2 className="text-base font-bold text-[var(--t0)]">
              Mailbox Defaults
            </h2>
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--t1)] mb-1 uppercase tracking-wider">
              Default Mailbox Lifetime
            </label>
            <select
              value={defaultLifespan}
              onChange={(e) => setDefaultLifespan(e.target.value)}
              className="w-full sm:w-64 px-3.5 py-2.5 rounded-[11px] border border-[var(--line)] bg-[var(--bg-3)] text-[var(--t0)] text-xs focus:outline-none focus:border-[var(--acc)] transition-all font-medium cursor-pointer"
            >
              <option value="15">15 Minutes</option>
              <option value="30">30 Minutes</option>
              <option value="60">60 Minutes (Recommended)</option>
              <option value="180">3 Hours</option>
              <option value="1440">24 Hours</option>
            </select>
            <p className="mt-1.5 text-[11px] text-[var(--t2)] font-medium">
              New addresses generated will start with this countdown timer. You can extend it at any time.
            </p>
          </div>

          <div className="pt-3 border-t border-[var(--line)] space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-bold text-[var(--t0)]">
                  Real-Time Live Inbox Auto-Polling
                </div>
                <div className="text-[11px] text-[var(--t2)] mt-0.5">
                  Automatically check for incoming messages and verification OTPs every 5 seconds.
                </div>
              </div>
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="h-4 w-4 rounded-[4px] border-[var(--line)] accent-[var(--acc)] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-bold text-[var(--t0)]">
                  Auto-Copy Extracted Verification Codes
                </div>
                <div className="text-[11px] text-[var(--t2)] mt-0.5">
                  Automatically copy high-confidence OTPs directly to clipboard upon email arrival.
                </div>
              </div>
              <input
                type="checkbox"
                checked={autoCopyOtp}
                onChange={(e) => setAutoCopyOtp(e.target.checked)}
                className="h-4 w-4 rounded-[4px] border-[var(--line)] accent-[var(--acc)] cursor-pointer"
              />
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-4 bg-[var(--bg-2)] border-[var(--line)]">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[var(--acc)]" />
            <h2 className="text-base font-bold text-[var(--t0)]">
              Notifications & Alerts
            </h2>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-[var(--t0)]">
                Telegram Payment & Order Status Notifications
              </div>
              <div className="text-[11px] text-[var(--t2)] mt-0.5">
                Receive instant notifications when an admin verifies and approves your top-up.
              </div>
            </div>
            <input
              type="checkbox"
              checked={telegramAlerts}
              onChange={(e) => setTelegramAlerts(e.target.checked)}
              className="h-4 w-4 rounded-[4px] border-[var(--line)] accent-[var(--acc)] cursor-pointer"
            />
          </div>
        </Card>

        <Button type="submit" variant="primary" size="md">
          Save Preferences
        </Button>
      </form>
    </div>
  );
}
