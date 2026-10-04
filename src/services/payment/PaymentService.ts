import { PaymentMethod, PaymentSubmissionInput, SystemPaymentDestination } from '@/types';
import { OmniMailRepository } from '@/lib/store/repository';

export const PAYMENT_DESTINATIONS: Record<PaymentMethod, SystemPaymentDestination> = {
  bkash: {
    type: 'Personal / Send Money',
    account: '01711-234567',
    instructions: 'Go to your bKash App, choose Send Money, enter the number above, enter package amount, and use your phone as reference.',
  },
  nagad: {
    type: 'Personal / Send Money',
    account: '01811-987654',
    instructions: 'Open Nagad App, tap Send Money, enter the number above. Keep note of the Transaction ID (TrxID) or take a screenshot.',
  },
  rocket: {
    type: 'Personal Account',
    account: '01911-345678-9',
    instructions: 'Dial *322# or use the Rocket App. Select Send Money, enter the 12-digit number above, and enter the exact package amount.',
  },
  upay: {
    type: 'Personal Account',
    account: '01611-123456',
    instructions: 'Open Upay app, select Send Money, enter the account number, and proceed with payment.',
  },
  binance: {
    type: 'Binance Pay ID / USDT TRC20',
    account: '84920194',
    wallet: 'TRC20: TLZ19xq7mP42XvaN4bA9xQoWp98Z3194',
    instructions: 'Pay directly via Binance Pay ID: 84920194, or send exact USDT (TRC-20) to the wallet address. Save Transaction Hash or screenshot.',
  },
};

export class PaymentService {
  public static getDestinations() {
    return PAYMENT_DESTINATIONS;
  }

  public static async validateAndSubmit(userId: string, input: PaymentSubmissionInput) {
    if (!input.sender_identifier || input.sender_identifier.trim().length === 0) {
      throw new Error('Sender phone number or account identifier is required.');
    }

    const hasTxId = Boolean(input.transaction_id && input.transaction_id.trim().length > 0);
    const hasScreenshot = Boolean(input.screenshot_base64 || input.screenshot_name);

    if (!hasTxId && !hasScreenshot) {
      throw new Error('Verification requires either a Transaction ID or an uploaded Payment Screenshot.');
    }

    return OmniMailRepository.submitPayment(userId, input);
  }

  public static async approve(paymentId: string, adminId: string, adminEmail?: string) {
    return OmniMailRepository.approvePayment(paymentId, adminId, adminEmail);
  }

  public static async reject(paymentId: string, adminId: string, reason: string, adminEmail?: string) {
    return OmniMailRepository.rejectPayment(paymentId, adminId, reason, adminEmail);
  }
}
