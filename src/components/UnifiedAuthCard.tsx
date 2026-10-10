'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  User,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { GoogleAuthModal } from '@/components/GoogleAuthModal';
import { LottieLoader } from '@/components/ui/LottieLoader';
import { BorderBeam } from '@/components/magicui/border-beam';
import { fireRealisticConfetti } from '@/components/magicui/confetti';
import { GridPattern } from '@/components/magicui/grid-pattern';
import { ShimmerButton } from '@/components/magicui/shimmer-button';
import { toast } from '@/components/ui/toast';
import { createClient } from '@/lib/supabase/client';

interface UnifiedAuthCardProps {
  initialTab?: 'login' | 'signup';
}

export function UnifiedAuthCard({ initialTab = 'login' }: UnifiedAuthCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tabParam = searchParams.get('tab');
  const targetRoute =
    searchParams.get('returnTo') ||
    searchParams.get('redirect') ||
    searchParams.get('next') ||
    searchParams.get('callbackUrl') ||
    '/dashboard';

  const isRegisteredRedirect = searchParams.get('registered') === '1';
  const paramEmail = searchParams.get('email') || '';

  const errorParam = searchParams.get('error');
  const initialOauthError = errorParam
    ? errorParam === 'oauth_failed'
      ? 'Google authentication was cancelled or interrupted. You can sign in using the Google selector.'
      : decodeURIComponent(errorParam)
    : null;

  // Tab State: 'login' | 'signup'
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(() => {
    if (tabParam === 'signup') return 'signup';
    if (tabParam === 'login') return 'login';
    return initialTab;
  });

  // Login form state
  const [loginEmail, setLoginEmail] = useState(paramEmail);
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState(paramEmail);
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(true);

  // Shared UI states
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [redirectMessage, setRedirectMessage] = useState('Signing in...');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [hasAutoFilled, setHasAutoFilled] = useState(false);
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Auto-fill registered credentials if present in sessionStorage or query
  useEffect(() => {
    try {
      const storedEmail = sessionStorage.getItem('omnimail_registered_email');
      const storedPassword = sessionStorage.getItem('omnimail_registered_password');

      const emailToUse = storedEmail || paramEmail;
      if (emailToUse) {
        setLoginEmail(emailToUse);
        setSignupEmail(emailToUse);
      }
      if (storedPassword) {
        setLoginPassword(storedPassword);
      }

      if (isRegisteredRedirect || (storedEmail && storedPassword)) {
        setHasAutoFilled(true);
        setActiveTab('login');
        setSuccessMsg(
          'Registration complete! Your credentials are auto-filled below. Click "Sign In" to continue.'
        );
        fireRealisticConfetti();
      }
    } catch (e) {
      console.warn('Session reading notice:', e);
    }
  }, [isRegisteredRedirect, paramEmail]);

  // Tab Switch handler with URL shallow update
  const switchTab = (tab: 'login' | 'signup') => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setActiveTab(tab);

    try {
      const currentUrl = new URL(window.location.href);
      currentUrl.pathname = tab === 'signup' ? '/signup' : '/login';
      currentUrl.searchParams.delete('tab');
      window.history.replaceState(null, '', currentUrl.toString());
    } catch {}
  };

  const activeError = errorMsg ?? (activeTab === 'login' ? initialOauthError : null);

  // ---------------------------------------------
  // LOGIN SUBMIT
  // ---------------------------------------------
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!loginEmail || !loginPassword) {
      const msg = 'Please enter both email and password.';
      setErrorMsg(msg);
      toast.error('Missing credentials', { description: msg });
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Authentication failed');
      }

      fireRealisticConfetti();

      try {
        sessionStorage.removeItem('omnimail_registered_password');
      } catch {}

      toast.success('Signed in successfully!', {
        description: 'Welcome back to OmniMail.',
      });
      setSuccessMsg('Login successful! Redirecting to your dashboard...');
      setRedirectMessage('Signing in...');
      setIsRedirecting(true);

      document.cookie = `omnimail_session=${data.user.id}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `omnimail_role=${data.user.role}; path=/; max-age=86400; SameSite=Lax`;

      const destination = targetRoute !== '/dashboard' ? targetRoute : data.redirectTo || '/dashboard';
      setTimeout(() => {
        router.push(destination);
      }, 700);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      setErrorMsg(msg);
      toast.error('Login failed', { description: msg });
      setIsLoading(false);
      setIsRedirecting(false);
    }
  };

  // ---------------------------------------------
  // SIGNUP SUBMIT
  // ---------------------------------------------
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!signupName.trim() || !signupEmail.trim() || !signupPassword || !signupConfirmPassword) {
      const msg = 'Please complete all required fields.';
      setErrorMsg(msg);
      toast.error('Missing fields', { description: msg });
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      const msg = 'Passwords do not match. Please verify both entries.';
      setErrorMsg(msg);
      toast.error('Password mismatch', { description: msg });
      return;
    }

    if (signupPassword.length < 6) {
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
          name: signupName.trim(),
          email: signupEmail.trim(),
          password: signupPassword,
          confirmPassword: signupConfirmPassword,
          acceptTerms,
          returnTo: targetRoute,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Registration failed');
      }

      fireRealisticConfetti();

      // Store credentials & pre-fill login tab
      try {
        sessionStorage.setItem('omnimail_registered_email', signupEmail.trim());
        sessionStorage.setItem('omnimail_registered_password', signupPassword);
        sessionStorage.setItem('omnimail_registered_name', signupName.trim());
      } catch {}

      setLoginEmail(signupEmail.trim());
      setLoginPassword(signupPassword);
      setHasAutoFilled(true);

      toast.success('Account created successfully!', {
        description: 'Auto-filling your details for immediate sign-in...',
      });

      // Smoothly switch to login tab with success banner
      setIsLoading(false);
      setActiveTab('login');
      setSuccessMsg('Account created! Your credentials have been auto-filled. Click "Sign In" below.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      setErrorMsg(msg);
      toast.error('Registration failed', { description: msg });
      setIsLoading(false);
    }
  };

  // ---------------------------------------------
  // GOOGLE AUTH HANDLER
  // ---------------------------------------------
  const handleGoogleAuth = async () => {
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
        console.warn('[Supabase Google OAuth Notice]:', error.message);
        setGoogleModalOpen(true);
      }
    } catch (err) {
      console.warn('[Google OAuth fallback notice]:', err);
      setGoogleModalOpen(true);
    } finally {
      setGoogleLoading(false);
    }
  };

  // ---------------------------------------------
  // DEMO SHORTCUT
  // ---------------------------------------------
  const handleQuickDemoLogin = (role: 'user' | 'admin') => {
    setActiveTab('login');
    if (role === 'admin') {
      setLoginEmail('admin@omnibey.com');
      setLoginPassword('admin123456');
    } else {
      setLoginEmail('user@omnibey.com');
      setLoginPassword('user123456');
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[var(--bg-0)] text-[var(--t0)] transition-colors overflow-hidden">
      {/* Background Pattern */}
      <GridPattern
        width={38}
        height={38}
        strokeDasharray="4 2"
        className="opacity-45 [mask-image:radial-gradient(ellipse_at_center,white_35%,transparent_80%)]"
        squares={[
          [2, 3],
          [6, 5],
          [9, 2],
          [13, 7],
          [4, 10],
        ]}
      />

      {/* Ambient Glow Background */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/4 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-3xl"
        style={{ background: 'radial-gradient(circle, var(--acc-soft), transparent 68%)' }}
      />

      {isRedirecting && (
        <LottieLoader
          overlay
          size="lg"
          text={redirectMessage}
          subtext={`Authenticated! Opening ${targetRoute}...`}
        />
      )}

      {/* Header / Brand */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center px-4">
        <Link href="/" className="inline-flex items-center gap-3 group mb-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-[var(--acc)] text-white shadow-lg shadow-[var(--acc-soft)] group-hover:scale-105 transition-transform">
            <Mail className="h-6 w-6" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-[var(--t0)]">
            Omni<span className="text-[var(--acc)]">Mail</span>
          </span>
        </Link>
        <h2 className="text-2xl font-extrabold tracking-tight text-[var(--t0)]">
          {activeTab === 'login' ? 'Welcome back to OmniMail' : 'Create your OmniBey account'}
        </h2>
        <p className="mt-1.5 text-xs text-[var(--t2)] font-medium">
          {activeTab === 'login'
            ? 'Sign in to access your disposable mailboxes and extracted OTPs.'
            : 'Get 15 complimentary credits for temporary mailboxes and OTP extraction.'}
        </p>
      </div>

      {/* Main Auth Card with Tab Controls */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 relative z-10">
        <Card className="relative overflow-hidden p-6 sm:p-8 border border-[var(--line)] bg-[var(--bg-1)] shadow-[var(--shadow)] backdrop-blur-xl">
          <BorderBeam
            size={280}
            duration={12}
            delay={0}
            borderWidth={1.5}
            colorFrom="#7c5cff"
            colorTo={activeTab === 'login' ? '#33d493' : '#56a8ff'}
          />

          {/* Smooth Side-by-Side Tab Switcher */}
          <div className="relative p-1 bg-[var(--bg-3)] border border-[var(--line)] rounded-[13px] flex items-center mb-6 select-none">
            {/* Sliding Pill Indicator */}
            <div
              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-[10px] bg-[var(--bg-1)] border border-[var(--line-2)] shadow-sm transition-all duration-300 ease-out ${
                activeTab === 'login' ? 'left-1' : 'left-[calc(50%+2px)]'
              }`}
            />

            <button
              type="button"
              onClick={() => switchTab('login')}
              className={`relative flex-1 py-2 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 z-10 cursor-pointer ${
                activeTab === 'login' ? 'text-[var(--t0)]' : 'text-[var(--t2)] hover:text-[var(--t1)]'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => switchTab('signup')}
              className={`relative flex-1 py-2 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 z-10 cursor-pointer ${
                activeTab === 'signup' ? 'text-[var(--t0)]' : 'text-[var(--t2)] hover:text-[var(--t1)]'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Account</span>
            </button>
          </div>

          {/* Alerts */}
          {hasAutoFilled && activeTab === 'login' && (
            <div className="mb-4 p-3 rounded-[12px] bg-[var(--acc-soft)] border border-[var(--acc)]/30 text-xs text-[var(--acc)] flex items-start gap-2.5 animate-fade-in">
              <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-[var(--acc)]" />
              <div className="flex-1 font-semibold">
                Account registered! Your credentials have been auto-filled. Click &quot;Sign In&quot; below.
              </div>
            </div>
          )}

          {activeError && (
            <div className="mb-4 p-3.5 rounded-[12px] bg-[var(--bad-soft)] border border-[var(--bad)]/30 text-xs text-[var(--bad)] flex items-start gap-2.5 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[var(--bad)]" />
              <div className="flex-1 font-semibold">{activeError}</div>
            </div>
          )}

          {successMsg && !hasAutoFilled && (
            <div className="mb-4 p-3.5 rounded-[12px] bg-[var(--ok-soft)] border border-[var(--ok)]/30 text-xs text-[var(--ok)] flex items-center gap-2 animate-fade-in">
              <ShieldCheck className="w-4 h-4 shrink-0 text-[var(--ok)]" />
              <div className="font-semibold">{successMsg}</div>
            </div>
          )}

          {/* Tab 1: SIGN IN FORM */}
          {activeTab === 'login' && (
            <div className="animate-fade-in space-y-4">
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
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="user@omnibey.com"
                      className="w-full pl-10 pr-4 py-2.5 text-xs rounded-[11px] border border-[var(--line)] bg-[var(--bg-3)] text-[var(--t0)] placeholder-[var(--t2)] focus:outline-none focus:border-[var(--acc)] focus:ring-1 focus:ring-[var(--acc)] transition-all font-medium"
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
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-2.5 text-xs rounded-[11px] border border-[var(--line)] bg-[var(--bg-3)] text-[var(--t0)] placeholder-[var(--t2)] focus:outline-none focus:border-[var(--acc)] focus:ring-1 focus:ring-[var(--acc)] transition-all font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--t2)] hover:text-[var(--t0)] cursor-pointer"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <ShimmerButton
                    type="submit"
                    disabled={isLoading}
                    background="var(--acc)"
                    shimmerColor="#ffffff"
                    className="w-full py-3"
                  >
                    <span>{isLoading ? 'Signing In...' : 'Sign In to Account'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </ShimmerButton>
                </div>
              </form>

              {/* Google Button */}
              <div className="pt-3 border-t border-[var(--line)]">
                <button
                  type="button"
                  disabled={isLoading || googleLoading}
                  onClick={handleGoogleAuth}
                  className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-[12px] border border-[var(--line)] bg-[var(--bg-3)] hover:bg-[var(--bg-2)] hover:border-[var(--line-2)] text-xs font-bold text-[var(--t0)] transition-all active:scale-[0.98] disabled:opacity-60 shadow-sm cursor-pointer group"
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
                  <span>{googleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
                </button>
              </div>

              {/* Demo Credentials */}
              <div className="p-3 rounded-[11px] bg-[var(--bg-3)] border border-[var(--line)] text-[11px] text-[var(--t2)] flex items-center justify-between">
                <span className="font-bold text-[var(--t1)]">Quick Demo:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('user')}
                    className="text-[var(--acc)] font-bold hover:underline cursor-pointer"
                  >
                    User (Demo)
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('admin')}
                    className="text-[var(--warn)] font-bold hover:underline cursor-pointer"
                  >
                    Admin (Root)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: SIGN UP FORM */}
          {activeTab === 'signup' && (
            <div className="animate-fade-in space-y-4">
              <form onSubmit={handleSignup} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-[var(--t1)] mb-1 uppercase tracking-wider">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[var(--t2)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      placeholder="Alex Rivera"
                      className="w-full pl-10 pr-4 py-2.5 text-xs rounded-[11px] border border-[var(--line)] bg-[var(--bg-3)] text-[var(--t0)] placeholder-[var(--t2)] focus:outline-none focus:border-[var(--acc)] focus:ring-1 focus:ring-[var(--acc)] transition-all font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--t1)] mb-1 uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[var(--t2)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="alex@example.com"
                      className="w-full pl-10 pr-4 py-2.5 text-xs rounded-[11px] border border-[var(--line)] bg-[var(--bg-3)] text-[var(--t0)] placeholder-[var(--t2)] focus:outline-none focus:border-[var(--acc)] focus:ring-1 focus:ring-[var(--acc)] transition-all font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--t1)] mb-1 uppercase tracking-wider">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[var(--t2)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showSignupPassword ? 'text' : 'password'}
                      required
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full pl-10 pr-10 py-2.5 text-xs rounded-[11px] border border-[var(--line)] bg-[var(--bg-3)] text-[var(--t0)] placeholder-[var(--t2)] focus:outline-none focus:border-[var(--acc)] focus:ring-1 focus:ring-[var(--acc)] transition-all font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--t2)] hover:text-[var(--t0)] cursor-pointer"
                    >
                      {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--t1)] mb-1 uppercase tracking-wider">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[var(--t2)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showSignupPassword ? 'text' : 'password'}
                      required
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full pl-10 pr-4 py-2.5 text-xs rounded-[11px] border border-[var(--line)] bg-[var(--bg-3)] text-[var(--t0)] placeholder-[var(--t2)] focus:outline-none focus:border-[var(--acc)] focus:ring-1 focus:ring-[var(--acc)] transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    id="terms-tab"
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="w-4 h-4 rounded-[4px] border-[var(--line)] text-[var(--acc)] focus:ring-[var(--acc)] bg-[var(--bg-3)] cursor-pointer"
                  />
                  <label htmlFor="terms-tab" className="text-xs text-[var(--t1)] cursor-pointer select-none">
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
                    <span>{isLoading ? 'Creating Account...' : 'Create Account'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </ShimmerButton>
                </div>
              </form>

              {/* Google Signup Button */}
              <div className="pt-3 border-t border-[var(--line)]">
                <button
                  type="button"
                  disabled={isLoading || googleLoading}
                  onClick={handleGoogleAuth}
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
            </div>
          )}
        </Card>

        {/* Footer switch prompt */}
        <p className="mt-5 text-center text-xs text-[var(--t2)]">
          {activeTab === 'login' ? (
            <>
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => switchTab('signup')}
                className="font-bold text-[var(--acc)] hover:underline cursor-pointer"
              >
                Create an account for free
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => switchTab('login')}
                className="font-bold text-[var(--acc)] hover:underline cursor-pointer"
              >
                Sign in to your account
              </button>
            </>
          )}
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
