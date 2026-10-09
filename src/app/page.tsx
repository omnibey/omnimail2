'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, Zap, ArrowRight, CheckCircle2, 
  Lock, Sparkles, ChevronDown, 
  Coins, Search, Cpu, Layers 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { QuickEmailGenerator } from '@/components/QuickEmailGenerator';
import { GridPattern } from '@/components/magicui/grid-pattern';
import { ShimmerButton } from '@/components/magicui/shimmer-button';
import { NumberTicker } from '@/components/magicui/number-ticker';
import { HyperText } from '@/components/magicui/hyper-text';
import { TextAnimate } from '@/components/magicui/text-animate';
import { EmailAddress, CompatibilityItem, CreditPackage } from '@/types';

export default function HomePage() {
  const [initialEmail, setInitialEmail] = useState<EmailAddress | null>(null);
  const [compatibilityList, setCompatibilityList] = useState<CompatibilityItem[]>([]);
  const [searchService, setSearchService] = useState('');
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/email/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'user-demo-1', customPrefix: 'quickbox47' }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.emailAddress) setInitialEmail(data.emailAddress);
      })
      .catch(() => {});

    fetch('/api/compatibility')
      .then((res) => res.json())
      .then((data) => {
        if (data.data) setCompatibilityList(data.data);
      })
      .catch(() => {});

    fetch('/api/payments/packages')
      .then((res) => res.json())
      .then((data) => {
        if (data.packages) setPackages(data.packages);
      })
      .catch(() => {});
  }, []);

  const filteredCompatibility = compatibilityList.filter(
    (item) =>
      item.service_domain.toLowerCase().includes(searchService.toLowerCase()) ||
      item.provider.toLowerCase().includes(searchService.toLowerCase())
  );

  const toggleFaq = (index: number) => {
    setFaqOpen(faqOpen === index ? null : index);
  };

  return (
    <div className="flex flex-col w-full text-[var(--t0)] vela-page-enter">
      {/* ========================================================
          1. HERO SECTION (Vela Styling & Ambient Glow)
      ======================================================== */}
      <section className="relative overflow-hidden pt-14 pb-20 md:pt-24 md:pb-32 bg-[var(--bg-0)] transition-colors">
        {/* MagicUI Background Grid Pattern */}
        <GridPattern
          width={44}
          height={44}
          strokeDasharray="4 2"
          className="opacity-40 [mask-image:radial-gradient(ellipse_at_center,white_30%,transparent_78%)]"
          squares={[
            [3, 2],
            [6, 5],
            [10, 3],
            [14, 7],
            [8, 10],
            [17, 4],
          ]}
        />

        {/* Ambient Top Glow */}
        <div
          className="pointer-events-none absolute left-1/2 top-10 h-[560px] w-[700px] -translate-x-1/2 rounded-full opacity-60 blur-3xl"
          style={{ background: 'radial-gradient(ellipse at center, var(--acc-soft), transparent 70%)' }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-10 md:mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[var(--acc-soft)] border border-[var(--acc)]/30 text-xs font-bold text-[var(--acc)] mb-6 animate-fade-in shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>OmniMail Cloud — Built on</span>
              <HyperText text="Vela Engine" className="font-bold text-[var(--acc)]" />
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[var(--t0)] leading-[1.12]">
              <TextAnimate animation="blurIn" by="word">
                Ephemeral Inboxes.
              </TextAnimate>{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--acc)] via-[#9d86ff] to-[#56a8ff]">
                Instant Verification.
              </span>
            </h1>

            <p className="mt-5 text-base sm:text-lg md:text-xl text-[var(--t1)] leading-relaxed max-w-2xl mx-auto">
              Secure, disposable email addresses powered by dynamic catch-all domain routing. Automatic heuristic OTP extraction, zero inbox clutter, and enterprise-grade privacy.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/dashboard">
                <ShimmerButton
                  background="var(--acc)"
                  shimmerColor="#ffffff"
                  className="px-6 py-3.5 text-sm shadow-lg shadow-[var(--acc-soft)]"
                >
                  <span>Create Temporary Email</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </ShimmerButton>
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

          {/* Live Telemetry Metrics with NumberTicker */}
          <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto p-4 rounded-2xl border border-[var(--line)] bg-[var(--bg-1)]/60 backdrop-blur-md shadow-[var(--shadow)]">
            <div className="text-center p-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-[var(--t0)] font-mono flex items-center justify-center gap-0.5">
                <NumberTicker value={142850} />
                <span className="text-[var(--acc)]">+</span>
              </div>
              <div className="text-xs text-[var(--t2)] mt-1 font-medium">Inboxes Generated</div>
            </div>
            <div className="text-center p-3 border-l border-[var(--line)]">
              <div className="text-2xl sm:text-3xl font-extrabold text-[var(--ok)] font-mono flex items-center justify-center gap-0.5">
                <NumberTicker value={99.8} decimalPlaces={1} />
                <span>%</span>
              </div>
              <div className="text-xs text-[var(--t2)] mt-1 font-medium">OTP Accuracy</div>
            </div>
            <div className="text-center p-3 border-l border-[var(--line)]">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#56a8ff] font-mono flex items-center justify-center gap-0.5">
                <NumberTicker value={1.4} decimalPlaces={1} />
                <span>s</span>
              </div>
              <div className="text-xs text-[var(--t2)] mt-1 font-medium">Avg Delivery Time</div>
            </div>
            <div className="text-center p-3 border-l border-[var(--line)]">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#f7b84e] font-mono flex items-center justify-center gap-0.5">
                <NumberTicker value={45} />
                <span className="text-[#f7b84e]">+</span>
              </div>
              <div className="text-xs text-[var(--t2)] mt-1 font-medium">Supported Platforms</div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          2. HOW IT WORKS
      ======================================================== */}
      <section id="how-it-works" className="py-20 bg-[var(--bg-1)] border-y border-[var(--line)] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="primary" size="sm" className="mb-3">
              Frictionless Workflow
            </Badge>
            <h2 className="text-3xl font-extrabold tracking-tight text-[var(--t0)]">
              How OmniMail Works
            </h2>
            <p className="mt-3 text-[var(--t1)] text-sm">
              Receive verification emails and one-time passwords without exposing your primary mailbox.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 relative overflow-hidden" hoverEffect>
              <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[var(--acc)] text-white font-extrabold text-lg mb-5 shadow-lg shadow-[var(--acc-soft)]">
                1
              </div>
              <h3 className="text-lg font-bold text-[var(--t0)] mb-2">
                Generate Catch-All Recipient
              </h3>
              <p className="text-sm text-[var(--t1)] leading-relaxed">
                Click once to instantiate a fresh dynamic address on <code>omnibey.com</code>. No physical inbox setup required.
              </p>
            </Card>

            <Card className="p-6 relative overflow-hidden" hoverEffect>
              <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#56a8ff] text-white font-extrabold text-lg mb-5 shadow-lg shadow-[#56a8ff]/25">
                2
              </div>
              <h3 className="text-lg font-bold text-[var(--t0)] mb-2">
                Receive Near Real-Time Messages
              </h3>
              <p className="text-sm text-[var(--t1)] leading-relaxed">
                Messages dispatched from websites reach <code>mail.omnibey.com</code> and immediately route to your live dashboard inbox.
              </p>
            </Card>

            <Card className="p-6 relative overflow-hidden" hoverEffect>
              <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[var(--ok)] text-white font-extrabold text-lg mb-5 shadow-lg shadow-[var(--ok-soft)]">
                3
              </div>
              <h3 className="text-lg font-bold text-[var(--t0)] mb-2">
                Auto-Extract OTP & Auto-Purge
              </h3>
              <p className="text-sm text-[var(--t1)] leading-relaxed">
                Heuristic algorithms identify verification codes in seconds. Inboxes automatically expire to maintain total privacy.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* ========================================================
          3. CORE FEATURES & ARCHITECTURE
      ======================================================== */}
      <section id="features" className="py-24 bg-[var(--bg-0)] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="primary" size="sm" className="mb-3">
              Engineered For Reliability
            </Badge>
            <h2 className="text-3xl font-extrabold tracking-tight text-[var(--t0)]">
              Enterprise-Ready Architecture
            </h2>
            <p className="mt-3 text-[var(--t1)] text-sm">
              Built on Next.js, Supabase Row-Level-Security, and modular abstraction layers designed to scale.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6" hoverEffect>
              <div className="flex h-10 w-10 items-center justify-center rounded-[11px] bg-[var(--acc-soft)] text-[var(--acc)] mb-4">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-[var(--t0)] mb-2">
                Heuristic OTP Detection
              </h3>
              <p className="text-xs text-[var(--t1)] leading-relaxed">
                Intelligently detects 4 to 8 digit verification codes and tokens from signup confirmations with confidence grading.
              </p>
            </Card>

            <Card className="p-6" hoverEffect>
              <div className="flex h-10 w-10 items-center justify-center rounded-[11px] bg-[#56a8ff]/15 text-[#56a8ff] mb-4">
                <Layers className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-[var(--t0)] mb-2">
                Multi-Provider Abstraction
              </h3>
              <p className="text-xs text-[var(--t1)] leading-relaxed">
                Currently running OmniBey Mail Gateway. Decoupled provider layer is architected to cleanly accept Gmail and Outlook API providers.
              </p>
            </Card>

            <Card className="p-6" hoverEffect>
              <div className="flex h-10 w-10 items-center justify-center rounded-[11px] bg-[var(--ok-soft)] text-[var(--ok)] mb-4">
                <Lock className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-[var(--t0)] mb-2">
                Zero-Knowledge Privacy
              </h3>
              <p className="text-xs text-[var(--t1)] leading-relaxed">
                No endless data retention. Temporary mailboxes expire automatically, and payment proof screenshots are deleted instantly upon approval.
              </p>
            </Card>

            <Card className="p-6" hoverEffect>
              <div className="flex h-10 w-10 items-center justify-center rounded-[11px] bg-[#f7b84e]/15 text-[#f7b84e] mb-4">
                <Coins className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-[var(--t0)] mb-2">
                Manual Multi-Channel Payments
              </h3>
              <p className="text-xs text-[var(--t1)] leading-relaxed">
                Supports bKash, Nagad, Rocket, Upay, and Binance with idempotent transaction-safe credit allocation and Telegram notifications.
              </p>
            </Card>

            <Card className="p-6" hoverEffect>
              <div className="flex h-10 w-10 items-center justify-center rounded-[11px] bg-[#9d86ff]/15 text-[#9d86ff] mb-4">
                <Cpu className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-[var(--t0)] mb-2">
                Compatibility Intelligence
              </h3>
              <p className="text-xs text-[var(--t1)] leading-relaxed">
                Transparent historical telemetry records delivery success rates across popular services (Discord, GitHub, Netflix, OpenAI).
              </p>
            </Card>

            <Card className="p-6" hoverEffect>
              <div className="flex h-10 w-10 items-center justify-center rounded-[11px] bg-[#f76d7d]/15 text-[#f76d7d] mb-4">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-[var(--t0)] mb-2">
                Row Level Security & RBAC
              </h3>
              <p className="text-xs text-[var(--t1)] leading-relaxed">
                PostgreSQL RLS ensures normal users can never access or modify another user&apos;s data or enter administrative portals.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* ========================================================
          4. COMPATIBILITY MATRIX
      ======================================================== */}
      <section id="compatibility" className="py-20 bg-[var(--bg-1)] border-t border-[var(--line)] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <Badge variant="primary" size="sm" className="mb-3">
              Historical Telemetry
            </Badge>
            <h2 className="text-3xl font-extrabold tracking-tight text-[var(--t0)]">
              Service Compatibility Intelligence
            </h2>
            <p className="mt-3 text-sm text-[var(--t1)]">
              Real-world delivery metrics across services. Data reflects observed historical telemetry.
            </p>

            <div className="mt-6 max-w-md mx-auto relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--t2)]" />
              <input
                type="text"
                placeholder="Search services (e.g. discord, github, openai)..."
                value={searchService}
                onChange={(e) => setSearchService(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-[12px] border border-[var(--line)] bg-[var(--bg-3)] text-xs text-[var(--t0)] placeholder-[var(--t2)] focus:outline-none focus:border-[var(--acc)] transition-all"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-[18px] border border-[var(--line)] bg-[var(--bg-2)] shadow-[var(--shadow)] max-w-4xl mx-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--bg-3)]/60 border-b border-[var(--line)] text-[10.5px] font-extrabold text-[var(--t2)] uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Target Service</th>
                  <th className="px-5 py-3.5">Provider</th>
                  <th className="px-5 py-3.5">Observed Success</th>
                  <th className="px-5 py-3.5">Avg Delivery</th>
                  <th className="px-5 py-3.5">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)] text-[var(--t1)] font-medium">
                {filteredCompatibility.map((item) => (
                  <tr key={item.id} className="hover:bg-[var(--bg-3)]/40 transition-colors">
                    <td className="px-5 py-4 font-bold text-[var(--t0)]">
                      {item.service_domain}
                    </td>
                    <td className="px-5 py-4">
                      {item.provider}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[var(--ok)] font-mono">
                          {item.success_rate}%
                        </span>
                        <div className="w-16 h-1.5 rounded-full bg-[var(--bg-3)] overflow-hidden">
                          <div 
                            className="h-full bg-[var(--ok)] rounded-full" 
                            style={{ width: `${item.success_rate}%` }} 
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-[var(--t2)]">
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
        </div>
      </section>

      {/* ========================================================
          5. PRICING PACKAGES
      ======================================================== */}
      <section id="pricing" className="py-24 bg-[var(--bg-0)] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="primary" size="sm" className="mb-3">
              Simple Credit Packs
            </Badge>
            <h2 className="text-3xl font-extrabold tracking-tight text-[var(--t0)]">
              Transparent Credit Packages
            </h2>
            <p className="mt-3 text-[var(--t1)] text-sm">
              Pay as you go with no recurring monthly lock-ins. Top up via bKash, Nagad, Rocket, Upay, or Binance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {packages.map((pkg) => (
              <Card
                key={pkg.id}
                className={`p-6 flex flex-col justify-between relative ${
                  pkg.is_featured
                    ? 'border-[var(--acc)] shadow-xl shadow-[var(--acc-soft)] ring-2 ring-[var(--acc)]/30'
                    : ''
                }`}
                hoverEffect
              >
                {pkg.is_featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-0.5 rounded-full text-[11px] font-extrabold bg-[var(--acc)] text-white shadow-sm">
                      Most Popular
                    </span>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-bold text-[var(--t0)]">
                    {pkg.name}
                  </h3>
                  <p className="mt-1 text-xs text-[var(--t2)]">
                    {pkg.description}
                  </p>

                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-[var(--t0)] font-mono">
                      ৳{pkg.price}
                    </span>
                    <span className="text-xs font-semibold text-[var(--t2)]">
                      /{pkg.currency}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-[var(--acc)]">
                    <Coins className="w-4 h-4" />
                    <span>{pkg.credits} Base Credits + {pkg.bonus} Bonus</span>
                  </div>

                  <ul className="mt-6 space-y-2.5 text-xs text-[var(--t1)]">
                    {pkg.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[var(--ok)] shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-6 border-t border-[var(--line)]">
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
          6. FREQUENTLY ASKED QUESTIONS (FAQ)
      ======================================================== */}
      <section className="py-20 bg-[var(--bg-1)] border-t border-[var(--line)] transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight text-[var(--t0)]">
              Frequently Asked Questions
            </h2>
            <p className="mt-2 text-sm text-[var(--t1)]">
              Clear answers on how OmniMail manages temporary mailboxes, OTPs, and payments.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: 'How does dynamic temporary email work without thousands of mailboxes?',
                a: 'OmniMail utilizes dynamic catch-all domain routing at mail.omnibey.com. When emails hit the mail server, an intelligent message processor parses the recipient header, validates the generated temporary email record in the database, and instantly routes the message to your dashboard inbox.',
              },
              {
                q: 'What is heuristic OTP detection?',
                a: 'Our heuristic parser analyzes email body content, subjects, and HTML structures for one-time verification tokens and authentication codes. We clearly label extractions as "Detected verification code" to reflect that this is pattern-matching intelligence rather than an absolute third-party guarantee.',
              },
              {
                q: 'How do manual payments work with bKash, Nagad, Rocket, Upay, and Binance?',
                a: 'Select a credit package, copy our official merchant or personal payment number/wallet, complete the transfer in your payment app, and submit your Sender Number alongside either your Transaction ID or an uploaded payment screenshot (at least one is required). An administrator verifies the transaction and approves your credits with atomic idempotency.',
              },
              {
                q: 'Why are payment screenshots deleted upon approval?',
                a: 'Privacy and data minimization are core principles of OmniMail. Once an administrator approves your payment and allocates credits, the uploaded screenshot is purged immediately from storage to free capacity and protect your financial privacy.',
              },
              {
                q: 'Can temporary emails be used for spam or fraudulent activity?',
                a: 'No. OmniMail is engineered strictly for privacy preservation, software testing, QA development, and legitimate temporary communications. Abusive patterns or attempts to facilitate fraud trigger automated rate limiting and account suspension.',
              },
            ].map((faq, i) => (
              <div
                key={i}
                className="rounded-[14px] border border-[var(--line)] bg-[var(--bg-2)] overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => toggleFaq(i)}
                  className="w-full flex items-center justify-between p-4.5 text-left font-bold text-[var(--t0)] text-sm cursor-pointer hover:bg-[var(--bg-3)]/30 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[var(--t2)] transition-transform ${faqOpen === i ? 'rotate-180' : ''}`}
                  />
                </button>
                {faqOpen === i && (
                  <div className="px-5 pb-5 text-xs text-[var(--t1)] border-t border-[var(--line)] pt-3 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================
          7. CALL TO ACTION BANNER (Electric Vela Violet)
      ======================================================== */}
      <section className="py-20 bg-[var(--acc)] text-white relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Protect Your Primary Mailbox?
          </h2>
          <p className="mt-4 text-white/80 text-sm max-w-xl mx-auto leading-relaxed">
            Generate unlimited temporary mailboxes, extract verification codes in seconds, and keep spam away forever.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/signup">
              <ShimmerButton
                background="#ffffff"
                shimmerColor="#7c5cff"
                className="px-7 py-3.5 text-sm !text-[var(--acc)] shadow-2xl font-extrabold hover:!text-[var(--acc)]"
              >
                <span>Get Started with 15 Free Credits</span>
                <ArrowRight className="w-4 h-4 ml-1.5 text-[var(--acc)]" />
              </ShimmerButton>
            </Link>
            <Link href="/dashboard">
              <button
                type="button"
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-[12px] border border-white/60 hover:bg-white/10 text-white text-xs font-bold transition-all active:scale-[0.98] cursor-pointer"
              >
                <span>Launch Web Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
