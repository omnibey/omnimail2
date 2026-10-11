import { NextResponse } from 'next/server';
import { OmniMailRepository } from '@/lib/store/repository';

export async function POST(request: Request) {
  try {
    const { emailAddressId, userId } = await request.json();

    if (!emailAddressId) {
      return NextResponse.json({ success: false, error: 'emailAddressId is required' }, { status: 400 });
    }

    const cookieHeader = request.headers.get('cookie') || '';
    const match = cookieHeader.match(/omnimail_session=([^;]+)/);
    const sessionUserId = match ? decodeURIComponent(match[1].trim()) : null;

    const effectiveUserId = userId || sessionUserId || 'user-demo-1';
    const success = await OmniMailRepository.deleteEmailAddress(emailAddressId, effectiveUserId);

    if (!success) {
      return NextResponse.json({ success: false, error: 'Could not delete email address' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Email address deleted successfully.' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete email';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
