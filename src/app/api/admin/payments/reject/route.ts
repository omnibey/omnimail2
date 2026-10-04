import { NextResponse } from 'next/server';
import { OmniMailRepository } from '@/lib/store/repository';

export async function POST(request: Request) {
  try {
    const { paymentId, adminId, reason, adminEmail } = await request.json();

    if (!paymentId) {
      return NextResponse.json({ success: false, error: 'paymentId is required' }, { status: 400 });
    }

    const effectiveAdminId = adminId || 'user-admin-1';
    const effectiveAdminEmail = adminEmail || 'admin@omnibey.com';

    const result = await OmniMailRepository.rejectPayment(
      paymentId,
      effectiveAdminId,
      reason || 'Transaction could not be verified against merchant statements.',
      effectiveAdminEmail
    );

    return NextResponse.json({
      success: true,
      payment: result.payment,
      message: 'Payment rejected and reason recorded. Audit log and Telegram notification dispatched.',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to reject payment';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
