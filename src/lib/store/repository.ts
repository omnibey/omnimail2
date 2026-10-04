import { 
  UserProfile, EmailAddress, Message, CreditPackage, 
  CreditTransaction, Payment, AuditLog, CompatibilityItem, 
  PaymentSubmissionInput, PaymentMethod 
} from '@/types';
import { 
  INITIAL_PACKAGES, INITIAL_USERS, INITIAL_EMAILS, 
  INITIAL_MESSAGES, INITIAL_PAYMENTS, INITIAL_TRANSACTIONS, 
  INITIAL_COMPATIBILITY, INITIAL_AUDIT_LOGS 
} from './mockStore';
import { TelegramService } from '@/services/telegram/TelegramService';
import { OTPService } from '@/services/otp/OTPService';

// In-memory persistent state during server runtime
class MemoryStore {
  public users: Map<string, UserProfile> = new Map();
  public emails: Map<string, EmailAddress> = new Map();
  public messages: Map<string, Message> = new Map();
  public packages: Map<string, CreditPackage> = new Map();
  public payments: Map<string, Payment> = new Map();
  public transactions: CreditTransaction[] = [];
  public auditLogs: AuditLog[] = [];
  public compatibility: CompatibilityItem[] = [];

  constructor() {
    this.reset();
  }

  public reset() {
    this.users.clear();
    this.emails.clear();
    this.messages.clear();
    this.packages.clear();
    this.payments.clear();
    this.transactions = [];
    this.auditLogs = [];
    this.compatibility = [];

    INITIAL_USERS.forEach(u => this.users.set(u.id, { ...u }));
    INITIAL_EMAILS.forEach(e => this.emails.set(e.id, { ...e }));
    INITIAL_MESSAGES.forEach(m => this.messages.set(m.id, { ...m }));
    INITIAL_PACKAGES.forEach(p => this.packages.set(p.id, { ...p }));
    INITIAL_PAYMENTS.forEach(p => this.payments.set(p.id, { ...p }));
    this.transactions = INITIAL_TRANSACTIONS.map(t => ({ ...t }));
    this.auditLogs = INITIAL_AUDIT_LOGS.map(a => ({ ...a }));
    this.compatibility = INITIAL_COMPATIBILITY.map(c => ({ ...c }));
  }
}

// Global singleton across server invocations
const globalStore = (globalThis as unknown as { __omnimail_store?: MemoryStore });
if (!globalStore.__omnimail_store) {
  globalStore.__omnimail_store = new MemoryStore();
}
const store = globalStore.__omnimail_store;

export class OmniMailRepository {
  // ================= USERS & AUTH =================
  public static async getCurrentUser(userId: string = 'user-demo-1'): Promise<UserProfile | null> {
    return store.users.get(userId) || null;
  }

  public static async getUserByEmail(email: string): Promise<UserProfile | null> {
    for (const user of store.users.values()) {
      if (user.email.toLowerCase() === email.toLowerCase()) {
        return user;
      }
    }
    return null;
  }

  public static async getAllUsers(): Promise<UserProfile[]> {
    return Array.from(store.users.values());
  }

  public static async updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile | null> {
    const user = store.users.get(userId);
    if (!user) return null;
    const updated = { ...user, ...data, updated_at: new Date().toISOString() };
    store.users.set(userId, updated);
    return updated;
  }

