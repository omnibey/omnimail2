'use client';

import React, { Suspense } from 'react';
import { UnifiedAuthCard } from '@/components/UnifiedAuthCard';
import { LottieLoader } from '@/components/ui/LottieLoader';

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--bg-0)] flex items-center justify-center">
          <LottieLoader size="md" text="Loading sign in..." />
        </div>
      }
    >
      <UnifiedAuthCard initialTab="login" />
    </Suspense>
  );
}
