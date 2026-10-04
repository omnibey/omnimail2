import { EmailAddress, EmailProviderCode, EmailProviderStatus, Message } from '@/types';

export interface CreateAddressOptions {
  userId: string;
  customPrefix?: string;
  domain?: string;
  expiresInMinutes?: number;
  userServiceTag?: string;
}

export interface ProviderHealthStatus {
  provider: EmailProviderCode;
  name: string;
  status: EmailProviderStatus;
  latencyMs: number;
  domains: string[];
  activeMailboxes: number;
}

export interface IEmailProvider {
  readonly code: EmailProviderCode;
  readonly name: string;
  
  createAddress(options: CreateAddressOptions): Promise<EmailAddress>;
  receiveMessages(emailAddressId: string): Promise<Message[]>;
  getMessage(messageId: string): Promise<Message | null>;
  deleteAddress(emailAddressId: string): Promise<boolean>;
  getStatus(): Promise<ProviderHealthStatus>;
}