  public static async createUser(name: string, email: string, role: 'user' | 'admin' = 'user'): Promise<UserProfile> {
    const existing = await this.getUserByEmail(email);
    if (existing) return existing;

    const id = `user-${Date.now()}`;
    const newUser: UserProfile = {
      id,
      name,
      email,
      role: email === 'admin@omnibey.com' ? 'admin' : role,
      credits: 15, // 15 free trial credits
      account_status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    store.users.set(id, newUser);

    // Initial bonus transaction
    store.transactions.unshift({
      id: `tx-${Date.now()}`,
      user_id: id,
      amount: 15,
      transaction_type: 'bonus',
      balance_after: 15,
      reference_id: 'welcome-bonus',
      reference_type: 'signup',
      description: 'Welcome bonus trial credits',
      created_at: new Date().toISOString(),
    });

    TelegramService.notifyNewUser(email, newUser.role).catch(() => {});
    return newUser;
  }

  // ================= EMAIL ADDRESSES =================
  public static async getEmailAddressesByUser(userId: string): Promise<EmailAddress[]> {
    return Array.from(store.emails.values())
      .filter(e => e.user_id === userId && e.status !== 'deleted')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public static async getAllEmailAddresses(): Promise<EmailAddress[]> {
    return Array.from(store.emails.values())
      .filter(e => e.status !== 'deleted')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public static async getEmailAddressById(id: string): Promise<EmailAddress | null> {
    const email = store.emails.get(id);
    return email && email.status !== 'deleted' ? email : null;
  }

  public static async generateEmailAddress(
    userId: string, 
    customPrefix?: string, 
    userServiceTag?: string,
    expiresInMinutes: number = 60
  ): Promise<EmailAddress> {
    const prefixes = ['quickbox', 'verifybox', 'maildrop', 'inbox', 'tempbox', 'testmail', 'cloudbox'];
    const randomWord = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomNum = Math.floor(10 + Math.random() * 899);
    const prefix = (customPrefix?.trim().toLowerCase().replace(/[^a-z0-9]/g, '') || `${randomWord}${randomNum}`);
    const domain = 'omnibey.com';
    const emailAddress = `${prefix}@${domain}`;

    const id = `email-${Date.now()}`;
    const newEmail: EmailAddress = {
      id,
      user_id: userId,
      email_address: emailAddress,
      prefix,
      domain,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + expiresInMinutes * 60000).toISOString(),
      status: 'active',
      usage_count: 0,
      message_count: 0,
      otp_count: 0,
      user_service_tag: userServiceTag || undefined,
    };

    store.emails.set(id, newEmail);
    return newEmail;
  }

  public static async deleteEmailAddress(id: string, userId: string): Promise<boolean> {
    const email = store.emails.get(id);
    if (!email || email.user_id !== userId) return false;
    email.status = 'deleted';
    store.emails.set(id, email);
    return true;
  }

  public static async extendEmailExpiration(id: string, additionalMinutes: number = 60): Promise<EmailAddress | null> {
    const email = store.emails.get(id);
    if (!email) return null;
    const currentExpiry = new Date(email.expires_at).getTime();
    const baseTime = currentExpiry > Date.now() ? currentExpiry : Date.now();
    email.expires_at = new Date(baseTime + additionalMinutes * 60000).toISOString();
    email.status = 'active';
    store.emails.set(id, email);
    return email;
  }

  // ================= MESSAGES & INBOX =================
  public static async getMessagesByEmail(emailAddressId: string): Promise<Message[]> {
    return Array.from(store.messages.values())
      .filter(m => m.email_address_id === emailAddressId)
      .sort((a, b) => new Date(b.received_at).getTime() - new Date(a.received_at).getTime());
  }

  public static async getMessagesByUser(userId: string): Promise<Message[]> {
    return Array.from(store.messages.values())
      .filter(m => m.user_id === userId)
      .sort((a, b) => new Date(b.received_at).getTime() - new Date(a.received_at).getTime());
  }

  public static async getAllMessages(): Promise<Message[]> {
    return Array.from(store.messages.values())
      .sort((a, b) => new Date(b.received_at).getTime() - new Date(a.received_at).getTime());
  }

  public static async getMessageById(messageId: string): Promise<Message | null> {
    return store.messages.get(messageId) || null;
  }

  public static async markMessageRead(messageId: string): Promise<boolean> {
    const msg = store.messages.get(messageId);
    if (!msg) return false;
    msg.is_read = true;
    store.messages.set(messageId, msg);
    return true;
  }

  public static async deleteMessage(messageId: string): Promise<boolean> {
    return store.messages.delete(messageId);
  }

  /**
   * Simulates receiving an incoming email into a temporary mailbox.
   * Runs heuristic OTP detection and updates mailbox counters.
   */
  public static async receiveIncomingMessage(
    emailAddressId: string,
    sender: string,
    subject: string,
    bodyText: string,
    bodyHtml?: string
  ): Promise<Message | null> {
    const email = store.emails.get(emailAddressId);
    if (!email) return null;

    const detected = OTPService.detect(subject, bodyText, bodyHtml);

    const messageId = `msg-${Date.now()}`;
    const newMsg: Message = {
      id: messageId,
      email_address_id: emailAddressId,
      user_id: email.user_id,
      sender,
      recipient: email.email_address,
      subject,
      body_text: bodyText,
      body_html: bodyHtml,
      detected_otp: detected?.code,
      otp_confidence: detected?.confidence,
      is_read: false,
      received_at: new Date().toISOString(),
    };

    store.messages.set(messageId, newMsg);

    // Update email counters
    email.message_count += 1;
    if (detected?.code) {
      email.otp_count += 1;
    }
    email.last_message_at = newMsg.received_at;
    email.last_used_at = newMsg.received_at;
    store.emails.set(emailAddressId, email);

    return newMsg;
  }

  // ================= CREDIT PACKAGES & TRANSACTIONS =================
  public static async getPackages(): Promise<CreditPackage[]> {
    return Array.from(store.packages.values())
      .sort((a, b) => a.display_order - b.display_order);
  }

  public static async getPackageById(id: string): Promise<CreditPackage | null> {
    return store.packages.get(id) || null;
  }

  public static async getTransactionsByUser(userId: string): Promise<CreditTransaction[]> {
    return store.transactions
      .filter(t => t.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public static async adjustUserCredits(
    userId: string,
    amount: number,
    adminId: string,
    reason: string
  ): Promise<{ success: boolean; newBalance: number }> {
    const user = store.users.get(userId);
    if (!user) throw new Error('User not found');

    const newBalance = user.credits + amount;
    if (newBalance < 0) throw new Error('Resulting balance cannot be negative');

    user.credits = newBalance;
    store.users.set(userId, user);

    const tx: CreditTransaction = {
      id: `tx-${Date.now()}`,
      user_id: userId,
      amount,
      transaction_type: 'admin_adjustment',
      balance_after: newBalance,
      reference_id: adminId,
      reference_type: 'admin',
      description: `Manual adjustment by admin: ${reason}`,
      created_at: new Date().toISOString(),
    };
    store.transactions.unshift(tx);

    store.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      admin_id: adminId,
      action: 'credits_adjusted',
      target_type: 'user',
      target_id: userId,
      details: { amount, newBalance, reason },
      created_at: new Date().toISOString(),
    });

    return { success: true, newBalance };
  }

  // ================= PAYMENTS (MANUAL GATEWAY) =================
  public static async submitPayment(userId: string, input: PaymentSubmissionInput): Promise<Payment> {
    // 1. Validation: Sender Identifier is strictly required
    if (!input.sender_identifier || input.sender_identifier.trim().length === 0) {
      throw new Error('Sender Number / Account Identifier is required.');
    }

    // 2. Validation: At least ONE of Transaction ID OR Screenshot must be provided
    const hasTxId = Boolean(input.transaction_id && input.transaction_id.trim().length > 0);
    const hasScreenshot = Boolean(input.screenshot_base64 || input.screenshot_name);

    if (!hasTxId && !hasScreenshot) {
      throw new Error('At least one of Transaction ID or Payment Screenshot must be provided.');
    }

    const user = store.users.get(userId);
    if (!user) throw new Error('User account not found');

    const pkg = store.packages.get(input.package_id);
    if (!pkg) throw new Error('Selected package not found');

    const paymentNum = Math.floor(10000 + Math.random() * 89999);
    const paymentRef = `PAY-${paymentNum}`;
    const id = `pay-${Date.now()}`;

    const newPayment: Payment = {
      id,
      payment_ref: paymentRef,
      user_id: userId,
      user_email: user.email,
      user_name: user.name,
      package_id: pkg.id,
      package_name: `${pkg.name} (${pkg.credits + pkg.bonus} Credits)`,
      amount: pkg.price,
      currency: pkg.currency,
      payment_method: input.payment_method,
      sender_identifier: input.sender_identifier.trim(),
      transaction_id: input.transaction_id?.trim() || undefined,
      screenshot_path: hasScreenshot ? `proofs/${id}-${input.screenshot_name || 'proof.png'}` : undefined,
      screenshot_url: hasScreenshot ? input.screenshot_base64 : undefined,
      status: 'pending',
      submitted_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    store.payments.set(id, newPayment);

    // Dispatch Telegram admin notification asynchronously
    TelegramService.notifyNewPayment({
      paymentRef,
      userEmail: user.email,
      method: input.payment_method,
      amount: pkg.price,
      currency: pkg.currency,
      senderIdentifier: input.sender_identifier,
      transactionId: input.transaction_id,
      hasScreenshot,
    }).catch(() => {});

    return newPayment;
  }

  public static async getPaymentsByUser(userId: string): Promise<Payment[]> {
    return Array.from(store.payments.values())
      .filter(p => p.user_id === userId)
      .sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());
  }

  public static async getAllPayments(): Promise<Payment[]> {
    return Array.from(store.payments.values())
      .sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());
  }

  public static async getPaymentById(id: string): Promise<Payment | null> {
    return store.payments.get(id) || null;
  }

  /**
   * Approves a payment with atomic idempotency protection.
   * If already approved, returns immediately without re-adding credits.
   * Automatically deletes the screenshot to free storage per specification.
   */
  public static async approvePayment(
    paymentId: string, 
    adminId: string,
    adminEmail: string = 'admin@omnibey.com'
  ): Promise<{ success: boolean; payment: Payment; creditsAdded: number }> {
    const payment = store.payments.get(paymentId);
    if (!payment) throw new Error('Payment record not found');

    // IDEMPOTENCY GUARD: One payment must never add credits twice
    if (payment.status === 'approved') {
      return { success: false, payment, creditsAdded: 0 };
    }
    if (payment.status === 'rejected') {
      throw new Error('Cannot approve an already rejected payment');
    }

    const pkg = store.packages.get(payment.package_id);
    const user = store.users.get(payment.user_id);
    if (!pkg || !user) throw new Error('Associated package or user profile missing');

    const totalCredits = pkg.credits + pkg.bonus;
    const newBalance = user.credits + totalCredits;

    // 1. Update user balance
    user.credits = newBalance;
    store.users.set(user.id, user);

    // 2. Create single immutable credit transaction
    const tx: CreditTransaction = {
      id: `tx-${Date.now()}`,
      user_id: user.id,
      amount: totalCredits,
      transaction_type: 'purchase',
      balance_after: newBalance,
      reference_id: payment.payment_ref,
      reference_type: 'payment',
      description: `Purchased ${pkg.name} (${pkg.credits} credits + ${pkg.bonus} bonus)`,
      created_at: new Date().toISOString(),
    };
    store.transactions.unshift(tx);

    // 3. Mark payment as approved and PURGE screenshot immediately to free storage
    payment.status = 'approved';
    payment.reviewed_at = new Date().toISOString();
    payment.reviewed_by = adminId;
    payment.reviewer_name = 'OmniBey Admin';
    payment.screenshot_path = undefined; // Storage Freed
    payment.screenshot_url = undefined;
    payment.updated_at = new Date().toISOString();
    store.payments.set(paymentId, payment);

    // 4. Record audit log
    store.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      admin_id: adminId,
      admin_email: adminEmail,
      action: 'payment_approved',
      target_type: 'payment',
      target_id: payment.payment_ref,
      details: {
        amount: payment.amount,
        credits_added: totalCredits,
        new_balance: newBalance,
        method: payment.payment_method,
      },
      created_at: new Date().toISOString(),
    });

