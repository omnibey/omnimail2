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
    const { paymentId, reason } = body;

    if (!paymentId) {
      return NextResponse.json(
        { success: false, error: 'paymentId is required' },
        { status: 400 }
      );
    }

    // Server-derived admin identity: NEVER trust client-provided adminId or adminEmail
    const adminId = auth.profile.id;
    const adminEmail = auth.profile.email;

    const result = await OmniMailRepository.rejectPayment(
      paymentId,
      adminId,
      reason || 'Transaction could not be verified against merchant statements.',
      adminEmail
    );

    return NextResponse.json({
      success: true,
      payment: result.payment,
      message: 'Payment rejected and reason recorded. Audit log dispatched.',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to reject payment';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
