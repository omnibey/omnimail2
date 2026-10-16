'use client';

import React, { useState, useEffect } from 'react';
import { 
  Coins, Plus, Edit2, Trash2, CheckCircle2, Sparkles, 
  DollarSign, ArrowRightLeft, ShieldCheck, RefreshCw, AlertCircle, Zap
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { toast } from '@/components/ui/toast';
import { CreditPackage, DollarRateConfig } from '@/types';

interface PackageFormData {
  id?: string;
  name: string;
  price: number;
  credits: number;
  bonus: number;
  description: string;
  features: string;
  is_featured: boolean;
  display_order: number;
  status: 'active' | 'inactive';
}

const DEFAULT_FORM: PackageFormData = {
  name: '',
  price: 5,
  credits: 500,
  bonus: 50,
  description: '',
  features: '500+ disposable mailboxes\nInstant OTP & SMS code extraction\nDirect API & Webhook integration\nPriority Bangladesh support',
  is_featured: false,
  display_order: 1,
  status: 'active',
};

export default function AdminCreditsPage() {
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Dollar rate state
  const [dollarRate, setDollarRate] = useState<DollarRateConfig>({
    rate: 125,
    currency: 'BDT',
    min_deposit_usd: 5,
    credits_per_usd: 100,
    credits_per_otp: 5,
    updated_at: new Date().toISOString(),
  });
  const [customRate, setCustomRate] = useState<number>(125);
  const [customMinDeposit, setCustomMinDeposit] = useState<number>(5);
  const [rateSaving, setRateSaving] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<PackageFormData>(DEFAULT_FORM);
  const [formError, setFormError] = useState<string | null>(null);

  // Fetch packages and dollar rate from API
  const loadData = async () => {
    try {
      setLoading(true);
      const [pkgRes, settingsRes] = await Promise.all([
        fetch('/api/admin/packages'),
        fetch('/api/admin/system-settings'),
      ]);

      if (pkgRes.ok) {
        const pkgData = await pkgRes.json();
        if (pkgData.packages) setPackages(pkgData.packages);
      } else {
        // Fallback to public packages endpoint if admin packages fails
        const fallbackRes = await fetch('/api/payments/packages');
        const fallbackData = await fallbackRes.json();
        if (fallbackData.packages) setPackages(fallbackData.packages);
        if (fallbackData.dollarRate) {
          setDollarRate(fallbackData.dollarRate);
          setCustomRate(fallbackData.dollarRate.rate);
          setCustomMinDeposit(fallbackData.dollarRate.min_deposit_usd || 5);
        }
      }

      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        if (settingsData.dollarRate) {
          setDollarRate(settingsData.dollarRate);
          setCustomRate(settingsData.dollarRate.rate);
          setCustomMinDeposit(settingsData.dollarRate.min_deposit_usd || 5);
        }
      }
    } catch (err) {
      console.error('Failed to load credit management data:', err);
      toast.error('Failed to load credit packages from database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Save exchange rate
  const handleSaveDollarRate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (customRate <= 0) {
      toast.error('Exchange rate must be greater than 0');
      return;
    }

    try {
      setRateSaving(true);
      const res = await fetch('/api/admin/system-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rate: Number(customRate),
          min_deposit_usd: Number(customMinDeposit) || 5,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update rate');
      }

      setDollarRate(data.dollarRate);
      toast.success('Dollar Exchange Rate updated!', {
        description: `1 USD = ৳${data.dollarRate.rate} BDT (Min deposit: $${data.dollarRate.min_deposit_usd} USD)`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error updating exchange rate';
      toast.error(msg);
    } finally {
      setRateSaving(false);
    }
  };

  // Toggle active/inactive
  const togglePackageStatus = async (pkg: CreditPackage) => {
    const newStatus = pkg.status === 'active' ? 'inactive' : 'active';
    try {
      setActionLoading(true);
      const res = await fetch('/api/admin/packages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: pkg.id, status: newStatus }),
      });

      if (!res.ok) throw new Error('Status update failed');
      const data = await res.json();

      setPackages((prev) =>
        prev.map((p) => (p.id === pkg.id ? data.package : p))
      );
      toast.success(`Package "${pkg.name}" marked as ${newStatus}`);
    } catch (err) {
      toast.error('Failed to update package status');
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  // Delete package
  const handleDeletePackage = async (pkg: CreditPackage) => {
    if (!confirm(`Are you sure you want to permanently delete package "${pkg.name}"?`)) {
      return;
    }

    try {
      setActionLoading(true);
      const res = await fetch(`/api/admin/packages?id=${encodeURIComponent(pkg.id)}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Delete failed');

      setPackages((prev) => prev.filter((p) => p.id !== pkg.id));
      toast.success(`Package "${pkg.name}" deleted successfully.`);
    } catch (err) {
      toast.error('Failed to delete package');
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  // Open modal for Create
  const handleOpenAddModal = () => {
    setIsEditing(false);
    setFormData({
      ...DEFAULT_FORM,
      price: 5,
      credits: 500, // 5 * 100
      bonus: 50,
      description: 'Starter tier for OTP and verification tests.',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEditModal = (pkg: CreditPackage) => {
    setIsEditing(true);
    setFormData({
      id: pkg.id,
      name: pkg.name,
      price: pkg.price,
      credits: pkg.credits,
      bonus: pkg.bonus,
      description: pkg.description,
      features: pkg.features.join('\n'),
      is_featured: pkg.is_featured,
      display_order: pkg.display_order,
      status: pkg.status,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  // Price change updates suggested credits automatically
  const handlePriceChange = (newPrice: number) => {
    const p = Math.max(0, newPrice);
    setFormData((prev) => ({
      ...prev,
      price: p,
      // Default rule: 1 USD = 100 credits
      credits: !isEditing ? p * 100 : prev.credits,
    }));
  };

  // Submit modal form
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim()) {
      setFormError('Package name is required.');
      return;
    }
    if (formData.price <= 0) {
      setFormError('Price must be greater than 0 USD.');
      return;
    }
    if (formData.credits <= 0) {
      setFormError('Credits amount must be greater than 0.');
      return;
    }

    const featureList = formData.features
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);

    try {
      setActionLoading(true);
      if (isEditing && formData.id) {
        // PATCH
        const res = await fetch('/api/admin/packages', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: formData.id,
            name: formData.name.trim(),
            price: Number(formData.price),
            currency: 'USD',
            credits: Number(formData.credits),
            bonus: Number(formData.bonus || 0),
            description: formData.description.trim(),
            features: featureList,
            is_featured: formData.is_featured,
            display_order: Number(formData.display_order),
            status: formData.status,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to update package');
        }

        setPackages((prev) =>
          prev.map((p) => (p.id === formData.id ? data.package : p))
        );
        toast.success(`Package "${data.package.name}" updated successfully.`);
      } else {
        // POST
        const res = await fetch('/api/admin/packages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name.trim(),
            price: Number(formData.price),
            currency: 'USD',
            credits: Number(formData.credits),
            bonus: Number(formData.bonus || 0),
            description: formData.description.trim(),
            features: featureList,
            is_featured: formData.is_featured,
            display_order: Number(formData.display_order),
            status: formData.status,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to create package');
        }

        setPackages((prev) => [...prev, data.package]);
        toast.success(`Package "${data.package.name}" created successfully.`);
      }

      setIsModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Operation failed';
      setFormError(msg);
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const currentRate = dollarRate.rate || 125;

  return (
    <div className="space-y-8 animate-fade-in text-[var(--t0)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--t0)] flex items-center gap-2.5">
            <Coins className="w-6 h-6 text-amber-500" />
            Credit Packages & Dollar Exchange Rate
          </h1>
          <p className="mt-1 text-xs text-[var(--t2)] font-medium">
            Configure USD package tiers, OTP debit rules (1 OTP = 5 credits), and bKash/Nagad dollar exchange rate.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={loadData}
            variant="outline"
            size="sm"
            disabled={loading}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>

          <Button
            onClick={handleOpenAddModal}
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add New Package
          </Button>
        </div>
      </div>

      {/* Dollar Exchange Rate & OTP Rule Card */}
      <Card className="p-6 bg-[var(--bg-2)] border-[var(--line)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--acc)] uppercase tracking-wider">
              <DollarSign className="w-4 h-4" />
              <span>USD to BDT Exchange Rate & OTP Debit Rules</span>
            </div>
            <h2 className="text-lg font-bold text-[var(--t0)]">
              Manual Payment Converter (bKash, Nagad, Rocket, Upay)
            </h2>
            <p className="text-xs text-[var(--t2)] max-w-2xl leading-relaxed">
              When users select bKash or Nagad to pay for USD packages, the payment amount in Bangladeshi Taka is calculated as: 
              <span className="font-mono font-bold text-[var(--t1)]"> [Package Price USD] × [Dollar Rate]</span>. 
              Each OTP received automatically deducts <span className="text-amber-500 font-bold">5 Credits</span> ($1.00 = 100 Credits = 20 OTPs).
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                1 USD = 100 Base Credits
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <Zap className="w-3.5 h-3.5" />
                1 OTP Received = 5 Credits Deducted
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                Minimum Deposit: ${dollarRate.min_deposit_usd || 5} USD
              </span>
            </div>
          </div>

          {/* Rate Editor Form */}
          <form
            onSubmit={handleSaveDollarRate}
            className="flex flex-col sm:flex-row items-end gap-3 bg-[var(--bg-3)] p-4 rounded-[16px] border border-[var(--line)] shrink-0"
          >
            <div>
              <label className="block text-[11px] font-bold text-[var(--t2)] uppercase tracking-wider mb-1">
                Exchange Rate (BDT / $1 USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--t2)]">
                  ৳
                </span>
                <input
                  type="number"
                  step="0.5"
                  min="50"
                  max="300"
                  required
                  value={customRate}
                  onChange={(e) => setCustomRate(parseFloat(e.target.value) || 0)}
                  className="w-32 pl-7 pr-3 py-2 rounded-[10px] border border-[var(--line)] bg-[var(--bg-1)] text-sm font-mono font-bold text-[var(--t0)] focus:outline-none focus:border-[var(--acc)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[var(--t2)] uppercase tracking-wider mb-1">
                Min Deposit ($)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--t2)]">
                  $
                </span>
                <input
                  type="number"
                  step="1"
                  min="1"
                  max="100"
                  required
                  value={customMinDeposit}
                  onChange={(e) => setCustomMinDeposit(parseInt(e.target.value, 10) || 5)}
                  className="w-24 pl-7 pr-3 py-2 rounded-[10px] border border-[var(--line)] bg-[var(--bg-1)] text-sm font-mono font-bold text-[var(--t0)] focus:outline-none focus:border-[var(--acc)]"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={rateSaving}
              leftIcon={<ArrowRightLeft className="w-3.5 h-3.5" />}
              className="h-[38px]"
            >
              {rateSaving ? 'Saving...' : 'Update Rate'}
            </Button>
          </form>
        </div>
      </Card>

      {/* Package Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-extrabold text-[var(--t0)]">
            Credit Packages in Database ({packages.length})
          </h2>
          <span className="text-xs text-[var(--t2)]">
            All prices in USD. Live bKash/Nagad conversion calculated at ৳{currentRate}/$
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {packages.map((pkg) => {
            const bdtAmount = Math.round(pkg.price * currentRate);
            const totalCredits = pkg.credits + pkg.bonus;
            const approxOtps = Math.floor(totalCredits / 5);

            return (
              <Card 
                key={pkg.id} 
                className={`p-6 flex flex-col justify-between relative bg-[var(--bg-2)] border-[var(--line)] ${
                  pkg.is_featured ? 'border-[var(--acc)] ring-2 ring-[var(--acc-soft)]' : ''
                } ${pkg.status === 'inactive' ? 'opacity-60' : ''}`} 
                hoverEffect
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={pkg.status === 'active' ? 'success' : 'neutral'} size="sm">
                      {pkg.status}
                    </Badge>
                    {pkg.is_featured && (
                      <Badge variant="primary" size="sm">
                        Featured
                      </Badge>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-[var(--t0)]">
                    {pkg.name}
                  </h3>
                  <p className="text-xs text-[var(--t2)] mt-1 line-clamp-2">
                    {pkg.description || 'No description provided.'}
                  </p>

                  {/* USD Price */}
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-[var(--t0)] font-mono">
                      ${pkg.price}
                    </span>
                    <span className="text-xs text-[var(--t2)]">USD</span>
                  </div>

                  {/* BDT Equivalent */}
                  <div className="text-xs text-[var(--t2)] font-mono mt-0.5">
                    ≈ ৳{bdtAmount.toLocaleString()} BDT (bKash/Nagad)
                  </div>

                  {/* Credits & OTPs breakdown */}
                  <div className="mt-3 p-2.5 rounded-[10px] bg-[var(--bg-3)] border border-[var(--line)] text-xs space-y-1">
                    <div className="font-bold text-[var(--acc)] flex items-center justify-between">
                      <span>{pkg.credits} Base + {pkg.bonus} Bonus</span>
                      <span className="font-mono font-extrabold">{totalCredits} pts</span>
                    </div>
                    <div className="text-[11px] text-[var(--t2)] flex items-center justify-between">
                      <span>Estimated OTPs:</span>
                      <span className="font-bold text-amber-500">~{approxOtps} OTPs (5 pts/OTP)</span>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="mt-4 space-y-1.5 text-xs text-[var(--t1)]">
                    {pkg.features.map((feat, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span className="truncate">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Card Actions */}
                <div className="mt-6 pt-4 border-t border-[var(--line)] flex items-center justify-between gap-2">
                  <Button
                    onClick={() => togglePackageStatus(pkg)}
                    variant="outline"
                    size="sm"
                    disabled={actionLoading}
                    className="text-xs"
                  >
                    {pkg.status === 'active' ? 'Deactivate' : 'Activate'}
                  </Button>

                  <div className="flex items-center gap-1.5">
                    <Button
                      onClick={() => handleOpenEditModal(pkg)}
                      variant="ghost"
                      size="sm"
                      disabled={actionLoading}
                      leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDeletePackage(pkg)}
                      variant="ghost"
                      size="sm"
                      disabled={actionLoading}
                      className="text-red-500 hover:text-red-600 hover:bg-red-500/10 p-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Add / Edit Package Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? `Edit Package: ${formData.name}` : 'Create New USD Package'}
        description="Packages are stored in the database and immediately available for user top-ups."
        maxWidth="lg"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {formError && (
            <div className="flex items-center gap-2 rounded-[12px] bg-[var(--bad-soft)] border border-[var(--bad)]/30 p-3 text-xs text-[var(--bad)] font-semibold animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-[var(--bad)]" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Package Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[var(--t1)] mb-1 uppercase tracking-wider">
                Package Name <span className="text-[var(--bad)]">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Starter Pack, Growth Tier"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-[11px] border border-[var(--line)] bg-[var(--bg-3)] text-[var(--t0)] text-xs focus:outline-none focus:border-[var(--acc)] font-medium"
              />
            </div>

            {/* Price USD */}
            <div>
              <label className="block text-xs font-bold text-[var(--t1)] mb-1 uppercase tracking-wider">
                Price in USD ($) <span className="text-[var(--bad)]">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--t2)]">$</span>
                <input
                  type="number"
                  step="1"
                  min="1"
                  required
                  placeholder="5"
                  value={formData.price}
                  onChange={(e) => handlePriceChange(parseFloat(e.target.value) || 0)}
                  className="w-full pl-7 pr-3.5 py-2.5 rounded-[11px] border border-[var(--line)] bg-[var(--bg-3)] text-[var(--t0)] text-xs focus:outline-none focus:border-[var(--acc)] font-mono font-bold"
                />
              </div>
              <p className="mt-1 text-[11px] text-[var(--t2)]">
                ≈ ৳{Math.round(formData.price * currentRate)} BDT (at current ৳{currentRate}/$)
              </p>
            </div>

            {/* Base Credits */}
            <div>
              <label className="block text-xs font-bold text-[var(--t1)] mb-1 uppercase tracking-wider">
                Base Credits <span className="text-[var(--bad)]">*</span>
              </label>
              <input
                type="number"
                step="50"
                min="50"
                required
                placeholder="500"
                value={formData.credits}
                onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3.5 py-2.5 rounded-[11px] border border-[var(--line)] bg-[var(--bg-3)] text-[var(--t0)] text-xs focus:outline-none focus:border-[var(--acc)] font-mono font-bold"
              />
              <p className="mt-1 text-[11px] text-[var(--t2)]">
                Rule: $1 USD = 100 Credits (5 credits/OTP)
              </p>
            </div>

            {/* Bonus Credits */}
            <div>
              <label className="block text-xs font-bold text-[var(--t1)] mb-1 uppercase tracking-wider">
                Promotional Bonus Credits
              </label>
              <input
                type="number"
                step="10"
                min="0"
                value={formData.bonus}
                onChange={(e) => setFormData({ ...formData, bonus: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3.5 py-2.5 rounded-[11px] border border-[var(--line)] bg-[var(--bg-3)] text-[var(--t0)] text-xs focus:outline-none focus:border-[var(--acc)] font-mono"
              />
            </div>

            {/* Display Order */}
            <div>
              <label className="block text-xs font-bold text-[var(--t1)] mb-1 uppercase tracking-wider">
                Display Order
              </label>
              <input
                type="number"
                min="0"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3.5 py-2.5 rounded-[11px] border border-[var(--line)] bg-[var(--bg-3)] text-[var(--t0)] text-xs focus:outline-none focus:border-[var(--acc)] font-mono"
              />
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[var(--t1)] mb-1 uppercase tracking-wider">
                Short Description
              </label>
              <input
                type="text"
                placeholder="e.g. Great for individual testers needing quick verification"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-[11px] border border-[var(--line)] bg-[var(--bg-3)] text-[var(--t0)] text-xs focus:outline-none focus:border-[var(--acc)]"
              />
            </div>

            {/* Features list */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[var(--t1)] mb-1 uppercase tracking-wider">
                Features (One per line)
              </label>
              <textarea
                rows={4}
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-[11px] border border-[var(--line)] bg-[var(--bg-3)] text-[var(--t0)] text-xs focus:outline-none focus:border-[var(--acc)] font-mono"
                placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
              />
            </div>

            {/* Checkboxes & status */}
            <div className="sm:col-span-2 flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[var(--t1)]">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="w-4 h-4 rounded border-[var(--line)] text-[var(--acc)] focus:ring-[var(--acc)]"
                />
                <span>Highlight as Popular Choice (Featured)</span>
              </label>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[var(--t2)]">Status:</span>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                  className="px-2.5 py-1 rounded-[8px] border border-[var(--line)] bg-[var(--bg-3)] text-xs font-bold text-[var(--t0)]"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--line)] flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={actionLoading}
              leftIcon={<Sparkles className="w-3.5 h-3.5" />}
            >
              {actionLoading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Package'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
