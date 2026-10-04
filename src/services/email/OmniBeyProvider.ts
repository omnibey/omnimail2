import { EmailAddress, EmailProviderCode, Message } from '@/types';
import { IEmailProvider, CreateAddressOptions, ProviderHealthStatus } from './EmailProvider.interface';
import { OmniMailRepository } from '@/lib/store/repository';

export class OmniBeyProvider implements IEmailProvider {
  public readonly code: EmailProviderCode = 'omnibey';
  public readonly name: string = 'OmniBey Dynamic Routing Provider';

  public async createAddress(options: CreateAddressOptions): Promise<EmailAddress> {
    return OmniMailRepository.generateEmailAddress(
      options.userId,
      options.customPrefix,
      options.userServiceTag,
      options.expiresInMinutes || 60
    );
  }

  public async receiveMessages(emailAddressId: string): Promise<Message[]> {
    return OmniMailRepository.getMessagesByEmail(emailAddressId);
  }

  public async getMessage(messageId: string): Promise<Message | null> {
    return OmniMailRepository.getMessageById(messageId);
  }

  public async deleteAddress(emailAddressId: string): Promise<boolean> {
    const email = await OmniMailRepository.getEmailAddressById(emailAddressId);
    if (!email) return false;
    return OmniMailRepository.deleteEmailAddress(emailAddressId, email.user_id);
  }

  public async getStatus(): Promise<ProviderHealthStatus> {
    return {
      provider: 'omnibey',
      name: 'OmniBey Mail Gateway (mail.omnibey.com)',
      status: 'operational',
      latencyMs: 38,
      domains: ['omnibey.com', 'mail.omnibey.com'],
      activeMailboxes: (await OmniMailRepository.getAllEmailAddresses()).length,
    };
  }
}

export const defaultEmailProvider = new OmniBeyProvider();
