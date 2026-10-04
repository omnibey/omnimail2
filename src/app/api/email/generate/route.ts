import { NextResponse } from 'next/server';
import { OmniBeyProvider } from '@/services/email/OmniBeyProvider';
import { OmniMailRepository } from '@/lib/store/repository';

export async function POST(request: Request) {
  try {
    const { userId, customPrefix, userServiceTag, expiresInMinutes } = await request.json();
    const effectiveUserId = userId || 'user-demo-1';

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
  const userId = searchParams.get('userId') || 'user-demo-1';

  const emails = await OmniMailRepository.getEmailAddressesByUser(userId);
  return NextResponse.json({ emails });
}
