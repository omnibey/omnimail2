'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Inbox, Mail, History, 
  Coins, CreditCard, User, Settings, ArrowLeft, LogOut,
  X, PanelLeftClose, PanelLeftOpen
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
  // Default to false so the sidebar is open by default
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Ref to prevent instant re-opening right after clicking collapse button
  const isManualCollapsingRef = useRef(false);

  // Restore collapsed state from localStorage (default to false if not set)
  useEffect(() => {
    try {
      const stored = localStorage.getItem('omnimail_dashboard_sidebar_collapsed');
      if (stored !== null) {
        setDesktopCollapsed(stored === 'true');
      } else {
        setDesktopCollapsed(false);
      }
    } catch {}
  }, []);

  // Close mobile drawer on route change
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileOpen(false);
  }

  // When user hovers over collapsed sidebar, expand it and KEEP it expanded!
  const handleMouseEnter = () => {
    if (isManualCollapsingRef.current) return;
    if (desktopCollapsed) {
      setDesktopCollapsed(false);
      try {
        localStorage.setItem('omnimail_dashboard_sidebar_collapsed', 'false');
      } catch {}
    }
  };

  const handleToggleCollapse = () => {
    isManualCollapsingRef.current = true;
    setTimeout(() => {
      isManualCollapsingRef.current = false;
    }, 400);

    setDesktopCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('omnimail_dashboard_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  useEffect(() => {
    const handleToggle = () => {
      if (window.innerWidth < 768) {
        setMobileOpen((prev) => !prev);
      } else {
        handleToggleCollapse();
      }
    };
    window.addEventListener('omnimail:toggle-dashboard-sidebar', handleToggle);
    window.addEventListener('omnimail:toggle-sidebar', handleToggle);
    return () => {
      window.removeEventListener('omnimail:toggle-dashboard-sidebar', handleToggle);
      window.removeEventListener('omnimail:toggle-sidebar', handleToggle);
    };
  }, []);

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

  const handleSignOut = async () => {
    setIsSigningOut(true);
    setMobileOpen(false);
    await clientSignOut({ redirectTo: '/' });
  };

  const renderNavContent = (isMobile: boolean = false) => {
    const isCollapsed = !isMobile && desktopCollapsed;

    return (
      <div className="flex-1 flex flex-col justify-between h-full overflow-hidden">
        <div className="space-y-4">
          
          {/* Header section with active Side View toggle button */}
          {isCollapsed ? (
            <div className="flex flex-col items-center gap-2 pb-2 border-b border-[var(--line)]">
              <div 
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--acc)] text-white font-extrabold text-sm shadow-md shadow-[var(--acc-soft)] cursor-pointer" 
                title={`${userName} (${userCredits} Credits) — Click or hover to expand`}
                onClick={handleToggleCollapse}
              >
                {userName.charAt(0)}
              </div>
              <button
                type="button"
                onClick={handleToggleCollapse}
                title="Expand sidebar"
                aria-label="Expand sidebar"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--line)] bg-[var(--bg-2)] hover:bg-[var(--bg-3)] text-[var(--acc)] transition-all cursor-pointer active:scale-95 shadow-xs"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="rounded-[14px] border border-[var(--line)] bg-[var(--bg-2)] p-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--acc)] text-white font-extrabold text-sm shadow-md shadow-[var(--acc-soft)]">
                    {userName.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1 whitespace-nowrap overflow-hidden">
                    <div className="truncate text-xs font-extrabold text-[var(--t0)]">
                      {userName}
                    </div>
                    <div className="truncate text-[11px] text-[var(--t2)] font-mono">
                      {userEmail}
                    </div>
                  </div>
                </div>

                {/* Active Side View Button to Collapse */}
                {!isMobile && (
                  <button
                    type="button"
                    onClick={handleToggleCollapse}
                    title="Collapse sidebar"
                    aria-label="Collapse sidebar"
                    className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-[var(--bg-3)] transition-colors cursor-pointer shrink-0"
                  >
                    <PanelLeftClose className="w-4 h-4 text-[var(--acc)]" />
                  </button>
                )}
              </div>

              <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-[var(--line)] text-xs">
                <span className="text-[var(--t2)] text-[11px] whitespace-nowrap">Available Credits:</span>
                <div className="flex items-center gap-1 font-mono font-bold text-[var(--acc)] bg-[var(--acc-soft)] px-2 py-0.5 rounded-[6px] shrink-0">
                  <Coins className="w-3 h-3" />
                  <span>{userCredits}</span>
                </div>
              </div>
            </div>
          )}

          {/* Core Services Category */}
          <div>
            {!isCollapsed && (
              <div className="px-3 pb-2 text-[10.5px] font-extrabold tracking-wider uppercase text-[var(--t2)] whitespace-nowrap">
                Mail Services
              </div>
            )}
            <nav className="space-y-1">
              {coreLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    title={isCollapsed ? `${link.label}${link.badge ? ` (${link.badge})` : ''}` : undefined}
                    onClick={() => isMobile && setMobileOpen(false)}
                    className={`flex items-center transition-all ${
                      isCollapsed
                        ? 'h-10 w-10 mx-auto justify-center rounded-xl relative'
                        : 'justify-between px-3 py-2 rounded-[11px] text-[13px] font-semibold'
                    } ${
                      isActive
                        ? 'bg-[var(--acc-soft)] text-[var(--acc)] font-bold shadow-xs ring-1 ring-[var(--acc)]/30'
                        : 'text-[var(--t1)] hover:bg-[var(--bg-3)] hover:text-[var(--t0)]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[var(--acc)]' : 'text-[var(--t2)]'}`} />
                      {!isCollapsed && <span className="truncate whitespace-nowrap">{link.label}</span>}
                    </div>
                    {!isCollapsed && link.badge && (
                      <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-[6px] bg-[var(--ok-soft)] text-[var(--ok)] border border-[var(--ok)]/30 shrink-0">
                        {link.badge}
                      </span>
                    )}
                    {isCollapsed && link.badge && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--ok)] ring-2 ring-[var(--bg-1)]" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {isCollapsed && <div className="w-8 mx-auto border-t border-[var(--line)]" />}

          {/* Account & Billing */}
          <div>
            {!isCollapsed && (
              <div className="px-3 pb-2 text-[10.5px] font-extrabold tracking-wider uppercase text-[var(--t2)] whitespace-nowrap">
                Account & Top-Up
              </div>
            )}
            <nav className="space-y-1">
              {billingLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    title={isCollapsed ? link.label : undefined}
                    onClick={() => isMobile && setMobileOpen(false)}
                    className={`flex items-center transition-all ${
                      isCollapsed
                        ? 'h-10 w-10 mx-auto justify-center rounded-xl'
                        : 'justify-between px-3 py-2 rounded-[11px] text-[13px] font-semibold'
                    } ${
                      isActive
                        ? 'bg-[var(--acc-soft)] text-[var(--acc)] font-bold shadow-xs ring-1 ring-[var(--acc)]/30'
                        : 'text-[var(--t1)] hover:bg-[var(--bg-3)] hover:text-[var(--t0)]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[var(--acc)]' : 'text-[var(--t2)]'}`} />
                      {!isCollapsed && <span className="truncate whitespace-nowrap">{link.label}</span>}
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
            title={isCollapsed ? "Back to Landing Page" : undefined}
            onClick={() => isMobile && setMobileOpen(false)}
            className={`flex items-center transition-colors ${
              isCollapsed
                ? 'h-10 w-10 mx-auto justify-center rounded-xl text-[var(--t1)] hover:text-[var(--t0)] hover:bg-[var(--bg-3)]'
                : 'gap-2.5 px-3 py-2 rounded-[11px] text-xs font-semibold text-[var(--t1)] hover:text-[var(--t0)] hover:bg-[var(--bg-3)]'
            }`}
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span className="whitespace-nowrap truncate">Back to Landing Page</span>}
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            title={isCollapsed ? "Sign Out" : undefined}
            disabled={isSigningOut}
            className={`w-full flex items-center transition-colors cursor-pointer disabled:opacity-50 text-left border border-transparent ${
              isCollapsed
                ? 'h-10 w-10 mx-auto justify-center rounded-xl text-[var(--bad)] hover:bg-[var(--bad-soft)]'
                : 'gap-2.5 px-3 py-2 rounded-[11px] text-xs font-semibold text-[var(--bad)] hover:bg-[var(--bad-soft)] hover:border-[var(--bad)]/25'
            }`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span className="whitespace-nowrap truncate">{isSigningOut ? 'Signing out...' : 'Sign Out'}</span>}
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Slide-Over Drawer Modal (< md) */}
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

            {renderNavContent(true)}
          </div>
        </div>
      )}

      {/* Desktop Persistent Collapsible Sidebar (>= md) */}
      <aside 
        onMouseEnter={handleMouseEnter}
        className={`hidden md:flex ${
          desktopCollapsed ? 'w-16 px-2' : 'w-64 px-3.5'
        } shrink-0 border-r border-[var(--line)] bg-[var(--bg-1)] flex-col justify-between py-4 transition-all duration-300 ease-in-out select-none`}
      >
        {renderNavContent(false)}
      </aside>
    </>
  );
};
