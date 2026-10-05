import React from 'react';
import Link from 'next/link';
import { Mail, CheckCircle, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-[var(--line)] bg-[var(--bg-1)] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-[var(--acc)] text-white shadow-md shadow-[var(--acc-soft)]">
                <Mail className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold tracking-tight text-[var(--t0)]">
                Omni<span className="text-[var(--acc)]">Mail</span>
              </span>
            </Link>
            <p className="text-[13px] text-[var(--t1)] max-w-md leading-relaxed">
              Production-grade temporary email infrastructure with high-accuracy heuristic OTP detection, catch-all dynamic domain routing, and enterprise-grade modular architecture.
            </p>
            <div className="flex items-center gap-2 text-xs text-[var(--ok)] font-medium">
              <span className="flex h-2 w-2 rounded-full bg-[var(--ok)] animate-ping" />
              <span>mail.omnibey.com Gateway: Operational (38ms latency)</span>
            </div>
          </div>

          {/* Product links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--t0)] mb-4">
              Platform & Features
            </h4>
            <ul className="space-y-2.5 text-[13px] text-[var(--t1)]">
              <li>
                <Link href="/dashboard" className="hover:text-[var(--acc)] transition-colors">
                  Web Dashboard
                </Link>
              </li>
              <li>
                <Link href="/dashboard/inbox" className="hover:text-[var(--acc)] transition-colors">
                  Real-time Inbox
                </Link>
              </li>
              <li>
                <Link href="/dashboard/history" className="hover:text-[var(--acc)] transition-colors">
                  Domain Telemetry
                </Link>
              </li>
              <li>
                <Link href="/dashboard/credits" className="hover:text-[var(--acc)] transition-colors">
                  Credit Packages
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-[#f7b84e] transition-colors">
                  Admin Control Panel
                </Link>
              </li>
            </ul>
          </div>

          {/* Infrastructure & Security */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--t0)] mb-4">
              Security & Reliability
            </h4>
            <ul className="space-y-2.5 text-[13px] text-[var(--t1)]">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-[var(--ok)]" />
                <span>Zero Inbox Telemetry Persistence</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-[var(--ok)]" />
                <span>Encrypted Postfix Memory Buffers</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-[var(--ok)]" />
                <span>Audit Trail Ledger</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-[var(--ok)]" />
                <span>Manual Payment Verification</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-[var(--line)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--t2)]">
          <div>
            © {new Date().getFullYear()} OmniBey Cloud Infrastructure. Powered by OmniMail Engine & Vela Design System.
          </div>
          <div className="flex items-center gap-6">
            <Link href="/#terms" className="hover:text-[var(--t0)] transition-colors">
              Terms of Service
            </Link>
            <Link href="/#privacy" className="hover:text-[var(--t0)] transition-colors">
              Privacy Policy
            </Link>
            <a
              href="https://omnibey.com"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 hover:text-[var(--t0)] transition-colors"
            >
              <span>OmniBey Official</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
