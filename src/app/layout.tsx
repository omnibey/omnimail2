import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { DemoSwitcher } from '@/components/DemoSwitcher';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'OmniMail — Temporary Email by OmniBey',
  description: 'Production-ready modular temporary email platform with dynamic recipient routing, heuristic verification code extraction, and multi-channel manual payments.',
  keywords: ['temporary email', 'disposable email', 'temp mail', 'OTP detection', 'OmniBey', 'OmniMail', 'bKash email', 'privacy email'],
  authors: [{ name: 'OmniBey Team', url: 'https://omnibey.com' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://omnibey.com'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
        <DemoSwitcher />
      </body>
    </html>
  );
}
