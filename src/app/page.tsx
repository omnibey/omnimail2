'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, Zap, Mail, ArrowRight, CheckCircle2, 
  Terminal, Server, Lock, Sparkles, ChevronDown, 
  Coins, Search, RefreshCw, Cpu, Layers 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { QuickEmailGenerator } from '@/components/QuickEmailGenerator';
import { EmailAddress, CompatibilityItem, CreditPackage } from '@/types';

export default function HomePage() {
  const [initialEmail, setInitialEmail] = useState<EmailAddress | null>(null);
  const [compatibilityList, setCompatibilityList] = useState<CompatibilityItem[]>([]);
  const [searchService, setSearchService] = useState('');
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  useEffect(() => {
    // Fetch initial temp email for hero
    fetch('/api/email/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'user-demo-1', customPrefix: 'quickbox47' })
    })
      .then(res => res.json())
      .then(data => {
        if (data.emailAddress) setInitialEmail(data.emailAddress);
      })
      .catch(() => {});

    // Fetch compatibility intelligence data
    fetch('/api/compatibility')
      .then(res => res.json())
      .then(data => {
        if (data.data) setCompatibilityList(data.data);
      })
      .catch(() => {});

    // Fetch pricing packages
    fetch('/api/payments/packages')
      .then(res => res.json())
      .then(data => {
        if (data.packages) setPackages(data.packages);
      })
      .catch(() => {});
  }, []);

  const filteredCompatibility = compatibilityList.filter(item =>
    item.service_domain.toLowerCase().includes(searchService.toLowerCase()) ||
    item.provider.toLowerCase().includes(searchService.toLowerCase())
  );

  const toggleFaq = (index: number) => {
    setFaqOpen(faqOpen === index ? null : index);
  };

  return (
    <div className="flex flex-col w-full">
      {/* ========================================================
          1. HERO SECTION
      ======================================================== */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32 bg-radial from-indigo-500/10 via-slate-50 to-white dark:from-indigo-950/30 dark:via-slate-950 dark:to-slate-950 transition-colors">
        {/* Background ambient elements */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 dark:bg-indigo-600/10 blur-[140px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-10 md:mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-6 animate-fade-in">
              <Sparkles className="w-3.5 h-3.5" />
              <span>OmniMail — Temporary Email by OmniBey</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-950 dark:text-white leading-[1.15]">
              Ephemeral Inboxes.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 dark:from-indigo-400 dark:via-indigo-300 dark:to-cyan-400">
                Instant Verification.
              </span>
            </h1>

            <p className="mt-5 text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Secure, disposable email addresses powered by dynamic catch-all domain routing. Automatic heuristic OTP extraction, zero inbox clutter, and enterprise-grade privacy.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/dashboard">
                <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Create Temporary Email
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="secondary" size="lg">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>

          {/* Interactive Live Generator in Hero */}
          <div className="max-w-2xl mx-auto">
            <QuickEmailGenerator
              initialEmail={initialEmail}
              userId="user-demo-1"
              onEmailChanged={(email) => setInitialEmail(email)}
            />
          </div>
        </div>
      </section>

      {/* ========================================================
          2. HOW IT WORKS
      ======================================================== */}
      <section id="how-it-works" className="py-20 bg-slate-50 dark:bg-slate-900/40 border-y border-slate-200/80 dark:border-slate-800/80 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="primary" size="sm" className="mb-3">
              Frictionless Workflow
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              How OmniMail Works
            </h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm">
              Receive verification emails and one-time passwords without exposing your primary mailbox.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 relative overflow-hidden" hoverEffect>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white font-bold text-lg mb-5 shadow-lg shadow-indigo-600/30">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Generate Catch-All Recipient
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Click once to instantiate a fresh dynamic address on <code>omnibey.com</code>. No physical inbox setup required.
              </p>
            </Card>

            <Card className="p-6 relative overflow-hidden" hoverEffect>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-600 text-white font-bold text-lg mb-5 shadow-lg shadow-cyan-600/30">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Receive Near Real-Time Messages
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Messages dispatched from websites reach <code>mail.omnibey.com</code> and immediately route to your live dashboard inbox.
              </p>
            </Card>

            <Card className="p-6 relative overflow-hidden" hoverEffect>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white font-bold text-lg mb-5 shadow-lg shadow-emerald-600/30">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Auto-Extract OTP & Auto-Purge
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Heuristic algorithms identify verification codes in seconds. Inboxes automatically expire to maintain total privacy.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* ========================================================
          3. CORE FEATURES & ARCHITECTURE
      ======================================================== */}
      <section id="features" className="py-24 bg-white dark:bg-slate-950 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="primary" size="sm" className="mb-3">
              Engineered For Reliability
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Enterprise-Ready Architecture
            </h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm">
              Built on Next.js, Supabase Row-Level-Security, and modular abstraction layers designed to scale.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6" hoverEffect>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mb-4">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                Heuristic OTP Detection
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Intelligently detects 4 to 8 digit verification codes and tokens from signup confirmations with confidence grading.
              </p>
            </Card>

            <Card className="p-6" hoverEffect>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 mb-4">
                <Layers className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                Multi-Provider Abstraction
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Currently running OmniBey Mail Gateway. Decoupled provider layer is architected to cleanly accept Gmail and Outlook API providers.
              </p>
            </Card>

            <Card className="p-6" hoverEffect>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-4">
                <Lock className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                Zero-Knowledge Privacy
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                No endless data retention. Temporary mailboxes expire automatically, and payment proof screenshots are deleted instantly upon approval.
              </p>
            </Card>

            <Card className="p-6" hoverEffect>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mb-4">
                <Coins className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                Manual Multi-Channel Payments
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Supports bKash, Nagad, Rocket, Upay, and Binance with idempotent transaction-safe credit allocation and Telegram notifications.
              </p>
            </Card>

            <Card className="p-6" hoverEffect>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 mb-4">
                <Cpu className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                Compatibility Intelligence
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Transparent historical telemetry records delivery success rates across popular services (Discord, GitHub, Netflix, OpenAI).
              </p>
            </Card>

            <Card className="p-6" hoverEffect>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 mb-4">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                Row Level Security & RBAC
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                PostgreSQL RLS ensures normal users can never access or modify another user&apos;s data or enter administrative portals.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* ========================================================
          4. COMPATIBILITY INTELLIGENCE TEASER
      ======================================================== */}
      <section id="compatibility" className="py-20 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-200/80 dark:border-slate-800/80 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <Badge variant="primary" size="sm" className="mb-3">
              Historical Telemetry
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Service Compatibility Intelligence
            </h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              Real-world delivery metrics across services. Data reflects observed historical telemetry, not a guarantee.
            </p>

            <div className="mt-6 max-w-md mx-auto relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search services (e.g. discord, github, openai)..."
                value={searchService}
                onChange={(e) => setSearchService(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm max-w-4xl mx-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Target Service</th>
                  <th className="px-5 py-3.5">Provider</th>
                  <th className="px-5 py-3.5">Observed Success</th>
                  <th className="px-5 py-3.5">Avg Delivery</th>
                  <th className="px-5 py-3.5">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {filteredCompatibility.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-4 font-semibold text-slate-900 dark:text-white">
                      {item.service_domain}
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-400">
                      {item.provider}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {item.success_rate}%
                        </span>
                        <div className="w-16 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 rounded-full" 
                            style={{ width: `${item.success_rate}%` }} 
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-500 text-xs">
                      {item.average_delivery_time}
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant={item.confidence === 'High' ? 'success' : 'warning'} size="sm">
                        {item.confidence}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-center text-xs text-slate-500 dark:text-slate-500 mt-4">
            Notice: Compatibility is calculated from observed system verification runs. We do not claim certainty or guarantee acceptance by external third-party entities.
          </p>
        </div>
      </section>

      {/* ========================================================
          5. DEVELOPER / API TEASER
      ======================================================== */}
      <section className="py-20 bg-slate-950 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-900/60 border border-indigo-700 text-xs font-semibold text-indigo-300 mb-6">
                <Terminal className="w-3.5 h-3.5" />
                <span>OmniMail Developer API</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Automate Temporary Email in Your CI/CD Pipeline
              </h2>
              <p className="mt-4 text-slate-400 leading-relaxed text-sm sm:text-base">
                Generate disposable inboxes, retrieve verification emails, and extract OTP tokens programmatically for Cypress, Playwright, or automated QA staging tests.
              </p>

              <div className="mt-8 space-y-3">
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" />
                  <span>Programmatic inbox creation via REST API</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" />
                  <span>Instant OTP JSON parsing and extraction</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" />
                  <span>Rate limited with secure Bearer API tokens</span>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <Link href="/dashboard">
                  <Button variant="primary" size="md">
                    Explore API Keys
                  </Button>
                </Link>
              </div>
            </div>

            {/* Code snippet display */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 font-mono text-xs text-slate-300 shadow-2xl overflow-x-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-slate-500">
                <span className="text-xs">bash - cURL test snippet</span>
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>
              </div>
              <pre className="mt-4 text-indigo-300">
                {`# 1. Generate a temporary mailbox
curl -X POST https://omnibey.com/api/v1/emails \\
  -H "Authorization: Bearer omni_live_key" \\
  -H "Content-Type: application/json" \\
  -d '{"prefix": "qa-test", "tag": "Cypress QA"}'

# Response:
# {
#   "status": "success",
#   "data": {
#     "id": "email-10842",
#     "email_address": "qa-test@omnibey.com",
#     "expires_at": "2026-10-04T22:30:00Z"
#   }
# }`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          6. PRICING PACKAGES
      ======================================================== */}
      <section id="pricing" className="py-24 bg-white dark:bg-slate-950 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="primary" size="sm" className="mb-3">
              Simple Credit Packs
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Transparent Credit Packages
            </h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm">
              Pay as you go with no recurring monthly lock-ins. Top up via bKash, Nagad, Rocket, Upay, or Binance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {packages.map((pkg) => (
              <Card
                key={pkg.id}
                className={`p-6 flex flex-col justify-between relative ${
                  pkg.is_featured
                    ? 'border-indigo-500 shadow-xl shadow-indigo-500/10 ring-2 ring-indigo-500/30'
                    : ''
                }`}
                hoverEffect
              >
                {pkg.is_featured && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-600 text-white shadow-sm">
                      Most Popular
                    </span>
                  </div>
                )}

                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {pkg.name}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {pkg.description}
                  </p>

                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-slate-950 dark:text-white">
                      ৳{pkg.price}
                    </span>
                    <span className="text-xs font-medium text-slate-500">
                      /{pkg.currency}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    <Coins className="w-4 h-4" />
                    <span>{pkg.credits} Base Credits + {pkg.bonus} Bonus</span>
                  </div>

                  <ul className="mt-6 space-y-3 text-xs text-slate-600 dark:text-slate-300">
                    {pkg.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <Link href="/dashboard/credits">
                    <Button
                      variant={pkg.is_featured ? 'primary' : 'outline'}
                      size="md"
                      className="w-full"
                    >
                      Top Up Now
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================
          7. FREQUENTLY ASKED QUESTIONS (FAQ)
      ======================================================== */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-200/80 dark:border-slate-800/80 transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Frequently Asked Questions
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Clear answers on how OmniMail manages temporary mailboxes, OTPs, and payments.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'How does dynamic temporary email work without thousands of mailboxes?',
                a: 'OmniMail utilizes dynamic catch-all domain routing at mail.omnibey.com. When emails hit the mail server, an intelligent message processor parses the recipient header, validates the generated temporary email record in the database, and instantly routes the message to your dashboard inbox.'
              },
              {
                q: 'What is heuristic OTP detection?',
                a: 'Our heuristic parser analyzes email body content, subjects, and HTML structures for one-time verification tokens and authentication codes. We clearly label extractions as "Detected verification code" to reflect that this is pattern-matching intelligence rather than an absolute third-party guarantee.'
              },
              {
                q: 'How do manual payments work with bKash, Nagad, Rocket, Upay, and Binance?',
                a: 'Select a credit package, copy our official merchant or personal payment number/wallet, complete the transfer in your payment app, and submit your Sender Number alongside either your Transaction ID or an uploaded payment screenshot (at least one is required). An administrator verifies the transaction and approves your credits with atomic idempotency.'
              },
              {
                q: 'Why are payment screenshots deleted upon approval?',
                a: 'Privacy and data minimization are core principles of OmniMail. Once an administrator approves your payment and allocates credits, the uploaded screenshot is purged immediately from storage to free capacity and protect your financial privacy.'
              },
              {
                q: 'Can temporary emails be used for spam or fraudulent activity?',
                a: 'No. OmniMail is engineered strictly for privacy preservation, software testing, QA development, and legitimate temporary communications. Abusive patterns or attempts to facilitate fraud trigger automated rate limiting and account suspension.'
              }
            ].map((faq, i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(i)}
                  className="w-full flex items-center justify-between p-5 text-left font-semibold text-slate-900 dark:text-white text-sm"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${faqOpen === i ? 'rotate-180' : ''}`} />
                </button>
                {faqOpen === i && (
                  <div className="px-5 pb-5 text-sm text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================
          8. CALL TO ACTION BANNER
      ======================================================== */}
      <section className="py-20 bg-indigo-600 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Protect Your Primary Mailbox?
          </h2>
          <p className="mt-4 text-indigo-100 text-base max-w-xl mx-auto leading-relaxed">
            Generate unlimited temporary mailboxes, extract verification codes in seconds, and keep spam away forever.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/signup">
              <Button variant="secondary" size="lg" className="bg-white text-indigo-700 hover:bg-indigo-50 border-white shadow-xl">
                Get Started with 15 Free Credits
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="lg" className="text-white border-white/60 hover:bg-white/10">
                Launch Web Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
