import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { OmniMailRepository } from '@/lib/store/repository';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error && data?.user) {
        const user = data.user;
        const fullName = user.user_metadata?.full_name || 
                         user.user_metadata?.name || 
                         user.email?.split('@')[0] || 
                         'User';
        const email = user.email || '';
        const role = email.toLowerCase() === 'admin@omnibey.com' ? 'admin' : 'user';

        // 1. Ensure profile is saved to Supabase profiles table
        try {
          await supabase.from('profiles').upsert({
            id: user.id,
            name: fullName,
            email: email,
            role: role,
            credits: 15,
            account_status: 'active',
            google_account_email: email,
            avatar_url: user.user_metadata?.avatar_url || '',
            updated_at: new Date().toISOString(),
          }, { onConflict: 'id' });
        } catch (dbErr) {
          console.warn('[OAuth Callback] Supabase profiles table upsert notice:', dbErr);
        }

        // 2. Also register in local repository
        await OmniMailRepository.createUser(fullName, email, role);

        const destination = role === 'admin' ? '/admin' : next;
        const response = NextResponse.redirect(`${origin}${destination}`);
        response.cookies.set('omnimail_session', user.id, { path: '/', maxAge: 86400 });
        response.cookies.set('omnimail_role', role, { path: '/', maxAge: 86400 });
        return response;
      }
    } catch (exchangeErr) {
      console.error('[OAuth Callback] Code exchange error:', exchangeErr);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
}
