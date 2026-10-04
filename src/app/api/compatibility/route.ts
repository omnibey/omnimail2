import { NextResponse } from 'next/server';
import { OmniMailRepository } from '@/lib/store/repository';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.toLowerCase();

  let items = await OmniMailRepository.getCompatibilitySummary();
  if (query) {
    items = items.filter(i => 
      i.service_domain.toLowerCase().includes(query) || 
      i.provider.toLowerCase().includes(query)
    );
  }

  return NextResponse.json({
    data: items,
    disclaimer: 'Observed historical data based on internal system telemetry; not a guarantee.',
  });
}
