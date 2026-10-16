import { NextResponse } from 'next/server';
import { OmniMailRepository } from '@/lib/store/repository';
import { getAuthenticatedUser, requireAuthenticatedUser } from '@/lib/auth-server';
import { isDemoMode } from '@/lib/demo';

export async function GET(request: Request) {
  const auth = await getAuthenticatedUser();
  if (auth) {
    return NextResponse.json({ user: auth.profile });
  }

  // Only allow demo role inspection in demo mode if explicit role query param is present
  if (isDemoMode()) {
    const { searchParams } = new URL(request.url);
    const requestedRole = searchParams.get('role');
    if (requestedRole) {
      const targetId = requestedRole === 'admin' ? 'user-admin-1' : 'user-demo-1';
      const user = await OmniMailRepository.getCurrentUser(targetId);
      return NextResponse.json({ user });
    }
  }

  return NextResponse.json({ user: null });
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuthenticatedUser();
    if (auth instanceof NextResponse) {
      return auth;
    }

    const body = await request.json().catch(() => ({}));
    const { action, name, phone } = body;

    if (action === 'update_profile') {
      // Must use authenticated user ID from session. Never trust client-provided userId.
      const userId = auth.profile.id;
      const updated = await OmniMailRepository.updateUserProfile(userId, { name, phone });
      return NextResponse.json({ success: true, user: updated });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
