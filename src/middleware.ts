import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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

  // 2. Read cookies for session / role
  const sessionToken = request.cookies.get('sb-access-token')?.value || request.cookies.get('omnimail_session')?.value;
  const userRole = request.cookies.get('omnimail_role')?.value || 'user'; // 'admin' | 'user'

  const isAdminRoute = pathname.startsWith('/admin');
  const isDashboardRoute = pathname.startsWith('/dashboard');
  const isAuthRoute = pathname === '/login' || pathname === '/signup' || pathname === '/forgot-password';

  // 3. Admin route protection: Normal users and guests cannot enter /admin
  if (isAdminRoute) {
    if (!sessionToken) {
      const redirectUrl = new URL(`/login?returnTo=${encodeURIComponent(pathname)}`, request.url);
      return NextResponse.redirect(redirectUrl);
    }
    if (userRole !== 'admin') {
      const redirectUrl = new URL('/dashboard?error=admin_required', request.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // 4. User dashboard route protection: Guests cannot enter /dashboard
  if (isDashboardRoute) {
    if (!sessionToken) {
      const redirectUrl = new URL(`/login?returnTo=${encodeURIComponent(pathname)}`, request.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // 5. Guest auth route protection: Already logged-in users redirected to their portal
  if (isAuthRoute && sessionToken) {
    const destination = userRole === 'admin' ? '/admin' : '/dashboard';
    return NextResponse.redirect(new URL(destination, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public asset files (.svg, .png, .jpg, .json, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|json)$).*)',
  ],
};
