import { NextResponse } from 'next/server';
import { OmniMailRepository } from '@/lib/store/repository';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') || 'user-demo-1';

  const payments = await OmniMailRepository.getPaymentsByUser(userId);
  const transactions = await OmniMailRepository.getTransactionsByUser(userId);
  const user = await OmniMailRepository.getCurrentUser(userId);

  return NextResponse.json({
    payments,
    transactions,
    credits: user?.credits || 0,
  });
}
