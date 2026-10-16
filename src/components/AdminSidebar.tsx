'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Users, Mail, MessageSquare, 
  CreditCard, Coins, BarChart3, Settings, 
  FileText, ArrowLeft, LogOut, ShieldCheck,
  Activity, X, PanelLeftClose, PanelLeftOpen
} from 'lucide-react';
import { clientSignOut } from '@/lib/auth-client';

export const AdminSidebar: React.FC = () => {
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
      const stored = localStorage.getItem('omnimail_admin_sidebar_collapsed');
      if (stored !== null) {
        setDesktopCollapsed(stored === 'true');
      } else {
        setDesktopCollapsed(false);
      }
    } catch {}
  }, []);

  // Close mobile drawer on route change
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
        localStorage.setItem('omnimail_admin_sidebar_collapsed', 'false');
      } catch {}
    }
  };

  // Toggle collapsed state and persist to localStorage
  const handleToggleCollapse = () => {
    isManualCollapsingRef.current = true;
    setTimeout(() => {
      isManualCollapsingRef.current = false;
    }, 400);

    setDesktopCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('omnimail_admin_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  // Listen for sidebar toggle event dispatched from Navbar
  useEffect(() => {
    const handleToggle = () => {
      if (window.innerWidth < 768) {
        setMobileOpen((prev) => !prev);
      } else {
        handleToggleCollapse();
      }
    };
    window.addEventListener('omnimail:toggle-admin-sidebar', handleToggle);
    return () => window.removeEventListener('omnimail:toggle-admin-sidebar', handleToggle);
  }, []);

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
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f7b84e] text-black font-extrabold text-sm shadow-md shadow-[#f7b84e]/20 cursor-pointer" 
                title="OmniBey Admin (Root Authority) — Click or hover to expand"
                onClick={handleToggleCollapse}
              >
                <ShieldCheck className="h-5 w-5" />
              </div>
              <button
                type="button"
                onClick={handleToggleCollapse}
                title="Expand sidebar"
                aria-label="Expand sidebar"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--line)] bg-[var(--bg-2)] hover:bg-[var(--bg-3)] text-[#f7b84e] transition-all cursor-pointer active:scale-95 shadow-xs"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="rounded-[14px] border border-[#f7b84e]/30 bg-[#f7b84e]/10 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f7b84e] text-black font-extrabold text-sm shadow-md shadow-[#f7b84e]/20">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1 whitespace-nowrap overflow-hidden">
                    <div className="truncate text-xs font-extrabold text-[var(--t0)]">
                      OmniBey Admin
                    </div>
                    <div className="truncate text-[11px] text-[#f7b84e] font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#f7b84e] animate-pulse" />
                      Root Authority
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
                    className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-[#f7b84e]/20 transition-colors cursor-pointer shrink-0"
                  >
                    <PanelLeftClose className="w-4 h-4 text-[#f7b84e]" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Dashboards Category */}
          <div>
            {!isCollapsed && (
              <div className="px-3 pb-2 text-[10.5px] font-extrabold tracking-wider uppercase text-[var(--t2)] whitespace-nowrap">
                Dashboards
              </div>
            )}
            <nav className="space-y-1">
              {dashboardLinks.map((link) => {
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
                      <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-[6px] bg-[var(--acc-soft)] text-[var(--acc)] border border-[var(--acc)]/30 shrink-0">
                        {link.badge}
                      </span>
                    )}
                    {isCollapsed && link.badge && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--acc)] ring-2 ring-[var(--bg-1)]" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {isCollapsed && <div className="w-8 mx-auto border-t border-[var(--line)]" />}

          {/* Management Category */}
          <div>
            {!isCollapsed && (
              <div className="px-3 pb-2 text-[10.5px] font-extrabold tracking-wider uppercase text-[var(--t2)] whitespace-nowrap">
                Operations & Control
              </div>
            )}
            <nav className="space-y-1">
              {managementLinks.map((link) => {
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

        {/* Bottom actions: Switch to User and active Sign Out */}
        <div className="pt-4 border-t border-[var(--line)] space-y-1.5 mt-6">
          <Link
            href="/dashboard"
            title={isCollapsed ? "Switch to User View" : undefined}
            onClick={() => isMobile && setMobileOpen(false)}
            className={`flex items-center transition-colors ${
              isCollapsed
                ? 'h-10 w-10 mx-auto justify-center rounded-xl text-[var(--t1)] hover:text-[var(--t0)] hover:bg-[var(--bg-3)]'
                : 'gap-2.5 px-3 py-2 rounded-[11px] text-xs font-semibold text-[var(--t1)] hover:text-[var(--t0)] hover:bg-[var(--bg-3)]'
            }`}
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span className="whitespace-nowrap truncate">Switch to User View</span>}
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            title={isCollapsed ? "Sign Out Admin" : undefined}
            disabled={isSigningOut}
            className={`w-full flex items-center transition-colors cursor-pointer disabled:opacity-50 text-left border border-transparent ${
              isCollapsed
                ? 'h-10 w-10 mx-auto justify-center rounded-xl text-[var(--bad)] hover:bg-[var(--bad-soft)]'
                : 'gap-2.5 px-3 py-2 rounded-[11px] text-xs font-semibold text-[var(--bad)] hover:bg-[var(--bad-soft)] hover:border-[var(--bad)]/25'
            }`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span className="whitespace-nowrap truncate">{isSigningOut ? 'Signing out...' : 'Sign Out Admin'}</span>}
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
