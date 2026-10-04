import { NextResponse } from 'next/server';
import { OmniMailRepository } from '@/lib/store/repository';

export async function POST(request: Request) {
  try {
    const { emailAddressId, additionalMinutes } = await request.json();

    if (!emailAddressId) {
      return NextResponse.json({ success: false, error: 'emailAddressId is required' }, { status: 400 });
    }

    const updated = await OmniMailRepository.extendEmailExpiration(
      emailAddressId, 
      additionalMinutes || 60
    );

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Email address not found' }, { status: 404 });
    }

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
