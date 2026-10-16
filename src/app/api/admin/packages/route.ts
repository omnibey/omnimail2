import { NextRequest, NextResponse } from 'next/server';
import { OmniMailRepository } from '@/lib/store/repository';
import { requireAdmin } from '@/lib/auth-server';
import { CreditPackage } from '@/types';

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) {
    return auth;
  }

  const packages = await OmniMailRepository.getAllPackagesAdmin();
  return NextResponse.json({ packages });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) {
    return auth;
  }

  try {
    const body = await req.json();
    const { name, price, credits, bonus, description, features, is_featured, display_order, status } = body;

    if (!name || typeof price !== 'number' || typeof credits !== 'number') {
      return NextResponse.json(
        { error: 'Name, price (USD), and credits count are required.' },
        { status: 400 }
      );
    }

    const newPkgData: Omit<CreditPackage, 'id' | 'created_at'> = {
      name: String(name).trim(),
      price: Math.max(0, Number(price)),
      currency: 'USD',
      credits: Math.max(0, Number(credits)),
      bonus: Math.max(0, Number(bonus || 0)),
      description: String(description || '').trim(),
      features: Array.isArray(features) ? features.filter(Boolean) : ['High-speed delivery', 'SMS OTP detection'],
      is_featured: Boolean(is_featured),
      display_order: Number(display_order) || 0,
      status: status === 'inactive' ? 'inactive' : 'active',
    };

    const created = await OmniMailRepository.createPackage(newPkgData);

    await OmniMailRepository.logAudit(
      auth.user.id,
      'create_package',
      'package',
      created.id,
      { name: created.name, price: created.price, credits: created.credits }
    );

    return NextResponse.json({ success: true, package: created }, { status: 201 });
  } catch (err: unknown) {
    console.error('Admin create package error:', err);
    return NextResponse.json({ error: 'Failed to create credit package' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) {
    return auth;
  }

  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Package ID is required' }, { status: 400 });
    }

    const cleanUpdates: Partial<CreditPackage> = {};
    if (updates.name !== undefined) cleanUpdates.name = String(updates.name).trim();
    if (updates.price !== undefined) cleanUpdates.price = Math.max(0, Number(updates.price));
    if (updates.currency !== undefined) cleanUpdates.currency = String(updates.currency).toUpperCase();
    if (updates.credits !== undefined) cleanUpdates.credits = Math.max(0, Number(updates.credits));
    if (updates.bonus !== undefined) cleanUpdates.bonus = Math.max(0, Number(updates.bonus));
    if (updates.description !== undefined) cleanUpdates.description = String(updates.description).trim();
    if (updates.features !== undefined && Array.isArray(updates.features)) {
      cleanUpdates.features = updates.features.filter(Boolean);
    }
    if (updates.is_featured !== undefined) cleanUpdates.is_featured = Boolean(updates.is_featured);
    if (updates.display_order !== undefined) cleanUpdates.display_order = Number(updates.display_order);
    if (updates.status !== undefined) {
      cleanUpdates.status = updates.status === 'inactive' ? 'inactive' : 'active';
    }

    const updated = await OmniMailRepository.updatePackage(id, cleanUpdates);
    if (!updated) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    }

    await OmniMailRepository.logAudit(
      auth.user.id,
      'update_package',
      'package',
      id,
      cleanUpdates
    );

    return NextResponse.json({ success: true, package: updated });
  } catch (err: unknown) {
    console.error('Admin update package error:', err);
    return NextResponse.json({ error: 'Failed to update package' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) {
    return auth;
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Package ID is required' }, { status: 400 });
    }

    const ok = await OmniMailRepository.deletePackage(id);
    if (!ok) {
      return NextResponse.json({ error: 'Package not found or could not be deleted' }, { status: 404 });
    }

    await OmniMailRepository.logAudit(
      auth.user.id,
      'delete_package',
      'package',
      id,
      {}
    );

    return NextResponse.json({ success: true, message: 'Package deleted successfully' });
  } catch (err: unknown) {
    console.error('Admin delete package error:', err);
    return NextResponse.json({ error: 'Failed to delete package' }, { status: 500 });
  }
}
