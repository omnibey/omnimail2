'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, Search, Coins, Ban, CheckCircle2, 
  CreditCard, Mail, Laptop, Smartphone, Tablet, 
  Globe, Calendar, Clock, Eye, RefreshCw, 
  Copy, ShieldCheck, Sparkles, Plus, AlertCircle,
  FileText, Shield, ArrowUpRight, Check, X,
  Trash2, Layers
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { toast } from '@/components/ui/toast';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { AdminUserListItem, AdminUserDetailResponse, AccountStatus } from '@/types';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [metrics, setMetrics] = useState({
    total_users: 0,
    active_users: 0,
    suspended_users: 0,
    pending_approvals_count: 0,
    total_credits: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [packageFilter, setPackageFilter] = useState<'all' | 'pending' | 'paid' | 'free'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin'>('all');

  // Detail Modal State
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [detailUser, setDetailUser] = useState<AdminUserDetailResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'device' | 'packages' | 'emails' | 'credits'>('device');
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Adjust Credits Modal State
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [adjustTargetUser, setAdjustTargetUser] = useState<AdminUserListItem | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('50');
  const [adjustReason, setAdjustReason] = useState('');
  const [adjustLoading, setAdjustLoading] = useState(false);

  // Status Action Loading
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Load Users from Database/Backend
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (packageFilter !== 'all') params.set('package', packageFilter);
      if (roleFilter !== 'all') params.set('role', roleFilter);

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      const data = await res.json();
      if (data.success && data.users) {
        setUsers(data.users);
        if (data.metrics) setMetrics(data.metrics);
      }
    } catch (err) {
      console.error('Failed to fetch admin users:', err);
      toast.error('Could not load user directory');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, packageFilter, roleFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  // Load Deep User Dossier for Modal
  const openUserDetailModal = async (userId: string, defaultTab: 'device' | 'packages' | 'emails' | 'credits' = 'device') => {
    setSelectedUserId(userId);
    setActiveTab(defaultTab);
    setDetailModalOpen(true);
    setDetailLoading(true);

    try {
      const res = await fetch(`/api/admin/users/${userId}`);
      const data = await res.json();
      if (data.success && data.user) {
        setDetailUser(data.user);
      } else {
        throw new Error(data.error || 'Failed to fetch details');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error loading details';
      toast.error('Failed to load user dossier', { description: msg });
    } finally {
      setDetailLoading(false);
    }
  };

  // Adjust Credits Submission
  const handleAdjustCredits = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = adjustTargetUser || detailUser;
    if (!target) return;

    try {
      setAdjustLoading(true);
      const res = await fetch('/api/admin/users/adjust-credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: target.id,
          amount: Number(adjustAmount),
          adminId: 'user-admin-1',
          reason: adjustReason || 'Administrative adjustment',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Adjustment failed');
      }

      toast.success('Credits updated successfully!', {
        description: `New balance for ${target.email}: ${data.newBalance} Credits`,
      });

      setAdjustModalOpen(false);
      setAdjustReason('');
      fetchUsers();

      // If detail modal is open for this user, refresh it
      if (detailUser && detailUser.id === target.id) {
        openUserDetailModal(target.id, 'credits');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Adjustment failed';
      toast.error('Credit update failed', { description: msg });
    } finally {
      setAdjustLoading(false);
    }
  };

  // Toggle User Status (Active <-> Suspended)
  const handleToggleStatus = async (user: AdminUserListItem | AdminUserDetailResponse) => {
    const nextStatus: AccountStatus = user.account_status === 'active' ? 'suspended' : 'active';
    try {
      setActionLoadingId(user.id);
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus, adminId: 'user-admin-1' }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Status update failed');
      }

      toast.success(`User account is now ${nextStatus.toUpperCase()}`, {
        description: `${user.email} status updated in database.`,
      });

      fetchUsers();

      if (detailUser && detailUser.id === user.id) {
        setDetailUser({ ...detailUser, account_status: nextStatus });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error changing status';
      toast.error('Status update failed', { description: msg });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Direct In-Modal Payment Approval
  const handleApprovePayment = async (paymentId: string) => {
    try {
      const res = await fetch('/api/admin/payments/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId,
          adminId: 'user-admin-1',
          adminEmail: 'admin@omnibey.com',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Approval failed');
      }

      toast.success('Payment approved! Credits added immediately.');
      fetchUsers();

      if (selectedUserId) {
        openUserDetailModal(selectedUserId, 'packages');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to approve';
      toast.error('Approval failed', { description: msg });
    }
  };

  // Copy helper
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  // Format date helper
  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Never';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatRelativeTime = (isoString?: string) => {
    if (!isoString) return 'Never';
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  // Device icon helper
  const getDeviceIcon = (deviceType: string) => {
    if (deviceType === 'Mobile') return <Smartphone className="w-3.5 h-3.5 text-blue-500" />;
    if (deviceType === 'Tablet') return <Tablet className="w-3.5 h-3.5 text-purple-500" />;
    return <Laptop className="w-3.5 h-3.5 text-emerald-500" />;
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* 1. Header & Live KPI Metrics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-[12px] bg-[var(--acc-soft)] text-[var(--acc)]">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--t0)] flex items-center gap-2">
                User Management Command Center
                <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-[var(--acc-soft)] text-[var(--acc)] border border-[var(--acc)]/30">
                  Database Connected
                </span>
              </h1>
              <p className="text-xs text-[var(--t2)] mt-0.5">
                Full telemetry control: register dates, connected devices, purchased & pending packages, credit reserves, and disposable inboxes.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            onClick={() => fetchUsers()}
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
          >
            Refresh Records
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 bg-[var(--bg-1)] border-[var(--line)] hover:border-[var(--acc)]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--t2)]">Total Registered</span>
            <div className="p-1.5 rounded-[9px] bg-indigo-500/10 text-indigo-500">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-[var(--t0)]">
            {metrics.total_users}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-[var(--ok)] font-medium">
            <CheckCircle2 className="w-3 h-3" />
            <span>{metrics.active_users} active accounts</span>
          </div>
        </Card>

        <Card className="p-4 bg-[var(--bg-1)] border-[var(--line)] hover:border-[var(--warn)]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--t2)]">Pending Packages</span>
            <div className="p-1.5 rounded-[9px] bg-amber-500/10 text-amber-500">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-amber-500 flex items-center gap-2">
            <span>{metrics.pending_approvals_count}</span>
            {metrics.pending_approvals_count > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30 animate-pulse">
                Needs Review
              </span>
            )}
          </div>
          <div className="mt-1 text-[11px] text-[var(--t2)]">
            Awaiting admin payment confirmation
          </div>
        </Card>

        <Card className="p-4 bg-[var(--bg-1)] border-[var(--line)] hover:border-[var(--acc)]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--t2)]">Circulating Credits</span>
            <div className="p-1.5 rounded-[9px] bg-emerald-500/10 text-emerald-500">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-[var(--ok)]">
            {metrics.total_credits.toLocaleString()}
          </div>
          <div className="mt-1 text-[11px] text-[var(--t2)]">
            Available across all active balances
          </div>
        </Card>

        <Card className="p-4 bg-[var(--bg-1)] border-[var(--line)] hover:border-[var(--bad)]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--t2)]">Suspended Users</span>
            <div className="p-1.5 rounded-[9px] bg-rose-500/10 text-rose-500">
              <Ban className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-rose-500">
            {metrics.suspended_users}
          </div>
          <div className="mt-1 text-[11px] text-[var(--t2)]">
            Restricted from inbox operations
          </div>
        </Card>
      </div>

      {/* 2. Search & Filtering Controls */}
      <Card className="p-4 bg-[var(--bg-1)] border-[var(--line)]">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--t2)]" />
            <input
              type="text"
              placeholder="Search user by name, email, phone, IP address, OS, or browser..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-[12px] border border-[var(--line)] bg-[var(--bg-2)] text-[var(--t0)] placeholder-[var(--t2)] focus:outline-none focus:ring-2 focus:ring-[var(--acc)]/40 transition-all"
            />
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Account Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="text-xs px-3 py-2 rounded-[11px] border border-[var(--line)] bg-[var(--bg-2)] text-[var(--t0)] focus:outline-none focus:ring-2 focus:ring-[var(--acc)]/40"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Accounts Only</option>
              <option value="suspended">Suspended Accounts</option>
            </select>

            {/* Package / Order Status Filter */}
            <select
              value={packageFilter}
              onChange={(e) => setPackageFilter(e.target.value as any)}
              className="text-xs px-3 py-2 rounded-[11px] border border-[var(--line)] bg-[var(--bg-2)] text-[var(--t0)] focus:outline-none focus:ring-2 focus:ring-[var(--acc)]/40"
            >
              <option value="all">All Packages</option>
              <option value="pending">⚡ Has Pending Payment</option>
              <option value="paid">Paid Package Holders</option>
              <option value="free">Free / Trial Only</option>
            </select>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="text-xs px-3 py-2 rounded-[11px] border border-[var(--line)] bg-[var(--bg-2)] text-[var(--t0)] focus:outline-none focus:ring-2 focus:ring-[var(--acc)]/40"
            >
              <option value="all">All Roles</option>
              <option value="user">Standard Users</option>
              <option value="admin">Administrators</option>
            </select>
          </div>
        </div>
      </Card>

      {/* 3. Main User Management Table */}
      <Card className="overflow-hidden border-[var(--line)] bg-[var(--bg-1)] shadow-sm">
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={6} />
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="w-10 h-10 text-[var(--t2)] mx-auto mb-3 opacity-60" />
            <h3 className="text-sm font-bold text-[var(--t0)]">No users found</h3>
            <p className="text-xs text-[var(--t2)] mt-1">
              Try adjusting your search criteria or resetting filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--bg-2)] border-b border-[var(--line)] font-bold text-[var(--t2)] uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">User Identity</th>
                  <th className="px-5 py-3.5">Registered & Device</th>
                  <th className="px-5 py-3.5">Plan / Order Status</th>
                  <th className="px-5 py-3.5">Credits</th>
                  <th className="px-5 py-3.5">Mailboxes Used</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)] font-medium">
                {users.map((u) => {
                  const hasPending = u.packages.has_pending_payment;
                  const isSuspended = u.account_status === 'suspended';

                  return (
                    <tr 
                      key={u.id}
                      className={`transition-colors hover:bg-[var(--bg-2)]/60 ${
                        hasPending ? 'bg-amber-500/5' : ''
                      }`}
                    >
                      {/* User Column */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-9 h-9 rounded-[11px] bg-[var(--bg-3)] border border-[var(--line)] flex items-center justify-center font-bold text-xs text-[var(--t0)]">
                              {u.name.slice(0, 2).toUpperCase()}
                            </div>
                            <span 
                              className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[var(--bg-1)] ${
                                isSuspended ? 'bg-rose-500' : 'bg-emerald-500'
                              }`} 
                            />
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[var(--t0)]">{u.name}</span>
                              <Badge variant={u.role === 'admin' ? 'warning' : 'neutral'} size="sm">
                                {u.role}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-[var(--t2)] font-mono mt-0.5">
                              <span>{u.email}</span>
                              <button
                                onClick={() => copyToClipboard(u.email, 'Email')}
                                className="p-0.5 text-[var(--t2)] hover:text-[var(--t0)] transition-colors"
                                title="Copy email"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                            {u.phone && (
                              <div className="text-[10.5px] text-[var(--t2)]">
                                📞 {u.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Registered & Device Column */}
                      <td className="px-5 py-4">
                        <div className="text-[11px] text-[var(--t0)] font-semibold flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[var(--t2)]" />
                          <span>{formatDate(u.created_at)}</span>
                          <span className="text-[10px] text-[var(--t2)] font-normal">
                            ({formatRelativeTime(u.created_at)})
                          </span>
                        </div>

                        {/* Device Pill */}
                        <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[7px] bg-[var(--bg-2)] border border-[var(--line)] text-[10.5px] text-[var(--t1)] font-mono font-medium">
                            {getDeviceIcon(u.device_info.device_type)}
                            <span>{u.device_info.os}</span>
                            <span className="text-[var(--t2)]">•</span>
                            <span>{u.device_info.browser}</span>
                          </span>

                          <span className="inline-block px-1.5 py-0.5 rounded-[6px] bg-[var(--bg-3)] text-[10px] text-[var(--t2)] font-mono">
                            {u.device_info.ip_address}
                          </span>
                        </div>
                      </td>

                      {/* Package / Order Status Column */}
                      <td className="px-5 py-4">
                        {hasPending && u.packages.pending_payment ? (
                          <div className="space-y-1">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-amber-500/15 border border-amber-500/30 text-amber-500 font-bold text-[11px] animate-pulse">
                              <span>⚡ Pending Approval</span>
                            </div>
                            <div className="text-[11px] text-[var(--t0)] font-medium">
                              {u.packages.pending_payment.package_name} ({u.packages.pending_payment.amount} {u.packages.pending_payment.currency})
                            </div>
                            <div className="text-[10px] text-[var(--t2)] font-mono flex items-center gap-1">
                              <span>via {u.packages.pending_payment.payment_method.toUpperCase()}</span>
                              <span>•</span>
                              <span>Ref: {u.packages.pending_payment.payment_ref}</span>
                            </div>
                            <button
                              onClick={() => openUserDetailModal(u.id, 'packages')}
                              className="text-[11px] text-amber-500 font-bold hover:underline flex items-center gap-1 pt-0.5 cursor-pointer"
                            >
                              <span>Review & Approve Now</span>
                              <ArrowUpRight className="w-3 h-3" />
                            </button>
                          </div>
                        ) : u.packages.active_package ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[7px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[11px] font-bold">
                              <Sparkles className="w-3 h-3" />
                              <span>{u.packages.active_package.name}</span>
                            </span>
                            <div className="text-[10px] text-[var(--t2)]">
                              Total spent: {u.packages.total_spent} BDT ({u.packages.total_purchases_count} order)
                            </div>
                          </div>
                        ) : (
                          <div className="text-[11px] text-[var(--t2)] font-medium">
                            <span className="px-2 py-0.5 rounded-[6px] bg-[var(--bg-3)] border border-[var(--line)]">
                              Free Trial (No Purchases)
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Credits Column */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 font-extrabold text-sm text-[var(--t0)]">
                          <Coins className="w-4 h-4 text-amber-500" />
                          <span>{u.credits.toLocaleString()}</span>
                        </div>
                        <button
                          onClick={() => {
                            setAdjustTargetUser(u);
                            setAdjustModalOpen(true);
                          }}
                          className="mt-1 text-[10px] text-[var(--acc)] font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <span>Adjust Balance</span>
                          <ArrowUpRight className="w-2.5 h-2.5" />
                        </button>
                      </td>

                      {/* Mailboxes Used Column */}
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[7px] bg-[var(--bg-2)] border border-[var(--line)] text-[11px] font-semibold text-[var(--t0)]">
                            <Mail className="w-3 h-3 text-[var(--acc)]" />
                            <span>{u.email_stats.total_emails_created} mailboxes</span>
                          </div>
                          <div className="text-[10.5px] text-[var(--t2)]">
                            {u.email_stats.total_messages_received} msgs • {u.email_stats.total_otps_received} OTPs
                          </div>
                        </div>
                      </td>

                      {/* Account Status Column */}
                      <td className="px-5 py-4">
                        <Badge
                          variant={u.account_status === 'active' ? 'success' : 'danger'}
                          size="sm"
                        >
                          {u.account_status.toUpperCase()}
                        </Badge>
                      </td>

                      {/* Actions Column */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            onClick={() => openUserDetailModal(u.id)}
                            variant="primary"
                            size="sm"
                            leftIcon={<Eye className="w-3.5 h-3.5" />}
                          >
                            Details
                          </Button>

                          <button
                            onClick={() => handleToggleStatus(u)}
                            disabled={actionLoadingId === u.id || u.role === 'admin'}
                            className={`p-1.5 rounded-[9px] border transition-all cursor-pointer disabled:opacity-40 ${
                              isSuspended
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/20'
                                : 'bg-rose-500/10 border-rose-500/30 text-rose-500 hover:bg-rose-500/20'
                            }`}
                            title={isSuspended ? 'Activate Account' : 'Suspend Account'}
                          >
                            {isSuspended ? <CheckCircle2 className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* 4. Deep-Dive User Control Modal */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={detailUser ? `User Dossier: ${detailUser.name}` : 'User Details'}
        description="Full multi-channel audit telemetry, login sessions, purchase invoices, and active mailboxes"
        maxWidth="4xl"
      >
        {detailLoading || !detailUser ? (
          <div className="p-8 text-center">
            <RefreshCw className="w-8 h-8 text-[var(--acc)] animate-spin mx-auto mb-3" />
            <p className="text-xs text-[var(--t2)] font-medium">Fetching deep user intelligence...</p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Modal User Header Card */}
            <div className="p-4 rounded-[16px] bg-[var(--bg-2)] border border-[var(--line)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-[14px] bg-[var(--acc-soft)] text-[var(--acc)] font-black text-base flex items-center justify-center border border-[var(--acc)]/30">
                  {detailUser.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-extrabold text-[var(--t0)]">{detailUser.name}</h2>
                    <Badge variant={detailUser.account_status === 'active' ? 'success' : 'danger'} size="sm">
                      {detailUser.account_status.toUpperCase()}
                    </Badge>
                    <Badge variant={detailUser.role === 'admin' ? 'warning' : 'neutral'} size="sm">
                      {detailUser.role}
                    </Badge>
                  </div>
                  <div className="text-xs text-[var(--t2)] font-mono flex items-center gap-2 mt-0.5">
                    <span>{detailUser.email}</span>
                    <span>•</span>
                    <span>ID: {detailUser.id}</span>
                  </div>
                </div>
              </div>

              {/* Header Quick Actions */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <Button
                  onClick={() => {
                    setAdjustTargetUser(detailUser);
                    setAdjustModalOpen(true);
                  }}
                  variant="outline"
                  size="sm"
                  leftIcon={<Coins className="w-3.5 h-3.5 text-amber-500" />}
                >
                  Adjust Credits
                </Button>

                <Button
                  onClick={() => handleToggleStatus(detailUser)}
                  variant={detailUser.account_status === 'active' ? 'secondary' : 'primary'}
                  size="sm"
                  leftIcon={detailUser.account_status === 'active' ? <Ban className="w-3.5 h-3.5 text-rose-500" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                >
                  {detailUser.account_status === 'active' ? 'Suspend' : 'Activate'}
                </Button>
              </div>
            </div>

            {/* Quick KPI Strip inside modal */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-[12px] bg-[var(--bg-3)] border border-[var(--line)]">
                <span className="text-[10px] font-bold uppercase text-[var(--t2)]">Credits Balance</span>
                <div className="text-lg font-black text-[var(--ok)] mt-0.5 flex items-center gap-1">
                  <Coins className="w-4 h-4 text-amber-500" />
                  <span>{detailUser.credits}</span>
                </div>
              </div>

              <div className="p-3 rounded-[12px] bg-[var(--bg-3)] border border-[var(--line)]">
                <span className="text-[10px] font-bold uppercase text-[var(--t2)]">Total Purchases</span>
                <div className="text-lg font-black text-[var(--t0)] mt-0.5">
                  {detailUser.packages.total_spent} BDT
                </div>
              </div>

              <div className="p-3 rounded-[12px] bg-[var(--bg-3)] border border-[var(--line)]">
                <span className="text-[10px] font-bold uppercase text-[var(--t2)]">Mailboxes Created</span>
                <div className="text-lg font-black text-[var(--t0)] mt-0.5">
                  {detailUser.email_stats.total_emails_created}
                </div>
              </div>

              <div className="p-3 rounded-[12px] bg-[var(--bg-3)] border border-[var(--line)]">
                <span className="text-[10px] font-bold uppercase text-[var(--t2)]">OTPs Extracted</span>
                <div className="text-lg font-black text-indigo-400 mt-0.5">
                  {detailUser.email_stats.total_otps_received}
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-2 border-b border-[var(--line)] pb-2 overflow-x-auto">
              <button
                onClick={() => setActiveTab('device')}
                className={`px-3 py-1.5 rounded-[10px] text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'device'
                    ? 'bg-[var(--acc)] text-white shadow-sm'
                    : 'text-[var(--t2)] hover:text-[var(--t0)] hover:bg-[var(--bg-2)]'
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
                <span>Device & Security</span>
              </button>

              <button
                onClick={() => setActiveTab('packages')}
                className={`px-3 py-1.5 rounded-[10px] text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'packages'
                    ? 'bg-[var(--acc)] text-white shadow-sm'
                    : 'text-[var(--t2)] hover:text-[var(--t0)] hover:bg-[var(--bg-2)]'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Packages & Orders</span>
                {detailUser.packages.has_pending_payment && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                )}
              </button>

              <button
                onClick={() => setActiveTab('emails')}
                className={`px-3 py-1.5 rounded-[10px] text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'emails'
                    ? 'bg-[var(--acc)] text-white shadow-sm'
                    : 'text-[var(--t2)] hover:text-[var(--t0)] hover:bg-[var(--bg-2)]'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Dispatched Mailboxes ({detailUser.emails_list?.length || 0})</span>
              </button>

              <button
                onClick={() => setActiveTab('credits')}
                className={`px-3 py-1.5 rounded-[10px] text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'credits'
                    ? 'bg-[var(--acc)] text-white shadow-sm'
                    : 'text-[var(--t2)] hover:text-[var(--t0)] hover:bg-[var(--bg-2)]'
                }`}
              >
                <Coins className="w-3.5 h-3.5" />
                <span>Credits & Ledger</span>
              </button>
            </div>

            {/* TAB 1: DEVICE & SECURITY */}
            {activeTab === 'device' && (
              <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Registration Session */}
                  <div className="p-4 rounded-[14px] bg-[var(--bg-2)] border border-[var(--line)] space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-[var(--t0)]">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span>Registration Profile</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between py-1 border-b border-[var(--line)]/50">
                        <span className="text-[var(--t2)]">Account Created:</span>
                        <span className="font-semibold text-[var(--t0)]">
                          {formatDate(detailUser.created_at)} ({formatRelativeTime(detailUser.created_at)})
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-1 border-b border-[var(--line)]/50">
                        <span className="text-[var(--t2)]">Registration Device:</span>
                        <span className="font-semibold text-[var(--t0)] flex items-center gap-1.5">
                          {getDeviceIcon(detailUser.device_info.device_type)}
                          <span>{detailUser.device_info.device_type}</span>
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-1 border-b border-[var(--line)]/50">
                        <span className="text-[var(--t2)]">Operating System:</span>
                        <span className="font-semibold text-[var(--t0)]">{detailUser.device_info.os}</span>
                      </div>

                      <div className="flex items-center justify-between py-1 border-b border-[var(--line)]/50">
                        <span className="text-[var(--t2)]">Browser Client:</span>
                        <span className="font-semibold text-[var(--t0)]">{detailUser.device_info.browser}</span>
                      </div>

                      <div className="flex items-center justify-between py-1">
                        <span className="text-[var(--t2)]">Network IP:</span>
                        <span className="font-mono font-semibold text-indigo-400">{detailUser.device_info.ip_address}</span>
                      </div>
                    </div>
                  </div>

                  {/* Last Active Session */}
                  <div className="p-4 rounded-[14px] bg-[var(--bg-2)] border border-[var(--line)] space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-[var(--t0)]">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <span>Latest Observed Session</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between py-1 border-b border-[var(--line)]/50">
                        <span className="text-[var(--t2)]">Last Activity:</span>
                        <span className="font-semibold text-[var(--t0)]">
                          {formatDate(detailUser.device_info.last_active)} ({formatRelativeTime(detailUser.device_info.last_active)})
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-1 border-b border-[var(--line)]/50">
                        <span className="text-[var(--t2)]">Session Client:</span>
                        <span className="font-semibold text-[var(--t0)]">
                          {detailUser.device_info.browser} on {detailUser.device_info.os}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-1 border-b border-[var(--line)]/50">
                        <span className="text-[var(--t2)]">Observed IP:</span>
                        <span className="font-mono font-semibold text-indigo-400">
                          {detailUser.device_info.ip_address}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-1">
                        <span className="text-[var(--t2)]">Security Status:</span>
                        <span className="inline-flex items-center gap-1 text-[var(--ok)] font-bold">
                          <Check className="w-3.5 h-3.5" />
                          <span>No anomalous logins detected</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PACKAGES & ORDERS */}
            {activeTab === 'packages' && (
              <div className="space-y-4 animate-fade-in">
                {/* Spotlight if pending payment exists */}
                {detailUser.packages.has_pending_payment && detailUser.packages.pending_payment && (
                  <div className="p-4 rounded-[16px] bg-amber-500/10 border-2 border-amber-500/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-amber-500 font-extrabold text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>Pending Package Order Action Required</span>
                      </div>
                      <Badge variant="warning" size="sm">Awaiting Approval</Badge>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs py-2 border-y border-amber-500/20">
                      <div>
                        <span className="text-[var(--t2)] block text-[10px]">Package</span>
                        <span className="font-bold text-[var(--t0)]">{detailUser.packages.pending_payment.package_name}</span>
                      </div>
                      <div>
                        <span className="text-[var(--t2)] block text-[10px]">Price</span>
                        <span className="font-bold text-[var(--t0)]">{detailUser.packages.pending_payment.amount} {detailUser.packages.pending_payment.currency}</span>
                      </div>
                      <div>
                        <span className="text-[var(--t2)] block text-[10px]">Gateway</span>
                        <span className="font-bold uppercase text-amber-400">{detailUser.packages.pending_payment.payment_method}</span>
                      </div>
                      <div>
                        <span className="text-[var(--t2)] block text-[10px]">Sender Number</span>
                        <span className="font-mono font-bold text-[var(--t0)]">{detailUser.packages.pending_payment.sender_identifier}</span>
                      </div>
                    </div>

                    {detailUser.packages.pending_payment.transaction_id && (
                      <div className="text-xs text-[var(--t2)] font-mono">
                        Transaction ID (TrxID): <strong className="text-[var(--t0)]">{detailUser.packages.pending_payment.transaction_id}</strong>
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <Button
                        onClick={() => handleApprovePayment(detailUser.packages.pending_payment!.id)}
                        variant="primary"
                        size="sm"
                        leftIcon={<Check className="w-3.5 h-3.5" />}
                      >
                        Approve Order & Grant Credits
                      </Button>
                    </div>
                  </div>
                )}

                {/* Complete Orders Table */}
                <div className="rounded-[14px] border border-[var(--line)] overflow-hidden">
                  <div className="px-4 py-3 bg-[var(--bg-2)] border-b border-[var(--line)] font-bold text-xs text-[var(--t0)]">
                    Payment & Invoice History ({detailUser.payments_list?.length || 0})
                  </div>
                  {(!detailUser.payments_list || detailUser.payments_list.length === 0) ? (
                    <div className="p-8 text-center text-xs text-[var(--t2)]">
                      No order or payment submissions recorded for this account.
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[var(--bg-3)] border-b border-[var(--line)] text-[var(--t2)] font-semibold">
                        <tr>
                          <th className="px-4 py-2.5">Invoice / Ref</th>
                          <th className="px-4 py-2.5">Package</th>
                          <th className="px-4 py-2.5">Amount</th>
                          <th className="px-4 py-2.5">Method & TrxID</th>
                          <th className="px-4 py-2.5">Date</th>
                          <th className="px-4 py-2.5 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--line)]">
                        {detailUser.payments_list.map((p) => (
                          <tr key={p.id} className="hover:bg-[var(--bg-2)]">
                            <td className="px-4 py-3 font-mono font-bold text-[var(--t0)]">{p.payment_ref}</td>
                            <td className="px-4 py-3">{p.package_name || 'Credit Pack'}</td>
                            <td className="px-4 py-3 font-bold text-[var(--t0)]">{p.amount} {p.currency}</td>
                            <td className="px-4 py-3">
                              <span className="uppercase font-bold text-[10.5px] px-1.5 py-0.5 rounded bg-[var(--bg-3)]">
                                {p.payment_method}
                              </span>
                              <div className="font-mono text-[10.5px] text-[var(--t2)] mt-0.5">
                                {p.transaction_id || p.sender_identifier}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-[var(--t2)]">{formatDate(p.submitted_at)}</td>
                            <td className="px-4 py-3 text-right">
                              <Badge
                                variant={p.status === 'approved' ? 'success' : p.status === 'pending' ? 'warning' : 'danger'}
                                size="sm"
                              >
                                {p.status.toUpperCase()}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: GENERATED EMAIL ADDRESSES */}
            {activeTab === 'emails' && (
              <div className="space-y-4 animate-fade-in">
                <div className="rounded-[14px] border border-[var(--line)] overflow-hidden">
                  <div className="px-4 py-3 bg-[var(--bg-2)] border-b border-[var(--line)] font-bold text-xs text-[var(--t0)] flex items-center justify-between">
                    <span>Generated Disposable Inboxes ({detailUser.emails_list?.length || 0})</span>
                  </div>

                  {(!detailUser.emails_list || detailUser.emails_list.length === 0) ? (
                    <div className="p-8 text-center text-xs text-[var(--t2)]">
                      User has not generated any temporary mailboxes yet.
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[var(--bg-3)] border-b border-[var(--line)] text-[var(--t2)] font-semibold">
                        <tr>
                          <th className="px-4 py-2.5">Mailbox Address</th>
                          <th className="px-4 py-2.5">Service Tag</th>
                          <th className="px-4 py-2.5">Status</th>
                          <th className="px-4 py-2.5">Traffic</th>
                          <th className="px-4 py-2.5">Created At</th>
                          <th className="px-4 py-2.5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--line)]">
                        {detailUser.emails_list.map((em) => (
                          <tr key={em.id} className="hover:bg-[var(--bg-2)]">
                            <td className="px-4 py-3 font-mono font-bold text-[var(--t0)]">
                              <div className="flex items-center gap-1.5">
                                <span>{em.email_address}</span>
                                <button
                                  onClick={() => copyToClipboard(em.email_address, 'Mailbox')}
                                  className="text-[var(--t2)] hover:text-[var(--t0)]"
                                  title="Copy address"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-[var(--t2)]">
                              {em.user_service_tag || 'Default Mailbox'}
                            </td>
                            <td className="px-4 py-3">
                              <Badge
                                variant={em.status === 'active' ? 'success' : 'neutral'}
                                size="sm"
                              >
                                {em.status.toUpperCase()}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-[11px] text-[var(--t1)]">
                              <span>{em.message_count} msgs</span>
                              <span className="text-[var(--t2)] mx-1">•</span>
                              <span className="text-amber-500 font-bold">{em.otp_count} OTPs</span>
                            </td>
                            <td className="px-4 py-3 text-[var(--t2)]">
                              {formatDate(em.created_at)}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="text-[10px] font-mono text-[var(--t2)]">
                                {em.domain}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: CREDITS & AUDIT LEDGER */}
            {activeTab === 'credits' && (
              <div className="space-y-4 animate-fade-in">
                {/* Balance & Adjust Quick Card */}
                <div className="p-4 rounded-[14px] bg-[var(--bg-2)] border border-[var(--line)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-[var(--t2)] font-medium">Available Balance</span>
                    <div className="text-2xl font-black text-[var(--ok)] flex items-center gap-2 mt-0.5">
                      <Coins className="w-5 h-5 text-amber-500" />
                      <span>{detailUser.credits.toLocaleString()} Credits</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      setAdjustTargetUser(detailUser);
                      setAdjustModalOpen(true);
                    }}
                    variant="primary"
                    size="sm"
                    leftIcon={<Plus className="w-3.5 h-3.5" />}
                  >
                    Adjust Credit Balance
                  </Button>
                </div>

                {/* Transactions Table */}
                <div className="rounded-[14px] border border-[var(--line)] overflow-hidden">
                  <div className="px-4 py-3 bg-[var(--bg-2)] border-b border-[var(--line)] font-bold text-xs text-[var(--t0)]">
                    Immutable Credit Ledger ({detailUser.credit_history?.length || 0})
                  </div>
                  {(!detailUser.credit_history || detailUser.credit_history.length === 0) ? (
                    <div className="p-8 text-center text-xs text-[var(--t2)]">
                      No credit adjustments recorded yet.
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[var(--bg-3)] border-b border-[var(--line)] text-[var(--t2)] font-semibold">
                        <tr>
                          <th className="px-4 py-2.5">Date</th>
                          <th className="px-4 py-2.5">Type</th>
                          <th className="px-4 py-2.5">Description</th>
                          <th className="px-4 py-2.5">Amount</th>
                          <th className="px-4 py-2.5 text-right">Balance After</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--line)]">
                        {detailUser.credit_history.map((tx) => (
                          <tr key={tx.id} className="hover:bg-[var(--bg-2)]">
                            <td className="px-4 py-3 text-[var(--t2)]">{formatDate(tx.created_at)}</td>
                            <td className="px-4 py-3">
                              <Badge variant={tx.amount > 0 ? 'success' : 'neutral'} size="sm">
                                {tx.transaction_type}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 font-medium text-[var(--t0)]">{tx.description}</td>
                            <td className={`px-4 py-3 font-bold ${tx.amount > 0 ? 'text-[var(--ok)]' : 'text-rose-400'}`}>
                              {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                            </td>
                            <td className="px-4 py-3 text-right font-mono font-bold text-[var(--t0)]">
                              {tx.balance_after}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* 5. Adjust Credits Modal */}
      <Modal
        isOpen={adjustModalOpen}
        onClose={() => setAdjustModalOpen(false)}
        title={`Adjust Credits: ${adjustTargetUser?.name || detailUser?.name}`}
        description="Manually credit or debit user account with recorded audit reason"
        maxWidth="md"
      >
        <form onSubmit={handleAdjustCredits} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--t1)] mb-1">
              Credit Adjustment (Positive to add, Negative to deduct)
            </label>
            <div className="relative">
              <input
                type="number"
                required
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(e.target.value)}
                className="w-full px-3 py-2 rounded-[11px] border border-[var(--line)] bg-[var(--bg-2)] text-[var(--t0)] text-xs focus:outline-none focus:ring-2 focus:ring-[var(--acc)]/40 font-mono font-bold"
              />
            </div>
            <p className="text-[10.5px] text-[var(--t2)] mt-1">
              Example: Type 100 to grant 100 credits, or -20 to deduct 20 credits.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--t1)] mb-1">
              Audit Reason <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="e.g. VIP bonus, refund for delivery delay, manual test reward"
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
              className="w-full px-3 py-2 rounded-[11px] border border-[var(--line)] bg-[var(--bg-2)] text-[var(--t0)] text-xs focus:outline-none focus:ring-2 focus:ring-[var(--acc)]/40"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--line)]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAdjustModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={adjustLoading}
            >
              Save Credit Adjustment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
