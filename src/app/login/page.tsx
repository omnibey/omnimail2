'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { GoogleAuthModal } from '@/components/GoogleAuthModal';

function LoginForm() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');
  const initialOauthError = errorParam
    ? (errorParam === 'oauth_failed'
        ? 'Google authentication was cancelled or interrupted. You can sign in using the Google selector.'
        : decodeURIComponent(errorParam))
    : null;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const router = useRouter();

  const activeError = errorMsg ?? initialOauthError;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Authentication failed');
      }

      setSuccessMsg('Login successful! Redirecting to your dashboard...');
      document.cookie = `omnimail_session=${data.user.id}; path=/; max-age=86400`;
      document.cookie = `omnimail_role=${data.user.role}; path=/; max-age=86400`;

      setTimeout(() => {
        router.push(data.redirectTo || '/dashboard');
      }, 500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = (role: 'user' | 'admin') => {
    if (role === 'admin') {
      setEmail('admin@omnibey.com');
      setPassword('admin123456');
    } else {
      setEmail('user@omnibey.com');
      setPassword('user123456');
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[var(--bg-0)] text-[var(--t0)] transition-colors overflow-hidden">
      {/* Vela Ambient Glow Background */}
      <div className="pointer-events-none absolute left-1/2 top-1/4 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60" style={{ background: 'radial-gradient(circle, var(--acc-soft), transparent 68%)' }} />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center px-4">
        <Link href="/" className="inline-flex items-center gap-3 group mb-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-[var(--acc)] text-white shadow-lg shadow-[var(--acc-soft)] group-hover:scale-105 transition-transform">
            <Mail className="h-6 w-6" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-[var(--t0)]">
            Omni<span className="text-[var(--acc)]">Mail</span>
          </span>
        </Link>
        <h2 className="text-2xl font-extrabold tracking-tight text-[var(--t0)]">
          Welcome back to OmniMail
        </h2>
        <p className="mt-2 text-xs text-[var(--t1)]">
          Temporary disposable mailboxes with instantaneous OTP extraction.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 relative z-10">
        <Card className="p-6 sm:p-8 border border-[var(--line)] bg-[var(--bg-2)] shadow-[var(--shadow)] backdrop-blur-xl">
          {activeError && (
            <div className="mb-5 p-3.5 rounded-[12px] bg-[#f76d7d]/15 border border-[#f76d7d]/30 text-xs text-[#f76d7d] flex items-start gap-2.5 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#f76d7d]" />
              <div className="flex-1 font-medium">{activeError}</div>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3.5 rounded-[12px] bg-[#33d493]/15 border border-[#33d493]/30 text-xs text-[#33d493] flex items-center gap-2 animate-fade-in">
              <ShieldCheck className="w-4 h-4 shrink-0 text-[#33d493]" />
              <div className="font-semibold">{successMsg}</div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[var(--t1)] mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[var(--t2)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@omnibey.com"
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-[11px] border border-[var(--line)] bg-[var(--bg-3)] text-[var(--t0)] placeholder-[var(--t2)] focus:outline-none focus:border-[var(--acc)] focus:ring-1 focus:ring-[var(--acc)] transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[var(--t1)] uppercase tracking-wider">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-[var(--acc)] hover:underline font-semibold"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[var(--t2)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 text-xs rounded-[11px] border border-[var(--line)] bg-[var(--bg-3)] text-[var(--t0)] placeholder-[var(--t2)] focus:outline-none focus:border-[var(--acc)] focus:ring-1 focus:ring-[var(--acc)] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--t2)] hover:text-[var(--t0)]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In to Account
            </Button>
          </form>

          {/* Google Login Button */}
          <div className="mt-6 pt-5 border-t border-[var(--line)]">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => setGoogleModalOpen(true)}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-[12px] border border-[var(--line)] bg-[var(--bg-3)] hover:bg-[var(--bg-2)] hover:border-[var(--line-2)] text-xs font-bold text-[var(--t0)] transition-all active:scale-[0.98] disabled:opacity-60 shadow-sm cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.9c2.28-2.1 3.64-5.2 3.64-9.15z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.9-3.05c-1.08.72-2.45 1.16-4.03 1.16-3.1 0-5.74-2.1-6.68-4.93H1.28v3.15C3.26 21.36 7.34 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.32 14.27c-.24-.73-.38-1.5-.38-2.27s.14-1.54.38-2.27V6.58H1.28C.46 8.21 0 10.05 0 12s.46 3.79 1.28 5.42l4.04-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.28 6.58l4.04 3.15c.94-2.83 3.58-4.98 6.68-4.98z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>

          {/* Quick Demo Credentials for Reviewers */}
          <div className="mt-5 p-3 rounded-[11px] bg-[var(--bg-3)] border border-[var(--line)] text-[11px] text-[var(--t2)] flex items-center justify-between">
            <span className="font-bold text-[var(--t1)]">Quick Demo:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('user')}
                className="text-[var(--acc)] font-bold hover:underline"
              >
                User (Demo)
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('admin')}
                className="text-[#f7b84e] font-bold hover:underline"
              >
                Admin (Root)
              </button>
            </div>
          </div>
        </Card>

        <p className="mt-6 text-center text-xs text-[var(--t2)]">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-bold text-[var(--acc)] hover:underline">
            Create an account for free
          </Link>
        </p>
      </div>

      {/* Google Auth Modal */}
      <GoogleAuthModal
        isOpen={googleModalOpen}
        onClose={() => setGoogleModalOpen(false)}
      />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--bg-0)] flex items-center justify-center" />}>
      <LoginForm />
    </Suspense>
  );
}
