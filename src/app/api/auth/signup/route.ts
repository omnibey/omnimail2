import { NextResponse } from 'next/server';
import { OmniMailRepository } from '@/lib/store/repository';
import { createClient } from '@/lib/supabase/server';
import { parseUserAgentAndIp } from '@/lib/device-parser';

export async function POST(request: Request) {
  try {
    const deviceInfo = parseUserAgentAndIp(request);
    const { name, email, password, confirmPassword, acceptTerms, returnTo } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and password are required.' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'Passwords do not match.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    if (!acceptTerms) {
      return NextResponse.json(
        { success: false, error: 'You must agree to the Terms of Service and Privacy Policy.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const role = cleanEmail === 'admin@omnibey.com' ? 'admin' : 'user';

    // Check if user already exists in local store
    const existingUser = await OmniMailRepository.getUserByEmail(cleanEmail);
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'An account with this email address already exists. Please sign in.' },
        { status: 409 }
      );
    }

    let supabaseUserId: string | null = null;

    // 1. Try to register with Supabase Auth
    try {
      const supabase = await createClient();
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: password,
        options: {
          data: {
            full_name: cleanName,
            name: cleanName,
            role: role,
          },
        },
      });

      if (authError) {
        if (authError.message.toLowerCase().includes('already registered')) {
          return NextResponse.json(
            { success: false, error: 'An account with this email address already exists in Supabase. Please sign in.' },
            { status: 409 }
          );
        }
        console.warn('[Signup] Supabase Auth warning (rate limit or connection):', authError.message);
      } else if (authData?.user) {
        supabaseUserId = authData.user.id;

        // Try to sync with Supabase public.profiles table
        try {
          await supabase.from('profiles').upsert(
            {
              id: authData.user.id,
              name: cleanName,
              email: cleanEmail,
              role: role,
              credits: 15,
              account_status: 'active',
              registration_device: deviceInfo.device_type,
              registration_browser: deviceInfo.browser,
              registration_os: deviceInfo.os,
              registration_ip: deviceInfo.ip_address,
              last_login_device: deviceInfo.device_type,
              last_login_browser: deviceInfo.browser,
              last_login_os: deviceInfo.os,
              last_login_ip: deviceInfo.ip_address,
              last_login_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'id' }
          );
        } catch (profileErr) {
          console.warn('[Signup] Supabase profiles upsert notice:', profileErr);
        }
      }
    } catch (sbErr) {
      console.warn('[Signup] Supabase integration fallback notice:', sbErr);
    }

    // 2. Save user into OmniMailRepository with credentials and initial mailbox
    const user = await OmniMailRepository.createUser(
      cleanName,
      cleanEmail,
      role,
      password,
      supabaseUserId || undefined
    );

    // Save device info on local record
    await OmniMailRepository.updateUserProfile(user.id, {
      registration_device: deviceInfo.device_type,
      registration_browser: deviceInfo.browser,
      registration_os: deviceInfo.os,
      registration_ip: deviceInfo.ip_address,
      last_login_device: deviceInfo.device_type,
      last_login_browser: deviceInfo.browser,
      last_login_os: deviceInfo.os,
      last_login_ip: deviceInfo.ip_address,
      last_login_at: new Date().toISOString(),
    });

    // Determine target redirect route (never redirect to root or auth routes)
    let targetRoute = user.role === 'admin' ? '/admin' : '/dashboard';
    if (
      returnTo &&
      typeof returnTo === 'string' &&
      returnTo.startsWith('/') &&
      !returnTo.startsWith('//') &&
      returnTo !== '/' &&
      returnTo !== '/login' &&
      returnTo !== '/signup'
    ) {
      targetRoute = returnTo;
    }

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        credits: user.credits,
      },
      message: 'Account created successfully with 15 free trial credits! Logging you in...',
      redirectTo: targetRoute,
    });

    response.cookies.set('omnimail_session', user.id, {
      path: '/',
      maxAge: 86400 * 7,
      sameSite: 'lax',
    });
    response.cookies.set('omnimail_role', user.role, {
      path: '/',
      maxAge: 86400 * 7,
      sameSite: 'lax',
    });

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Registration failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
