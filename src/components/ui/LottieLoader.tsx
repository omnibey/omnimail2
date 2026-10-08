'use client';

import React, { useEffect, useRef, useState } from 'react';

export interface LottieLoaderProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  subtext?: string;
  overlay?: boolean;
  className?: string;
}

export const LottieLoader: React.FC<LottieLoaderProps> = ({
  size = 'md',
  text,
  subtext,
  overlay = false,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [lottieLoaded, setLottieLoaded] = useState(false);

  useEffect(() => {
    let animInstance: any = null;
    let isCancelled = false;

    async function initLottie() {
      try {
        const lottieModule = await import('lottie-web');
        const lottie = lottieModule.default || lottieModule;

        if (isCancelled || !containerRef.current) return;

        // Fetch or load the local JSON
        const res = await fetch('/animations/loading.json');
        const animData = await res.json();

        if (isCancelled || !containerRef.current) return;

        animInstance = lottie.loadAnimation({
          container: containerRef.current,
          renderer: 'svg',
          loop: true,
          autoplay: true,
          animationData: animData,
        });

        setLottieLoaded(true);
      } catch (err) {
        // Fallback gracefully to gif
        console.warn('Lottie rendering fallback:', err);
      }
    }

    initLottie();

    return () => {
      isCancelled = true;
      if (animInstance) {
        animInstance.destroy();
      }
    };
  }, []);

  const sizeDimensions = {
    xs: 'w-8 h-8',
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-32 h-32',
    xl: 'w-44 h-44',
  };

  const content = (
    <div className={`flex flex-col items-center justify-center text-center ${className}`}>
      <div className={`relative ${sizeDimensions[size]} flex items-center justify-center`}>
        {/* Lottie SVG Container */}
        <div
          ref={containerRef}
          className={`w-full h-full ${lottieLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        />

        {/* Fallback while Lottie JSON loads */}
        {!lottieLoaded && (
          <img
            src="/animations/loading.gif"
            alt="Loading animation"
            className="w-full h-full object-contain pointer-events-none"
          />
        )}
      </div>

      {text && (
        <h4 className="mt-3 text-sm font-extrabold text-[var(--t0)] tracking-tight">
          {text}
        </h4>
      )}

      {subtext && (
        <p className="mt-1 text-xs text-[var(--t2)] max-w-xs font-medium">
          {subtext}
        </p>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
        <div className="relative rounded-[22px] border border-[var(--line)] bg-[var(--bg-1)] p-8 shadow-[var(--shadow)] max-w-sm w-full">
          {content}
        </div>
      </div>
    );
  }

  return content;
};
