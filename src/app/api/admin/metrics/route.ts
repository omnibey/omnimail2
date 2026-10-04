import { NextResponse } from 'next/server';
import { OmniMailRepository } from '@/lib/store/repository';

export async function GET() {
  const metrics = await OmniMailRepository.getSystemMetrics();
  const auditLogs = await OmniMailRepository.getAuditLogs();
  const users = await OmniMailRepository.getAllUsers();
  const payments = await OmniMailRepository.getAllPayments();
  const emails = await OmniMailRepository.getAllEmailAddresses();
  const messages = await OmniMailRepository.getAllMessages();

  return NextResponse.json({
    metrics,
    auditLogs: auditLogs.slice(0, 10),
    recentUsers: users.slice(0, 5),
    recentPayments: payments.slice(0, 5),
    recentEmails: emails.slice(0, 5),
    recentMessages: messages.slice(0, 5),
  });
}
