'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { GoogleAuthModal } from '@/components/GoogleAuthModal';
import { LottieLoader } from '@/components/ui/LottieLoader';
import { BorderBeam } from '@/components/magicui/border-beam';
import { fireRealisticConfetti } from '@/components/magicui/confetti';
import { GridPattern } from '@/components/magicui/grid-pattern';
import { ShimmerButton } from '@/components/magicui/shimmer-button';
import { toast } from '@/components/ui/toast';
import { createClient } from '@/lib/supabase/client';

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetRoute =
    searchParams.get('returnTo') ||
    searchParams.get('redirect') ||
    searchParams.get('next') ||
    searchParams.get('callbackUrl') ||
    '/dashboard';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      const msg = 'Please complete all required fields.';
      setErrorMsg(msg);
      toast.error('Missing fields', { description: msg });
      return;
    }

    if (password !== confirmPassword) {
      const msg = 'Passwords do not match. Please verify both entries.';
      setErrorMsg(msg);
      toast.error('Password mismatch', { description: msg });
      return;
    }

    if (password.length < 6) {
      const msg = 'Password must contain at least 6 characters.';
      setErrorMsg(msg);
      toast.error('Weak password', { description: msg });
      return;
    }

    if (!acceptTerms) {
      const msg = 'You must agree to the Terms of Service & Privacy Policy.';
      setErrorMsg(msg);
      toast.error('Terms required', { description: msg });
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          confirmPassword,
          acceptTerms,
          returnTo: targetRoute,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Registration failed');
      }

      // 1. Trigger celebratory confetti burst
      fireRealisticConfetti();

      // 2. Persist credentials in sessionStorage for auto-fill on login page
      try {
        sessionStorage.setItem('omnimail_registered_email', email.trim());
        sessionStorage.setItem('omnimail_registered_password', password);
        sessionStorage.setItem('omnimail_registered_name', name.trim());
      } catch (storageErr) {
        console.warn('Storage warning:', storageErr);
      }

      toast.success('Account created successfully!', {
        description: 'Auto-filling your email and password on the login screen...',
      });
      setSuccessMsg('Registration successful! Redirecting to login with pre-filled credentials...');
      setIsRedirecting(true);

      // 3. Redirect to login page with auto-fill query params
      setTimeout(() => {
        const loginUrl = `/login?registered=1&email=${encodeURIComponent(email.trim())}${
          targetRoute !== '/dashboard' ? `&returnTo=${encodeURIComponent(targetRoute)}` : ''
        }`;
        router.push(loginUrl);
      }, 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      setErrorMsg(msg);
      toast.error('Registration failed', { description: msg });
      setIsLoading(false);
      setIsRedirecting(false);
    }
  };

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    setErrorMsg(null);
    try {
      const supabase = createClient();
      const redirectUrl = `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(targetRoute)}`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) {
        console.warn('[Supabase Google OAuth Provider Notice]:', error.message);
        // Fall back gracefully to Google One-Click Auth Modal
        setGoogleModalOpen(true);
      }
    } catch (err) {
      console.warn('[Google OAuth fallback notice]:', err);
      setGoogleModalOpen(true);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[var(--bg-0)] text-[var(--t0)] transition-colors overflow-hidden">
      {/* MagicUI Background Grid Pattern */}
      <GridPattern
        width={38}
        height={38}
        strokeDasharray="4 2"
        className="opacity-45 [mask-image:radial-gradient(ellipse_at_center,white_35%,transparent_80%)]"
        squares={[
          [1, 2],
          [4, 6],
          [8, 3],
          [12, 8],
          [3, 11],
        ]}
      />

      {/* Vela Ambient Glow Background */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/4 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-3xl"
        style={{ background: 'radial-gradient(circle, var(--acc-soft), transparent 68%)' }}
      />

      {isRedirecting && (
        <LottieLoader
          overlay
          size="lg"
          text="Account created! Taking you to login..."
          subtext="Your email and password have been auto-filled for immediate sign in."
        />
      )}

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
        <p className="mt-2 text-xs text-[var(--t2)] font-medium">
          Get 15 complimentary credits to generate temporary mailboxes and extract OTPs immediately.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 relative z-10">
        <Card className="relative overflow-hidden p-6 sm:p-8 border border-[var(--line)] bg-[var(--bg-1)] shadow-[var(--shadow)] backdrop-blur-xl">
          {/* MagicUI Border Beam effect on Registration Card */}
          <BorderBeam
            size={280}
            duration={12}
            delay={0}
            borderWidth={1.5}
            colorFrom="#7c5cff"
            colorTo="#56a8ff"
          />

          {errorMsg && (
            <div className="mb-4 flex items-center gap-2.5 rounded-[12px] bg-[var(--bad-soft)] border border-[var(--bad)]/30 p-3 text-xs text-[var(--bad)] animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-[var(--bad)]" />
              <span className="font-semibold">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 flex items-center gap-2.5 rounded-[12px] bg-[var(--ok-soft)] border border-[var(--ok)]/30 p-3 text-xs text-[var(--ok)] animate-fade-in">
              <ShieldCheck className="w-4 h-4 shrink-0 text-[var(--ok)]" />
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
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-[11px] border border-[var(--line)] bg-[var(--bg-3)] text-[var(--t0)] placeholder-[var(--t2)] focus:outline-none focus:border-[var(--acc)] focus:ring-1 focus:ring-[var(--acc)] transition-all font-medium"
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
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-[11px] border border-[var(--line)] bg-[var(--bg-3)] text-[var(--t0)] placeholder-[var(--t2)] focus:outline-none focus:border-[var(--acc)] focus:ring-1 focus:ring-[var(--acc)] transition-all font-medium"
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
                  className="w-full pl-10 pr-10 py-2.5 text-xs rounded-[11px] border border-[var(--line)] bg-[var(--bg-3)] text-[var(--t0)] placeholder-[var(--t2)] focus:outline-none focus:border-[var(--acc)] focus:ring-1 focus:ring-[var(--acc)] transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--t2)] hover:text-[var(--t0)] cursor-pointer"
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
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-[11px] border border-[var(--line)] bg-[var(--bg-3)] text-[var(--t0)] placeholder-[var(--t2)] focus:outline-none focus:border-[var(--acc)] focus:ring-1 focus:ring-[var(--acc)] transition-all font-medium"
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
              <label htmlFor="terms" className="text-xs text-[var(--t1)] cursor-pointer select-none">
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

            <div className="pt-2">
              <ShimmerButton
                type="submit"
                disabled={isLoading}
                background="var(--acc)"
                shimmerColor="#ffffff"
                className="w-full py-3"
              >
                <span>{isLoading ? 'Creating Account...' : 'Create Account & Auto-Fill Login'}</span>
                <ArrowRight className="w-4 h-4" />
              </ShimmerButton>
            </div>
          </form>

          {/* Google OAuth Option */}
          <div className="mt-6 pt-5 border-t border-[var(--line)]">
            <button
              type="button"
              disabled={isLoading || googleLoading}
              onClick={handleGoogleSignup}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-[12px] border border-[var(--line)] bg-[var(--bg-3)] hover:bg-[var(--bg-2)] hover:border-[var(--line-2)] text-xs font-bold text-[var(--t0)] transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer shadow-sm group"
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
              <span>{googleLoading ? 'Connecting to Google...' : 'Sign up with Google'}</span>
            </button>
          </div>
        </Card>

        <p className="mt-6 text-center text-xs text-[var(--t2)]">
          Already have an account?{' '}
          <Link
            href={`/login${targetRoute !== '/dashboard' ? `?returnTo=${encodeURIComponent(targetRoute)}` : ''}`}
            className="font-bold text-[var(--acc)] hover:underline"
          >
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

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--bg-0)] flex items-center justify-center">
          <LottieLoader size="md" text="Loading registration..." />
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
