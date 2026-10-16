import { NextResponse } from 'next/server';
import { OmniMailRepository } from '@/lib/store/repository';
import { requireAuthenticatedUser } from '@/lib/auth-server';

export async function GET() {
  const auth = await requireAuthenticatedUser();
  if (auth instanceof NextResponse) {
    return auth;
  }

  // Server-derived user ID: NEVER trust query params for userId
  const userId = auth.profile.id;

  const [payments, transactions, user] = await Promise.all([
    OmniMailRepository.getPaymentsByUser(userId),
    OmniMailRepository.getTransactionsByUser(userId),
    OmniMailRepository.getCurrentUser(userId),
  ]);

  return NextResponse.json({
    payments,
    transactions,
    credits: user?.credits ?? auth.profile.credits ?? 0,
  });
}
