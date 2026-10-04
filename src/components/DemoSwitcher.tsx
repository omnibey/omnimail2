'use client';

import React, { useState } from 'react';
import { ShieldAlert, User, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const DemoSwitcher: React.FC = () => {
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const switchRole = (newRole: 'user' | 'admin') => {
    setRole(newRole);
    document.cookie = `omnimail_role=${newRole}; path=/; max-age=86400`;
    setOpen(false);
    if (newRole === 'admin') {
      router.push('/admin');
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 w-72 animate-slide-up">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Role Testing Switcher
            </span>
            <button
              onClick={() => setOpen(false)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Close
            </button>
          </div>

          <div className="mt-3 space-y-2">
            <button
              onClick={() => switchRole('user')}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left text-xs transition-all ${
                role === 'user'
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-500" />
                <div>
                  <div className="font-medium text-slate-900 dark:text-white">Alex Rivera (User)</div>
                  <div className="text-[11px] text-slate-500">Normal temporary email user</div>
                </div>
              </div>
              {role === 'user' && <Check className="w-4 h-4 text-indigo-600" />}
            </button>

            <button
              onClick={() => switchRole('admin')}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left text-xs transition-all ${
                role === 'admin'
                  ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-semibold'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                <div>
                  <div className="font-medium text-slate-900 dark:text-white">OmniBey Admin (Root)</div>
                  <div className="text-[11px] text-slate-500">Access to /admin, approvals, RLS</div>
                </div>
              </div>
              {role === 'admin' && <Check className="w-4 h-4 text-amber-600" />}
            </button>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
            Simulates RBAC session role transitions locally.
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xl text-xs font-semibold hover:scale-105 active:scale-95 transition-all border border-slate-700 dark:border-slate-300"
          title="Switch Active Testing Role"
        >
          {role === 'admin' ? (
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400 dark:text-amber-600" />
          ) : (
            <User className="w-3.5 h-3.5 text-indigo-400 dark:text-indigo-600" />
          )}
          <span>Role: {role === 'admin' ? 'Admin' : 'User'}</span>
        </button>
      )}
    </div>
  );
};
