'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { GoogleAuthModal } from '@/components/GoogleAuthModal';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!name || !email || !password || !confirmPassword) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    if (!acceptTerms) {
      setErrorMsg('You must accept the Terms of Service & Privacy Policy.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          confirmPassword,
          acceptTerms,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Registration failed');
      }

      setSuccessMsg(data.message || 'Account created successfully! Redirecting...');
      document.cookie = `omnimail_session=${data.user.id}; path=/; max-age=86400`;
      document.cookie = `omnimail_role=${data.user.role}; path=/; max-age=86400`;

      setTimeout(() => {
        router.push(data.redirectTo || '/dashboard');
      }, 700);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[var(--bg-0)] text-[var(--t0)] transition-colors overflow-hidden">
      {/* Vela Ambient Glow Background */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/4 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60"
        style={{ background: 'radial-gradient(circle, var(--acc-soft), transparent 68%)' }}
      />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center px-4">
        <Link href="/" className="inline-flex items-center gap-3 group mb-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-[var(--acc)] text-white shadow-lg shadow-[var(--acc-soft)] group-hover:scale-105 transition-transform">
            <Mail className="h-6 w-6" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-[var(--t0)]">
            Omni<span className="text-[var(--acc)]">Mail</span>
          </span>
        </Link>
        <h1 className="text-2xl font-extrabold tracking-tight text-[var(--t0)]">
          Create your OmniBey account
        </h1>
        <p className="mt-2 text-xs text-[var(--t1)]">
          Get 15 free trial credits to start generating temporary mailboxes instantly.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 relative z-10">
        <Card className="p-6 sm:p-8 border border-[var(--line)] bg-[var(--bg-2)] shadow-[var(--shadow)] backdrop-blur-xl">
          {errorMsg && (
            <div className="mb-4 flex items-center gap-2.5 rounded-[12px] bg-[#f76d7d]/15 border border-[#f76d7d]/30 p-3 text-xs text-[#f76d7d]">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#f76d7d]" />
              <span className="font-semibold">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 flex items-center gap-2.5 rounded-[12px] bg-[#33d493]/15 border border-[#33d493]/30 p-3 text-xs text-[#33d493]">
              <ShieldCheck className="w-4 h-4 shrink-0 text-[#33d493]" />
              <span className="font-semibold">{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[var(--t1)] mb-1.5 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[var(--t2)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Rivera"
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-[11px] border border-[var(--line)] bg-[var(--bg-3)] text-[var(--t0)] placeholder-[var(--t2)] focus:outline-none focus:border-[var(--acc)] focus:ring-1 focus:ring-[var(--acc)] transition-all"
                />
              </div>
            </div>

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
                  placeholder="alex@example.com"
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-[11px] border border-[var(--line)] bg-[var(--bg-3)] text-[var(--t0)] placeholder-[var(--t2)] focus:outline-none focus:border-[var(--acc)] focus:ring-1 focus:ring-[var(--acc)] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--t1)] mb-1.5 uppercase tracking-wider">
                Password
              </label>
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

            <div>
              <label className="block text-xs font-bold text-[var(--t1)] mb-1.5 uppercase tracking-wider">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[var(--t2)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-[11px] border border-[var(--line)] bg-[var(--bg-3)] text-[var(--t0)] placeholder-[var(--t2)] focus:outline-none focus:border-[var(--acc)] focus:ring-1 focus:ring-[var(--acc)] transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                id="terms"
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="w-4 h-4 rounded-[4px] border-[var(--line)] text-[var(--acc)] focus:ring-[var(--acc)] bg-[var(--bg-3)] cursor-pointer"
              />
              <label htmlFor="terms" className="text-xs text-[var(--t1)] cursor-pointer">
                I agree to the{' '}
                <Link href="/#terms" className="text-[var(--acc)] hover:underline font-semibold">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/#privacy" className="text-[var(--acc)] hover:underline font-semibold">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Create Account
            </Button>
          </form>

          {/* Google OAuth Option */}
          <div className="mt-6 pt-5 border-t border-[var(--line)]">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => setGoogleModalOpen(true)}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-[12px] border border-[var(--line)] bg-[var(--bg-3)] hover:bg-[var(--bg-2)] hover:border-[var(--line-2)] text-xs font-bold text-[var(--t0)] transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer shadow-sm"
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
              <span>Sign up with Google</span>
            </button>
          </div>
        </Card>

        <p className="mt-6 text-center text-xs text-[var(--t2)]">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-[var(--acc)] hover:underline">
            Sign in
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
