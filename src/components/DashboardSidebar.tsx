'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Inbox, Mail, History, 
  Coins, CreditCard, User, Settings, LogOut, ArrowLeft
} from 'lucide-react';

interface SidebarProps {
  userCredits?: number;
  userName?: string;
  userEmail?: string;
}

export const DashboardSidebar: React.FC<SidebarProps> = ({
  userCredits = 45,
  userName = 'Alex Rivera',
  userEmail = 'user@omnibey.com',
}) => {
  const pathname = usePathname();

  const links = [
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Live Inbox', href: '/dashboard/inbox', icon: Inbox, badge: 'Live' },
    { label: 'Mailboxes', href: '/dashboard/emails', icon: Mail },
    { label: 'Usage History', href: '/dashboard/history', icon: History },
    { label: 'Credits & Top-Up', href: '/dashboard/credits', icon: Coins },
    { label: 'Payment Orders', href: '/dashboard/payments', icon: CreditCard },
    { label: 'Profile', href: '/dashboard/profile', icon: User },
    { label: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <aside className="w-full md:w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 flex flex-col justify-between p-4 transition-colors">
      <div className="space-y-6">
        {/* User Mini Card */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-sm">
              {userName.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                {userName}
              </div>
              <div className="truncate text-xs text-slate-500 dark:text-slate-400">
                {userEmail}
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-slate-200/80 dark:border-slate-800/80 text-xs">
            <span className="text-slate-500 dark:text-slate-400">Balance:</span>
            <div className="flex items-center gap-1 font-bold text-indigo-600 dark:text-indigo-400">
              <Coins className="w-3.5 h-3.5" />
              <span>{userCredits} Credits</span>
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
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 font-semibold shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span>{link.label}</span>
                </div>
                {link.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/20">
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
          href="/"
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Landing Page</span>
        </Link>
        <Link
          href="/login"
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </Link>
      </div>
    </aside>
  );
};
