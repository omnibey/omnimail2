import { NextResponse } from 'next/server';
import { OmniMailRepository } from '@/lib/store/repository';
import { requireAuthenticatedUser } from '@/lib/auth-server';

export async function GET(request: Request) {
  const auth = await requireAuthenticatedUser();
  if (auth instanceof NextResponse) {
    return auth;
  }

  const { searchParams } = new URL(request.url);
  const emailAddressId = searchParams.get('emailAddressId');

  // Server-derived user ID: strictly isolate user messages
  const userId = auth.profile.id;

  if (emailAddressId) {
    const email = await OmniMailRepository.getEmailAddressById(emailAddressId);
    if (!email) {
      return NextResponse.json({ success: false, error: 'Email address not found' }, { status: 404 });
    }

    // Must own the mailbox or be admin
    if (email.user_id !== userId && auth.profile.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden. You do not own this mailbox.' }, { status: 403 });
    }

    const messages = await OmniMailRepository.getMessagesByEmail(emailAddressId);
    return NextResponse.json({ messages });
  }

  const messages = await OmniMailRepository.getMessagesByUser(userId);
  return NextResponse.json({ messages });
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuthenticatedUser();
    if (auth instanceof NextResponse) {
      return auth;
    }

    const { action, messageId } = await request.json().catch(() => ({}));

    if (!messageId) {
      return NextResponse.json({ success: false, error: 'messageId is required' }, { status: 400 });
    }

    const msg = await OmniMailRepository.getMessageById(messageId);
    if (!msg) {
      return NextResponse.json({ success: false, error: 'Message not found' }, { status: 404 });
    }

    // Must own the message or be admin
    if (msg.user_id !== auth.profile.id && auth.profile.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden. You do not own this message.' }, { status: 403 });
    }

    if (action === 'mark_read') {
      const success = await OmniMailRepository.markMessageRead(messageId);
      return NextResponse.json({ success });
    }

    if (action === 'delete') {
      const success = await OmniMailRepository.deleteMessage(messageId);
      return NextResponse.json({ success });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Inbox action failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
