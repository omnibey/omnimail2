import { NextResponse } from 'next/server';
import { OmniMailRepository } from '@/lib/store/repository';
import { requireAuthenticatedUser } from '@/lib/auth-server';

export async function POST(request: Request) {
  try {
    const auth = await requireAuthenticatedUser();
    if (auth instanceof NextResponse) {
      return auth;
    }

    const { emailAddressId } = await request.json().catch(() => ({}));

    if (!emailAddressId) {
      return NextResponse.json({ success: false, error: 'emailAddressId is required' }, { status: 400 });
    }

    const email = await OmniMailRepository.getEmailAddressById(emailAddressId);
    if (!email) {
      return NextResponse.json({ success: false, error: 'Could not find email address' }, { status: 404 });
    }

    // Ownership verification: Normal users can only delete their own mailboxes
    if (email.user_id !== auth.profile.id && auth.profile.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden. You do not own this mailbox.' }, { status: 403 });
    }

    const success = await OmniMailRepository.deleteEmailAddress(emailAddressId, email.user_id);

    if (!success) {
      return NextResponse.json({ success: false, error: 'Could not delete email address' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Email address deleted successfully.' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete email';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
