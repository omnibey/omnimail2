'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Users, Mail, MessageSquare, 
  CreditCard, Coins, BarChart3, Settings, 
  FileText, ArrowLeft, LogOut, ShieldCheck,
  Activity, Menu, X
} from 'lucide-react';
import { clientSignOut } from '@/lib/auth-client';

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

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

  const activeLink = [...dashboardLinks, ...managementLinks].find((l) => l.href === pathname);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    setMobileOpen(false);
    await clientSignOut({ redirectTo: '/' });
  };

  const renderNavItems = (isMobile: boolean = false) => (
    <div className="flex-1 flex flex-col justify-between">
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
                  onClick={() => isMobile && setMobileOpen(false)}
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
                    <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-[6px] bg-[var(--acc-soft)] text-[var(--acc)] border border-[var(--acc)]/30">
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
                  onClick={() => isMobile && setMobileOpen(false)}
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

      {/* Bottom actions: Switch to User and active Sign Out */}
      <div className="pt-4 border-t border-[var(--line)] space-y-1.5 mt-6">
        <Link
          href="/dashboard"
          onClick={() => isMobile && setMobileOpen(false)}
          className="flex items-center gap-2.5 px-3 py-2 rounded-[11px] text-xs font-semibold text-[var(--t1)] hover:text-[var(--t0)] hover:bg-[var(--bg-3)] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Switch to User View</span>
        </Link>
        <button
          type="button"
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[11px] text-xs font-semibold text-[var(--bad)] hover:bg-[var(--bad-soft)] transition-colors cursor-pointer disabled:opacity-50 text-left border border-transparent hover:border-[var(--bad)]/25"
        >
          <LogOut className="w-3.5 h-3.5 shrink-0" />
          <span>{isSigningOut ? 'Signing out...' : 'Sign Out Admin'}</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Bar with Hamburger Trigger (< md) */}
      <div className="md:hidden sticky top-16 z-30 flex items-center justify-between px-4 py-2.5 bg-[var(--bg-1)] border-b border-[var(--line)] backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[#f7b84e] text-black font-extrabold text-xs shadow-sm">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-[var(--t0)] flex items-center gap-1.5">
              <span>{activeLink?.label || 'Admin Suite'}</span>
              <span className="text-[10px] font-mono font-bold text-[#f7b84e] bg-[#f7b84e]/10 border border-[#f7b84e]/20 px-1.5 py-0.2 rounded-[4px]">
                Root
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-[10px] bg-[var(--bg-2)] border border-[var(--line)] text-xs font-bold text-[var(--t0)] hover:bg-[var(--bg-3)] transition-all active:scale-95 shadow-sm cursor-pointer"
          aria-label="Toggle admin navigation"
        >
          <Menu className="w-4 h-4 text-[#f7b84e]" />
          <span>Admin Menu</span>
        </button>
      </div>

      {/* Mobile Slide-Over Drawer Modal */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer container */}
          <div className="relative w-[300px] max-w-[85vw] bg-[var(--bg-1)] border-r border-[var(--line)] z-50 p-4 flex flex-col justify-between overflow-y-auto shadow-2xl animate-slide-in-left">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)] mb-4">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-[8px] bg-[#f7b84e] flex items-center justify-center text-black text-xs font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-extrabold text-[var(--t0)] uppercase tracking-wider">
                  Admin Navigation
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-[9px] text-[var(--t2)] hover:text-[var(--t0)] hover:bg-[var(--bg-3)] transition-colors cursor-pointer"
                aria-label="Close admin menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {renderNavItems(true)}
          </div>
        </div>
      )}

      {/* Desktop Persistent Sidebar (>= md) */}
      <aside className="hidden md:flex w-64 shrink-0 border-r border-[var(--line)] bg-[var(--bg-1)] flex-col justify-between p-4 transition-colors">
        {renderNavItems(false)}
      </aside>
    </>
  );
};
