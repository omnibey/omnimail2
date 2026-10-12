import { NextResponse } from 'next/server';
import { OmniMailRepository } from '@/lib/store/repository';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const status = searchParams.get('status') || undefined;
    const role = searchParams.get('role') || undefined;
    const packageFilter = searchParams.get('package') || undefined;

    const result = await OmniMailRepository.getAdminUsersOverview({
      search,
      status,
      role,
      packageFilter,
    });

    return NextResponse.json({
      success: true,
      users: result.users,
      total: result.total,
      metrics: result.metrics,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch admin users';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
