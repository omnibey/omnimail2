import { createClient } from '@/lib/supabase/client';
import { toast } from '@/components/ui/toast';

/**
 * Perform a clean, global sign out:
 * 1. Calls the server-side /api/auth/logout to expire session cookies
 * 2. Clears client document cookies
 * 3. Clears temporary auth session items
 * 4. Signs out of Supabase Auth
 * 5. Redirects to the homepage ('/')
 */
export async function clientSignOut(options?: { redirectTo?: string; showToast?: boolean }) {
  const { redirectTo = '/', showToast = true } = options || {};

  try {
    // 1. Invalidate session on server
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});

    // 2. Clear all client cookies
    document.cookie = 'omnimail_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; SameSite=Lax';
    document.cookie = 'omnimail_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; SameSite=Lax';
    document.cookie = 'sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; SameSite=Lax';
    document.cookie = 'sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; SameSite=Lax';

    // 3. Clear session storage credentials
    try {
      sessionStorage.removeItem('omnimail_registered_password');
      sessionStorage.removeItem('omnimail_registered_email');
    } catch {}

    // 4. Sign out Supabase auth
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Supabase signout notice:', e);
    }

    if (showToast) {
      toast.success('Signed out successfully', {
        description: 'Returning to homepage...',
      });
    }

    // 5. Hard redirect to flush client caches & auth state
    setTimeout(() => {
      window.location.href = redirectTo;
    }, 250);
  } catch (err) {
    console.error('Error signing out:', err);
    window.location.href = redirectTo;
  }
}
