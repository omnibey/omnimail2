'use client';

import React, { useState, useEffect } from 'react';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { UserProfile } from '@/types';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950 transition-colors">
      <DashboardSidebar
        userCredits={user?.credits ?? 45}
        userName={user?.name ?? 'Alex Rivera'}
        userEmail={user?.email ?? 'user@omnibey.com'}
      />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full">
        {children}
      </div>
    </div>
  );
}
