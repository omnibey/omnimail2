import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { isDemoMode } from '@/lib/demo';

export async function middleware(request: NextRequest) {
  // 1. Canonical Domain Redirection:
  // If request hits Vercel's default/preview domain (e.g. *.vercel.app), redirect to mail.omnibey.com
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || request.nextUrl.host || '';
  if (host.includes('.vercel.app')) {
    const canonicalUrl = new URL(request.url);
    canonicalUrl.protocol = 'https:';
    canonicalUrl.host = 'mail.omnibey.com';
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

  const { pathname } = request.nextUrl;
  const demoActive = isDemoMode();
  const demoCookieSession = request.cookies.get('omnimail_session')?.value;
  const demoCookieRole = request.cookies.get('omnimail_role')?.value;

  // A session is only valid via authenticated Supabase user or isolated Demo Mode (if enabled)
  const hasValidSession = Boolean(supabaseUser) || (demoActive && Boolean(demoCookieSession));
  
  // Role MUST be derived from database profile for authenticated users. NEVER trust omnimail_role cookie.
  const effectiveRole = supabaseUser 
    ? userRole 
    : (demoActive && (demoCookieSession === 'user-admin-1' || demoCookieRole === 'admin') ? 'admin' : 'user');

  const isAdminRoute = pathname.startsWith('/admin');
  const isDashboardRoute = pathname.startsWith('/dashboard');
  const isAuthRoute = pathname === '/login' || pathname === '/signup' || pathname === '/forgot-password';

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
    '/dashboard/:path*',
    '/admin/:path*',
    '/login',
    '/signup',
    '/forgot-password',
  ],
};
