'use client';

import React, { Suspense } from 'react';
import { UnifiedAuthCard } from '@/components/UnifiedAuthCard';
import { LottieLoader } from '@/components/ui/LottieLoader';

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--bg-0)] flex items-center justify-center">
          <LottieLoader size="md" text="Loading registration..." />
        </div>
      }
    >
      <UnifiedAuthCard initialTab="signup" />
    </Suspense>
  );
}
