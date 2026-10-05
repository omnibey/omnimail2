import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { DemoSwitcher } from '@/components/DemoSwitcher';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'OmniMail — Temporary Email by OmniBey',
  description:
    'State-of-the-art modular temporary email platform with dynamic recipient routing, heuristic verification code extraction, and multi-channel manual payments.',
  keywords: [
    'temporary email',
    'disposable email',
    'temp mail',
    'OTP detection',
    'OmniBey',
    'OmniMail',
    'bKash email',
    'privacy email',
    'Vela dashboard',
  ],
  authors: [{ name: 'OmniBey Team', url: 'https://omnibey.com' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://omnibey.com'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${plusJakartaSans.variable} ${jetbrainsMono.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const stored = localStorage.getItem('vela-theme') || localStorage.getItem('omnimail_theme');
                  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  const theme = stored ? stored : (prefersDark ? 'dark' : 'light');
                  document.documentElement.setAttribute('data-theme', theme);
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.classList.add('light');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans selection:bg-[#7c5cff]/30 selection:text-white">
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
        <DemoSwitcher />
      </body>
    </html>
  );
}
