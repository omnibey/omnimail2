import { NextResponse } from 'next/server';
import { OmniMailRepository } from '@/lib/store/repository';
import { PAYMENT_DESTINATIONS } from '@/services/payment/PaymentService';

export async function GET() {
  const packages = await OmniMailRepository.getPackages();
  return NextResponse.json({
    packages,
    destinations: PAYMENT_DESTINATIONS,
  });
}
