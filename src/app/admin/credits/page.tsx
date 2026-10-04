'use client';

import React, { useState, useEffect } from 'react';
import { Coins, Plus, Edit2, CheckCircle2, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CreditPackage } from '@/types';

export default function AdminCreditsPage() {
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/payments/packages')
      .then(res => res.json())
      .then(data => {
        if (data.packages) setPackages(data.packages);
      })
      .catch(console.error);
  }, []);

  const togglePackageStatus = (pkgId: string) => {
    setPackages(packages.map(p => {
      if (p.id === pkgId) {
        return { ...p, status: p.status === 'active' ? 'inactive' : 'active' };
      }
      return p;
    }));
    setToastMsg('Package status updated.');
    setTimeout(() => setToastMsg(null), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Coins className="w-6 h-6 text-amber-500" />
            Credit Packages & Pricing Rates
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Configure available top-up credit tiers, promotional bonuses, and pricing in BDT.
          </p>
        </div>

        <Button
          onClick={() => {
            setToastMsg('New package created as draft.');
            setTimeout(() => setToastMsg(null), 3000);
          }}
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add New Package
        </Button>
      </div>

      {toastMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 p-3 text-xs text-emerald-700 dark:text-emerald-300">
          <Sparkles className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <Card key={pkg.id} className="p-6 flex flex-col justify-between" hoverEffect>
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

              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {pkg.name}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {pkg.description}
              </p>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  ৳{pkg.price}
                </span>
                <span className="text-xs text-slate-400">/{pkg.currency}</span>
              </div>

              <div className="mt-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                {pkg.credits} Base Credits + {pkg.bonus} Bonus
              </div>

              <ul className="mt-4 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                {pkg.features.map((feat, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <Button
                onClick={() => togglePackageStatus(pkg.id)}
                variant="outline"
                size="sm"
              >
                {pkg.status === 'active' ? 'Deactivate' : 'Activate'}
              </Button>
              <Button
                onClick={() => {
                  setToastMsg('Edit package modal opened');
                  setTimeout(() => setToastMsg(null), 2500);
                }}
                variant="ghost"
                size="sm"
                leftIcon={<Edit2 className="w-3.5 h-3.5" />}
              >
                Edit
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
