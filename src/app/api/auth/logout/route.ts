import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch (err) {
    console.warn('[Logout] Supabase signOut notice:', err);
  }

  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  
  // Clear auth cookies
  response.cookies.set('omnimail_session', '', {
    path: '/',
    maxAge: 0,
    sameSite: 'lax',
  });
  response.cookies.set('omnimail_role', '', {
    path: '/',
    maxAge: 0,
    sameSite: 'lax',
  });

  return response;
}
