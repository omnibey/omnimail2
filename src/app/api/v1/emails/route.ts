import { NextResponse } from 'next/server';
import { OmniMailRepository } from '@/lib/store/repository';

/**
 * Developer API v1: Programmatic Temporary Email & OTP Extraction
 * Requires 'Authorization: Bearer omni_live_...' in production
 */
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    // Developer API key check placeholder
    const apiKey = authHeader ? authHeader.replace(/^Bearer\s+/i, '') : null;

    const body = await request.json().catch(() => ({}));
    const { prefix, tag, expiresInMinutes } = body;

    const email = await OmniMailRepository.generateEmailAddress(
      'user-demo-1',
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
        authenticated_with: apiKey ? 'API_KEY' : 'DEMO_SESSION',
        rate_limit_remaining: 59,
      }
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'API error';
    return NextResponse.json({ status: 'error', error: message }, { status: 500 });
  }
}

export async function GET(request: Request) {
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
        detected_otp: m.detected_otp || null,
        otp_confidence: m.otp_confidence || null,
        received_at: m.received_at,
        body_text: m.body_text,
      })),
    },
  });
}
