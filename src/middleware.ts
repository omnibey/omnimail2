import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Read cookies for session / role
  const sessionToken = request.cookies.get('sb-access-token')?.value || request.cookies.get('omnimail_session')?.value;
  const userRole = request.cookies.get('omnimail_role')?.value || 'user'; // 'admin' | 'user'

  // Default demo access during development: if no cookie is set yet, we allow inspection with demo fallback
  const isDevOrDemo = process.env.NODE_ENV !== 'production' || !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

  const isAdminRoute = pathname.startsWith('/admin');
  const isDashboardRoute = pathname.startsWith('/dashboard');
  const isAuthRoute = pathname === '/login' || pathname === '/signup' || pathname === '/forgot-password';

  // 1. Admin route protection: Normal users and guests cannot enter /admin
  if (isAdminRoute) {
    if (userRole !== 'admin' && !isDevOrDemo) {
      const redirectUrl = new URL('/login?error=admin_required', request.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // 2. User dashboard route protection: Guests cannot enter /dashboard
  if (isDashboardRoute) {
    if (!sessionToken && !isDevOrDemo) {
      const redirectUrl = new URL(`/login?returnTo=${encodeURIComponent(pathname)}`, request.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // 3. Guest auth route protection: Already logged-in users redirected to their portal
  if (isAuthRoute && sessionToken && !isDevOrDemo) {
    const destination = userRole === 'admin' ? '/admin' : '/dashboard';
    return NextResponse.redirect(new URL(destination, request.url));
  }

  return NextResponse.next();
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
