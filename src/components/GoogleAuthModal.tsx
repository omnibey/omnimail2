'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, ArrowRight, X } from 'lucide-react';
import { Button } from './ui/Button';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  preferredRole?: 'user' | 'admin';
}

const PRESET_ACCOUNTS = [
  {
    name: 'Alex Rivera',
    email: 'user@omnibey.com',
    role: 'user' as const,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    description: 'Pro User (Active mailboxes & 45 credits)',
  },
  {
    name: 'OmniBey System Admin',
    email: 'admin@omnibey.com',
    role: 'admin' as const,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    description: 'Root Administrator (Full dashboard access)',
  },
];

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  preferredRole = 'user',
}) => {
  const router = useRouter();
  const [selectedEmail, setSelectedEmail] = useState<string>(
    preferredRole === 'admin' ? 'admin@omnibey.com' : 'user@omnibey.com'
  );
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAuthenticate = async (emailToUse: string, nameToUse?: string) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/auth/google-dev', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailToUse,
          name: nameToUse || (emailToUse === 'admin@omnibey.com' ? 'OmniBey Admin' : 'Google User'),
          role: emailToUse === 'admin@omnibey.com' ? 'admin' : 'user',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Google login failed');
      }

      // Successful login
      router.push(data.redirectTo || '/dashboard');
      router.refresh();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Google authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail) {
      setError('Please enter a valid Google email address');
      return;
    }
    handleAuthenticate(customEmail, customName || customEmail.split('@')[0]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-md rounded-2xl border border-white/10 bg-[#12141d] p-6 shadow-2xl text-[#f3f4f9] transition-all"
        style={{
          boxShadow: '0 24px 60px -15px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.08)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white p-2 shadow-sm">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Sign in with Google</h3>
              <p className="text-xs text-[#9aa1b2]">Choose an account to continue to OmniMail</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#9aa1b2] hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-[#f76d7d]/15 border border-[#f76d7d]/30 text-xs text-[#f76d7d]">
            {error}
          </div>
        )}

        {/* Account Selection */}
        <div className="mt-4 space-y-2">
          {PRESET_ACCOUNTS.map((acc) => {
            const isSelected = !useCustom && selectedEmail === acc.email;
            return (
              <button
                key={acc.email}
                type="button"
                onClick={() => {
                  setUseCustom(false);
                  setSelectedEmail(acc.email);
                  handleAuthenticate(acc.email, acc.name);
                }}
                disabled={loading}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-[#7c5cff] bg-[#7c5cff]/10 shadow-sm shadow-[#7c5cff]/20'
                    : 'border-white/10 bg-[#1a1d28]/60 hover:bg-[#1a1d28] hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={acc.avatar}
                      alt={acc.name}
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-white/10"
                    />
                    {acc.role === 'admin' && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-amber-500 rounded-full border-2 border-[#12141d]" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white truncate">{acc.name}</span>
                      {acc.role === 'admin' ? (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Admin
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Pro User
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[#9aa1b2] truncate">{acc.email}</div>
                  </div>
                </div>

                <div className="shrink-0 pl-2">
                  <ArrowRight className="w-4 h-4 text-[#9aa1b2] group-hover:text-white" />
                </div>
              </button>
            );
          })}

          {/* Custom Google Account Option */}
          <div className="pt-2">
            {!useCustom ? (
              <button
                type="button"
                onClick={() => setUseCustom(true)}
                className="w-full py-2.5 px-3 rounded-xl border border-dashed border-white/15 text-xs text-[#9aa1b2] hover:text-white hover:border-[#7c5cff] hover:bg-[#7c5cff]/5 flex items-center justify-center gap-2 transition-colors"
              >
                <User className="w-3.5 h-3.5" />
                <span>Use another Google account</span>
              </button>
            ) : (
              <form onSubmit={handleCustomSubmit} className="p-3.5 rounded-xl border border-white/15 bg-[#1a1d28] space-y-3">
                <div className="text-xs font-semibold text-white">Enter your Google email:</div>
                <input
                  type="email"
                  placeholder="e.g. yourname@gmail.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[#090a0f] border border-white/15 text-white placeholder-[#5f6678] focus:outline-none focus:border-[#7c5cff]"
                  autoFocus
                />
                <input
                  type="text"
                  placeholder="Display Name (optional)"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[#090a0f] border border-white/15 text-white placeholder-[#5f6678] focus:outline-none focus:border-[#7c5cff]"
                />
                <div className="flex items-center gap-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    className="flex-1"
                    isLoading={loading}
                  >
                    Continue with this Account
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setUseCustom(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Supabase OAuth Notice */}
        <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-[#5f6678]">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#33d493]" />
            <span>OAuth Service: Online & Active</span>
          </div>
          <span className="font-mono text-[10px]">OmniBey ID Gateway</span>
        </div>
      </div>
    </div>
  );
};
