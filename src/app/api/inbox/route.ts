import { NextResponse } from 'next/server';
import { OmniMailRepository } from '@/lib/store/repository';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const emailAddressId = searchParams.get('emailAddressId');
  const userId = searchParams.get('userId') || 'user-demo-1';

  if (emailAddressId) {
    const messages = await OmniMailRepository.getMessagesByEmail(emailAddressId);
    return NextResponse.json({ messages });
  }

  const messages = await OmniMailRepository.getMessagesByUser(userId);
  return NextResponse.json({ messages });
}

export async function POST(request: Request) {
  try {
    const { action, messageId } = await request.json();

    if (!messageId) {
      return NextResponse.json({ success: false, error: 'messageId is required' }, { status: 400 });
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
