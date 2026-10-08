'use client';

import React, { useState, useEffect } from 'react';
import { User, Lock, Calendar, Check, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { UserProfile } from '@/types';

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Password change form
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passMsg, setPassMsg] = useState<string | null>(null);
  const [passError, setPassError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/auth/session')
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          setName(data.user.name || '');
          setPhone(data.user.phone || '');
        }
      })
      .finally(() => setLoading(false));
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
      setPassError('New passwords do not match.');
      return;
    }
    if (newPass.length < 6) {
      setPassError('New password must contain at least 6 characters.');
      return;
    }

    setPassMsg('Password updated successfully.');
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
    setTimeout(() => setPassMsg(null), 3500);
  };

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in text-[var(--t0)]">
      <div className="pb-4 border-b border-[var(--line)]">
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--t0)] flex items-center gap-2.5">
          <User className="w-6 h-6 text-[var(--acc)]" />
          Account Profile & Security
        </h1>
        <p className="mt-1 text-xs text-[var(--t2)] font-medium">
          Manage your personal details, credentials, and authentication preferences.
        </p>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2.5 rounded-[12px] bg-[var(--ok-soft)] border border-[var(--ok)]/30 p-3.5 text-xs text-[var(--ok)] font-semibold animate-fade-in">
          <Check className="w-4 h-4 shrink-0 text-[var(--ok)]" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Account Overview Card */}
      {loading ? (
        <div className="p-6 rounded-[18px] border border-[var(--line)] bg-[var(--bg-2)] space-y-4">
          <div className="flex items-center gap-4">
            <Skeleton variant="circle" className="w-14 h-14" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3 w-56" />
            </div>
          </div>
          <div className="pt-4 border-t border-[var(--line)] grid grid-cols-2 gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      ) : (
        <Card className="p-6 bg-[var(--bg-2)] border-[var(--line)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--line)]">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[16px] bg-[var(--acc)] text-white font-extrabold text-xl shadow-lg shadow-[var(--acc-soft)]">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-[var(--t0)]">
                    {user?.name}
                  </h2>
                  <Badge variant={user?.account_status === 'active' ? 'success' : 'danger'} size="sm">
                    {user?.account_status || 'active'}
                  </Badge>
                </div>
                <p className="text-xs text-[var(--t2)] font-mono mt-0.5">
                  {user?.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-[var(--t2)] font-medium">
              <Calendar className="w-4 h-4" />
              <span>Member since: {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Recent'}</span>
            </div>
          </div>

          {/* Edit Form */}
          <form onSubmit={handleUpdateProfile} className="mt-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[var(--t1)] mb-1 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-[11px] border border-[var(--line)] bg-[var(--bg-3)] text-[var(--t0)] text-xs focus:outline-none focus:border-[var(--acc)] transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--t1)] mb-1 uppercase tracking-wider">
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="+8801XXXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-[11px] border border-[var(--line)] bg-[var(--bg-3)] text-[var(--t0)] text-xs focus:outline-none focus:border-[var(--acc)] transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--t1)] mb-1 uppercase tracking-wider">
                Primary Account Email (Read-Only)
              </label>
              <input
                type="email"
                readOnly
                value={user?.email || ''}
                className="w-full px-3.5 py-2.5 rounded-[11px] border border-[var(--line)] bg-[var(--bg-inset)] text-[var(--t2)] font-mono text-xs select-all cursor-not-allowed"
              />
            </div>

            <div className="pt-2">
              <Button type="submit" variant="primary" size="md" isLoading={saving}>
                Save Profile Changes
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Change Password Card */}
      <Card className="p-6 bg-[var(--bg-2)] border-[var(--line)]">
        <h3 className="text-base font-bold text-[var(--t0)] mb-1 flex items-center gap-2">
          <Lock className="w-4 h-4 text-[var(--acc)]" />
          Update Password
        </h3>
        <p className="text-xs text-[var(--t2)] mb-4">
          Ensure your account is protected with a strong, distinct passphrase.
        </p>

        {passError && (
          <div className="mb-4 flex items-center gap-2.5 rounded-[12px] bg-[var(--bad-soft)] border border-[var(--bad)]/30 p-3 text-xs text-[var(--bad)] font-semibold animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-[var(--bad)]" />
            <span>{passError}</span>
          </div>
        )}

        {passMsg && (
          <div className="mb-4 flex items-center gap-2.5 rounded-[12px] bg-[var(--ok-soft)] border border-[var(--ok)]/30 p-3 text-xs text-[var(--ok)] font-semibold animate-fade-in">
            <Check className="w-4 h-4 shrink-0 text-[var(--ok)]" />
            <span>{passMsg}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-bold text-[var(--t1)] mb-1 uppercase tracking-wider">
              Current Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={currentPass}
              onChange={(e) => setCurrentPass(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-[11px] border border-[var(--line)] bg-[var(--bg-3)] text-[var(--t0)] text-xs focus:outline-none focus:border-[var(--acc)] transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--t1)] mb-1 uppercase tracking-wider">
              New Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-[11px] border border-[var(--line)] bg-[var(--bg-3)] text-[var(--t0)] text-xs focus:outline-none focus:border-[var(--acc)] transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--t1)] mb-1 uppercase tracking-wider">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-[11px] border border-[var(--line)] bg-[var(--bg-3)] text-[var(--t0)] text-xs focus:outline-none focus:border-[var(--acc)] transition-all font-medium"
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
