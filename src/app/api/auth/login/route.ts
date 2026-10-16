import { NextResponse } from 'next/server';
import { OmniMailRepository } from '@/lib/store/repository';
import { createClient } from '@/lib/supabase/server';
import { parseUserAgentAndIp } from '@/lib/device-parser';
import { isDemoMode } from '@/lib/demo';

export async function POST(request: Request) {
  try {
    const deviceInfo = parseUserAgentAndIp(request);
    const body = await request.json().catch(() => ({}));
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const demo = isDemoMode();
    let authenticatedUser: {
      id: string;
      name: string;
      email: string;
      role: 'user' | 'admin';
      credits: number;
      account_status: string;
    } | null = null;
    let authSource = 'none';

    // 1. Try Supabase Auth
    try {
      const supabase = await createClient();
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password,
      });

      if (!signInError && signInData?.user) {
        authSource = 'supabase';
        const sbUser = signInData.user;
        let userRole: 'user' | 'admin' = cleanEmail === 'admin@omnibey.com' ? 'admin' : 'user';
        let accountStatus = 'active';

        // Check authoritative profile in database
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, account_status, credits')
          .eq('id', sbUser.id)
          .maybeSingle();

        if (profile) {
          userRole = profile.role === 'admin' ? 'admin' : 'user';
          accountStatus = profile.account_status || 'active';
        }

        const userName =
          sbUser.user_metadata?.full_name ||
          sbUser.user_metadata?.name ||
          cleanEmail.split('@')[0];

        authenticatedUser = {
          id: sbUser.id,
          name: userName,
          email: cleanEmail,
          role: userRole,
          credits: profile?.credits ?? 15,
          account_status: accountStatus,
        };

        // Sync telemetry to database profiles table
        try {
          await supabase.from('profiles').upsert(
            {
              id: sbUser.id,
              name: userName,
              email: cleanEmail,
              role: userRole,
              account_status: accountStatus,
              last_login_device: deviceInfo.device_type,
              last_login_browser: deviceInfo.browser,
              last_login_os: deviceInfo.os,
              last_login_ip: deviceInfo.ip_address,
              last_login_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'id' }
          );
        } catch {
          // Non-critical profile sync fallback
        }
      } else if (!demo) {
        // If not in demo mode, strictly reject if Supabase authentication fails
        return NextResponse.json(
          { success: false, error: signInError?.message || 'Invalid email or password.' },
          { status: 401 }
        );
      }
    } catch (sbErr) {
      if (!demo) {
        console.error('[Login] Supabase auth error:', sbErr);
        return NextResponse.json(
          { success: false, error: 'Authentication service unavailable.' },
          { status: 500 }
        );
      }
    }

    // 2. Demo fallback only when demo mode is active
    if (!authenticatedUser && demo) {
      const localVerification = await OmniMailRepository.verifyUserPassword(cleanEmail, password);
      if (localVerification.valid && localVerification.user) {
        authSource = 'local';
        const user = localVerification.user;
        authenticatedUser = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          credits: user.credits,
          account_status: user.account_status,
        };
        await OmniMailRepository.updateUserProfile(authenticatedUser.id, {
          last_login_device: deviceInfo.device_type,
          last_login_browser: deviceInfo.browser,
          last_login_os: deviceInfo.os,
          last_login_ip: deviceInfo.ip_address,
          last_login_at: new Date().toISOString(),
        });
      } else {
        const failureReason =
          localVerification.error || 'Incorrect email or password. Please verify your credentials.';
        return NextResponse.json(
          { success: false, error: failureReason },
          { status: 401 }
        );
      }
    }

    if (!authenticatedUser) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // Check account status
    if (authenticatedUser.account_status === 'suspended') {
      return NextResponse.json(
        { success: false, error: 'Account suspended. Please contact OmniBey support.' },
        { status: 403 }
      );
    }

    const targetRoute = authenticatedUser.role === 'admin' ? '/admin' : '/dashboard';

    const response = NextResponse.json({
      success: true,
      user: {
        id: authenticatedUser.id,
        name: authenticatedUser.name,
        email: authenticatedUser.email,
        role: authenticatedUser.role,
        credits: authenticatedUser.credits,
      },
      redirectTo: targetRoute,
      authSource,
    });

    // Set secure authentication cookies
    response.cookies.set('omnimail_session', authenticatedUser.id, {
      path: '/',
      maxAge: 86400 * 7,
      sameSite: 'lax',
    });
    response.cookies.set('omnimail_role', authenticatedUser.role, {
      path: '/',
      maxAge: 86400 * 7,
      sameSite: 'lax',
    });

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Login failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
