// ==========================================================
// OmniMail TypeScript Domain Models & Types
// ==========================================================

export type UserRole = 'user' | 'admin';
export type AccountStatus = 'active' | 'suspended';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  credits: number;
  account_status: AccountStatus;
  google_account_email?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export type EmailProviderCode = 'omnibey' | 'gmail' | 'outlook' | 'other';
export type EmailProviderStatus = 'operational' | 'degraded' | 'maintenance';

export interface EmailProvider {
  id: string;
  name: string;
  code: EmailProviderCode;
  is_active: boolean;
  status: EmailProviderStatus;
  domains: string[];
  config?: Record<string, unknown>;
  created_at: string;
}

export type EmailAddressStatus = 'active' | 'expired' | 'deleted';

export interface EmailAddress {
  id: string;
  user_id: string;
  email_address: string;
  prefix: string;
  domain: string;
  provider_id?: string;
  created_at: string;
  expires_at: string;
  status: EmailAddressStatus;
  usage_count: number;
  message_count: number;
  otp_count: number;
  last_message_at?: string;
  last_used_at?: string;
  user_service_tag?: string;
}

export type OTPConfidence = 'high' | 'medium' | 'low';

export interface ExtractedOTP {
  code: string;
  confidence: OTPConfidence;
  contextMessage?: string;
  service?: string;
}

export interface Message {
  id: string;
  email_address_id: string;
  user_id: string;
  sender: string;
  recipient: string;
  subject: string;
  body_text: string;
  body_html?: string;
  detected_otp?: string;
  otp_confidence?: OTPConfidence;
  is_read: boolean;
  received_at: string;
  headers?: Record<string, string>;
}

export interface EmailUsageSession {
  id: string;
  user_id: string;
  email_address_id: string;
  user_reported_service?: string;
  observed_sender_domain?: string;
  provider_code: string;
  notes?: string;
  created_at: string;
}

export type EmailEventType = 
  | 'created' 
  | 'copied' 
  | 'received' 
  | 'opened' 
  | 'otp_detected' 
  | 'expired' 
  | 'deleted' 
  | 'provider_status_change';

export interface EmailEvent {
  id: string;
  user_id?: string;
  email_address_id?: string;
  event_type: EmailEventType;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface CreditPackage {
  id: string;
  name: string;
  price: number;
  currency: string;
  credits: number;
  bonus: number;
  status: 'active' | 'inactive';
  description: string;
  features: string[];
  is_featured: boolean;
  display_order: number;
  created_at: string;
}

export type CreditTxType = 'purchase' | 'bonus' | 'usage' | 'refund' | 'admin_adjustment';

export interface CreditTransaction {
  id: string;
  user_id: string;
  amount: number; // positive = credit, negative = debit
  transaction_type: CreditTxType;
  balance_after: number;
  reference_id?: string;
  reference_type?: string;
  description: string;
  created_at: string;
}

export type PaymentMethod = 'bkash' | 'nagad' | 'rocket' | 'upay' | 'binance';
export type PaymentStatus = 'pending' | 'approved' | 'rejected';

export interface Payment {
  id: string;
  payment_ref: string;
  user_id: string;
  user_email?: string;
  user_name?: string;
  package_id: string;
  package_name?: string;
  amount: number;
  currency: string;
  payment_method: PaymentMethod;
  sender_identifier: string; // REQUIRED
  transaction_id?: string; // OPTIONAL
  screenshot_path?: string; // OPTIONAL
  screenshot_url?: string;
  status: PaymentStatus;
  submitted_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  reviewer_name?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentSubmissionInput {
  package_id: string;
  payment_method: PaymentMethod;
  sender_identifier: string;
  transaction_id?: string;
  screenshot_base64?: string;
  screenshot_name?: string;
}

export interface AuditLog {
  id: string;
  admin_id: string;
  admin_email?: string;
  action: string;
  target_type: string;
  target_id: string;
  details?: Record<string, unknown>;
  ip_address?: string;
  created_at: string;
}

export interface CompatibilityItem {
  id: string;
  service_domain: string;
  email_domain: string;
  provider: string;
  total_tests: number;
  successful_tests: number;
  failed_tests: number;
  success_rate: number;
  average_delivery_time: string;
  confidence: 'High' | 'Medium' | 'Low';
  last_tested: string;
  disclaimer: string;
}

export interface SystemPaymentDestination {
  type: string;
  account: string;
  wallet?: string;
  instructions: string;
}
