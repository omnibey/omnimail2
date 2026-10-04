'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ShieldAlert, Users, Mail, MessageSquare, 
  CreditCard, Coins, BarChart3, Settings, 
  FileText, ArrowLeft, LogOut, ShieldCheck 
} from 'lucide-react';

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();

  const links = [
    { label: 'Control Center', href: '/admin', icon: ShieldAlert },
    { label: 'Users Management', href: '/admin/users', icon: Users },
    { label: 'Generated Emails', href: '/admin/emails', icon: Mail },
    { label: 'Message Logs', href: '/admin/messages', icon: MessageSquare },
    { label: 'Payment Verifications', href: '/admin/payments', icon: CreditCard, badge: 'Review' },
    { label: 'Credit Packages', href: '/admin/credits', icon: Coins },
    { label: 'System Analytics', href: '/admin/analytics', icon: BarChart3 },
    { label: 'Gateway Settings', href: '/admin/settings', icon: Settings },
    { label: 'Audit Trail', href: '/admin/audit-logs', icon: FileText },
  ];

  return (
    <aside className="w-full md:w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex flex-col justify-between p-4 transition-colors">
      <div className="space-y-6">
        {/* Admin Badge Header */}
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 dark:bg-amber-950/20 p-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-600 text-white font-bold text-sm shadow-md shadow-amber-600/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-bold text-amber-900 dark:text-amber-300">
                OmniBey Admin
              </div>
              <div className="truncate text-xs text-amber-700/80 dark:text-amber-400/80">
                Security Level: Root
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 font-semibold shadow-sm border border-amber-500/30'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span>{link.label}</span>
                </div>
                {link.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 animate-pulse">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom links */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Switch to User Dashboard</span>
        </Link>
        <Link
          href="/login"
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out Admin</span>
        </Link>
      </div>
    </aside>
  );
};
