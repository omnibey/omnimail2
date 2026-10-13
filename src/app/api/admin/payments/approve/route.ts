import { NextResponse } from 'next/server';
import { OmniMailRepository } from '@/lib/store/repository';
import { requireAdmin } from '@/lib/auth-server';

export async function POST(request: Request) {
  try {
    // 1. Authorize admin strictly on server
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) {
      return auth;
    }

    const body = await request.json().catch(() => ({}));
    const { paymentId } = body;

    if (!paymentId) {
      return NextResponse.json(
        { success: false, error: 'paymentId is required' },
        { status: 400 }
      );
    }

    // Server-derived admin identity: NEVER trust client-provided adminId or adminEmail
    const adminId = auth.profile.id;
    const adminEmail = auth.profile.email;

    const result = await OmniMailRepository.approvePayment(
      paymentId,
      adminId,
      adminEmail
    );

    return NextResponse.json({
      success: true,
      payment: result.payment,
      creditsAdded: result.creditsAdded,
      message: result.creditsAdded > 0
        ? `Payment approved successfully. ${result.creditsAdded} credits added to user balance.`
        : 'Payment was already approved (Idempotent call). No duplicate credits added.',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to approve payment';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
