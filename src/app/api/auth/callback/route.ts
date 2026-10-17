import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { OmniMailRepository } from '@/lib/store/repository';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const rawNext = searchParams.get('next') ?? '/dashboard';

  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || '';
  const canonicalOrigin = host.includes('.vercel.app') || origin.includes('.vercel.app')
    ? (process.env.NEXT_PUBLIC_APP_URL || 'https://mail.omnibey.com')
    : origin;

  const next = rawNext && rawNext !== '/' && rawNext !== '/login' && rawNext !== '/signup' && rawNext !== '/register' ? rawNext : '/dashboard';

  if (error) {
    console.warn('[OAuth Callback Error from Provider]:', error, errorDescription);
    const redirectUrl = new URL('/login', canonicalOrigin);
    redirectUrl.searchParams.set('error', errorDescription || error);
    return NextResponse.redirect(redirectUrl.toString());
  }

  if (code) {
    try {
      const supabase = await createClient();
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (!exchangeError && data?.user) {
        const user = data.user;
        const fullName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split('@')[0] ||
          'Google User';
        const email = user.email || '';
        const role = email.toLowerCase() === 'admin@omnibey.com' ? 'admin' : 'user';

        // 1. Ensure profile is saved to Supabase profiles table
        try {
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
          console.warn('[OAuth Callback] Supabase profiles table upsert notice:', dbErr);
        }

        // 2. Register in local repository
        await OmniMailRepository.createUser(fullName, email, role, undefined, user.id);

        const destination = role === 'admin' ? '/admin' : next;
        const response = NextResponse.redirect(`${canonicalOrigin}${destination}`);
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
      } else if (exchangeError) {
        console.error('[OAuth Callback] Code exchange error:', exchangeError.message);

        // If the server exchange failed due to PKCE code verifier not found in server cookies
        // (common in SSR cross-site redirects on mobile Chrome / iOS Safari),
        // redirect to /login with fallback=client so the browser client (which holds document.cookie)
        // can execute supabase.auth.exchangeCodeForSession(code) directly!
        const isPkceError =
          exchangeError.message.toLowerCase().includes('code verifier') ||
          exchangeError.message.toLowerCase().includes('pkce');

        if (isPkceError) {
          const clientFallback = new URL('/login', canonicalOrigin);
          clientFallback.searchParams.set('code', code);
          clientFallback.searchParams.set('fallback', 'client');
          if (rawNext) clientFallback.searchParams.set('next', next);
          return NextResponse.redirect(clientFallback.toString());
        }

        return NextResponse.redirect(
          `${canonicalOrigin}/login?error=${encodeURIComponent(exchangeError.message)}`
        );
      }
    } catch (exchangeErr) {
      console.error('[OAuth Callback] Unexpected exception:', exchangeErr);
    }
  }

  return NextResponse.redirect(`${canonicalOrigin}/login?error=oauth_failed`);
}
