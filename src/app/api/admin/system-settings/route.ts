import { NextRequest, NextResponse } from 'next/server';
import { OmniMailRepository } from '@/lib/store/repository';
import { requireAdmin } from '@/lib/auth-server';

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) {
    return auth;
  }

  const dollarRate = await OmniMailRepository.getDollarRate();
  return NextResponse.json({ dollarRate });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) {
    return auth;
  }

  try {
    const body = await req.json();
    const { rate, min_deposit_usd } = body;

    const parsedRate = Number(rate);
    const parsedMinDeposit = Number(min_deposit_usd ?? 5);

    if (isNaN(parsedRate) || parsedRate <= 0) {
      return NextResponse.json(
        { error: 'Valid positive exchange rate (BDT per USD) is required.' },
        { status: 400 }
      );
    }

    const updated = await OmniMailRepository.setDollarRate(
      parsedRate,
      parsedMinDeposit > 0 ? parsedMinDeposit : 5
    );

    await OmniMailRepository.logAudit(
      auth.user.id,
      'update_dollar_rate',
      'system_settings',
      'dollar_rate',
      { rate: updated.rate, min_deposit_usd: updated.min_deposit_usd }
    );

    return NextResponse.json({ success: true, dollarRate: updated });
  } catch (err: unknown) {
    console.error('Update dollar rate error:', err);
    return NextResponse.json({ error: 'Failed to update dollar rate configuration' }, { status: 500 });
  }
}
