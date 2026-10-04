import { NextResponse } from 'next/server';
import { OmniMailRepository } from '@/lib/store/repository';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const role = cleanEmail === 'admin@omnibey.com' ? 'admin' : 'user';
    let supabaseUserId: string | null = null;
    let userName = cleanEmail.split('@')[0];

    // 1. Authenticate with Supabase Auth
    try {
      const supabase = await createClient();
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password,
      });

      if (!signInError && signInData.user) {
        supabaseUserId = signInData.user.id;
        userName = signInData.user.user_metadata?.full_name || 
                   signInData.user.user_metadata?.name || 
                   userName;

        // Ensure profile is up to date in Supabase public.profiles table
        await supabase.from('profiles').upsert({
          id: signInData.user.id,
          name: userName,
          email: cleanEmail,
          role: role,
          account_status: 'active',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });
      } else {
        // If user does not exist in Supabase Auth yet, create/sign them up automatically
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: cleanEmail,
          password: password,
          options: {
            data: { full_name: userName, role },
          },
        });

        if (!signUpError && signUpData.user) {
          supabaseUserId = signUpData.user.id;
          // Save to public.profiles
          await supabase.from('profiles').upsert({
            id: signUpData.user.id,
            name: userName,
            email: cleanEmail,
            role: role,
            credits: 15,
            account_status: 'active',
            updated_at: new Date().toISOString(),
          }, { onConflict: 'id' });
        }
      }
    } catch (sbErr) {
      console.warn('[Login] Supabase auth notice:', sbErr);
    }

    // 2. Fetch or create in OmniMailRepository
    let user = await OmniMailRepository.getUserByEmail(cleanEmail);
    if (!user) {
      user = await OmniMailRepository.createUser(userName, cleanEmail, role);
    }

    if (user.account_status === 'suspended') {
      return NextResponse.json(
        { success: false, error: 'Account suspended. Please contact OmniBey support.' },
        { status: 403 }
      );
    }

    const effectiveUser = {
      ...user,
      id: supabaseUserId || user.id,
    };

    const response = NextResponse.json({
      success: true,
      user: effectiveUser,
      redirectTo: user.role === 'admin' ? '/admin' : '/dashboard',
    });

    response.cookies.set('omnimail_session', effectiveUser.id, { path: '/', maxAge: 86400 });
    response.cookies.set('omnimail_role', user.role, { path: '/', maxAge: 86400 });

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Login failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
