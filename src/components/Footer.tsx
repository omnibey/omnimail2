import React from 'react';
import Link from 'next/link';
import { Mail, Shield, CheckCircle, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
                <Mail className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Omni<span className="text-indigo-600 dark:text-indigo-400">Mail</span>
              </span>
            </Link>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md leading-relaxed">
              Production-grade temporary email infrastructure with high-accuracy heuristic OTP detection, catch-all dynamic domain routing, and enterprise-grade modular architecture.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span>mail.omnibey.com Gateway: Operational (38ms latency)</span>
            </div>
          </div>

          {/* Product links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              Platform & Features
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/dashboard" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Web Dashboard
                </Link>
              </li>
              <li>
                <Link href="/dashboard/inbox" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Real-time Inbox
                </Link>
              </li>
              <li>
                <Link href="/dashboard/history" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Domain Telemetry
                </Link>
              </li>
              <li>
                <Link href="/dashboard/credits" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Credit Packages
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                  Admin Control Panel
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Compliance */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              Security & Policy
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <span className="text-slate-500">Privacy Policy (Auto-purge)</span>
              </li>
              <li>
                <span className="text-slate-500">Terms of Service</span>
              </li>
              <li>
                <span className="text-slate-500">Responsible Usage Notice</span>
              </li>
              <li>
                <span className="text-slate-500">Row Level Security</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Ethical Usage Notice */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-4 text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-8">
          <strong className="text-slate-700 dark:text-slate-300 font-semibold">Legitimate Use Notice: </strong>
          OmniMail by OmniBey is engineered exclusively for software testing, quality assurance (QA), privacy preservation, developer staging, and legitimate temporary communications. It is strictly prohibited to use this service for unsolicited messaging, spam, or bypassing legitimate security protections.
        </div>

        {/* Bottom copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <div>
            © {new Date().getFullYear()} OmniBey. All rights reserved. Main domain:{' '}
            <strong className="text-slate-700 dark:text-slate-300">omnibey.com</strong>
          </div>
          <div className="flex items-center gap-4">
            <span>Powered by Next.js & Supabase</span>
            <span>•</span>
            <span>Cloudflare Protected</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
