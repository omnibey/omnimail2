import { NextResponse } from 'next/server';
import { OmniBeyProvider } from '@/services/email/OmniBeyProvider';
import { OmniMailRepository } from '@/lib/store/repository';
import { requireAuthenticatedUser } from '@/lib/auth-server';

export async function POST(request: Request) {
  try {
    const auth = await requireAuthenticatedUser();
    if (auth instanceof NextResponse) {
      return auth;
    }

    const { customPrefix, userServiceTag, expiresInMinutes } = await request.json().catch(() => ({}));

    // Server-derived user ID: NEVER trust client-provided userId
    const effectiveUserId = auth.profile.id;

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

export async function GET() {
  const auth = await requireAuthenticatedUser();
  if (auth instanceof NextResponse) {
    return auth;
  }

  // Server-derived user ID: Returns only the authenticated user's own email addresses
  const userId = auth.profile.id;
  const emails = await OmniMailRepository.getEmailAddressesByUser(userId);
  return NextResponse.json({ emails });
}
