import { EmailProviderCode } from '@/types';
import { IEmailProvider } from './EmailProvider.interface';
import { OmniBeyProvider, defaultEmailProvider } from './OmniBeyProvider';

export class EmailProviderRegistry {
  private static providers: Map<EmailProviderCode, IEmailProvider> = new Map();

  static {
    this.register(defaultEmailProvider);
  }

  public static register(provider: IEmailProvider) {
    this.providers.set(provider.code, provider);
  }

  public static get(code: EmailProviderCode = 'omnibey'): IEmailProvider {
    const provider = this.providers.get(code);
    if (!provider) {
      return defaultEmailProvider;
    }
    return provider;
  }

  public static getAll(): IEmailProvider[] {
    return Array.from(this.providers.values());
  }
}
