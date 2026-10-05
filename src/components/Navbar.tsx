'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mail, Menu, X, ArrowRight, LayoutDashboard, ShieldAlert } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { Button } from './ui/Button';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

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
              <span className="text-[10px] font-mono font-bold tracking-wider px-1.5 py-0.5 rounded-[6px] bg-[var(--acc-soft)] text-[var(--acc)] border border-[var(--acc)]/25">
                VELA
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

          <div className="h-4 w-px bg-[var(--line)] mx-1" />

          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[9px] text-[var(--acc)] hover:bg-[var(--acc-soft)] transition-colors"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>User Dashboard</span>
          </Link>

          <Link
            href="/admin"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[9px] text-[#f7b84e] hover:bg-[#f7b84e]/10 transition-colors"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Admin Suite</span>
          </Link>
        </nav>

        {/* Right CTA / Auth & Theme Switcher */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          <div className="hidden sm:flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Get Started
              </Button>
            </Link>
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
          <Link
            href="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-[9px] text-[var(--acc)] bg-[var(--acc-soft)]"
          >
            User Dashboard
          </Link>
          <Link
            href="/admin"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-[9px] text-[#f7b84e] bg-[#f7b84e]/10"
          >
            Admin Suite
          </Link>
          <div className="pt-2 flex items-center gap-2">
            <Link href="/login" className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                Sign In
              </Button>
            </Link>
            <Link href="/signup" className="flex-1">
              <Button variant="primary" size="sm" className="w-full">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
