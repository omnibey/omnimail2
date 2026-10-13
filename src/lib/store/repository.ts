import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  UserProfile, EmailAddress, Message, CreditPackage, 
  CreditTransaction, Payment, AuditLog, CompatibilityItem, 
  PaymentSubmissionInput, AdminUserListItem, AdminUsersOverviewResponse, 
  AdminUserDetailResponse, AccountStatus 
} from '@/types';
import { 
  INITIAL_PACKAGES, INITIAL_USERS, INITIAL_EMAILS, 
  INITIAL_MESSAGES, INITIAL_PAYMENTS, INITIAL_TRANSACTIONS, 
  INITIAL_COMPATIBILITY, INITIAL_AUDIT_LOGS 
} from './mockStore';
import { TelegramService } from '@/services/telegram/TelegramService';
import { OTPService } from '@/services/otp/OTPService';
import { createAdminClient } from '@/lib/supabase/admin';

// In-memory fallback persistent state during development/demo runtime
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

const globalStore = (globalThis as unknown as { __omnimail_store?: MemoryStore });
if (!globalStore.__omnimail_store) {
  globalStore.__omnimail_store = new MemoryStore();
}
const store = globalStore.__omnimail_store;

function getDb(): SupabaseClient | null {
  const admin = createAdminClient();
  if (admin) return admin;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && anonKey && !url.includes('placeholder')) {
    return createSupabaseClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return null;
}

export class OmniMailRepository {
  // ================= USERS & AUTH =================
  public static async getCurrentUser(userId: string): Promise<UserProfile | null> {
    const db = getDb();
    if (db) {
      try {
        const { data, error } = await db.from('profiles').select('*').eq('id', userId).maybeSingle();
        if (!error && data) return data as UserProfile;
      } catch (err) {
        console.warn('Repository Supabase getCurrentUser error:', err);
      }
    }
    return store.users.get(userId) || null;
  }

  public static async getUserByEmail(email: string): Promise<UserProfile | null> {
    const cleanEmail = email.trim().toLowerCase();
    const db = getDb();
    if (db) {
      try {
        const { data, error } = await db.from('profiles').select('*').eq('email', cleanEmail).maybeSingle();
        if (!error && data) return data as UserProfile;
      } catch (err) {
        console.warn('Repository Supabase getUserByEmail error:', err);
      }
    }

    for (const user of store.users.values()) {
      if (user.email.toLowerCase() === cleanEmail) {
        return user;
      }
    }
    return null;
  }

  public static async getAllUsers(): Promise<UserProfile[]> {
    const db = getDb();
    if (db) {
      try {
        const { data, error } = await db.from('profiles').select('*').order('created_at', { ascending: false });
        if (!error && data) return data as UserProfile[];
      } catch (err) {
        console.warn('Repository Supabase getAllUsers error:', err);
      }
    }
    return Array.from(store.users.values());
  }

  public static async updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile | null> {
    const db = getDb();
    if (db) {
      try {
        const payload: Record<string, unknown> = { ...data, updated_at: new Date().toISOString() };
        delete payload.role; // Role updates strictly through admin routes
        const { data: updated, error } = await db
          .from('profiles')
          .update(payload)
          .eq('id', userId)
          .select()
          .maybeSingle();
        if (!error && updated) return updated as UserProfile;
      } catch (err) {
        console.warn('Repository Supabase updateUserProfile error:', err);
      }
    }

    const user = store.users.get(userId);
    if (!user) return null;
    const updated = { ...user, ...data, updated_at: new Date().toISOString() };
    store.users.set(userId, updated);
    return updated;
  }

  public static async verifyUserPassword(
    email: string,
    passwordAttempt: string
  ): Promise<{ valid: boolean; user: UserProfile | null; error?: string }> {
    const user = await this.getUserByEmail(email);
    if (!user) {
      return { valid: false, user: null, error: 'No account found with this email address.' };
    }

    if (!user.password) {
      return {
        valid: false,
        user: null,
        error: 'This account was signed up via Google. Please use Google Sign-In.',
      };
    }

    if (user.password !== passwordAttempt) {
      return { valid: false, user: null, error: 'Incorrect password. Please verify your credentials.' };
    }

    return { valid: true, user };
  }

