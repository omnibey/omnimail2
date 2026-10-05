'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Users, Mail, MessageSquare, 
  CreditCard, Coins, BarChart3, Settings, 
  FileText, ArrowLeft, LogOut, ShieldCheck,
  Activity
} from 'lucide-react';

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();

  const dashboardLinks = [
    { label: 'Analytics Dashboard', href: '/admin', icon: BarChart3, badge: 'Live' },
    { label: 'Sales & Revenue', href: '/admin/payments', icon: CreditCard, badge: 'Orders' },
    { label: 'SaaS Telemetry', href: '/admin/analytics', icon: Activity },
    { label: 'Security & Audit', href: '/admin/audit-logs', icon: FileText },
  ];

  const managementLinks = [
    { label: 'User Directory', href: '/admin/users', icon: Users },
    { label: 'Dispatched Mailboxes', href: '/admin/emails', icon: Mail },
    { label: 'Incoming Messages', href: '/admin/messages', icon: MessageSquare },
    { label: 'Credit Packages', href: '/admin/credits', icon: Coins },
    { label: 'Gateway Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <aside className="w-full md:w-64 shrink-0 border-r border-[var(--line)] bg-[var(--bg-1)] flex flex-col justify-between p-4 transition-colors">
      <div className="space-y-5">
        {/* Admin Badge Header */}
        <div className="rounded-[14px] border border-[#f7b84e]/30 bg-[#f7b84e]/10 p-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-[#f7b84e] text-black font-extrabold text-sm shadow-md shadow-[#f7b84e]/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-extrabold text-[var(--t0)]">
                OmniBey Admin
              </div>
              <div className="truncate text-[11px] text-[#f7b84e] font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#f7b84e] animate-pulse" />
                Root Authority
              </div>
            </div>
          </div>
        </div>

        {/* Dashboards Category */}
        <div>
          <div className="px-3 pb-2 text-[10.5px] font-extrabold tracking-wider uppercase text-[var(--t2)]">
            Dashboards
          </div>
          <nav className="space-y-1">
            {dashboardLinks.map((link) => {
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
                    <span className="px-1.5 py-0.2 text-[10px] font-mono font-bold rounded-[6px] bg-[var(--acc-soft)] text-[var(--acc)] border border-[var(--acc)]/30">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Management Category */}
        <div>
          <div className="px-3 pb-2 text-[10.5px] font-extrabold tracking-wider uppercase text-[var(--t2)]">
            Operations & Control
          </div>
          <nav className="space-y-1">
            {managementLinks.map((link) => {
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

      {/* Bottom actions */}
      <div className="pt-4 border-t border-[var(--line)] space-y-1.5">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 px-3 py-2 rounded-[11px] text-xs font-semibold text-[var(--t1)] hover:text-[var(--t0)] hover:bg-[var(--bg-3)] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Switch to User View</span>
        </Link>
        <Link
          href="/login"
          className="flex items-center gap-2.5 px-3 py-2 rounded-[11px] text-xs font-semibold text-[var(--bad)] hover:bg-[var(--bad-soft)] transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out Admin</span>
        </Link>
      </div>
    </aside>
  );
};
