import { NextResponse } from 'next/server';
import { OmniMailRepository } from '@/lib/store/repository';

export async function POST(request: Request) {
  try {
    const { paymentId, adminId, adminEmail } = await request.json();

    if (!paymentId) {
      return NextResponse.json({ success: false, error: 'paymentId is required' }, { status: 400 });
    }

    const effectiveAdminId = adminId || 'user-admin-1';
    const effectiveAdminEmail = adminEmail || 'admin@omnibey.com';

    const result = await OmniMailRepository.approvePayment(
      paymentId,
      effectiveAdminId,
      effectiveAdminEmail
    );

    return NextResponse.json({
      success: true,
      payment: result.payment,
      creditsAdded: result.creditsAdded,
      message: result.creditsAdded > 0
        ? `Payment approved successfully. ${result.creditsAdded} credits added to user balance. Screenshot deleted immediately to free storage.`
        : 'Payment was already approved (Idempotent call). No duplicate credits added.',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to approve payment';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
