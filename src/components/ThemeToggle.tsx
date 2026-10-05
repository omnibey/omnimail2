'use client';

import React, { useSyncExternalStore } from 'react';
import { Sun, Moon } from 'lucide-react';

function getThemeSnapshot(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'dark';
  const attr = document.documentElement.getAttribute('data-theme');
  if (attr === 'light' || attr === 'dark') return attr;
  const stored = localStorage.getItem('vela-theme') || localStorage.getItem('omnimail_theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getServerSnapshot(): 'dark' | 'light' {
  return 'dark';
}

function subscribe(callback: () => void) {
  if (typeof window === 'undefined') return () => {};

  window.addEventListener('storage', callback);
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.attributeName === 'data-theme' || m.attributeName === 'class') {
        callback();
      }
    }
  });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme', 'class'],
  });

  return () => {
    window.removeEventListener('storage', callback);
    observer.disconnect();
  };
}

export const ThemeToggle: React.FC = () => {
  const theme = useSyncExternalStore(subscribe, getThemeSnapshot, getServerSnapshot);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
    localStorage.setItem('vela-theme', next);
    localStorage.setItem('omnimail_theme', next);
  };

  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className="relative flex items-center justify-center w-9 h-9 rounded-[11px] border border-[var(--line)] bg-[var(--bg-3)] text-[var(--t1)] hover:text-[var(--t0)] hover:border-[var(--line-2)] transition-all cursor-pointer select-none active:scale-95"
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-[#f7b84e] transition-transform duration-300 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-[#6a4cff] transition-transform duration-300 hover:-rotate-12" />
      )}
    </button>
  );
};
