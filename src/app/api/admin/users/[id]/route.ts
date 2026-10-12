import { NextResponse } from 'next/server';
import { OmniMailRepository } from '@/lib/store/repository';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userDetail = await OmniMailRepository.getAdminUserDetail(id);

    if (!userDetail) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: userDetail,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch user dossier';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, role, adminId } = body;

    if (status) {
      if (status !== 'active' && status !== 'suspended') {
        return NextResponse.json({ success: false, error: 'Invalid status value' }, { status: 400 });
      }
      await OmniMailRepository.updateUserStatus(id, status, adminId || 'user-admin-1');
    }

    if (role) {
      if (role !== 'user' && role !== 'admin') {
        return NextResponse.json({ success: false, error: 'Invalid role value' }, { status: 400 });
      }
      await OmniMailRepository.updateUserProfile(id, { role });
    }

    const updatedUser = await OmniMailRepository.getAdminUserDetail(id);

    return NextResponse.json({
      success: true,
      message: 'User account updated successfully',
      user: updatedUser,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update user';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await OmniMailRepository.deleteUser(id, 'user-admin-1');

    if (!deleted) {
      return NextResponse.json({ success: false, error: 'User could not be deleted' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'User deleted and purged from directory',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete user';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
