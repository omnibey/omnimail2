import { NextResponse } from 'next/server';
import { OmniMailRepository } from '@/lib/store/repository';
import { createClient } from '@/lib/supabase/server';
import { parseUserAgentAndIp } from '@/lib/device-parser';

export async function POST(request: Request) {
  try {
    const deviceInfo = parseUserAgentAndIp(request);
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const role = cleanEmail === 'admin@omnibey.com' ? 'admin' : 'user';
    let authenticatedUser = null;
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
        const userName =
          sbUser.user_metadata?.full_name ||
          sbUser.user_metadata?.name ||
          cleanEmail.split('@')[0];

        let repoUser = await OmniMailRepository.getUserByEmail(cleanEmail);
        if (!repoUser) {
          repoUser = await OmniMailRepository.createUser(
            userName,
            cleanEmail,
            role,
            password,
            sbUser.id
          );
        } else {
          repoUser.id = sbUser.id;
          repoUser.password = password;
        }

        authenticatedUser = {
          ...repoUser,
          id: sbUser.id,
          last_login_device: deviceInfo.device_type,
          last_login_browser: deviceInfo.browser,
          last_login_os: deviceInfo.os,
          last_login_ip: deviceInfo.ip_address,
          last_login_at: new Date().toISOString(),
        };

        // Sync with public.profiles table in Supabase
        try {
          await supabase.from('profiles').upsert(
            {
              id: sbUser.id,
              name: userName,
              email: cleanEmail,
              role: role,
              account_status: 'active',
              last_login_device: deviceInfo.device_type,
              last_login_browser: deviceInfo.browser,
              last_login_os: deviceInfo.os,
              last_login_ip: deviceInfo.ip_address,
              last_login_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'id' }
          );
        } catch {}
      }
    } catch (sbErr) {
      console.warn('[Login] Supabase auth notice:', sbErr);
    }

    // 2. If not authenticated via Supabase, verify with local store
    if (!authenticatedUser) {
      const localVerification = await OmniMailRepository.verifyUserPassword(cleanEmail, password);
      if (localVerification.valid && localVerification.user) {
        authSource = 'local';
        authenticatedUser = localVerification.user;
        await OmniMailRepository.updateUserProfile(authenticatedUser.id, {
          last_login_device: deviceInfo.device_type,
          last_login_browser: deviceInfo.browser,
          last_login_os: deviceInfo.os,
          last_login_ip: deviceInfo.ip_address,
          last_login_at: new Date().toISOString(),
        });
      } else {
        // Authentication strictly FAILED - return 401 unauthorized
        const failureReason =
          localVerification.error || 'Incorrect email or password. Please verify your credentials.';
        return NextResponse.json(
          { success: false, error: failureReason },
          { status: 401 }
        );
      }
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
