'use client';

import React, { useState } from 'react';
import { Settings, CreditCard, Send, Shield, Check, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function AdminSettingsPage() {
  const [bkashNumber, setBkashNumber] = useState('01711-234567');
  const [nagadNumber, setNagadNumber] = useState('01811-987654');
  const [rocketNumber, setRocketNumber] = useState('01911-345678-9');
  const [upayNumber, setUpayNumber] = useState('01611-123456');
  const [binancePayId, setBinancePayId] = useState('84920194');
  const [binanceWallet, setBinanceWallet] = useState('TRC20: TLZ19xq7mP42XvaN4bA9xQoWp98Z3194');

  // Telegram Bot Settings
  const [telegramToken, setTelegramToken] = useState('123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ');
  const [telegramChatId, setTelegramChatId] = useState('987654321');
  const [notifyPayment, setNotifyPayment] = useState(true);
  const [notifyUser, setNotifyUser] = useState(true);
  const [notifyHealth, setNotifyHealth] = useState(true);

  // Retention Settings
  const [retentionDays, setRetentionDays] = useState('7');

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setToastMsg('Gateway numbers and Telegram configuration updated successfully.');
    setTimeout(() => setToastMsg(null), 3500);
  };

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-amber-500" />
          Admin System & Gateway Settings
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Configure payment destination numbers, Telegram bot alerts, and privacy retention rules.
        </p>
      </div>

      {toastMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 p-3 text-xs text-emerald-700 dark:text-emerald-300">
          <Check className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{toastMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Payment Channels Section */}
        <Card className="p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-indigo-500" />
            Payment Destination Accounts (Displayed to Users on Purchase)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                bKash Personal / Send Money Number
              </label>
              <input
                type="text"
                value={bkashNumber}
                onChange={(e) => setBkashNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nagad Personal Number
              </label>
              <input
                type="text"
                value={nagadNumber}
                onChange={(e) => setNagadNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Rocket 12-Digit Account
              </label>
              <input
                type="text"
                value={rocketNumber}
                onChange={(e) => setRocketNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Upay Personal Account
              </label>
              <input
                type="text"
                value={upayNumber}
                onChange={(e) => setUpayNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Binance Pay ID
              </label>
              <input
                type="text"
                value={binancePayId}
                onChange={(e) => setBinancePayId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Binance USDT (TRC-20) Address
              </label>
              <input
                type="text"
                value={binanceWallet}
                onChange={(e) => setBinanceWallet(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          </div>
        </Card>

        {/* Telegram Notification Bot Section */}
        <Card className="p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Send className="w-4 h-4 text-cyan-500" />
            Telegram Admin Notification Bot
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Telegram Bot Token
              </label>
              <input
                type="password"
                placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                value={telegramToken}
                onChange={(e) => setTelegramToken(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Admin Chat ID
              </label>
              <input
                type="text"
                placeholder="e.g. 987654321"
                value={telegramChatId}
                onChange={(e) => setTelegramChatId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-700 dark:text-slate-300">
                Notify admin instantly on new payment submission (without screenshot)
              </span>
              <input
                type="checkbox"
                checked={notifyPayment}
                onChange={(e) => setNotifyPayment(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-700 dark:text-slate-300">
                Notify on new user account registration
              </span>
              <input
                type="checkbox"
                checked={notifyUser}
                onChange={(e) => setNotifyUser(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-700 dark:text-slate-300">
                Critical system health & provider downtime alerts
              </span>
              <input
                type="checkbox"
                checked={notifyHealth}
                onChange={(e) => setNotifyHealth(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
            </div>
          </div>
        </Card>

        {/* Privacy & Retention */}
        <Card className="p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-500" />
            Storage & Data Retention Rules
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Rejected Payment Screenshot Retention Window
            </label>
            <select
              value={retentionDays}
              onChange={(e) => setRetentionDays(e.target.value)}
              className="w-full sm:w-64 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <option value="3">3 Days</option>
              <option value="7">7 Days (Standard Audit Window)</option>
              <option value="14">14 Days</option>
              <option value="30">30 Days</option>
            </select>
            <p className="mt-1 text-[11px] text-slate-400">
              Approved payment screenshots are deleted immediately to free storage. Rejected proofs are retained for this period for disputes before auto-purging.
            </p>
          </div>
        </Card>

        <Button type="submit" variant="primary" size="md">
          Save Admin Settings
        </Button>
      </form>
    </div>
  );
}
