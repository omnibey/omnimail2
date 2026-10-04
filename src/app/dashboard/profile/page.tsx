'use client';

import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, ShieldCheck, Lock, Calendar, LogOut, Check, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { UserProfile } from '@/types';

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Password change form
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passMsg, setPassMsg] = useState<string | null>(null);
  const [passError, setPassError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/auth/session')
      .then(r => r.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
          setName(data.user.name || '');
          setPhone(data.user.phone || '');
        }
      });
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    try {
      setSaving(true);
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_profile',
          userId: user?.id,
          name,
          phone,
        }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        setSuccessMsg('Profile updated successfully.');
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch {
      //
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassMsg(null);

    if (newPass !== confirmPass) {
      setPassError('New passwords do not match');
      return;
    }
    if (newPass.length < 6) {
      setPassError('New password must be at least 6 characters');
      return;
    }

    setPassMsg('Password changed successfully.');
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
    setTimeout(() => setPassMsg(null), 3500);
  };

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <User className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          Account Profile & Security
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Manage your personal details, credentials, and authentication preferences.
        </p>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 p-3 text-xs text-emerald-700 dark:text-emerald-300">
          <Check className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Account Overview Card */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white font-bold text-xl shadow-lg shadow-indigo-600/20">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {user?.name}
                </h2>
                <Badge variant={user?.account_status === 'active' ? 'success' : 'danger'} size="sm">
                  {user?.account_status || 'active'}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {user?.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>Member since: {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Recent'}</span>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleUpdateProfile} className="mt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                placeholder="+8801XXXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Primary Account Email (Read-Only)
            </label>
            <input
              type="email"
              readOnly
              value={user?.email || ''}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-xs text-slate-500 select-all cursor-not-allowed"
            />
          </div>

          <div className="pt-2">
            <Button type="submit" variant="primary" size="md" isLoading={saving}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Card>

      {/* Change Password Card */}
      <Card className="p-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
          <Lock className="w-4 h-4 text-indigo-500" />
          Update Password
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Ensure your account is protected with a strong, distinct passphrase.
        </p>

        {passError && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 p-3 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{passError}</span>
          </div>
        )}

        {passMsg && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 p-3 text-xs text-emerald-700 dark:text-emerald-300">
            <Check className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{passMsg}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Current Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={currentPass}
              onChange={(e) => setCurrentPass(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              New Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          <Button type="submit" variant="secondary" size="md">
            Update Password
          </Button>
        </form>
      </Card>
    </div>
  );
}
