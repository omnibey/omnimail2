import { NextResponse } from 'next/server';
import { OmniMailRepository } from '@/lib/store/repository';
import { requireAdmin } from '@/lib/auth-server';

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) {
    return auth;
  }

  const [metrics, auditLogs, users, payments, emails, messages] = await Promise.all([
    OmniMailRepository.getSystemMetrics(),
    OmniMailRepository.getAuditLogs(),
    OmniMailRepository.getAllUsers(),
    OmniMailRepository.getAllPayments(),
    OmniMailRepository.getAllEmailAddresses(),
    OmniMailRepository.getAllMessages(),
  ]);

  return NextResponse.json({
    metrics,
    auditLogs,
    recentUsers: users,
    recentPayments: payments,
    recentEmails: emails,
    recentMessages: messages,
  });
}
