import { NextResponse } from 'next/server';
import { OmniMailRepository } from '@/lib/store/repository';
import { getAuthenticatedUser, requireAuthenticatedUser } from '@/lib/auth-server';
import { isDemoMode } from '@/lib/demo';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const auth = await getAuthenticatedUser();
  if (auth) {
    return NextResponse.json({ user: auth.profile });
  }

  // Only allow demo role inspection in demo mode if explicit role query param is present
  if (isDemoMode()) {
    const { searchParams } = new URL(request.url);
    const requestedRole = searchParams.get('role');
    if (requestedRole) {
      const targetId = requestedRole === 'admin' ? 'user-admin-1' : 'user-demo-1';
      const user = await OmniMailRepository.getCurrentUser(targetId);
      return NextResponse.json({ user });
    }
  }

  return NextResponse.json({ user: null });
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { action } = body;

    if (action === 'sync_oauth') {
      const { user } = body;
      if (!user || !user.id || !user.email) {
        return NextResponse.json({ success: false, error: 'Invalid user payload' }, { status: 400 });
      }

      const fullName =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email.split('@')[0] ||
        'Google User';
      const email = (user.email as string).toLowerCase();
      const role = email === 'admin@omnibey.com' ? 'admin' : 'user';

      // 1. Sync Supabase profiles table
      try {
        const supabase = await createClient();
        await supabase.from('profiles').upsert(
          {
            id: user.id,
            name: fullName,
            email: email,
            role: role,
            credits: 15,
            account_status: 'active',
            google_account_email: email,
            avatar_url: user.user_metadata?.avatar_url || '',
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        );
      } catch (dbErr) {
        console.warn('[Sync OAuth] Supabase profiles upsert notice:', dbErr);
      }

      // 2. Register in repository
      await OmniMailRepository.createUser(fullName, email, role, undefined, user.id);

      const destination = role === 'admin' ? '/admin' : '/dashboard';
      const response = NextResponse.json({
        success: true,
        redirect: destination,
        user: { id: user.id, name: fullName, email, role },
      });

      response.cookies.set('omnimail_session', user.id, {
        path: '/',
        maxAge: 86400 * 7,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });
      response.cookies.set('omnimail_role', role, {
        path: '/',
        maxAge: 86400 * 7,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });

      return response;
    }

    const auth = await requireAuthenticatedUser();
    if (auth instanceof NextResponse) {
      return auth;
    }

    const { name, phone } = body;

    if (action === 'update_profile') {
      // Must use authenticated user ID from session. Never trust client-provided userId.
      const userId = auth.profile.id;
      const updated = await OmniMailRepository.updateUserProfile(userId, { name, phone });
      return NextResponse.json({ success: true, user: updated });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
