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
import { CreditPackage, CreditTransaction, PaymentMethod, SystemPaymentDestination } from '@/types';

export default function CreditsPage() {
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [destinations, setDestinations] = useState<Record<PaymentMethod, SystemPaymentDestination> | null>(null);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [currentCredits, setCurrentCredits] = useState<number>(45);

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
      const pkgRes = await fetch('/api/payments/packages');
      const pkgData = await pkgRes.json();
      if (pkgData.packages) setPackages(pkgData.packages);
      if (pkgData.destinations) setDestinations(pkgData.destinations);

      const histRes = await fetch('/api/payments/history?userId=user-demo-1');
      const histData = await histRes.json();
      if (histData.transactions) setTransactions(histData.transactions);
      if (histData.credits !== undefined) setCurrentCredits(histData.credits);
    } catch (err) {
      console.error(err);
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
      setFormError('Screenshot file size must be less than 5MB');
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

    // Strict validation requirement:
    // 1. Sender number is REQUIRED
    if (!senderIdentifier.trim()) {
      setFormError('Sender Number / Account Identifier is required.');
      return;
    }

    // 2. At least ONE of Transaction ID or Screenshot must be provided
    const hasTxId = Boolean(transactionId.trim());
    const hasScreenshot = Boolean(screenshotBase64);

    if (!hasTxId && !hasScreenshot) {
      setFormError('Verification requires either a Transaction ID OR a Payment Screenshot. Please provide at least one.');
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
      setTimeout(() => setSuccessToast(null), 5000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Submission failed';
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const activeDestination = destinations ? destinations[selectedMethod] : null;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Coins className="w-6 h-6 text-amber-500" />
            Credit Packages & Balance
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Top up your account balance via bKash, Nagad, Rocket, Upay, or Binance.
          </p>
        </div>

        {/* Current Balance Card */}
        <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 px-4 py-2.5 rounded-2xl">
          <Coins className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          <div>
            <div className="text-[10px] uppercase font-bold text-amber-800 dark:text-amber-400">
              Current Balance
            </div>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white">
              {currentCredits} <span className="text-xs font-normal text-slate-500">Credits</span>
            </div>
          </div>
        </div>
      </div>

      {successToast && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 p-3 text-xs text-emerald-700 dark:text-emerald-300">
          <Sparkles className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Credit Packages Grid */}
      <div>
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
          Available Top-Up Packages
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <Card
              key={pkg.id}
              className={`p-6 flex flex-col justify-between relative ${
                pkg.is_featured
                  ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-md'
                  : ''
              }`}
              hoverEffect
            >
              {pkg.is_featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white">
                    Recommended
                  </span>
                </div>
              )}

              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {pkg.name}
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {pkg.description}
                </p>

                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                    ৳{pkg.price}
                  </span>
                  <span className="text-xs text-slate-400">/{pkg.currency}</span>
                </div>

                <div className="mt-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5" />
                  <span>{pkg.credits} Credits + {pkg.bonus} Bonus</span>
                </div>

                <ul className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  {pkg.features.map((feat, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
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
      </div>

      {/* Immutable Credit Transaction History Ledger */}
      <div>
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
          Credit Ledger Transaction History
        </h2>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Type</th>
                  <th className="px-5 py-3.5">Amount</th>
                  <th className="px-5 py-3.5">Balance After</th>
                  <th className="px-5 py-3.5">Description</th>
                  <th className="px-5 py-3.5">Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">
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
                    <td className="px-5 py-3.5 font-bold">
                      <span className={tx.amount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}>
                        {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-900 dark:text-white">
                      {tx.balance_after}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">
                      {tx.description}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-400">
                      {tx.reference_id || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Manual Payment Verification Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Purchase ${selectedPkg?.name}`}
        description="Follow the steps below to complete manual transfer"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmitPayment} className="space-y-4">
          {formError && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 p-3 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{formError}</span>
            </div>
          )}

          {/* 1. Method Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              1. Choose Payment Channel
            </label>
            <div className="grid grid-cols-5 gap-2">
              {(['bkash', 'nagad', 'rocket', 'upay', 'binance'] as PaymentMethod[]).map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setSelectedMethod(m)}
                  className={`py-2 px-1 text-center rounded-xl border text-xs font-bold uppercase tracking-wider transition-all ${
                    selectedMethod === m
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Destination Instructions Box */}
          {activeDestination && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3.5 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Type: {activeDestination.type}</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  Amount: ৳{selectedPkg?.price}
                </span>
              </div>
              <div className="flex items-center justify-between font-mono font-bold text-sm text-slate-900 dark:text-white pt-1">
                <span>Account: {activeDestination.account}</span>
              </div>
              {activeDestination.wallet && (
                <div className="text-[11px] font-mono text-slate-500 break-all">
                  {activeDestination.wallet}
                </div>
              )}
              <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 leading-relaxed">
                {activeDestination.instructions}
              </p>
            </div>
          )}

          {/* 3. Form Input: Sender Number REQUIRED */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Sender Number / Account Identifier <span className="text-rose-500">* (REQUIRED)</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 017XXXXXXXX or Binance Pay ID"
              value={senderIdentifier}
              onChange={(e) => setSenderIdentifier(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          {/* 4. Form Input: TrxID OPTIONAL */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Transaction ID (TrxID) <span className="text-slate-400 font-normal">(Optional if screenshot attached)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. 9B48CK01Z"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          {/* 5. Form Input: Screenshot Upload OPTIONAL */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Payment Screenshot Proof <span className="text-slate-400 font-normal">(Optional if TrxID provided)</span>
            </label>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Screenshot</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              {screenshotName && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 truncate max-w-[200px]">
                  ✓ {screenshotName}
                </span>
              )}
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              * Privacy Guarantee: Screenshot is automatically deleted immediately upon approval to free storage.
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