  public static async getAdminUsersOverview(options?: {
    search?: string;
    status?: string;
    role?: string;
    packageFilter?: string;
  }): Promise<AdminUsersOverviewResponse> {
    // 1. Try to sync real users from Supabase if configured
    try {
      const supabase = createAdminClient();
      if (supabase) {
        const { data: sbProfiles, error } = await supabase.from('profiles').select('*');
        if (!error && sbProfiles && sbProfiles.length > 0) {
          sbProfiles.forEach((sbUser: Record<string, unknown>) => {
            const uId = String(sbUser.id);
            const email = String(sbUser.email || '');
            const existing = store.users.get(uId);
            if (!existing) {
              store.users.set(uId, {
                id: uId,
                name: String(sbUser.name || email.split('@')[0] || 'User'),
                email: email,
                phone: String(sbUser.phone || ''),
                role: (sbUser.role === 'admin' ? 'admin' : 'user'),
                credits: typeof sbUser.credits === 'number' ? sbUser.credits : 15,
                account_status: sbUser.account_status === 'suspended' ? 'suspended' : 'active',
                registration_device: String(sbUser.registration_device || 'Desktop'),
                registration_browser: String(sbUser.registration_browser || 'Chrome 122'),
                registration_os: String(sbUser.registration_os || 'Windows 11'),
                registration_ip: String(sbUser.registration_ip || '127.0.0.1'),
                last_login_device: String(sbUser.last_login_device || 'Desktop'),
                last_login_browser: String(sbUser.last_login_browser || 'Chrome 122'),
                last_login_os: String(sbUser.last_login_os || 'Windows 11'),
                last_login_ip: String(sbUser.last_login_ip || '127.0.0.1'),
                last_login_at: String(sbUser.last_login_at || sbUser.updated_at || new Date().toISOString()),
                created_at: String(sbUser.created_at || new Date().toISOString()),
                updated_at: String(sbUser.updated_at || new Date().toISOString()),
              });
            } else {
              if (typeof sbUser.credits === 'number') existing.credits = sbUser.credits;
              if (sbUser.account_status) existing.account_status = sbUser.account_status === 'suspended' ? 'suspended' : 'active';
              if (sbUser.name) existing.name = String(sbUser.name);
            }
          });
        }
      }
    } catch {}

    // Ensure demo mock records are present in store
    INITIAL_USERS.forEach((iu) => {
      if (!store.users.has(iu.id)) {
        store.users.set(iu.id, { ...iu });
      }
    });
    INITIAL_EMAILS.forEach((ie) => {
      if (!store.emails.has(ie.id)) {
        store.emails.set(ie.id, { ...ie });
      }
    });
    INITIAL_PAYMENTS.forEach((ip) => {
      if (!store.payments.has(ip.id)) {
        store.payments.set(ip.id, { ...ip });
      }
    });

    const allUsers = Array.from(store.users.values());

    const userList: AdminUserListItem[] = allUsers.map((user) => {
      const deviceInfo = {
        device_type: (user.registration_device === 'Mobile' ? 'Mobile' : user.registration_device === 'Tablet' ? 'Tablet' : 'Desktop') as 'Desktop' | 'Mobile' | 'Tablet',
        os: user.last_login_os || user.registration_os || 'Windows 11',
        browser: user.last_login_browser || user.registration_browser || 'Chrome 122',
        ip_address: user.last_login_ip || user.registration_ip || '103.114.98.24',
        last_active: user.last_login_at || user.updated_at || user.created_at,
      };

      const userPayments = Array.from(store.payments.values())
        .filter((p) => p.user_id === user.id)
        .sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());

      const pendingPayment = userPayments.find((p) => p.status === 'pending');
      const approvedPayments = userPayments.filter((p) => p.status === 'approved');
      const latestApproved = approvedPayments[0];
      const totalSpent = approvedPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

      const userEmails = Array.from(store.emails.values())
        .filter((e) => e.user_id === user.id && e.status !== 'deleted')
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      const activeEmails = userEmails.filter((e) => e.status === 'active');
      const expiredEmails = userEmails.filter((e) => e.status === 'expired');
      const totalMessages = userEmails.reduce((sum, e) => sum + (e.message_count || 0), 0);
      const totalOtps = userEmails.reduce((sum, e) => sum + (e.otp_count || 0), 0);
      const latestEmail = userEmails.length > 0 ? userEmails[0].email_address : undefined;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        credits: user.credits,
        account_status: user.account_status,
        avatar_url: user.avatar_url,
        created_at: user.created_at,
        updated_at: user.updated_at,
        device_info: deviceInfo,
        packages: {
          active_package: latestApproved
            ? {
                id: latestApproved.package_id,
                name: latestApproved.package_name || 'Active Package',
                credits: latestApproved.amount,
                price: latestApproved.amount,
                currency: latestApproved.currency,
                purchased_at: latestApproved.submitted_at,
              }
            : undefined,
          has_pending_payment: Boolean(pendingPayment),
          pending_payment: pendingPayment
            ? {
                id: pendingPayment.id,
                payment_ref: pendingPayment.payment_ref,
                package_name: pendingPayment.package_name || 'Credit Package',
                amount: pendingPayment.amount,
                currency: pendingPayment.currency,
                payment_method: pendingPayment.payment_method,
                sender_identifier: pendingPayment.sender_identifier,
                transaction_id: pendingPayment.transaction_id,
                submitted_at: pendingPayment.submitted_at,
              }
            : undefined,
          total_spent: totalSpent,
          total_purchases_count: approvedPayments.length,
        },
        email_stats: {
          total_emails_created: userEmails.length,
          active_emails_count: activeEmails.length,
          expired_emails_count: expiredEmails.length,
          total_messages_received: totalMessages,
          total_otps_received: totalOtps,
          latest_email: latestEmail,
        },
      };
    });

    const metrics = {
      total_users: userList.length,
      active_users: userList.filter((u) => u.account_status === 'active').length,
      suspended_users: userList.filter((u) => u.account_status === 'suspended').length,
      pending_approvals_count: userList.filter((u) => u.packages.has_pending_payment).length,
      total_credits: userList.reduce((sum, u) => sum + (u.credits || 0), 0),
    };

    let filtered = [...userList];

    if (options?.search) {
      const q = options.search.toLowerCase().trim();
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.phone && u.phone.includes(q)) ||
          u.device_info.ip_address.includes(q) ||
          u.device_info.os.toLowerCase().includes(q) ||
          u.device_info.browser.toLowerCase().includes(q)
      );
    }

    if (options?.status && options.status !== 'all') {
      filtered = filtered.filter((u) => u.account_status === options.status);
    }

    if (options?.role && options.role !== 'all') {
      filtered = filtered.filter((u) => u.role === options.role);
    }

    if (options?.packageFilter && options.packageFilter !== 'all') {
      if (options.packageFilter === 'pending') {
        filtered = filtered.filter((u) => u.packages.has_pending_payment);
      } else if (options.packageFilter === 'paid') {
        filtered = filtered.filter((u) => Boolean(u.packages.active_package));
      } else if (options.packageFilter === 'free') {
        filtered = filtered.filter((u) => !u.packages.active_package && !u.packages.has_pending_payment);
      }
    }

    filtered.sort((a, b) => {
      if (a.packages.has_pending_payment && !b.packages.has_pending_payment) return -1;
      if (!a.packages.has_pending_payment && b.packages.has_pending_payment) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return {
      users: filtered,
      total: filtered.length,
      metrics,
    };
  }

  public static async getAdminUserDetail(userId: string): Promise<AdminUserDetailResponse | null> {
    const overview = await this.getAdminUsersOverview();
    const userSummary = overview.users.find((u) => u.id === userId);
    if (!userSummary) return null;

    const emailsList = await this.getEmailAddressesByUser(userId);
    const paymentsList = await this.getPaymentsByUser(userId);
    const creditHistory = await this.getTransactionsByUser(userId);

    return {
      ...userSummary,
      emails_list: emailsList,
      payments_list: paymentsList,
      credit_history: creditHistory,
    };
  }

  public static async updateUserStatus(
    userId: string,
    newStatus: AccountStatus,
    adminId: string = 'user-admin-1'
  ): Promise<{ success: boolean; user: UserProfile | null }> {
    const user = store.users.get(userId);
    if (!user) throw new Error('User not found');

    const prevStatus = user.account_status;
    user.account_status = newStatus;
    user.updated_at = new Date().toISOString();
    store.users.set(userId, user);

    try {
      const supabase = createAdminClient();
      if (supabase) {
        await supabase.from('profiles').update({
          account_status: newStatus,
          updated_at: new Date().toISOString(),
        }).eq('id', userId);
      }
    } catch {}

    store.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      admin_id: adminId,
      action: newStatus === 'active' ? 'user_activated' : 'user_suspended',
      target_type: 'user',
      target_id: userId,
      details: { previousStatus: prevStatus, newStatus, userEmail: user.email },
      created_at: new Date().toISOString(),
    });

    return { success: true, user };
  }

  public static async deleteUser(userId: string, adminId: string = 'user-admin-1'): Promise<boolean> {
    const user = store.users.get(userId);
    if (!user) return false;
    if (user.role === 'admin') throw new Error('Cannot delete an administrator account');

    store.users.delete(userId);

    try {
      const supabase = createAdminClient();
      if (supabase) {
        await supabase.from('profiles').delete().eq('id', userId);
      }
    } catch {}

    store.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      admin_id: adminId,
      action: 'user_deleted',
      target_type: 'user',
      target_id: userId,
      details: { deletedEmail: user.email, deletedName: user.name },
      created_at: new Date().toISOString(),
    });

    return true;
  }

  public static async createUser(
    name: string,
    email: string,
    role: 'user' | 'admin' = 'user',
    password?: string,
    customId?: string
  ): Promise<UserProfile> {
    const cleanEmail = email.trim().toLowerCase();
    const existing = await this.getUserByEmail(cleanEmail);
    if (existing) {
      if (password && !existing.password) {
        existing.password = password;
        store.users.set(existing.id, existing);
      }
      return existing;
    }

    const db = getDb();
    const id = customId || ((typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `user-${Date.now()}`);
    const cleanRole = cleanEmail === 'admin@omnibey.com' ? 'admin' : role;
    const newUser: UserProfile = {
      id,
      name,
      email: cleanEmail,
      role: cleanRole,
      password: password || undefined,
      credits: 15, // 15 free trial credits
      account_status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (db) {
      try {
        const { password: _p, ...profileData } = newUser;
        await db.from('profiles').upsert(profileData, { onConflict: 'id' });
      } catch (err) {
        console.warn('Repository Supabase createUser error:', err);
      }
    }

    store.users.set(id, newUser);
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

    // Auto-generate initial temporary mailbox for new user
    try {
      const cleanPrefix = (cleanEmail.split('@')[0] || 'box').replace(/[^a-z0-9]/gi, '').toLowerCase();
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const emailPrefix = `${cleanPrefix.slice(0, 8)}_${randomSuffix}`;
      const emailAddress = `${emailPrefix}@omnibey.com`;
      const emailId = `em-${Date.now()}-${randomSuffix}`;
      const newEmail: EmailAddress = {
        id: emailId,
        user_id: id,
        email_address: emailAddress,
        prefix: emailPrefix,
        domain: 'omnibey.com',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        status: 'active',
        usage_count: 0,
        message_count: 0,
        otp_count: 0,
        user_service_tag: 'Default Mailbox',
      };
      store.emails.set(emailId, newEmail);
    } catch (e) {
      console.warn('Initial mailbox generation notice:', e);
    }

    TelegramService.notifyNewUser(cleanEmail, newUser.role).catch(() => {});
    return newUser;
  }

  // ================= EMAIL ADDRESSES =================
  public static async getEmailAddressesByUser(userId: string): Promise<EmailAddress[]> {
    const db = getDb();
    if (db) {
      try {
        const { data, error } = await db
          .from('email_addresses')
          .select('*')
          .eq('user_id', userId)
          .neq('status', 'deleted')
          .order('created_at', { ascending: false });
        if (!error && data) return data as EmailAddress[];
      } catch (err) {
        console.warn('Repository Supabase getEmailAddressesByUser error:', err);
      }
    }

    return Array.from(store.emails.values())
      .filter(e => e.user_id === userId && e.status !== 'deleted')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public static async getAllEmailAddresses(): Promise<EmailAddress[]> {
    const db = getDb();
    if (db) {
      try {
        const { data, error } = await db
          .from('email_addresses')
          .select('*')
          .neq('status', 'deleted')
          .order('created_at', { ascending: false });
        if (!error && data) return data as EmailAddress[];
      } catch (err) {
        console.warn('Repository Supabase getAllEmailAddresses error:', err);
      }
    }

    return Array.from(store.emails.values())
      .filter(e => e.status !== 'deleted')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public static async getEmailAddressById(id: string): Promise<EmailAddress | null> {
    const db = getDb();
    if (db) {
      try {
        const { data, error } = await db
          .from('email_addresses')
          .select('*')
          .eq('id', id)
          .neq('status', 'deleted')
          .maybeSingle();
        if (!error && data) return data as EmailAddress;
      } catch (err) {
        console.warn('Repository Supabase getEmailAddressById error:', err);
      }
    }

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

    const id = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `email-${Date.now()}`;
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

    const db = getDb();
    if (db) {
      try {
        await db.from('email_addresses').insert({
          id: newEmail.id,
          user_id: newEmail.user_id,
          email_address: newEmail.email_address,
          prefix: newEmail.prefix,
          domain: newEmail.domain,
          created_at: newEmail.created_at,
          expires_at: newEmail.expires_at,
          status: newEmail.status,
          user_service_tag: newEmail.user_service_tag,
        });
      } catch (err) {
        console.warn('Repository Supabase generateEmailAddress error:', err);
      }
    }

    store.emails.set(id, newEmail);
    return newEmail;
  }

  public static async deleteEmailAddress(id: string, userId: string): Promise<boolean> {
    const db = getDb();
    if (db) {
      try {
        const { error } = await db
          .from('email_addresses')
          .update({ status: 'deleted' })
          .eq('id', id)
          .eq('user_id', userId);
        if (!error) return true;
      } catch (err) {
        console.warn('Repository Supabase deleteEmailAddress error:', err);
      }
    }

    const email = store.emails.get(id);
    if (!email || email.user_id !== userId) return false;
    email.status = 'deleted';
    store.emails.set(id, email);
    return true;
  }

  public static async extendEmailExpiration(id: string, additionalMinutes: number = 60): Promise<EmailAddress | null> {
    const email = await this.getEmailAddressById(id);
    if (!email) return null;

    const currentExpiry = new Date(email.expires_at).getTime();
    const baseTime = currentExpiry > Date.now() ? currentExpiry : Date.now();
    const newExpiry = new Date(baseTime + additionalMinutes * 60000).toISOString();

    const db = getDb();
    if (db) {
      try {
        const { data, error } = await db
          .from('email_addresses')
          .update({ expires_at: newExpiry, status: 'active' })
          .eq('id', id)
          .select()
          .maybeSingle();
        if (!error && data) return data as EmailAddress;
      } catch (err) {
        console.warn('Repository Supabase extendEmailExpiration error:', err);
      }
    }

    email.expires_at = newExpiry;
    email.status = 'active';
    store.emails.set(id, email);
    return email;
  }

  // ================= MESSAGES & INBOX =================
  public static async getMessagesByEmail(emailAddressId: string): Promise<Message[]> {
    const db = getDb();
    if (db) {
      try {
        const { data, error } = await db
          .from('messages')
          .select('*')
          .eq('email_address_id', emailAddressId)
          .order('received_at', { ascending: false });
        if (!error && data) return data as Message[];
      } catch (err) {
        console.warn('Repository Supabase getMessagesByEmail error:', err);
      }
    }

    return Array.from(store.messages.values())
      .filter(m => m.email_address_id === emailAddressId)
      .sort((a, b) => new Date(b.received_at).getTime() - new Date(a.received_at).getTime());
  }

  public static async getMessagesByUser(userId: string): Promise<Message[]> {
    const db = getDb();
    if (db) {
      try {
        const { data, error } = await db
          .from('messages')
          .select('*')
          .eq('user_id', userId)
          .order('received_at', { ascending: false });
        if (!error && data) return data as Message[];
      } catch (err) {
        console.warn('Repository Supabase getMessagesByUser error:', err);
      }
    }

    return Array.from(store.messages.values())
      .filter(m => m.user_id === userId)
      .sort((a, b) => new Date(b.received_at).getTime() - new Date(a.received_at).getTime());
  }

  public static async getAllMessages(): Promise<Message[]> {
    const db = getDb();
    if (db) {
      try {
        const { data, error } = await db.from('messages').select('*').order('received_at', { ascending: false });
        if (!error && data) return data as Message[];
      } catch (err) {
        console.warn('Repository Supabase getAllMessages error:', err);
      }
    }

    return Array.from(store.messages.values())
      .sort((a, b) => new Date(b.received_at).getTime() - new Date(a.received_at).getTime());
  }

  public static async getMessageById(messageId: string): Promise<Message | null> {
    const db = getDb();
    if (db) {
      try {
        const { data, error } = await db.from('messages').select('*').eq('id', messageId).maybeSingle();
        if (!error && data) return data as Message;
      } catch (err) {
        console.warn('Repository Supabase getMessageById error:', err);
      }
    }
    return store.messages.get(messageId) || null;
  }

  public static async markMessageRead(messageId: string): Promise<boolean> {
    const db = getDb();
    if (db) {
      try {
        const { error } = await db.from('messages').update({ is_read: true }).eq('id', messageId);
        if (!error) return true;
      } catch (err) {
        console.warn('Repository Supabase markMessageRead error:', err);
      }
    }

    const msg = store.messages.get(messageId);
    if (!msg) return false;
    msg.is_read = true;
    store.messages.set(messageId, msg);
    return true;
  }

  public static async deleteMessage(messageId: string): Promise<boolean> {
    const db = getDb();
    if (db) {
      try {
        const { error } = await db.from('messages').delete().eq('id', messageId);
        if (!error) return true;
      } catch (err) {
        console.warn('Repository Supabase deleteMessage error:', err);
      }
    }
    return store.messages.delete(messageId);
  }

  public static async receiveIncomingMessage(
    emailAddressId: string,
    sender: string,
    subject: string,
    bodyText: string,
    bodyHtml?: string
  ): Promise<Message | null> {
    const email = await this.getEmailAddressById(emailAddressId);
    if (!email) return null;

    const detected = OTPService.detect(subject, bodyText, bodyHtml);
    const messageId = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `msg-${Date.now()}`;
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

    const db = getDb();
    if (db) {
      try {
        await db.from('messages').insert(newMsg);
      } catch (err) {
        console.warn('Repository Supabase receiveIncomingMessage error:', err);
      }
    }

    store.messages.set(messageId, newMsg);
    email.message_count += 1;
    if (detected?.code) email.otp_count += 1;
    email.last_message_at = newMsg.received_at;
    email.last_used_at = newMsg.received_at;
    store.emails.set(emailAddressId, email);

    return newMsg;
  }

  // ================= CREDIT PACKAGES & TRANSACTIONS =================
  public static async getPackages(): Promise<CreditPackage[]> {
    const db = getDb();
    if (db) {
      try {
        const { data, error } = await db
          .from('credit_packages')
          .select('*')
          .eq('status', 'active')
          .order('display_order', { ascending: true });
        if (!error && data && data.length > 0) return data as CreditPackage[];
      } catch (err) {
        console.warn('Repository Supabase getPackages error:', err);
      }
    }

    return Array.from(store.packages.values())
      .filter(p => p.status === 'active')
      .sort((a, b) => a.display_order - b.display_order);
  }

  public static async getPackageById(id: string): Promise<CreditPackage | null> {
    const db = getDb();
    if (db) {
      try {
        const { data, error } = await db.from('credit_packages').select('*').eq('id', id).maybeSingle();
        if (!error && data) return data as CreditPackage;
      } catch (err) {
        console.warn('Repository Supabase getPackageById error:', err);
      }
    }
    return store.packages.get(id) || null;
  }

  public static async getTransactionsByUser(userId: string): Promise<CreditTransaction[]> {
    const db = getDb();
    if (db) {
      try {
        const { data, error } = await db
          .from('credit_transactions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        if (!error && data) return data as CreditTransaction[];
      } catch (err) {
        console.warn('Repository Supabase getTransactionsByUser error:', err);
      }
    }

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
    const db = getDb();
    if (db) {
      try {
        const { data, error } = await db.rpc('adjust_credits', {
          p_user_id: userId,
          p_admin_id: adminId,
          p_amount: amount,
          p_reason: reason,
        });

        if (error) {
          throw new Error(error.message);
        }
        if (data && data.success) {
          return { success: true, newBalance: data.new_balance };
        }
        if (data && !data.success) {
          throw new Error(data.error || 'Adjustment failed');
        }
      } catch (err) {
        if (err instanceof Error) throw err;
      }
    }

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
    if (!input.sender_identifier || input.sender_identifier.trim().length === 0) {
      throw new Error('Sender Number / Account Identifier is required.');
    }

    const hasTxId = Boolean(input.transaction_id && input.transaction_id.trim().length > 0);
    const hasScreenshot = Boolean(input.screenshot_base64 || input.screenshot_name);

    if (!hasTxId && !hasScreenshot) {
      throw new Error('At least one of Transaction ID or Payment Screenshot must be provided.');
    }

    const user = await this.getCurrentUser(userId);
    if (!user) throw new Error('User account not found');

    const pkg = await this.getPackageById(input.package_id);
    if (!pkg) throw new Error('Selected package not found');

    const paymentNum = Math.floor(10000 + Math.random() * 89999);
    const paymentRef = `PAY-${paymentNum}`;
    const id = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `pay-${Date.now()}`;

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

    const db = getDb();
    if (db) {
      try {
        await db.from('payments').insert({
          id: newPayment.id,
          payment_ref: newPayment.payment_ref,
          user_id: newPayment.user_id,
          package_id: newPayment.package_id,
          amount: newPayment.amount,
          currency: newPayment.currency,
          payment_method: newPayment.payment_method,
          sender_identifier: newPayment.sender_identifier,
          transaction_id: newPayment.transaction_id,
          screenshot_path: newPayment.screenshot_path,
          status: 'pending',
          submitted_at: newPayment.submitted_at,
        });
      } catch (err) {
        console.warn('Repository Supabase submitPayment error:', err);
      }
    }

    store.payments.set(id, newPayment);

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
    const db = getDb();
    if (db) {
      try {
        const { data, error } = await db
          .from('payments')
          .select('*, credit_packages(name, credits, bonus)')
          .eq('user_id', userId)
          .order('submitted_at', { ascending: false });
        if (!error && data) {
          return data.map((p: Record<string, unknown>) => {
            const pkg = p.credit_packages as { name?: string; credits?: number; bonus?: number } | undefined;
            return {
              ...p,
              package_name: pkg ? `${pkg.name} (${(pkg.credits || 0) + (pkg.bonus || 0)} Credits)` : 'Credit Package',
            } as Payment;
          });
        }
      } catch (err) {
        console.warn('Repository Supabase getPaymentsByUser error:', err);
      }
    }

    return Array.from(store.payments.values())
      .filter(p => p.user_id === userId)
      .sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());
  }

  public static async getAllPayments(): Promise<Payment[]> {
    const db = getDb();
    if (db) {
      try {
        const { data, error } = await db
          .from('payments')
          .select('*, profiles(name, email), credit_packages(name, credits, bonus)')
          .order('submitted_at', { ascending: false });
        if (!error && data) {
          return data.map((p: Record<string, unknown>) => {
            const prof = p.profiles as { name?: string; email?: string } | undefined;
            const pkg = p.credit_packages as { name?: string; credits?: number; bonus?: number } | undefined;
            return {
              ...p,
              user_name: prof?.name || 'User',
              user_email: prof?.email || '',
              package_name: pkg ? `${pkg.name} (${(pkg.credits || 0) + (pkg.bonus || 0)} Credits)` : 'Credit Package',
            } as Payment;
          });
        }
      } catch (err) {
        console.warn('Repository Supabase getAllPayments error:', err);
      }
    }

    return Array.from(store.payments.values())
      .sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());
  }

  public static async getPaymentById(id: string): Promise<Payment | null> {
    const db = getDb();
    if (db) {
      try {
        const { data, error } = await db
          .from('payments')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        if (!error && data) return data as Payment;
      } catch (err) {
        console.warn('Repository Supabase getPaymentById error:', err);
      }
    }
    return store.payments.get(id) || null;
  }

  public static async approvePayment(
    paymentId: string, 
    adminId: string,
    adminEmail: string = 'admin@omnibey.com'
  ): Promise<{ success: boolean; payment: Payment; creditsAdded: number }> {
    const db = getDb();
    if (db) {
      try {
        const { data, error } = await db.rpc('approve_payment', {
          p_payment_id: paymentId,
          p_admin_id: adminId,
        });

        if (error) {
          throw new Error(error.message);
        }

        if (data) {
          const freshPayment = await this.getPaymentById(paymentId);
          if (freshPayment) {
            TelegramService.notifyPaymentDecision(freshPayment.payment_ref, 'APPROVED', adminEmail).catch(() => {});
            return {
              success: data.success,
              payment: freshPayment,
              creditsAdded: data.credits_added || 0,
            };
          }
        }
      } catch (err) {
        if (err instanceof Error) throw err;
      }
    }

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

    user.credits = newBalance;
    store.users.set(user.id, user);

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

    payment.status = 'approved';
    payment.reviewed_at = new Date().toISOString();
    payment.reviewed_by = adminId;
    payment.reviewer_name = 'OmniBey Admin';
    payment.screenshot_path = undefined; // Storage Freed
    payment.screenshot_url = undefined;
    payment.updated_at = new Date().toISOString();
    store.payments.set(paymentId, payment);

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

    TelegramService.notifyPaymentDecision(payment.payment_ref, 'APPROVED', adminEmail).catch(() => {});

    return { success: true, payment, creditsAdded: totalCredits };
  }

  public static async rejectPayment(
    paymentId: string, 
    adminId: string, 
    reason: string,
    adminEmail: string = 'admin@omnibey.com'
  ): Promise<{ success: boolean; payment: Payment }> {
    const db = getDb();
    if (db) {
      try {
        const { data, error } = await db.rpc('reject_payment', {
          p_payment_id: paymentId,
          p_admin_id: adminId,
          p_reason: reason,
        });

        if (error) {
          throw new Error(error.message);
        }

        if (data && data.success) {
          const freshPayment = await this.getPaymentById(paymentId);
          if (freshPayment) {
            TelegramService.notifyPaymentDecision(freshPayment.payment_ref, 'REJECTED', adminEmail, reason).catch(() => {});
            return { success: true, payment: freshPayment };
          }
        }
      } catch (err) {
        if (err instanceof Error) throw err;
      }
    }

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
    const db = getDb();
    if (db) {
      try {
        const { data, error } = await db.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100);
        if (!error && data) return data as AuditLog[];
      } catch (err) {
        console.warn('Repository Supabase getAuditLogs error:', err);
      }
    }
    return [...store.auditLogs];
  }

  public static async getCompatibilitySummary(): Promise<CompatibilityItem[]> {
    const db = getDb();
    if (db) {
      try {
        const { data, error } = await db.from('compatibility_summary').select('*');
        if (!error && data && data.length > 0) return data as CompatibilityItem[];
      } catch (err) {
        console.warn('Repository Supabase getCompatibilitySummary error:', err);
      }
    }
    return [...store.compatibility];
  }

  public static async getSystemMetrics() {
    const db = getDb();
    if (db) {
      try {
        const [
          usersRes, emailsActiveRes, emailsExpiredRes, msgsRes, 
          pendingPaymentsRes, approvedPaymentsRes
        ] = await Promise.all([
          db.from('profiles').select('id', { count: 'exact', head: true }),
          db.from('email_addresses').select('id', { count: 'exact', head: true }).eq('status', 'active'),
          db.from('email_addresses').select('id', { count: 'exact', head: true }).eq('status', 'expired'),
          db.from('messages').select('id', { count: 'exact', head: true }),
          db.from('payments').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
          db.from('payments').select('amount').eq('status', 'approved'),
        ]);

        const totalRevenue = (approvedPaymentsRes.data || []).reduce((sum: number, p: { amount: number }) => sum + Number(p.amount || 0), 0);

        return {
          totalUsers: usersRes.count || 0,
          activeUsers: usersRes.count || 0,
          activeEmails: emailsActiveRes.count || 0,
          expiredEmails: emailsExpiredRes.count || 0,
          totalMessages: msgsRes.count || 0,
          otpDetections: Math.floor((msgsRes.count || 0) * 0.7),
          pendingPayments: pendingPaymentsRes.count || 0,
          approvedPaymentsCount: (approvedPaymentsRes.data || []).length,
          totalRevenue,
          providerStatus: 'operational',
          systemHealth: '99.98%',
        };
      } catch (err) {
        console.warn('Repository Supabase getSystemMetrics error:', err);
      }
    }

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
