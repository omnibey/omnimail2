'use client';

import React, { useState, useEffect } from 'react';
import { Users, Search, Coins, ShieldAlert, Check, AlertCircle, Ban, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { UserProfile } from '@/types';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [adjustAmount, setAdjustAmount] = useState('50');
  const [adjustReason, setAdjustReason] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/metrics');
      const data = await res.json();
      if (data.recentUsers) setUsers(data.recentUsers);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAdjustCredits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      setLoading(true);
      const res = await fetch('/api/admin/users/adjust-credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          amount: Number(adjustAmount),
          adminId: 'user-admin-1',
          reason: adjustReason || 'Administrative credit bonus adjustment',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Adjustment failed');
      }

      setToastMsg(`Credits updated! New balance for ${selectedUser.email}: ${data.newBalance}`);
      setAdjustModalOpen(false);
      setAdjustReason('');
      fetchUsers();
      setTimeout(() => setToastMsg(null), 4000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Adjustment error');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(users.map(u => {
      if (u.id === userId) {
        const newStatus = u.account_status === 'active' ? 'suspended' : 'active';
        return { ...u, account_status: newStatus };
      }
      return u;
    }));
    setToastMsg('User account status updated.');
    setTimeout(() => setToastMsg(null), 3000);
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            User Management Directory
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            View accounts, monitor usage, adjust credit balances, and enforce suspension controls.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>
      </div>

      {toastMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 p-3 text-xs text-emerald-700 dark:text-emerald-300">
          <Check className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{toastMsg}</span>
        </div>
      )}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">User</th>
                <th className="px-5 py-3.5">Role</th>
                <th className="px-5 py-3.5">Credits</th>
                <th className="px-5 py-3.5">Account Status</th>
                <th className="px-5 py-3.5">Registered</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-bold text-slate-900 dark:text-white">
                      {u.name}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {u.email}
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <Badge variant={u.role === 'admin' ? 'warning' : 'neutral'} size="sm">
                      {u.role}
                    </Badge>
                  </td>

                  <td className="px-5 py-4 font-bold text-indigo-600 dark:text-indigo-400">
                    <div className="flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5 text-amber-500" />
                      <span>{u.credits}</span>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <Badge variant={u.account_status === 'active' ? 'success' : 'danger'} size="sm">
                      {u.account_status}
                    </Badge>
                  </td>

                  <td className="px-5 py-4 text-slate-400">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>

                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        onClick={() => {
                          setSelectedUser(u);
                          setAdjustModalOpen(true);
                        }}
                        variant="outline"
                        size="sm"
                        leftIcon={<Coins className="w-3.5 h-3.5 text-amber-500" />}
                      >
                        Adjust Credits
                      </Button>

                      <button
                        onClick={() => toggleUserStatus(u.id)}
                        className={`p-1.5 rounded-lg text-xs transition-colors ${
                          u.account_status === 'active'
                            ? 'text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                            : 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                        }`}
                        title={u.account_status === 'active' ? 'Suspend Account' : 'Activate Account'}
                      >
                        {u.account_status === 'active' ? <Ban className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Adjust Credits Modal */}
      <Modal
        isOpen={adjustModalOpen}
        onClose={() => setAdjustModalOpen(false)}
        title={`Adjust Credits: ${selectedUser?.name}`}
        description="Manually credit or debit user account with recorded audit reason"
        maxWidth="md"
      >
        <form onSubmit={handleAdjustCredits} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Credit Adjustment (Positive to add, Negative to deduct)
            </label>
            <input
              type="number"
              required
              value={adjustAmount}
              onChange={(e) => setAdjustAmount(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Audit Reason <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="e.g. VIP test bonus, promo reward, or customer service refund"
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setAdjustModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={loading}
            >
              Save Adjustment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
