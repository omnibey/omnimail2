import { NextResponse } from 'next/server';
import { OmniMailRepository } from '@/lib/store/repository';
import { getAuthenticatedUser } from '@/lib/auth-server';

/**
 * Developer API v1: Programmatic Temporary Email & OTP Extraction
 */
export async function POST(request: Request) {
  try {
    const auth = await getAuthenticatedUser();
    if (!auth) {
      return NextResponse.json(
        { status: 'error', error: 'Authentication required. Bearer API key or active session required.' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { prefix, tag, expiresInMinutes } = body;

    const email = await OmniMailRepository.generateEmailAddress(
      auth.profile.id,
      prefix,
      tag || 'Developer API Integration',
      expiresInMinutes || 60
    );

    return NextResponse.json({
      status: 'success',
      data: {
        id: email.id,
        email_address: email.email_address,
        expires_at: email.expires_at,
        provider: 'OmniBey Mail Gateway',
        tag: email.user_service_tag,
      },
      meta: {
        api_version: 'v1',
        rate_limit_remaining: 59,
      }
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'API error';
    return NextResponse.json({ status: 'error', error: message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const auth = await getAuthenticatedUser();
  if (!auth) {
    return NextResponse.json(
      { status: 'error', error: 'Authentication required.' },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const emailId = searchParams.get('id');

  if (!emailId) {
    return NextResponse.json({
      status: 'error',
      error: 'Query parameter ?id=<email_id> is required to retrieve messages and OTPs.',
    }, { status: 400 });
  }

  const email = await OmniMailRepository.getEmailAddressById(emailId);
  if (!email) {
    return NextResponse.json({ status: 'error', error: 'Email address not found or expired.' }, { status: 404 });
  }

  // Must own the email or be admin
  if (email.user_id !== auth.profile.id && auth.profile.role !== 'admin') {
    return NextResponse.json({ status: 'error', error: 'Forbidden. You do not own this mailbox.' }, { status: 403 });
  }

  const messages = await OmniMailRepository.getMessagesByEmail(emailId);

  return NextResponse.json({
    status: 'success',
    data: {
      email_address: email.email_address,
      status: email.status,
      expires_at: email.expires_at,
      message_count: messages.length,
      messages: messages.map(m => ({
        id: m.id,
        sender: m.sender,
        subject: m.subject,
        detected_otp: m.detected_otp,
        otp_confidence: m.otp_confidence,
        received_at: m.received_at,
      })),
    }
  });
}