    // 5. Notify Telegram admin channel
    TelegramService.notifyPaymentDecision(payment.payment_ref, 'APPROVED', adminEmail).catch(() => {});

    return { success: true, payment, creditsAdded: totalCredits };
  }

  /**
   * Rejects a payment with a required reason.
   */
  public static async rejectPayment(
    paymentId: string, 
    adminId: string, 
    reason: string,
    adminEmail: string = 'admin@omnibey.com'
  ): Promise<{ success: boolean; payment: Payment }> {
    const payment = store.payments.get(paymentId);
    if (!payment) throw new Error('Payment record not found');

    if (payment.status === 'approved') {
      throw new Error('Cannot reject an approved payment');
    }

    payment.status = 'rejected';
    payment.rejection_reason = reason || 'Verification failed. Details did not match transaction records.';
    payment.reviewed_at = new Date().toISOString();
    payment.reviewed_by = adminId;
    payment.reviewer_name = 'OmniBey Admin';
    payment.updated_at = new Date().toISOString();
    store.payments.set(paymentId, payment);

    // Record audit log
    store.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      admin_id: adminId,
      admin_email: adminEmail,
      action: 'payment_rejected',
      target_type: 'payment',
      target_id: payment.payment_ref,
      details: { reason: payment.rejection_reason },
      created_at: new Date().toISOString(),
    });

    TelegramService.notifyPaymentDecision(payment.payment_ref, 'REJECTED', adminEmail, payment.rejection_reason).catch(() => {});

    return { success: true, payment };
  }

  // ================= ADMIN AUDIT & ANALYTICS =================
  public static async getAuditLogs(): Promise<AuditLog[]> {
    return [...store.auditLogs];
  }

  public static async getCompatibilitySummary(): Promise<CompatibilityItem[]> {
    return [...store.compatibility];
  }

  public static async getSystemMetrics() {
    const totalUsers = store.users.size;
    const activeEmails = Array.from(store.emails.values()).filter(e => e.status === 'active').length;
    const expiredEmails = Array.from(store.emails.values()).filter(e => e.status === 'expired').length;
    const totalMessages = store.messages.size;
    const otpDetections = Array.from(store.messages.values()).filter(m => Boolean(m.detected_otp)).length;
    const pendingPayments = Array.from(store.payments.values()).filter(p => p.status === 'pending').length;
    const approvedPayments = Array.from(store.payments.values()).filter(p => p.status === 'approved');
    const totalRevenue = approvedPayments.reduce((acc, p) => acc + p.amount, 0);

    return {
      totalUsers,
      activeUsers: totalUsers,
      activeEmails,
      expiredEmails,
      totalMessages,
      otpDetections,
      pendingPayments,
      approvedPaymentsCount: approvedPayments.length,
      totalRevenue,
      providerStatus: 'operational',
      systemHealth: '99.98%',
    };
  }
}
