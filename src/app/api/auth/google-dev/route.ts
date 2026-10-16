import { NextResponse } from 'next/server';
import { OmniMailRepository } from '@/lib/store/repository';
import { createClient } from '@/lib/supabase/server';
import { isDemoMode } from '@/lib/demo';

export async function POST(request: Request) {
  // TEST 12: When DEMO_MODE is false, demo authentication must not work!
  if (!isDemoMode()) {
    return NextResponse.json(
      { success: false, error: 'Simulated authentication is strictly disabled in production / non-demo mode.' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const email = (body.email || 'user@omnibey.com').trim().toLowerCase();
    const name = body.name || email.split('@')[0] || 'Google User';
    const avatarUrl = body.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`;
    const role = email === 'admin@omnibey.com' ? 'admin' : (body.role || 'user');

    // 1. Ensure user exists in local repository
    const user = await OmniMailRepository.createUser(name, email, role);

    // 2. Synchronize with Supabase profiles table if accessible
    try {
      const supabase = await createClient();
      await supabase.from('profiles').upsert(
        {
          id: user.id,
          name: name,
          email: email,
          role: role,
          credits: user.credits ?? 15,
          account_status: 'active',
          google_account_email: email,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );
    } catch {
      // Demo fallback
    }

    const destination = role === 'admin' ? '/admin' : '/dashboard';
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        credits: user.credits,
      },
      redirectTo: destination,
    });

    response.cookies.set('omnimail_session', user.id, {
      path: '/',
      maxAge: 86400 * 7,
      httpOnly: false,
      sameSite: 'lax',
    });
    response.cookies.set('omnimail_role', role, {
      path: '/',
      maxAge: 86400 * 7,
      httpOnly: false,
      sameSite: 'lax',
    });

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Demo login error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
