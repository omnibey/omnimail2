'use client';

import React, { useState, useEffect } from 'react';
import { 
  Coins, CreditCard, CheckCircle2, ArrowRight, 
  Upload, AlertCircle, Sparkles, Check 
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { PackagesGridSkeleton, TableSkeleton } from '@/components/ui/Skeleton';
import { LottieLoader } from '@/components/ui/LottieLoader';
import { CreditPackage, CreditTransaction, PaymentMethod, SystemPaymentDestination } from '@/types';

export default function CreditsPage() {
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [destinations, setDestinations] = useState<Record<PaymentMethod, SystemPaymentDestination> | null>(null);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [currentCredits, setCurrentCredits] = useState<number>(45);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState<CreditPackage | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('bkash');
  const [senderIdentifier, setSenderIdentifier] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [screenshotName, setScreenshotName] = useState('');
  const [screenshotBase64, setScreenshotBase64] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [pkgRes, histRes] = await Promise.all([
        fetch('/api/payments/packages').then((r) => r.json()),
        fetch('/api/payments/history?userId=user-demo-1').then((r) => r.json()),
      ]);
      if (pkgRes.packages) setPackages(pkgRes.packages);
      if (pkgRes.destinations) setDestinations(pkgRes.destinations);
      if (histRes.transactions) setTransactions(histRes.transactions);
      if (histRes.credits !== undefined) setCurrentCredits(histRes.credits);
    } catch (err) {
      console.error('Failed to load credit data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openPaymentModal = (pkg: CreditPackage) => {
    setSelectedPkg(pkg);
    setFormError(null);
    setSenderIdentifier('');
    setTransactionId('');
    setScreenshotName('');
    setScreenshotBase64(undefined);
    setIsModalOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setFormError('Screenshot file size must be less than 5MB.');
      return;
    }

    setScreenshotName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setScreenshotBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!senderIdentifier.trim()) {
      setFormError('Sender Number / Account Identifier is required.');
      return;
    }

    const hasTxId = Boolean(transactionId.trim());
    const hasScreenshot = Boolean(screenshotBase64);

    if (!hasTxId && !hasScreenshot) {
      setFormError('Verification requires either a Transaction ID (TrxID) or a Payment Screenshot. Please provide at least one.');
      return;
    }

    if (!selectedPkg) return;

    try {
      setSubmitting(true);
      const res = await fetch('/api/payments/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user-demo-1',
          packageId: selectedPkg.id,
          paymentMethod: selectedMethod,
          senderIdentifier: senderIdentifier.trim(),
          transactionId: transactionId.trim() || undefined,
          screenshotBase64,
          screenshotName,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Payment submission failed');
      }

      setIsModalOpen(false);
      setSuccessToast(`Payment ${data.payment.payment_ref} submitted! An admin will review and approve credits.`);
      loadData();
      setTimeout(() => setSuccessToast(null), 6000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Submission failed';
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const activeDestination = destinations ? destinations[selectedMethod] : null;

  return (
    <div className="space-y-8 animate-fade-in text-[var(--t0)]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--t0)] flex items-center gap-2.5">
            <Coins className="w-6 h-6 text-[var(--warn)]" />
            Credit Packages & Balance
          </h1>
          <p className="mt-1 text-xs text-[var(--t2)] font-medium">
            Top up your balance via bKash, Nagad, Rocket, Upay, or Binance for disposable mailboxes.
          </p>
        </div>

        {/* Current Balance Card */}
        <div className="flex items-center gap-3 bg-[var(--warn-soft)] border border-[var(--warn)]/30 px-4 py-2.5 rounded-[16px] shadow-sm">
          <Coins className="w-5 h-5 text-[var(--warn)]" />
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-[var(--warn)]">
              Current Balance
            </div>
            <div className="text-xl font-extrabold text-[var(--t0)] font-mono">
              {currentCredits} <span className="text-xs font-normal text-[var(--t2)]">Credits</span>
            </div>
          </div>
        </div>
      </div>

      {successToast && (
        <div className="flex items-center gap-2.5 rounded-[12px] bg-[var(--ok-soft)] border border-[var(--ok)]/30 p-3.5 text-xs text-[var(--ok)] font-semibold animate-fade-in">
          <Sparkles className="w-4 h-4 shrink-0 text-[var(--ok)]" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Available Credit Packages */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-extrabold text-[var(--t0)]">
            Available Top-Up Packages
          </h2>
          <span className="text-xs text-[var(--t2)]">Instant delivery on review</span>
        </div>

        {loading ? (
          <PackagesGridSkeleton />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <Card
                key={pkg.id}
                className={`p-6 flex flex-col justify-between relative bg-[var(--bg-2)] border-[var(--line)] ${
                  pkg.is_featured
                    ? 'border-[var(--acc)] ring-2 ring-[var(--acc-soft)] shadow-md'
                    : ''
                }`}
                hoverEffect
              >
                {pkg.is_featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-0.5 rounded-full text-[10px] font-extrabold bg-[var(--acc)] text-white shadow-sm shadow-[var(--acc-soft)]">
                      POPULAR CHOICE
                    </span>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-bold text-[var(--t0)]">
                    {pkg.name}
                  </h3>
                  <p className="mt-1 text-xs text-[var(--t2)] font-medium">
                    {pkg.description}
                  </p>

                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-[var(--t0)] font-mono">
                      ৳{pkg.price}
                    </span>
                    <span className="text-xs text-[var(--t2)]">/{pkg.currency}</span>
                  </div>

                  <div className="mt-2.5 text-xs font-bold text-[var(--acc)] flex items-center gap-1.5 bg-[var(--acc-soft)] px-2.5 py-1 rounded-[8px] w-fit">
                    <Coins className="w-3.5 h-3.5" />
                    <span>{pkg.credits} Credits + {pkg.bonus} Bonus</span>
                  </div>

                  <ul className="mt-5 space-y-2 text-xs text-[var(--t1)]">
                    {pkg.features.map((feat, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[var(--ok)] shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-[var(--line)]">
                  <Button
                    onClick={() => openPaymentModal(pkg)}
                    variant={pkg.is_featured ? 'primary' : 'outline'}
                    size="md"
                    className="w-full"
                  >
                    Purchase Package
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Credit Ledger History */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-extrabold text-[var(--t0)]">
            Credit Ledger & Transaction History
          </h2>
          <span className="text-xs text-[var(--t2)]">Immutable ledger</span>
        </div>

        {loading ? (
          <TableSkeleton rows={4} />
        ) : (
          <Card className="overflow-hidden bg-[var(--bg-2)] border-[var(--line)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[var(--bg-3)] border-b border-[var(--line)] font-bold text-[var(--t2)] uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Date</th>
                    <th className="px-5 py-3.5">Type</th>
                    <th className="px-5 py-3.5">Amount</th>
                    <th className="px-5 py-3.5">Balance After</th>
                    <th className="px-5 py-3.5">Description</th>
                    <th className="px-5 py-3.5">Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)] font-medium">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-[var(--bg-3)]/60 transition-colors">
                      <td className="px-5 py-3.5 text-[var(--t2)] whitespace-nowrap">
                        {new Date(tx.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge
                          variant={
                            tx.transaction_type === 'purchase' || tx.transaction_type === 'bonus'
                              ? 'success'
                              : tx.transaction_type === 'admin_adjustment'
                              ? 'warning'
                              : 'neutral'
                          }
                          size="sm"
                        >
                          {tx.transaction_type}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 font-bold font-mono">
                        <span className={tx.amount > 0 ? 'text-[var(--ok)]' : 'text-[var(--t1)]'}>
                          {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-bold text-[var(--t0)] font-mono">
                        {tx.balance_after}
                      </td>
                      <td className="px-5 py-3.5 text-[var(--t1)]">
                        {tx.description}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-[var(--t2)]">
                        {tx.reference_id || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* Manual Payment Verification Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Purchase ${selectedPkg?.name}`}
        description="Follow the steps below to complete the manual transfer"
        maxWidth="lg"
      >
        {submitting && (
          <LottieLoader
            overlay
            size="md"
            text="Submitting payment order..."
            subtext="Allocating audit reference and registering for admin review..."
          />
        )}

        <form onSubmit={handleSubmitPayment} className="space-y-4">
          {formError && (
            <div className="flex items-center gap-2 rounded-[12px] bg-[var(--bad-soft)] border border-[var(--bad)]/30 p-3 text-xs text-[var(--bad)] font-semibold animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-[var(--bad)]" />
              <span>{formError}</span>
            </div>
          )}

          {/* 1. Method Selector */}
          <div>
            <label className="block text-xs font-bold text-[var(--t1)] mb-1.5 uppercase tracking-wider">
              1. Choose Payment Channel
            </label>
            <div className="grid grid-cols-5 gap-2">
              {(['bkash', 'nagad', 'rocket', 'upay', 'binance'] as PaymentMethod[]).map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setSelectedMethod(m)}
                  className={`py-2 px-1 text-center rounded-[10px] border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    selectedMethod === m
                      ? 'border-[var(--acc)] bg-[var(--acc-soft)] text-[var(--acc)] shadow-sm'
                      : 'border-[var(--line)] bg-[var(--bg-3)] text-[var(--t1)] hover:bg-[var(--bg-2)] hover:text-[var(--t0)]'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Destination Instructions Box */}
          {activeDestination && (
            <div className="rounded-[14px] border border-[var(--line)] bg-[var(--bg-3)] p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[var(--t2)] font-medium">Type: {activeDestination.type}</span>
                <span className="font-extrabold text-[var(--acc)] font-mono">
                  Amount: ৳{selectedPkg?.price}
                </span>
              </div>
              <div className="flex items-center justify-between font-mono font-bold text-sm text-[var(--t0)] pt-0.5">
                <span>Account: {activeDestination.account}</span>
              </div>
              {activeDestination.wallet && (
                <div className="text-[11px] font-mono text-[var(--t2)] break-all bg-[var(--bg-inset)] p-2 rounded-[8px] border border-[var(--line)]">
                  {activeDestination.wallet}
                </div>
              )}
              <p className="text-[11px] text-[var(--t2)] pt-1 leading-relaxed">
                {activeDestination.instructions}
              </p>
            </div>
          )}

          {/* 3. Form Input: Sender Number REQUIRED */}
          <div>
            <label className="block text-xs font-bold text-[var(--t1)] mb-1 uppercase tracking-wider">
              Sender Number / Account Identifier <span className="text-[var(--bad)]">* (REQUIRED)</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 017XXXXXXXX or Binance Pay ID"
              value={senderIdentifier}
              onChange={(e) => setSenderIdentifier(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-[11px] border border-[var(--line)] bg-[var(--bg-3)] text-[var(--t0)] placeholder-[var(--t2)] text-xs focus:outline-none focus:border-[var(--acc)] focus:ring-1 focus:ring-[var(--acc)] transition-all font-mono"
            />
          </div>

          {/* 4. Form Input: TrxID OPTIONAL */}
          <div>
            <label className="block text-xs font-bold text-[var(--t1)] mb-1 uppercase tracking-wider">
              Transaction ID (TrxID) <span className="text-[var(--t2)] font-normal normal-case">(Optional if screenshot attached)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. 9B48CK01Z"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-[11px] border border-[var(--line)] bg-[var(--bg-3)] text-[var(--t0)] placeholder-[var(--t2)] text-xs focus:outline-none focus:border-[var(--acc)] focus:ring-1 focus:ring-[var(--acc)] transition-all font-mono"
            />
          </div>

          {/* 5. Form Input: Screenshot Upload OPTIONAL */}
          <div>
            <label className="block text-xs font-bold text-[var(--t1)] mb-1 uppercase tracking-wider">
              Payment Screenshot Proof <span className="text-[var(--t2)] font-normal normal-case">(Optional if TrxID provided)</span>
            </label>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 rounded-[11px] border border-[var(--line)] bg-[var(--bg-3)] hover:bg-[var(--bg-2)] hover:border-[var(--line-2)] text-xs font-bold text-[var(--t0)] transition-all">
                <Upload className="w-3.5 h-3.5 text-[var(--acc)]" />
                <span>Upload Screenshot</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              {screenshotName && (
                <span className="text-xs text-[var(--ok)] font-bold truncate max-w-[200px]">
                  ✓ {screenshotName}
                </span>
              )}
            </div>
            <p className="mt-1 text-[11px] text-[var(--t2)]">
              * Privacy Guarantee: Screenshot proof is automatically wiped from server storage immediately upon review approval.
            </p>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={submitting}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Submit Payment for Verification
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
