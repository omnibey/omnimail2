import { NextResponse } from 'next/server';
import { OmniMailRepository } from '@/lib/store/repository';
import { requireAdmin } from '@/lib/auth-server';

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) {
      return auth;
    }

    const body = await request.json().catch(() => ({}));
    const { paymentId, status, reason } = body;

    if (!paymentId || !status) {
      return NextResponse.json(
        { success: false, error: 'paymentId and status are required' },
        { status: 400 }
      );
    }

    const adminId = auth.profile.id;
    const adminEmail = auth.profile.email;

    if (status === 'approved') {
      const result = await OmniMailRepository.approvePayment(paymentId, adminId, adminEmail);
      return NextResponse.json({
        success: true,
        payment: result.payment,
        creditsAdded: result.creditsAdded,
      });
    } else if (status === 'rejected') {
      const result = await OmniMailRepository.rejectPayment(paymentId, adminId, reason || 'Payment rejected by admin.', adminEmail);
      return NextResponse.json({
        success: true,
        payment: result.payment,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid status. Must be "approved" or "rejected".' },
      { status: 400 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Verification failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
