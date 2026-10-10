'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Inbox, Mail, History, 
  Coins, CreditCard, User, Settings, ArrowLeft, LogOut,
  Menu, X
} from 'lucide-react';
import { clientSignOut } from '@/lib/auth-client';

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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

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

  const activeLink = [...coreLinks, ...billingLinks].find((l) => l.href === pathname);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    setMobileOpen(false);
    await clientSignOut({ redirectTo: '/' });
  };

  const renderNavItems = (isMobile: boolean = false) => (
    <div className="flex-1 flex flex-col justify-between">
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

        {/* Core Services Category */}
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
                    <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-[6px] bg-[var(--ok-soft)] text-[var(--ok)] border border-[var(--ok)]/30">
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

      {/* Bottom actions: Back and active Sign Out */}
      <div className="pt-4 border-t border-[var(--line)] space-y-1.5 mt-6">
        <Link
          href="/"
          onClick={() => isMobile && setMobileOpen(false)}
          className="flex items-center gap-2.5 px-3 py-2 rounded-[11px] text-xs font-semibold text-[var(--t1)] hover:text-[var(--t0)] hover:bg-[var(--bg-3)] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Landing Page</span>
        </Link>
        <button
          type="button"
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[11px] text-xs font-semibold text-[var(--bad)] hover:bg-[var(--bad-soft)] transition-colors cursor-pointer disabled:opacity-50 text-left border border-transparent hover:border-[var(--bad)]/25"
        >
          <LogOut className="w-3.5 h-3.5 shrink-0" />
          <span>{isSigningOut ? 'Signing out...' : 'Sign Out'}</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Bar with Hamburger Trigger (< md) */}
      <div className="md:hidden sticky top-16 z-30 flex items-center justify-between px-4 py-2.5 bg-[var(--bg-1)] border-b border-[var(--line)] backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[var(--acc)] text-white font-extrabold text-xs">
            {userName.charAt(0)}
          </div>
          <div>
            <div className="text-xs font-bold text-[var(--t0)] flex items-center gap-1.5">
              <span>{activeLink?.label || 'Dashboard'}</span>
              <span className="text-[10px] font-mono text-[var(--acc)] bg-[var(--acc-soft)] px-1.5 py-0.2 rounded-[4px]">
                {userCredits} cr
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-[10px] bg-[var(--bg-2)] border border-[var(--line)] text-xs font-bold text-[var(--t0)] hover:bg-[var(--bg-3)] transition-all active:scale-95 shadow-sm cursor-pointer"
          aria-label="Toggle mobile menu"
        >
          <Menu className="w-4 h-4 text-[var(--acc)]" />
          <span>Menu</span>
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
                <div className="h-6 w-6 rounded-[8px] bg-[var(--acc)] flex items-center justify-center text-white text-xs font-bold">
                  OM
                </div>
                <span className="text-xs font-extrabold text-[var(--t0)] uppercase tracking-wider">
                  Dashboard Menu
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-[9px] text-[var(--t2)] hover:text-[var(--t0)] hover:bg-[var(--bg-3)] transition-colors cursor-pointer"
                aria-label="Close menu"
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
