'use client';

import React, { useState } from 'react';
import { ShieldAlert, User, Check, X } from 'lucide-react';
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
        <div className="bg-[var(--bg-2)] border border-[var(--line)] rounded-[18px] shadow-[var(--shadow)] p-4 w-72 animate-slide-up text-[var(--t0)]">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
            <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-[var(--t2)]">
              Role Testing Switcher
            </span>
            <button
              onClick={() => setOpen(false)}
              className="text-xs text-[var(--t2)] hover:text-[var(--t0)] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-3 space-y-2">
            <button
              onClick={() => switchRole('user')}
              className={`w-full flex items-center justify-between p-2.5 rounded-[12px] border text-left text-xs transition-all cursor-pointer ${
                role === 'user'
                  ? 'border-[var(--acc)] bg-[var(--acc-soft)] text-[var(--acc)] font-bold shadow-sm'
                  : 'border-[var(--line)] bg-[var(--bg-3)] hover:bg-[var(--bg-3)]/80 text-[var(--t1)]'
              }`}
            >
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[var(--acc)]" />
                <div>
                  <div className="font-bold text-[var(--t0)]">Alex Rivera (User)</div>
                  <div className="text-[10px] text-[var(--t2)]">Standard temporary mailbox</div>
                </div>
              </div>
              {role === 'user' && <Check className="w-4 h-4 text-[var(--acc)]" />}
            </button>

            <button
              onClick={() => switchRole('admin')}
              className={`w-full flex items-center justify-between p-2.5 rounded-[12px] border text-left text-xs transition-all cursor-pointer ${
                role === 'admin'
                  ? 'border-[#f7b84e] bg-[#f7b84e]/15 text-[#f7b84e] font-bold shadow-sm'
                  : 'border-[var(--line)] bg-[var(--bg-3)] hover:bg-[var(--bg-3)]/80 text-[var(--t1)]'
              }`}
            >
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#f7b84e]" />
                <div>
                  <div className="font-bold text-[var(--t0)]">OmniBey Admin (Root)</div>
                  <div className="text-[10px] text-[var(--t2)]">Full multi-dashboard access</div>
                </div>
              </div>
              {role === 'admin' && <Check className="w-4 h-4 text-[#f7b84e]" />}
            </button>
          </div>

          <div className="mt-3 pt-2 border-t border-[var(--line)] text-[10px] text-[var(--t2)] font-mono">
            Simulates RBAC session transitions.
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--bg-2)] text-[var(--t0)] shadow-[var(--shadow)] text-xs font-bold hover:scale-105 active:scale-95 transition-all border border-[var(--line)] cursor-pointer"
          title="Switch Active Testing Role"
        >
          {role === 'admin' ? (
            <ShieldAlert className="w-3.5 h-3.5 text-[#f7b84e]" />
          ) : (
            <User className="w-3.5 h-3.5 text-[var(--acc)]" />
          )}
          <span>Role: {role === 'admin' ? 'Admin' : 'User'}</span>
        </button>
      )}
    </div>
  );
};
