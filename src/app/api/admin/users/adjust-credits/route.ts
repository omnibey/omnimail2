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
    const { userId, amount, reason } = body;

    if (!userId || amount === undefined || isNaN(Number(amount))) {
      return NextResponse.json(
        { success: false, error: 'userId and valid numerical amount are required' },
        { status: 400 }
      );
    }

    // Server-derived admin ID: NEVER trust client-provided adminId
    const adminId = auth.profile.id;
    const effectiveReason = reason || 'Admin manual balance adjustment';

    const result = await OmniMailRepository.adjustUserCredits(
      userId,
      Number(amount),
      adminId,
      effectiveReason
    );

    return NextResponse.json({
      success: true,
      newBalance: result.newBalance,
      message: `Credits successfully adjusted by ${amount}. New balance: ${result.newBalance}`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Credit adjustment failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
