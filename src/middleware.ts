import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { isDemoMode } from '@/lib/demo';

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // 1. OAuth Code Forwarder:
  // If Supabase/Google redirects to root (/) or auth page with ?code=, forward immediately to callback route
  // unless explicitly flagged for client-side fallback exchange.
  const code = searchParams.get('code');
  const isFallbackClient = searchParams.get('fallback') === 'client';
  if (code && !isFallbackClient && (pathname === '/' || pathname === '/login' || pathname === '/register' || pathname === '/signup')) {
    const callbackUrl = new URL('/api/auth/callback', request.url);
    callbackUrl.search = request.nextUrl.search;
    return NextResponse.redirect(callbackUrl);
  }

  // 2. Canonical Domain Redirection (only if CANONICAL_DOMAIN env is explicitly set):
  const canonicalDomain = process.env.CANONICAL_DOMAIN;
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || request.nextUrl.host || '';
  if (canonicalDomain && host && host !== canonicalDomain && !host.includes('localhost') && !host.includes('127.0.0.1')) {
    const canonicalUrl = new URL(request.url);
    canonicalUrl.protocol = 'https:';
    canonicalUrl.host = canonicalDomain;
    canonicalUrl.port = '';
    return NextResponse.redirect(canonicalUrl, 308);
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let supabaseUser: { id: string; email?: string } | null = null;
  let userRole: 'user' | 'admin' = 'user';

  if (supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('placeholder')) {
    try {
      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            response = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      });

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        supabaseUser = user;
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        if (profile?.role === 'admin' || user.email?.toLowerCase() === 'admin@omnibey.com') {
          userRole = 'admin';
        }
      }
    } catch {
      // Supabase connection fallback
    }
  }

  const demoActive = isDemoMode();
  const sessionCookie = request.cookies.get('omnimail_session')?.value;
  const roleCookie = request.cookies.get('omnimail_role')?.value;

  // Session is valid if authenticated via Supabase user OR omnimail_session cookie exists
  const hasValidSession = Boolean(supabaseUser) || Boolean(sessionCookie);
  
  // Role determination:
  // If Supabase user exists, use profile role
  // Otherwise if session cookie exists, check role cookie / admin id
  const effectiveRole = supabaseUser 
    ? userRole 
    : (sessionCookie === 'user-admin-1' || roleCookie === 'admin' ? 'admin' : 'user');

  const isAdminRoute = pathname.startsWith('/admin');
  const isDashboardRoute = pathname.startsWith('/dashboard');
  const isAuthRoute = pathname === '/login' || pathname === '/register' || pathname === '/signup' || pathname === '/forgot-password';

  // 1. Admin route protection: Normal users and unauthenticated guests cannot enter /admin
  if (isAdminRoute) {
    if (!hasValidSession) {
      const redirectUrl = new URL('/login?error=admin_required', request.url);
      return NextResponse.redirect(redirectUrl);
    }
    if (effectiveRole !== 'admin') {
      const redirectUrl = new URL('/dashboard?error=admin_required', request.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // 2. User dashboard route protection: Guests cannot enter /dashboard
  if (isDashboardRoute) {
    if (!hasValidSession) {
      const redirectUrl = new URL(`/login?returnTo=${encodeURIComponent(pathname)}`, request.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // 3. Guest auth route protection: Already logged-in users redirected to their respective portal
  if (isAuthRoute && hasValidSession) {
    const destination = effectiveRole === 'admin' ? '/admin' : '/dashboard';
    return NextResponse.redirect(new URL(destination, request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/admin/:path*',
    '/login',
    '/register',
    '/signup',
    '/forgot-password',
  ],
};
