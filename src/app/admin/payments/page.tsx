'use client';

import React, { useState, useEffect } from 'react';
import { 
  CreditCard, CheckCircle2, XCircle, Eye, 
  Trash2, ShieldCheck, AlertCircle, Sparkles, Filter 
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Payment } from '@/types';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fetchPayments = async () => {
    try {
      const res = await fetch('/api/admin/metrics');
      const data = await res.json();
      if (data.recentPayments) setPayments(data.recentPayments);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleApprove = async (paymentId: string) => {
    try {
      setActionLoading(true);
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

      setToastMsg(data.message || 'Payment approved! Credits added and screenshot purged.');
      setInspectModalOpen(false);
      fetchPayments();
      setTimeout(() => setToastMsg(null), 5000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Approval failed';
      alert(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayment) return;

    try {
      setActionLoading(true);
      const res = await fetch('/api/admin/payments/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId: selectedPayment.id,
          adminId: 'user-admin-1',
          reason: rejectionReason,
          adminEmail: 'admin@omnibey.com',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Rejection failed');
      }

      setToastMsg('Payment rejected and reason recorded.');
      setRejectModalOpen(false);
      setInspectModalOpen(false);
      setRejectionReason('');
      fetchPayments();
      setTimeout(() => setToastMsg(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Rejection failed';
      alert(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredPayments = payments.filter((p) => {
    if (filter === 'all') return true;
    return p.status === filter;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <CreditCard className="w-6 h-6 text-amber-500" />
            Manual Payment Review & Verification
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Enforces strict idempotency: one payment can NEVER allocate credits twice. Screenshot is automatically purged on approval.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
          {(['pending', 'approved', 'rejected', 'all'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 rounded-lg font-semibold uppercase tracking-wider text-[10px] transition-all ${
                filter === st
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {toastMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 p-3.5 text-xs text-emerald-700 dark:text-emerald-300">
          <Sparkles className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Payments Table */}
      <Card className="overflow-hidden">
        {filteredPayments.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No payments match the filter &ldquo;{filter}&rdquo;.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Payment ID</th>
                  <th className="px-5 py-3.5">User</th>
                  <th className="px-5 py-3.5">Package & Amount</th>
                  <th className="px-5 py-3.5">Method</th>
                  <th className="px-5 py-3.5">Sender Identifier</th>
                  <th className="px-5 py-3.5">TrxID / Proof</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {filteredPayments.map((pay) => (
                  <tr key={pay.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-slate-900 dark:text-white">
                      {pay.payment_ref}
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {pay.user_name || 'Alex Rivera'}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {pay.user_email || 'user@omnibey.com'}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        ৳{pay.amount} {pay.currency}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {pay.package_name}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[10px]">
                        {pay.payment_method}
                      </span>
                    </td>

                    <td className="px-5 py-4 font-mono font-bold text-slate-700 dark:text-slate-200">
                      {pay.sender_identifier}
                    </td>

                    <td className="px-5 py-4">
                      {pay.transaction_id ? (
                        <div className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                          {pay.transaction_id}
                        </div>
                      ) : null}
                      {pay.screenshot_url ? (
                        <span className="text-emerald-600 dark:text-emerald-400 text-[10px] block">
                          [Screenshot Attached]
                        </span>
                      ) : pay.status === 'approved' ? (
                        <span className="text-slate-400 text-[10px] italic">
                          Screenshot purged
                        </span>
                      ) : null}
                    </td>

                    <td className="px-5 py-4">
                      <Badge
                        variant={
                          pay.status === 'approved'
                            ? 'success'
                            : pay.status === 'rejected'
                            ? 'danger'
                            : 'warning'
                        }
                        size="sm"
                      >
                        {pay.status}
                      </Badge>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          onClick={() => {
                            setSelectedPayment(pay);
                            setInspectModalOpen(true);
                          }}
                          variant="outline"
                          size="sm"
                          leftIcon={<Eye className="w-3.5 h-3.5" />}
                        >
                          Inspect
                        </Button>

                        {pay.status === 'pending' && (
                          <>
                            <Button
                              onClick={() => handleApprove(pay.id)}
                              variant="success"
                              size="sm"
                              isLoading={actionLoading}
                              leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                            >
                              Approve
                            </Button>

                            <Button
                              onClick={() => {
                                setSelectedPayment(pay);
                                setRejectModalOpen(true);
                              }}
                              variant="danger"
                              size="sm"
                              leftIcon={<XCircle className="w-3.5 h-3.5" />}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Inspect / Verification Modal */}
      <Modal
        isOpen={inspectModalOpen}
        onClose={() => setInspectModalOpen(false)}
        title={`Inspect Payment: ${selectedPayment?.payment_ref}`}
        description="Verify transaction sender and matching financial records"
        maxWidth="lg"
      >
        {selectedPayment && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <div>
                <span className="text-slate-400">User:</span>
                <div className="font-semibold text-slate-900 dark:text-white">{selectedPayment.user_email}</div>
              </div>
              <div>
                <span className="text-slate-400">Amount & Currency:</span>
                <div className="font-bold text-slate-900 dark:text-white">৳{selectedPayment.amount} {selectedPayment.currency}</div>
              </div>
              <div>
                <span className="text-slate-400">Payment Gateway:</span>
                <div className="font-bold uppercase text-indigo-600 dark:text-indigo-400">{selectedPayment.payment_method}</div>
              </div>
              <div>
                <span className="text-slate-400">Sender Number / Account:</span>
                <div className="font-mono font-bold text-slate-900 dark:text-white">{selectedPayment.sender_identifier}</div>
              </div>
              <div>
                <span className="text-slate-400">Transaction ID (TrxID):</span>
                <div className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{selectedPayment.transaction_id || 'None (Screenshot provided)'}</div>
              </div>
              <div>
                <span className="text-slate-400">Status:</span>
                <div>
                  <Badge variant={selectedPayment.status === 'approved' ? 'success' : selectedPayment.status === 'rejected' ? 'danger' : 'warning'} size="sm">
                    {selectedPayment.status}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Screenshot Preview */}
            {selectedPayment.screenshot_url ? (
              <div>
                <span className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Attached Payment Proof Screenshot:
                </span>
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-2 bg-slate-100 dark:bg-slate-950 text-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedPayment.screenshot_url}
                    alt="Payment Proof"
                    className="max-h-60 mx-auto rounded-lg object-contain shadow-sm"
                  />
                  <p className="mt-1.5 text-[10px] text-slate-400">
                    * Approving will delete this screenshot permanently from storage to enforce zero-retention privacy.
                  </p>
                </div>
              </div>
            ) : selectedPayment.status === 'approved' ? (
              <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 text-xs">
                ✓ Screenshot purged immediately upon approval in accordance with Section 15 privacy requirements.
              </div>
            ) : (
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
                No screenshot uploaded. Verified using Transaction ID: <code>{selectedPayment.transaction_id}</code>
              </div>
            )}

            {/* Actions */}
            {selectedPayment.status === 'pending' && (
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <Button
                  onClick={() => {
                    setInspectModalOpen(false);
                    setRejectModalOpen(true);
                  }}
                  variant="danger"
                  size="md"
                >
                  Reject with Reason
                </Button>
                <Button
                  onClick={() => handleApprove(selectedPayment.id)}
                  variant="success"
                  size="md"
                  isLoading={actionLoading}
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                >
                  Approve & Credit Balance
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Reject Reason Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title={`Reject Payment: ${selectedPayment?.payment_ref}`}
        description="Provide a clear reason for the user and administrative audit trail"
        maxWidth="md"
      >
        <form onSubmit={handleReject} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Rejection Reason <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="e.g. Sender number did not match merchant transaction statement for this timeframe."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/50"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setRejectModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              size="md"
              isLoading={actionLoading}
            >
              Confirm Rejection
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
