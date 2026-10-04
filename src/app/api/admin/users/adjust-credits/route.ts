import { NextResponse } from 'next/server';
import { OmniMailRepository } from '@/lib/store/repository';

export async function POST(request: Request) {
  try {
    const { userId, amount, adminId, reason } = await request.json();

    if (!userId || amount === undefined) {
      return NextResponse.json({ success: false, error: 'userId and amount are required' }, { status: 400 });
    }

    const effectiveAdminId = adminId || 'user-admin-1';
    const effectiveReason = reason || 'Admin manual balance adjustment';

    const result = await OmniMailRepository.adjustUserCredits(
      userId,
      Number(amount),
      effectiveAdminId,
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
