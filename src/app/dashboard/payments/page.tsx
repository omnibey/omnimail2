'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CreditCard, Plus, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { Payment } from '@/types';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = () => {
    setLoading(true);
    fetch('/api/payments/history?userId=user-demo-1')
      .then((res) => res.json())
      .then((data) => {
        if (data.payments) setPayments(data.payments);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in text-[var(--t0)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--t0)] flex items-center gap-2.5">
            <CreditCard className="w-6 h-6 text-[var(--acc)]" />
            Payment Orders & Verification History
          </h1>
          <p className="mt-1 text-xs text-[var(--t2)] font-medium">
            View the status of your top-up submissions across bKash, Nagad, Rocket, Upay, and Binance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={fetchPayments}
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>

          <Link href="/dashboard/credits">
            <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
              New Top-Up Order
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={4} />
      ) : (
        <Card className="overflow-hidden bg-[var(--bg-2)] border-[var(--line)]">
          {payments.length === 0 ? (
            <div className="p-12 text-center text-[var(--t2)]">
              <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-60" />
              <p className="text-sm font-bold text-[var(--t0)]">
                No payment orders found
              </p>
              <p className="text-xs text-[var(--t2)] mt-1">
                Top up credits to generate more temporary mailboxes and unlock premium features.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[var(--bg-3)] border-b border-[var(--line)] font-bold text-[var(--t2)] uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Payment Ref</th>
                    <th className="px-5 py-3.5">Package</th>
                    <th className="px-5 py-3.5">Method</th>
                    <th className="px-5 py-3.5">Sender Identifier</th>
                    <th className="px-5 py-3.5">TrxID / Proof</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Submitted</th>
                    <th className="px-5 py-3.5">Reviewed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)] font-medium">
                  {payments.map((pay) => (
                    <tr key={pay.id} className="hover:bg-[var(--bg-3)]/60 transition-colors">
                      <td className="px-5 py-4 font-mono font-bold text-[var(--t0)]">
                        {pay.payment_ref}
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-bold text-[var(--t0)]">
                          {pay.package_name || `${pay.amount} ${pay.currency}`}
                        </div>
                        <div className="text-[11px] text-[var(--t2)] font-mono">
                          ৳{pay.amount} {pay.currency}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-bold uppercase tracking-wider text-[var(--t0)] bg-[var(--bg-3)] border border-[var(--line)] px-2 py-0.5 rounded-[6px] text-[10px]">
                          {pay.payment_method}
                        </span>
                      </td>

                      <td className="px-5 py-4 font-mono text-[var(--t0)]">
                        {pay.sender_identifier}
                      </td>

                      <td className="px-5 py-4 font-mono">
                        {pay.transaction_id ? (
                          <span className="text-[var(--acc)] font-bold">
                            {pay.transaction_id}
                          </span>
                        ) : (
                          <span className="text-[var(--t2)] italic">Screenshot Attached</span>
                        )}
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
                        {pay.status === 'rejected' && pay.rejection_reason && (
                          <div className="text-[10px] text-[var(--bad)] mt-1 max-w-[160px] truncate" title={pay.rejection_reason}>
                            {pay.rejection_reason}
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-4 text-[var(--t2)] whitespace-nowrap font-mono">
                        {new Date(pay.submitted_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </td>

                      <td className="px-5 py-4 text-[var(--t2)] whitespace-nowrap font-mono">
                        {pay.reviewed_at ? (
                          <span>{new Date(pay.reviewed_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                        ) : (
                          <span className="italic">Pending Review</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
