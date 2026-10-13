import { NextResponse } from 'next/server';
import { OmniMailRepository } from '@/lib/store/repository';
import { requireAuthenticatedUser } from '@/lib/auth-server';

export async function POST(request: Request) {
  try {
    const auth = await requireAuthenticatedUser();
    if (auth instanceof NextResponse) {
      return auth;
    }

    const { emailAddressId, additionalMinutes } = await request.json().catch(() => ({}));

    if (!emailAddressId) {
      return NextResponse.json({ success: false, error: 'emailAddressId is required' }, { status: 400 });
    }

    const email = await OmniMailRepository.getEmailAddressById(emailAddressId);
    if (!email) {
      return NextResponse.json({ success: false, error: 'Email address not found' }, { status: 404 });
    }

    // Ownership verification: Normal users can only extend their own mailboxes
    if (email.user_id !== auth.profile.id && auth.profile.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden. You do not own this mailbox.' }, { status: 403 });
    }

    const updated = await OmniMailRepository.extendEmailExpiration(
      emailAddressId, 
      additionalMinutes || 60
    );

    return NextResponse.json({
      success: true,
      emailAddress: updated,
      message: 'Email expiration successfully extended by 60 minutes.',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to extend email';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
