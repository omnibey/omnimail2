import { NextResponse } from 'next/server';
import { OmniMailRepository } from '@/lib/store/repository';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestedRole = searchParams.get('role');

  // Allow easy toggling between demo user and admin in browser header / demo toolbar
  const targetId = requestedRole === 'admin' ? 'user-admin-1' : 'user-demo-1';
  const user = await OmniMailRepository.getCurrentUser(targetId);

  return NextResponse.json({ user });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, userId, name, phone } = body;

    if (action === 'update_profile' && userId) {
      const updated = await OmniMailRepository.updateUserProfile(userId, { name, phone });
      return NextResponse.json({ success: true, user: updated });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
