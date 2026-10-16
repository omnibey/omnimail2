import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { UserProfile } from '@/types';
import { isDemoMode } from '@/lib/demo';
import { OmniMailRepository } from '@/lib/store/repository';

export interface AuthenticatedAuthContext {
  user: {
    id: string;
    email?: string;
    user_metadata?: Record<string, unknown>;
  };
  profile: UserProfile;
  isDemo: boolean;
}

/**
 * Retrieves the currently authenticated user and their database profile.
 * Server-side source of truth: Supabase Auth Session -> Database Profile.
 * Never trusts client headers, client-sent role cookies, or body parameters.
 */
export async function getAuthenticatedUser(): Promise<AuthenticatedAuthContext | null> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (!authError && user) {
      // Authenticated Supabase session found - lookup profile in database
      const adminClient = createAdminClient();
      const clientToUse = adminClient || supabase;

      const { data: profileRow } = await clientToUse
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileRow) {
        const profile: UserProfile = {
          id: profileRow.id,
          name: profileRow.name || user.user_metadata?.full_name || 'OmniMail User',
          email: profileRow.email || user.email || '',
          phone: profileRow.phone || '',
          role: profileRow.role === 'admin' ? 'admin' : 'user',
          credits: typeof profileRow.credits === 'number' ? profileRow.credits : 10,
          account_status: profileRow.account_status === 'suspended' ? 'suspended' : 'active',
          google_account_email: profileRow.google_account_email || undefined,
          avatar_url: profileRow.avatar_url || undefined,
          created_at: profileRow.created_at || new Date().toISOString(),
          updated_at: profileRow.updated_at || new Date().toISOString(),
        };

        return {
          user: {
            id: user.id,
            email: user.email,
            user_metadata: user.user_metadata,
          },
          profile,
          isDemo: false,
        };
      }

      // If user is authenticated in Supabase but profile row is not yet created, create or sync it
      const defaultRole = (user.email?.toLowerCase() === 'admin@omnibey.com') ? 'admin' : 'user';
      const newProfile: UserProfile = {
        id: user.id,
        name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'OmniMail User',
        email: user.email || '',
        role: defaultRole,
        credits: 15,
        account_status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      try {
        await clientToUse.from('profiles').upsert({
          id: newProfile.id,
          name: newProfile.name,
          email: newProfile.email,
          role: newProfile.role,
          credits: newProfile.credits,
          account_status: newProfile.account_status,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });
      } catch (upsertErr) {
        console.warn('Profile sync notice:', upsertErr);
      }

      return {
        user: {
          id: user.id,
          email: user.email,
          user_metadata: user.user_metadata,
        },
        profile: newProfile,
        isDemo: false,
      };
    }
  } catch (err) {
    console.warn('Supabase auth resolution notice:', err);
  }

  // 2. Active Session Cookie fallback (for custom registered & authenticated users)
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('omnimail_session')?.value;

    if (sessionId) {
      const user = await OmniMailRepository.getCurrentUser(sessionId);
      if (user) {
        return {
          user: { id: user.id, email: user.email },
          profile: user,
          isDemo: isDemoMode() || sessionId.startsWith('user-demo'),
        };
      }
    }

    if (isDemoMode()) {
      const demoUser = await OmniMailRepository.getCurrentUser('user-demo-1');
      if (demoUser) {
        return {
          user: { id: demoUser.id, email: demoUser.email },
          profile: demoUser,
          isDemo: true,
        };
      }
    }
  } catch {
    // Cookie store read error in static context
  }

  return null;
}

/**
 * Ensures the caller is authenticated.
 * Returns the authentication context, or an HTTP 401 / 403 NextResponse if unauthorized.
 */
export async function requireAuthenticatedUser(): Promise<AuthenticatedAuthContext | NextResponse> {
  const auth = await getAuthenticatedUser();
  if (!auth) {
    return NextResponse.json(
      { success: false, error: 'Authentication required. Please log in.' },
      { status: 401 }
    );
  }

  if (auth.profile.account_status === 'suspended') {
    return NextResponse.json(
      { success: false, error: 'Account suspended. Please contact OmniBey support.' },
      { status: 403 }
    );
  }

  return auth;
}

/**
 * Ensures the caller is authenticated AND has the 'admin' database role.
 * Returns the authentication context, or an HTTP 401 / 403 NextResponse if unauthorized.
 */
export async function requireAdmin(): Promise<AuthenticatedAuthContext | NextResponse> {
  const auth = await getAuthenticatedUser();
  if (!auth) {
    return NextResponse.json(
      { success: false, error: 'Authentication required. Please log in.' },
      { status: 401 }
    );
  }

  if (auth.profile.account_status === 'suspended') {
    return NextResponse.json(
      { success: false, error: 'Account suspended. Please contact OmniBey support.' },
      { status: 403 }
    );
  }

  if (auth.profile.role !== 'admin') {
    return NextResponse.json(
      { success: false, error: 'Forbidden. Administrator privileges required.' },
      { status: 403 }
    );
  }

  return auth;
}

/**
 * Returns current profile or null without raising an HTTP response.
 */
export async function getCurrentProfile(): Promise<UserProfile | null> {
  const auth = await getAuthenticatedUser();
  return auth ? auth.profile : null;
}
