import { NextResponse } from 'next/server';
import { OmniBeyProvider } from '@/services/email/OmniBeyProvider';
import { OmniMailRepository } from '@/lib/store/repository';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { userId, customPrefix, userServiceTag, expiresInMinutes } = body;

    const cookieHeader = request.headers.get('cookie') || '';
    const match = cookieHeader.match(/omnimail_session=([^;]+)/);
    const sessionUserId = match ? decodeURIComponent(match[1].trim()) : null;

    const effectiveUserId = userId || sessionUserId || 'user-demo-1';

    const provider = new OmniBeyProvider();
    const newAddress = await provider.createAddress({
      userId: effectiveUserId,
      customPrefix,
      userServiceTag,
      expiresInMinutes: expiresInMinutes || 60,
    });

    return NextResponse.json({
      success: true,
      emailAddress: newAddress,
      message: `Successfully generated ${newAddress.email_address}`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to generate temporary email';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(/omnimail_session=([^;]+)/);
  const sessionUserId = match ? decodeURIComponent(match[1].trim()) : null;

  const userId = searchParams.get('userId') || sessionUserId || 'user-demo-1';

  let emails = await OmniMailRepository.getEmailAddressesByUser(userId);

  // If user has no mailboxes yet, automatically generate one for them
  if (emails.length === 0 && userId !== 'user-demo-1') {
    try {
      const user = await OmniMailRepository.getCurrentUser(userId);
      if (user) {
        const cleanPrefix = (user.email.split('@')[0] || 'box').replace(/[^a-z0-9]/gi, '').toLowerCase();
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        const provider = new OmniBeyProvider();
        const autoBox = await provider.createAddress({
          userId: user.id,
          customPrefix: `${cleanPrefix.slice(0, 8)}_${randomSuffix}`,
          userServiceTag: 'Primary Mailbox',
          expiresInMinutes: 60,
        });
        emails = [autoBox];
      }
    } catch (e) {
      console.warn('Auto mailbox init notice:', e);
    }
  }

  return NextResponse.json({ emails });
}
