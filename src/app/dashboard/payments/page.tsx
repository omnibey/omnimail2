'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CreditCard, Plus, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Payment } from '@/types';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/payments/history?userId=user-demo-1')
      .then(res => res.json())
      .then(data => {
        if (data.payments) setPayments(data.payments);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <CreditCard className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Payment Orders & Verification History
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            View the status of your top-up submissions across bKash, Nagad, Rocket, Upay, and Binance.
          </p>
        </div>

        <Link href="/dashboard/credits">
          <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
            New Payment Order
          </Button>
        </Link>
      </div>

      <Card className="overflow-hidden">
        {payments.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <CreditCard className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No payment orders found
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Top up credits to generate more temporary mailboxes and unlock premium features.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 font-semibold text-slate-500 uppercase tracking-wider">
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
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {payments.map((pay) => (
                  <tr key={pay.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-slate-900 dark:text-white">
                      {pay.payment_ref}
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {pay.package_name || `${pay.amount} ${pay.currency}`}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        ৳{pay.amount} {pay.currency}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[10px]">
                        {pay.payment_method}
                      </span>
                    </td>

                    <td className="px-5 py-4 font-mono">
                      {pay.sender_identifier}
                    </td>

                    <td className="px-5 py-4 font-mono">
                      {pay.transaction_id ? (
                        <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                          {pay.transaction_id}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Screenshot Attached</span>
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
                        <div className="text-[10px] text-rose-500 mt-1 max-w-[160px] truncate" title={pay.rejection_reason}>
                          {pay.rejection_reason}
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-4 text-slate-500 whitespace-nowrap">
                      {new Date(pay.submitted_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>

                    <td className="px-5 py-4 text-slate-500 whitespace-nowrap">
                      {pay.reviewed_at ? (
                        <span>{new Date(pay.reviewed_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                      ) : (
                        <span className="text-slate-400 italic">Pending</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
