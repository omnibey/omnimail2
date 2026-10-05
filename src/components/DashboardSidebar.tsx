'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Inbox, Mail, History, 
  Coins, CreditCard, User, Settings, ArrowLeft, LogOut
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

  const coreLinks = [
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Live Inbox', href: '/dashboard/inbox', icon: Inbox, badge: 'Live' },
    { label: 'Mailboxes', href: '/dashboard/emails', icon: Mail },
    { label: 'Usage Analytics', href: '/dashboard/history', icon: History },
  ];

  const billingLinks = [
    { label: 'Credits & Top-Up', href: '/dashboard/credits', icon: Coins },
    { label: 'Payment Orders', href: '/dashboard/payments', icon: CreditCard },
    { label: 'Profile', href: '/dashboard/profile', icon: User },
    { label: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <aside className="w-full md:w-64 shrink-0 border-r border-[var(--line)] bg-[var(--bg-1)] flex flex-col justify-between p-4 transition-colors">
      <div className="space-y-5">
        {/* User Mini Card */}
        <div className="rounded-[14px] border border-[var(--line)] bg-[var(--bg-2)] p-3.5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-[var(--acc)] text-white font-extrabold text-sm shadow-md shadow-[var(--acc-soft)]">
              {userName.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-extrabold text-[var(--t0)]">
                {userName}
              </div>
              <div className="truncate text-[11px] text-[var(--t2)] font-mono">
                {userEmail}
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-[var(--line)] text-xs">
            <span className="text-[var(--t2)] text-[11px]">Available Credits:</span>
            <div className="flex items-center gap-1 font-mono font-bold text-[var(--acc)] bg-[var(--acc-soft)] px-2 py-0.5 rounded-[6px]">
              <Coins className="w-3 h-3" />
              <span>{userCredits}</span>
            </div>
          </div>
        </div>

        {/* Dashboards Category */}
        <div>
          <div className="px-3 pb-2 text-[10.5px] font-extrabold tracking-wider uppercase text-[var(--t2)]">
            Mail Services
          </div>
          <nav className="space-y-1">
            {coreLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-[11px] text-[13px] font-semibold transition-all ${
                    isActive
                      ? 'bg-[var(--acc-soft)] text-[var(--acc)] font-bold shadow-sm'
                      : 'text-[var(--t1)] hover:bg-[var(--bg-3)] hover:text-[var(--t0)]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[var(--acc)]' : 'text-[var(--t2)]'}`} />
                    <span>{link.label}</span>
                  </div>
                  {link.badge && (
                    <span className="px-1.5 py-0.2 text-[10px] font-mono font-bold rounded-[6px] bg-[var(--ok-soft)] text-[var(--ok)] border border-[var(--ok)]/30">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Account & Billing */}
        <div>
          <div className="px-3 pb-2 text-[10.5px] font-extrabold tracking-wider uppercase text-[var(--t2)]">
            Account & Top-Up
          </div>
          <nav className="space-y-1">
            {billingLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-[11px] text-[13px] font-semibold transition-all ${
                    isActive
                      ? 'bg-[var(--acc-soft)] text-[var(--acc)] font-bold shadow-sm'
                      : 'text-[var(--t1)] hover:bg-[var(--bg-3)] hover:text-[var(--t0)]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[var(--acc)]' : 'text-[var(--t2)]'}`} />
                    <span>{link.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom links */}
      <div className="pt-4 border-t border-[var(--line)] space-y-1.5">
        <Link
          href="/"
          className="flex items-center gap-2.5 px-3 py-2 rounded-[11px] text-xs font-semibold text-[var(--t1)] hover:text-[var(--t0)] hover:bg-[var(--bg-3)] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Landing Page</span>
        </Link>
        <Link
          href="/login"
          className="flex items-center gap-2.5 px-3 py-2 rounded-[11px] text-xs font-semibold text-[var(--bad)] hover:bg-[var(--bad-soft)] transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </Link>
      </div>
    </aside>
  );
};
