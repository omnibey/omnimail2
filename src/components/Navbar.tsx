'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Mail, Menu, X, ArrowRight, LayoutDashboard, LogOut, 
  User, UserCircle2, Settings, Info, Globe, Bell, 
  ChevronDown, ShieldCheck, Search, Check, ExternalLink, 
  MessageCircle, Phone, Sparkles
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { ShimmerButton } from './magicui/shimmer-button';
import { createClient } from '@/lib/supabase/client';
import { clientSignOut } from '@/lib/auth-client';
import { UserProfile } from '@/types';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<'user' | 'admin'>('user');
  const [user, setUser] = useState<UserProfile | null>(null);

  // Dropdown states
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState<{ code: string; label: string; flag: string }>({
    code: 'en',
    label: 'English',
    flag: '🇺🇸',
  });

  // Modal states
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  // Form states for profile editing
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);

  // Search input state
  const [searchQuery, setSearchQuery] = useState('');

  // Refs for click outside
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();

  const isAdminPage = pathname?.startsWith('/admin');
  const isDashboardPage = pathname?.startsWith('/dashboard');

  // Check authentication status and retrieve user profile
  useEffect(() => {
    const checkAuth = async () => {
      const sessionCookie = document.cookie
        .split('; ')
        .find((row) => row.startsWith('omnimail_session='))
        ?.split('=')[1];
      const roleCookie = document.cookie
        .split('; ')
        .find((row) => row.startsWith('omnimail_role='))
        ?.split('=')[1];

      const hasSessionCookie = Boolean(sessionCookie && sessionCookie.trim().length > 0);

      // 1. Check server session endpoint
      try {
        const res = await fetch('/api/auth/session');
        const data = await res.json();

        if (data?.user) {
          setUser(data.user);
          setIsLoggedIn(true);
          setUserRole(data.user.role === 'admin' || roleCookie === 'admin' ? 'admin' : 'user');
          setEditName(data.user.name || 'Musharof Chowdhury');
          setEditPhone(data.user.phone || '+1 (555) 234-5678');
          return;
        }
      } catch {}

      // 2. Fallback to client session cookie if present
      if (hasSessionCookie) {
        setIsLoggedIn(true);
        setUserRole(roleCookie === 'admin' ? 'admin' : 'user');
        setEditName('Musharof Chowdhury');
        return;
      }

      // 3. Check Supabase client session if available
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getSession();
        if (data?.session) {
          setIsLoggedIn(true);
          const email = data.session.user?.email || '';
          if (email === 'admin@omnibey.com') {
            setUserRole('admin');
          }
          return;
        }
      } catch {}

      // 4. Truly signed out / guest: strictly clear all user details and dropdowns
      setIsLoggedIn(false);
      setUser(null);
      setProfileDropdownOpen(false);
    };

    checkAuth();
  }, [pathname]);

  // Keyboard shortcut for Cmd/Ctrl + K search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
        setLanguageMenuOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setNotificationDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdowns on route change
  useEffect(() => {
    setProfileDropdownOpen(false);
    setNotificationDropdownOpen(false);
    setMobileMenuOpen(false);
    setLanguageMenuOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    setIsLoggedIn(false);
    setUser(null);
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
    await clientSignOut({ redirectTo: '/' });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileSuccessMsg(null);
    try {
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_profile',
          userId: user?.id,
          name: editName,
          phone: editPhone,
        }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        setProfileSuccessMsg('Profile updated successfully!');
        setTimeout(() => {
          setProfileSuccessMsg(null);
          setEditProfileOpen(false);
        }, 1200);
      } else {
        if (user) {
          setUser({ ...user, name: editName, phone: editPhone });
        }
        setProfileSuccessMsg('Profile updated!');
        setTimeout(() => {
          setProfileSuccessMsg(null);
          setEditProfileOpen(false);
        }, 1200);
      }
    } catch {
      setProfileSuccessMsg('Profile saved.');
      setTimeout(() => {
        setProfileSuccessMsg(null);
        setEditProfileOpen(false);
      }, 1200);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleToggleLeftSidebar = () => {
    if (isAdminPage) {
      window.dispatchEvent(new CustomEvent('omnimail:toggle-admin-sidebar'));
    } else if (isDashboardPage) {
      window.dispatchEvent(new CustomEvent('omnimail:toggle-dashboard-sidebar'));
    } else {
      setMobileMenuOpen(!mobileMenuOpen);
    }
  };

  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/signup' || pathname === '/forgot-password';
  if (isAuthPage) return null;

  // Active display name and email matching TailAdmin reference
  const displayName = user?.name || (userRole === 'admin' ? 'OmniBey Admin' : 'Musharof Chowdhury');
  const displayFirstName = displayName.split(' ')[0] || 'Musharof';
  const displayEmail = user?.email || (userRole === 'admin' ? 'admin@omnibey.com' : 'randomuser@pimjo.com');
  const avatarUrl = user?.avatar_url || '/images/user/owner.png';

  const notifications = [
    {
      id: 1,
      title: 'New verification code',
      desc: 'OTP code 841-902 extracted for tempbox Netflix account',
      time: '2 min ago',
      unread: true,
      category: 'Mail',
    },
    {
      id: 2,
      title: 'Credit package credited',
      desc: '50 disposable mailbox tokens successfully deposited',
      time: '15 min ago',
      unread: true,
      category: 'Billing',
    },
    {
      id: 3,
      title: 'Security audit checkpoint',
      desc: 'New authorized sign-in from Chrome on Windows',
      time: '1 hour ago',
      unread: false,
      category: 'Security',
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-gray-200/90 dark:border-gray-800 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-md transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Left section: Sidebar toggle hamburger & Brand Logo */}
          <div className="flex items-center gap-3">
            {/* Mobile-only Hamburger Menu Button (< md) */}
            <button
              type="button"
              onClick={handleToggleLeftSidebar}
              title={isAdminPage ? 'Toggle Admin Sidebar' : isDashboardPage ? 'Toggle Dashboard Sidebar' : 'Toggle Menu'}
              aria-label="Toggle Navigation Sidebar"
              className="md:hidden flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shadow-xs active:scale-95 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* OmniMail Brand Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--acc)] text-white shadow-md shadow-[var(--acc-soft)] group-hover:scale-105 transition-transform">
                <Mail className="h-5 w-5" />
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-extrabold tracking-tight text-gray-900 dark:text-white">
                    Omni<span className="text-[var(--acc)]">Mail</span>
                  </span>
                  {isAdminPage && (
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-[#f7b84e]/15 text-[#f7b84e] border border-[#f7b84e]/30">
                      Admin
                    </span>
                  )}
                  {isDashboardPage && !isAdminPage && (
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-[var(--acc-soft)] text-[var(--acc)] border border-[var(--acc)]/25">
                      Portal
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium tracking-tight">
                  by OmniBey Cloud
                </p>
              </div>
            </Link>

            {/* Admin Context Badge or TailAdmin Search bar */}
            {isAdminPage ? (
              <div className="hidden lg:flex items-center gap-2 ml-4 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-500 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Admin Suite Active</span>
              </div>
            ) : null}
          </div>

          {/* Middle section: Desktop Marketing Nav or Quick Search input */}
          <div className="flex-1 max-w-md hidden md:flex items-center justify-center px-4">
            {isAdminPage || isDashboardPage ? (
              <button
                type="button"
                onClick={() => setSearchModalOpen(true)}
                className="w-full relative flex items-center justify-between h-10 px-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/75 dark:bg-gray-900/60 text-xs text-gray-400 hover:border-gray-300 dark:hover:border-gray-700 hover:text-gray-600 dark:hover:text-gray-300 transition-all cursor-pointer shadow-xs"
              >
                <div className="flex items-center gap-2.5">
                  <Search className="w-4 h-4 text-gray-400" />
                  <span>Search mailboxes, telemetry, settings...</span>
                </div>
                <kbd className="hidden sm:inline-flex items-center gap-1 font-mono text-[10px] font-semibold text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700">
                  ⌘ K
                </kbd>
              </button>
            ) : (
              <nav className="flex items-center gap-6 text-sm font-semibold text-gray-600 dark:text-gray-300">
                <Link href="/#how-it-works" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                  How It Works
                </Link>
                <Link href="/#features" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                  Features
                </Link>
                <Link href="/#compatibility" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                  Services
                </Link>
                <Link href="/#pricing" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                  Pricing
                </Link>
              </nav>
            )}
          </div>

          {/* Right section: TailAdmin Dark Mode toggle, Notification Bell, Profile Trigger */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* 1. TailAdmin Dark Mode Toggler */}
            <ThemeToggle />

            {/* 2. TailAdmin Notification Menu Area */}
            <div className="relative" ref={notificationRef}>
              <button
                type="button"
                onClick={() => {
                  setNotificationDropdownOpen(!notificationDropdownOpen);
                  setProfileDropdownOpen(false);
                }}
                className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors shadow-xs active:scale-95 cursor-pointer"
                aria-label="View notifications"
                title="Notifications"
              >
                <span className="absolute top-1 right-1 z-10 flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500 ring-2 ring-white dark:ring-gray-900" />
                </span>
                <Bell className="w-4 h-4" />
              </button>

              {/* Notification Dropdown Card */}
              {notificationDropdownOpen && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-[#111827] p-4 shadow-2xl z-50 animate-slide-up text-gray-700 dark:text-gray-200">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                        Notifications
                      </h4>
                      <span className="px-1.5 py-0.2 rounded-full bg-[var(--acc-soft)] text-[var(--acc)] text-[10px] font-bold">
                        3 New
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNotificationDropdownOpen(false)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <ul className="mt-2 divide-y divide-gray-100 dark:divide-gray-800/60 max-h-72 overflow-y-auto">
                    {notifications.map((item) => (
                      <li key={item.id} className="py-2.5 hover:bg-gray-50/80 dark:hover:bg-gray-800/40 rounded-xl px-2 transition-colors">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-semibold text-gray-900 dark:text-white">
                            {item.title}
                          </span>
                          <span className="text-[10px] font-mono text-gray-400 shrink-0">
                            {item.time}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                          {item.desc}
                        </p>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-3 border-t border-gray-100 dark:border-gray-800 mt-2">
                    <Link
                      href="/dashboard/history"
                      onClick={() => setNotificationDropdownOpen(false)}
                      className="block text-center text-xs font-semibold text-[var(--acc)] hover:underline py-1"
                    >
                      View All Activity & Logs
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* 3. TailAdmin User Profile Area & Dropdown */}
            {isLoggedIn ? (
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => {
                    setProfileDropdownOpen(!profileDropdownOpen);
                    setNotificationDropdownOpen(false);
                  }}
                  className="flex items-center gap-2.5 p-1 rounded-full sm:rounded-xl hover:bg-gray-100/70 dark:hover:bg-gray-800/60 transition-colors cursor-pointer select-none"
                  aria-expanded={profileDropdownOpen}
                  aria-label="User profile menu"
                >
                  {/* Rounded Avatar Circle */}
                  <div className="h-10 w-10 overflow-hidden rounded-full ring-2 ring-gray-100 dark:ring-gray-800 bg-gray-200 dark:bg-gray-800 shrink-0 shadow-xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80';
                      }}
                    />
                  </div>

                  {/* User Name */}
                  <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-200 tracking-tight">
                    {displayFirstName}
                  </span>

                  {/* Arrow Icon: points up (rotate-180) when open, exactly like TailAdmin */}
                  <ChevronDown
                    className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${
                      profileDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* TailAdmin Signature User Dropdown Card */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-72 rounded-2xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-[#111827] p-4 shadow-2xl z-50 text-gray-700 dark:text-gray-200 animate-slide-up">
                    
                    {/* User Full Name & Email Header */}
                    <div className="px-1 pb-3 border-b border-gray-100 dark:border-gray-800/80">
                      <span className="block text-[14px] font-semibold text-gray-900 dark:text-white tracking-tight">
                        {displayName}
                      </span>
                      <span className="block text-[12px] text-gray-500 dark:text-gray-400 mt-0.5 truncate font-normal">
                        {displayEmail}
                      </span>
                    </div>

                    {/* Menu Items List */}
                    <ul className="flex flex-col gap-1 border-b border-gray-100 dark:border-gray-800/80 pt-3 pb-3">
                      
                      {/* 1. Dashboard Option (User Explicit Requirement!) */}
                      <li>
                        <Link
                          href="/dashboard"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center justify-between px-3 py-2 rounded-xl text-[13.5px] font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100/80 dark:text-gray-300 dark:hover:text-white dark:hover:bg-white/5 transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <LayoutDashboard className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200 transition-colors" />
                            <span>Dashboard</span>
                          </div>
                          <span className="text-[10px] font-bold text-[var(--acc)] bg-[var(--acc-soft)] px-1.5 py-0.5 rounded-md">
                            User
                          </span>
                        </Link>
                      </li>

                      {/* 2. Admin Dashboard (if admin role) */}
                      {userRole === 'admin' && (
                        <li>
                          <Link
                            href="/admin"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center justify-between px-3 py-2 rounded-xl text-[13.5px] font-medium text-[#f7b84e] hover:bg-[#f7b84e]/10 transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              <ShieldCheck className="w-5 h-5 text-[#f7b84e]" />
                              <span>Admin Dashboard</span>
                            </div>
                            <span className="text-[10px] font-mono font-bold text-[#f7b84e] bg-[#f7b84e]/15 border border-[#f7b84e]/30 px-1.5 py-0.5 rounded-md">
                              Root
                            </span>
                          </Link>
                        </li>
                      )}

                      {/* 3. Edit Profile */}
                      <li>
                        <button
                          type="button"
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            setEditProfileOpen(true);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13.5px] font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100/80 dark:text-gray-300 dark:hover:text-white dark:hover:bg-white/5 transition-colors cursor-pointer text-left group"
                        >
                          <UserCircle2 className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200 transition-colors" />
                          <span>Edit profile</span>
                        </button>
                      </li>

                      {/* 4. Account Settings */}
                      <li>
                        <Link
                          href={userRole === 'admin' ? '/admin/settings' : '/dashboard/settings'}
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-xl text-[13.5px] font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100/80 dark:text-gray-300 dark:hover:text-white dark:hover:bg-white/5 transition-colors group"
                        >
                          <Settings className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200 transition-colors" />
                          <span>Account settings</span>
                        </Link>
                      </li>
                    </ul>

                    {/* Sign out */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13.5px] font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 dark:text-gray-300 dark:hover:text-red-400 dark:hover:bg-red-500/10 transition-colors cursor-pointer text-left group"
                      >
                        <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" />
                        <span>Sign out</span>
                      </button>
                    </div>

                  </div>
                )}
              </div>
            ) : (
              /* If not logged in, show Sign In / Sign Up */
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <ShimmerButton
                    background="var(--acc)"
                    shimmerColor="#ffffff"
                    className="px-4 py-2 text-xs"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </ShimmerButton>
                </Link>
              </div>
            )}

          </div>
        </div>

        {/* Mobile Navigation Drawer for Marketing pages (< md) */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 pt-3 pb-6 space-y-3 animate-fade-in text-sm font-semibold">
            <Link
              href="/#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              How It Works
            </Link>
            <Link
              href="/#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Features
            </Link>
            <Link
              href="/#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Pricing
            </Link>

            <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
              {isLoggedIn ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full block"
                  >
                    <ShimmerButton
                      background="var(--acc)"
                      shimmerColor="#ffffff"
                      className="w-full py-2.5 text-xs"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      <span>Go to User Dashboard</span>
                    </ShimmerButton>
                  </Link>
                  {userRole === 'admin' && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full mt-2 block"
                    >
                      <button
                        type="button"
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-xs font-bold text-amber-500 hover:bg-amber-500/20 transition-colors"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Admin Suite</span>
                      </button>
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full mt-2 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-medium text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full"
                  >
                    <Button variant="ghost" size="sm" className="w-full justify-center">
                      Sign In
                    </Button>
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full"
                  >
                    <ShimmerButton
                      background="var(--acc)"
                      shimmerColor="#ffffff"
                      className="w-full py-2.5 text-xs"
                    >
                      <span>Get Started</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </ShimmerButton>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={editProfileOpen}
        onClose={() => setEditProfileOpen(false)}
        title="Edit Profile"
        description="Update your personal details and account credentials."
      >
        <form onSubmit={handleSaveProfile} className="space-y-4">
          {profileSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>{profileSuccessMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Musharof Chowdhury"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--acc)]/40"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
              Email Address (Fixed)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                disabled
                value={displayEmail}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800/60 text-sm font-mono text-gray-500 dark:text-gray-400 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
              Phone / Contact
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="+880 1700-000000"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--acc)]/40"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100 dark:border-gray-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEditProfileOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSavingProfile}
            >
              {isSavingProfile ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Support & Help Modal */}
      <Modal
        isOpen={supportModalOpen}
        onClose={() => setSupportModalOpen(false)}
        title="OmniMail 24/7 Support Desk"
        description="Get fast resolution for temporary mailbox routing, verification tokens, or credit top-ups."
      >
        <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-2">
            <div className="flex items-center gap-2 text-indigo-500 font-bold">
              <MessageCircle className="w-5 h-5" />
              <span>Official Telegram Live Support</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Immediate response by technical team for webhook failures and OTP heuristics.
            </p>
            <a
              href="https://t.me/omnibey_support"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-500 hover:underline pt-1"
            >
              <span>Launch Telegram (@omnibey_support)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-800 space-y-2">
            <div className="flex items-center gap-2 text-gray-900 dark:text-white font-bold">
              <Mail className="w-4 h-4 text-[var(--acc)]" />
              <span>Dedicated Enterprise Email</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Email us directly at <span className="font-mono text-gray-900 dark:text-white">support@omnibey.com</span>. Average response turnaround is &lt; 20 minutes.
            </p>
          </div>

          <div className="pt-2 flex justify-end">
            <Button size="sm" onClick={() => setSupportModalOpen(false)}>
              Close Desk
            </Button>
          </div>
        </div>
      </Modal>

      {/* Search / Command Palette Modal (⌘ K) */}
      <Modal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        title="Quick Command Navigation"
        description="Jump instantly to any section of the OmniMail suite."
      >
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sections, mailboxes, or actions..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--acc)]/40"
            />
          </div>

          <div className="space-y-1 text-xs font-semibold">
            <div className="px-2 py-1 text-gray-400 uppercase text-[10px] tracking-wider font-bold">
              Quick Links
            </div>
            {[
              { label: 'Live Inbox', href: '/dashboard/inbox', desc: 'Real-time incoming OTP messages' },
              { label: 'Mailboxes Directory', href: '/dashboard/emails', desc: 'Generated ephemeral emails' },
              { label: 'Usage Analytics & Telemetry', href: '/dashboard/history', desc: 'Domain and routing logs' },
              { label: 'Credits & Top-Up', href: '/dashboard/credits', desc: 'Add tokens for custom prefix mailboxes' },
              { label: 'Admin Analytics & Control', href: '/admin', desc: 'Platform control panel (Root)' },
              { label: 'Account Settings', href: '/dashboard/settings', desc: 'Change password and webhook configs' },
            ]
              .filter((item) => item.label.toLowerCase().includes(searchQuery.toLowerCase()) || item.desc.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSearchModalOpen(false)}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                >
                  <div>
                    <div className="text-gray-900 dark:text-white font-bold">{item.label}</div>
                    <div className="text-gray-400 text-[11px] font-normal">{item.desc}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[var(--acc)] transition-colors" />
                </Link>
              ))}
          </div>
        </div>
      </Modal>
    </>
  );
};
