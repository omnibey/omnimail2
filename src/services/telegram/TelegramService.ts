export interface PaymentNotificationPayload {
  paymentRef: string;
  userEmail: string;
  method: string;
  amount: number;
  currency: string;
  senderIdentifier: string;
  transactionId?: string;
  hasScreenshot: boolean;
}

export class TelegramService {
  private static getCredentials() {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
    return { token, chatId };
  }

  /**
   * Sends raw formatted markdown message to admin chat via Telegram Bot API
   */
  public static async sendMessage(text: string): Promise<boolean> {
    const { token, chatId } = this.getCredentials();
    if (!token || !chatId) {
      console.info('[TelegramService] Telegram credentials not configured. Notification logged locally:\n' + text);
      return false;
    }

    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'Markdown',
          disable_web_page_preview: true,
        }),
      });

      const data = await response.json();
      return Boolean(data.ok);
    } catch (err) {
      console.error('[TelegramService] Failed to dispatch Telegram notification:', err);
      return false;
    }
  }

  /**
   * Notifies admin of new payment submission
   * (Screenshots are intentionally omitted per security & privacy architecture)
   */
  public static async notifyNewPayment(p: PaymentNotificationPayload): Promise<boolean> {
    const message = [
      `🔔 *New Payment Submitted*`,
      ``,
      `*Payment ID:* \`${p.paymentRef}\``,
      `*User:* \`${p.userEmail}\``,
      `*Method:* ${p.method.toUpperCase()}`,
      `*Amount:* ${p.currency} ${p.amount}`,
      `*Sender:* \`${p.senderIdentifier}\``,
      p.transactionId ? `*TrxID:* \`${p.transactionId}\`` : `*TrxID:* _(None provided)_`,
      `*Screenshot:* ${p.hasScreenshot ? 'Yes (Attached in Admin Panel)' : 'No'}`,
      `*Status:* Pending Verification`,
      ``,
      `_Review & verify via OmniMail Admin Panel:_`,
      `${process.env.NEXT_PUBLIC_APP_URL || 'https://omnibey.com'}/admin/payments`
    ].join('\n');

    return this.sendMessage(message);
  }

  /**
   * Notifies admin of payment approval or rejection
   */
  public static async notifyPaymentDecision(
    paymentRef: string,
    action: 'APPROVED' | 'REJECTED',
    adminEmail: string,
    reason?: string
  ): Promise<boolean> {
    const icon = action === 'APPROVED' ? '✅' : '❌';
    const message = [
      `${icon} *Payment ${action}*`,
      ``,
      `*Payment ID:* \`${paymentRef}\``,
      `*Decision:* ${action}`,
      `*Reviewed By:* \`${adminEmail}\``,
      reason ? `*Reason:* ${reason}` : '',
      `*Timestamp:* \`${new Date().toISOString()}\``
    ].filter(Boolean).join('\n');

    return this.sendMessage(message);
  }

  /**
   * Notifies admin of new user signup
   */
  public static async notifyNewUser(userEmail: string, role: string): Promise<boolean> {
    const message = [
      `👤 *New OmniMail User Registered*`,
      ``,
      `*Email:* \`${userEmail}\``,
      `*Role:* ${role}`,
      `*Joined:* \`${new Date().toISOString()}\``
    ].join('\n');

    return this.sendMessage(message);
  }

  /**
   * Notifies admin of system health or provider warnings
   */
  public static async notifySystemAlert(title: string, details: string, severity: 'WARNING' | 'CRITICAL' = 'WARNING'): Promise<boolean> {
    const icon = severity === 'CRITICAL' ? '🚨' : '⚠️';
    const message = [
      `${icon} *System Alert: ${severity}*`,
      ``,
      `*Title:* ${title}`,
      `*Details:* ${details}`,
      `*Timestamp:* \`${new Date().toISOString()}\``
    ].join('\n');

    return this.sendMessage(message);
  }
}
