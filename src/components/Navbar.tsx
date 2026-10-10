'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Mail, Menu, X, ArrowRight, LayoutDashboard, LogOut, User } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { Button } from './ui/Button';
import { ShimmerButton } from './magicui/shimmer-button';
import { createClient } from '@/lib/supabase/client';

import { clientSignOut } from '@/lib/auth-client';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<'user' | 'admin'>('user');
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Check authentication status from cookies and Supabase
    const checkAuth = async () => {
      const hasCookieSession = document.cookie.split('; ').some((row) => row.startsWith('omnimail_session='));
      const roleCookie = document.cookie.split('; ').find((row) => row.startsWith('omnimail_role='))?.split('=')[1];

      if (hasCookieSession) {
        setIsLoggedIn(true);
        if (roleCookie === 'admin') setUserRole('admin');
        return;
      }

      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getSession();
        if (data?.session) {
          setIsLoggedIn(true);
          const email = data.session.user?.email || '';
          if (email === 'admin@omnibey.com') {
            setUserRole('admin');
          }
        } else {
          setIsLoggedIn(false);
        }
      } catch {
        setIsLoggedIn(false);
      }
    };

    checkAuth();
  }, [pathname]);

  const handleSignOut = async () => {
    setIsLoggedIn(false);
    setMobileMenuOpen(false);
    await clientSignOut({ redirectTo: '/' });
  };

  const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/forgot-password';
  if (isAuthPage) return null;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--line)] bg-[var(--bg-0)]/80 backdrop-blur-xl transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-[13px] bg-[var(--acc)] text-white shadow-[0_10px_24px_-8px_var(--acc-soft)] group-hover:scale-105 transition-transform">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-extrabold tracking-tight text-[var(--t0)]">
                Omni<span className="text-[var(--acc)]">Mail</span>
              </span>
            </div>
            <p className="text-[10px] text-[var(--t2)] tracking-tight">by OmniBey Cloud</p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-[13px] font-semibold text-[var(--t1)]">
          <Link href="/#how-it-works" className="hover:text-[var(--t0)] transition-colors">
            How It Works
          </Link>
          <Link href="/#features" className="hover:text-[var(--t0)] transition-colors">
            Features
          </Link>
          <Link href="/#compatibility" className="hover:text-[var(--t0)] transition-colors">
            Services
          </Link>
          <Link href="/#pricing" className="hover:text-[var(--t0)] transition-colors">
            Pricing
          </Link>
        </nav>

        {/* Right CTA / Auth & Theme Switcher */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {/* Desktop Auth State Toggle */}
          <div className="hidden sm:flex items-center gap-2">
            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <Link href={userRole === 'admin' ? '/admin' : '/dashboard'}>
                  <ShimmerButton
                    background="var(--acc)"
                    shimmerColor="#ffffff"
                    className="px-4 py-2 text-xs"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>{userRole === 'admin' ? 'Admin Portal' : 'Dashboard'}</span>
                  </ShimmerButton>
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  title="Sign Out"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-[11px] text-xs font-semibold text-[var(--t2)] hover:text-[var(--bad)] hover:bg-[var(--bad-soft)] transition-colors cursor-pointer border border-transparent hover:border-[var(--bad)]/25"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <ShimmerButton
                    background="var(--acc)"
                    shimmerColor="#ffffff"
                    className="px-4 py-2 text-xs"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </ShimmerButton>
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-[11px] text-[var(--t1)] hover:bg-[var(--bg-3)] hover:text-[var(--t0)] transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[var(--line)] bg-[var(--bg-1)] px-4 pt-3 pb-6 space-y-3 animate-fade-in text-sm font-semibold">
          <Link
            href="/#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-[9px] text-[var(--t1)] hover:text-[var(--t0)] hover:bg-[var(--bg-3)]"
          >
            How It Works
          </Link>
          <Link
            href="/#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-[9px] text-[var(--t1)] hover:text-[var(--t0)] hover:bg-[var(--bg-3)]"
          >
            Features
          </Link>
          <Link
            href="/#pricing"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-[9px] text-[var(--t1)] hover:text-[var(--t0)] hover:bg-[var(--bg-3)]"
          >
            Pricing
          </Link>

          <div className="pt-2">
            {isLoggedIn ? (
              <div className="flex flex-col gap-2">
                <Link
                  href={userRole === 'admin' ? '/admin' : '/dashboard'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full"
                >
                  <ShimmerButton
                    background="var(--acc)"
                    shimmerColor="#ffffff"
                    className="w-full py-2.5 text-xs"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>{userRole === 'admin' ? 'Admin Portal' : 'Dashboard'}</span>
                  </ShimmerButton>
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-[11px] border border-[var(--bad)]/30 text-xs font-bold text-[var(--bad)] hover:bg-[var(--bad-soft)] transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup" onClick={() => setMobileMenuOpen(false)} className="flex-1">
                  <ShimmerButton
                    background="var(--acc)"
                    shimmerColor="#ffffff"
                    className="w-full py-2 text-xs"
                  >
                    <span>Get Started</span>
                  </ShimmerButton>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
