'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Home, LayoutDashboard, ArrowLeft, RefreshCw } from 'lucide-react';
import { GridPattern } from '@/components/magicui/grid-pattern';
import { ShimmerButton } from '@/components/magicui/shimmer-button';
import { HyperText } from '@/components/magicui/hyper-text';
import { TextAnimate } from '@/components/magicui/text-animate';

export default function NotFoundPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [animLoaded, setAnimLoaded] = useState(false);

  useEffect(() => {
    let animInstance: any = null;
    let isCancelled = false;

    async function initCatLottie() {
      try {
        const lottieModule = await import('lottie-web');
        const lottie = lottieModule.default || lottieModule;

        if (isCancelled || !containerRef.current) return;

        const res = await fetch('/animations/cat-404.json');
        if (!res.ok) throw new Error('Failed to load cat animation');
        const animData = await res.json();

        if (isCancelled || !containerRef.current) return;

        animInstance = lottie.loadAnimation({
          container: containerRef.current,
          renderer: 'svg',
          loop: true,
          autoplay: true,
          animationData: animData,
        });

        setAnimLoaded(true);
      } catch (err) {
        console.warn('Lottie render warning:', err);
      }
    }

    initCatLottie();

    return () => {
      isCancelled = true;
      if (animInstance) animInstance.destroy();
    };
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-16 bg-[var(--bg-0)] text-[var(--t0)] overflow-hidden transition-colors">
      {/* MagicUI Grid Pattern in background */}
      <GridPattern
        width={36}
        height={36}
        strokeDasharray="4 2"
        className="opacity-40 [mask-image:radial-gradient(ellipse_at_center,white_30%,transparent_75%)]"
        squares={[
          [2, 3],
          [5, 8],
          [12, 4],
          [15, 10],
          [8, 12],
          [18, 6],
        ]}
      />

      {/* Ambient Radial Glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-50 blur-3xl"
        style={{
          background: 'radial-gradient(circle, var(--acc-soft), transparent 65%)',
        }}
      />

      <div className="relative z-10 max-w-xl w-full flex flex-col items-center text-center">
        {/* Lottie Container */}
        <div className="relative w-72 h-72 sm:w-88 sm:h-88 flex items-center justify-center">
          <div
            ref={containerRef}
            className={`w-full h-full transition-opacity duration-500 ${
              animLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          />

          {!animLoaded && (
            <div className="flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-[var(--acc)]" />
              <span className="text-xs text-[var(--t2)] font-mono">Loading playful cat animation...</span>
            </div>
          )}
        </div>

        {/* 404 Status Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[var(--acc-soft)] border border-[var(--acc)]/30 text-xs font-bold text-[var(--acc)] mb-3">
          <span>Error Code:</span>
          <HyperText text="404" className="text-[var(--acc)] font-extrabold tracking-widest" />
          <span>• Page Not Found</span>
        </div>

        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--t0)]">
          <TextAnimate animation="blurIn" by="word">
            Oops! The cat purred this page away.
          </TextAnimate>
        </h1>

        <p className="mt-3 text-sm text-[var(--t1)] max-w-md leading-relaxed font-medium">
          The link you followed may be broken, expired, or the temporary mailbox is no longer available. Don&apos;t worry, your data is safe!
        </p>

        {/* Navigation Action Buttons with ShimmerButton */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 w-full sm:w-auto">
          <Link href="/">
            <ShimmerButton
              background="var(--acc)"
              shimmerColor="#ffffff"
              className="px-6 py-3"
            >
              <Home className="w-4 h-4 mr-1.5" />
              <span>Return to Homepage</span>
            </ShimmerButton>
          </Link>

          <Link href="/dashboard">
            <button
              type="button"
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-[12px] border border-[var(--line-2)] bg-[var(--bg-2)] hover:bg-[var(--bg-3)] text-xs font-bold text-[var(--t0)] transition-all active:scale-[0.98] cursor-pointer shadow-sm"
            >
              <LayoutDashboard className="w-4 h-4 text-[var(--acc)]" />
              <span>Open Dashboard</span>
            </button>
          </Link>

          <button
            type="button"
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-[12px] text-xs font-bold text-[var(--t2)] hover:text-[var(--t0)] hover:bg-[var(--bg-2)] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go Back</span>
          </button>
        </div>

        {/* Attribution Notice */}
        <div className="mt-12 text-[11px] text-[var(--t2)]">
          Animation by{' '}
          <a
            href="https://lottiefiles.com/free-animation/404-error-page-with-cat-ZltNpefmQj"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--acc)] hover:underline font-semibold"
          >
            Abdul Latif on LottieFiles
          </a>
        </div>
      </div>
    </div>
  );
}
