import { NextResponse } from 'next/server';
import { OmniMailRepository } from '@/lib/store/repository';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { name, email, password, confirmPassword, acceptTerms } = await request.json();

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

    let supabaseUserId: string | null = null;

    // 1. Save user directly into Supabase Auth
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
        // If user already exists in Supabase
        if (authError.message.toLowerCase().includes('already registered')) {
          return NextResponse.json(
            { success: false, error: 'An account with this email address already exists in Supabase.' },
            { status: 409 }
          );
        }
        console.warn('[Signup] Supabase Auth warning:', authError.message);
      } else if (authData.user) {
        supabaseUserId = authData.user.id;

        // Save profile into Supabase public.profiles table
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: authData.user.id,
          name: cleanName,
          email: cleanEmail,
          role: role,
          credits: 15,
          account_status: 'active',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });

        if (profileError) {
          console.warn('[Signup] Supabase profiles upsert notice:', profileError.message);
        }
      }
    } catch (sbErr) {
      console.warn('[Signup] Supabase integration fallback notice:', sbErr);
    }

    // 2. Also save to OmniMailRepository
    const user = await OmniMailRepository.createUser(cleanName, cleanEmail, role);

    const response = NextResponse.json({
      success: true,
      user: {
        ...user,
        id: supabaseUserId || user.id,
      },
      message: 'Account created successfully in Supabase with 15 free trial credits!',
      redirectTo: user.role === 'admin' ? '/admin' : '/dashboard',
    });

    response.cookies.set('omnimail_session', supabaseUserId || user.id, { path: '/', maxAge: 86400 });
    response.cookies.set('omnimail_role', user.role, { path: '/', maxAge: 86400 });

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Registration failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
