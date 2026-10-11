import { NextResponse } from 'next/server';
import { OmniMailRepository } from '@/lib/store/repository';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestedRole = searchParams.get('role');

  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(/omnimail_session=([^;]+)/);
  const sessionToken = match ? decodeURIComponent(match[1].trim()) : null;

  let user = null;

  // 1. Look up user by active session cookie
  if (sessionToken) {
    user = await OmniMailRepository.getCurrentUser(sessionToken);
  }

  // 2. Check Supabase Auth server session if available
  if (!user) {
    try {
      const supabase = await createClient();
      const {
        data: { user: sbUser },
      } = await supabase.auth.getUser();

      if (sbUser) {
        user =
          (await OmniMailRepository.getCurrentUser(sbUser.id)) ||
          (sbUser.email ? await OmniMailRepository.getUserByEmail(sbUser.email) : null);
      }
    } catch {}
  }

  // 3. Fallback to requested role (demo switcher testing)
  if (!user && requestedRole) {
    const targetId = requestedRole === 'admin' ? 'user-admin-1' : 'user-demo-1';
    user = await OmniMailRepository.getCurrentUser(targetId);
  }

  // 4. Default demo user for development/preview if no session cookie exists
  if (!user && !sessionToken) {
    user = await OmniMailRepository.getCurrentUser('user-demo-1');
  }

  return NextResponse.json({ user });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, userId, name, phone } = body;

    const cookieHeader = request.headers.get('cookie') || '';
    const match = cookieHeader.match(/omnimail_session=([^;]+)/);
    const sessionToken = match ? decodeURIComponent(match[1].trim()) : null;

    const effectiveUserId = userId || sessionToken;

    if (action === 'update_profile' && effectiveUserId) {
      const updated = await OmniMailRepository.updateUserProfile(effectiveUserId, { name, phone });

      // Try syncing with Supabase profiles table
      try {
        const supabase = await createClient();
        await supabase
          .from('profiles')
          .update({ name, phone, updated_at: new Date().toISOString() })
          .eq('id', effectiveUserId);
      } catch {}

      return NextResponse.json({ success: true, user: updated });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
