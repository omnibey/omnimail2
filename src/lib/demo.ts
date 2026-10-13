/**
 * Demo Mode Isolation Utilities
 *
 * Rules:
 * - When DEMO_MODE=false: Demo mode is strictly disabled. No demo authentication,
 *   no demo admin fallback, no demo user fallback, no client-controlled role switching.
 * - In production: Demo mode is disabled by default unless DEMO_MODE=true is explicitly set.
 */

export function isDemoMode(): boolean {
  if (process.env.DEMO_MODE === 'false') {
    return false;
  }
  if (process.env.DEMO_MODE === 'true') {
    return true;
  }
  if (process.env.NODE_ENV === 'production') {
    return false;
  }

  // Development fallback only when Supabase is not configured
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url || url.includes('placeholder')) {
    return true;
  }

  return false;
}

export function isDemoModeClient(): boolean {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'false') {
    return false;
  }
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    return true;
  }
  if (process.env.NODE_ENV === 'production') {
    return false;
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url || url.includes('placeholder')) {
    return true;
  }
  return false;
}
