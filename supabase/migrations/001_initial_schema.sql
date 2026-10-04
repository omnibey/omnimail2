-- ====================================================================
-- OmniMail Database Schema & Security Migration
-- Version: 1.0.0
-- Author: OmniBey Engineering
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('user', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE email_status AS ENUM ('active', 'expired', 'deleted');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_method_type AS ENUM ('bkash', 'nagad', 'rocket', 'upay', 'binance');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE credit_tx_type AS ENUM ('purchase', 'bonus', 'usage', 'refund', 'admin_adjustment');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE email_event_type AS ENUM (
    'created', 'copied', 'received', 'opened', 'otp_detected', 
    'expired', 'deleted', 'provider_status_change'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE (Linked with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL UNIQUE,
  phone TEXT DEFAULT '',
  role user_role NOT NULL DEFAULT 'user',
  credits INTEGER NOT NULL DEFAULT 10 CHECK (credits >= 0),
  account_status TEXT NOT NULL DEFAULT 'active' CHECK (account_status IN ('active', 'suspended')),
  google_account_email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index on role for fast permission checks
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- 4. EMAIL PROVIDERS
CREATE TABLE IF NOT EXISTS public.email_providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE, -- 'omnibey', 'gmail', 'outlook'
  is_active BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'operational', -- 'operational', 'degraded', 'maintenance'
  domains TEXT[] NOT NULL DEFAULT ARRAY['omnibey.com', 'mail.omnibey.com'],
  config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default OmniBey Provider
INSERT INTO public.email_providers (name, code, is_active, status, domains)
VALUES ('OmniBey Dynamic Mail Provider', 'omnibey', true, 'operational', ARRAY['omnibey.com', 'mail.omnibey.com'])
ON CONFLICT (code) DO NOTHING;

-- 5. EMAIL ADDRESSES (Dynamically generated temporary mailboxes)
CREATE TABLE IF NOT EXISTS public.email_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  email_address TEXT NOT NULL UNIQUE,
  prefix TEXT NOT NULL,
  domain TEXT NOT NULL DEFAULT 'omnibey.com',
  provider_id UUID REFERENCES public.email_providers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  status email_status NOT NULL DEFAULT 'active',
  usage_count INTEGER NOT NULL DEFAULT 0,
  message_count INTEGER NOT NULL DEFAULT 0,
  otp_count INTEGER NOT NULL DEFAULT 0,
  last_message_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  user_service_tag TEXT -- Tag assigned by user e.g. "Github verification"
);

CREATE INDEX IF NOT EXISTS idx_email_addresses_user_id ON public.email_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_email_addresses_email ON public.email_addresses(email_address);
CREATE INDEX IF NOT EXISTS idx_email_addresses_expires_at ON public.email_addresses(expires_at);
CREATE INDEX IF NOT EXISTS idx_email_addresses_status ON public.email_addresses(status);

-- 6. MESSAGES
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email_address_id UUID NOT NULL REFERENCES public.email_addresses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sender TEXT NOT NULL,
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL DEFAULT '(No Subject)',
  body_text TEXT NOT NULL DEFAULT '',
  body_html TEXT DEFAULT '',
  detected_otp TEXT, -- Extracted OTP e.g. "849201"
  otp_confidence TEXT, -- 'high', 'medium', 'low'
  is_read BOOLEAN NOT NULL DEFAULT false,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  headers JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_messages_email_address_id ON public.messages(email_address_id);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON public.messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_received_at ON public.messages(received_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON public.messages(is_read);

-- 7. EMAIL USAGE SESSIONS (Separating user-claimed vs observed domain)
CREATE TABLE IF NOT EXISTS public.email_usage_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  email_address_id UUID NOT NULL REFERENCES public.email_addresses(id) ON DELETE CASCADE,
  user_reported_service TEXT, -- e.g. "Netflix", "Discord"
  observed_sender_domain TEXT, -- e.g. "netflix.com", "notifications.discord.com"
  provider_code TEXT NOT NULL DEFAULT 'omnibey',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usage_sessions_user ON public.email_usage_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_sessions_email ON public.email_usage_sessions(email_address_id);

-- 8. EMAIL EVENTS (Telemetry & Audit)
CREATE TABLE IF NOT EXISTS public.email_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  email_address_id UUID REFERENCES public.email_addresses(id) ON DELETE CASCADE,
  event_type email_event_type NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_events_user ON public.email_events(user_id);
CREATE INDEX IF NOT EXISTS idx_email_events_type ON public.email_events(event_type);
CREATE INDEX IF NOT EXISTS idx_email_events_created ON public.email_events(created_at DESC);

-- 9. CREDIT PACKAGES
CREATE TABLE IF NOT EXISTS public.credit_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  currency TEXT NOT NULL DEFAULT 'BDT',
  credits INTEGER NOT NULL CHECK (credits > 0),
  bonus INTEGER NOT NULL DEFAULT 0 CHECK (bonus >= 0),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  description TEXT DEFAULT '',
  features TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_featured BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default credit packages
INSERT INTO public.credit_packages (name, price, currency, credits, bonus, status, description, features, is_featured, display_order)
VALUES 
  ('Starter Pack', 150.00, 'BDT', 100, 10, 'active', 'Ideal for testing and casual verification needs', ARRAY['110 Total Credits', 'Instant OTP extraction', 'Active for 30 days', 'Standard support'], false, 1),
  ('Pro Creator', 350.00, 'BDT', 300, 50, 'active', 'Our most popular plan for developers & QA testers', ARRAY['350 Total Credits', 'Priority email delivery', 'Real-time Telegram notifications', 'Extended mailbox lifetime'], true, 2),
  ('Enterprise Power', 800.00, 'BDT', 800, 200, 'active', 'Maximum power for heavy automation & agency workflows', ARRAY['1,000 Total Credits', 'Catch-all domain routing', 'VIP Priority support', 'API access ready'], false, 3)
ON CONFLICT DO NOTHING;

-- 10. CREDIT TRANSACTIONS (Immutable Ledger)
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- Positive for additions, negative for usage
  transaction_type credit_tx_type NOT NULL,
  balance_after INTEGER NOT NULL CHECK (balance_after >= 0),
  reference_id TEXT, -- Payment ID, message ID, or admin note
  reference_type TEXT, -- 'payment', 'email_generation', 'admin_adjustment'
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credit_transactions_user ON public.credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created ON public.credit_transactions(created_at DESC);

-- 11. PAYMENTS
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_ref TEXT NOT NULL UNIQUE, -- e.g. "PAY-10824"
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES public.credit_packages(id),
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'BDT',
  payment_method payment_method_type NOT NULL,
  sender_identifier TEXT NOT NULL, -- Phone / Account / Wallet (REQUIRED)
  transaction_id TEXT, -- TrxID (OPTIONAL)
  screenshot_path TEXT, -- Storage path in payment-proof bucket (OPTIONAL)
  status payment_status NOT NULL DEFAULT 'pending',
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  rejection_reason TEXT,
  idempotency_key TEXT UNIQUE, -- Ensures no duplicate payment creation or credit allocation
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Constraint: Sender is always required; and at least one of transaction_id OR screenshot_path must be provided!
  CONSTRAINT check_txid_or_screenshot CHECK (
    transaction_id IS NOT NULL OR screenshot_path IS NOT NULL
  )
);

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_submitted_at ON public.payments(submitted_at DESC);

-- 12. ADMIN AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- e.g. "payment_approved", "credits_adjusted", "user_suspended"
  target_type TEXT NOT NULL, -- 'payment', 'user', 'package', 'system'
  target_id TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON public.audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);

-- 13. COMPATIBILITY SUMMARY & SERVICE TESTS
CREATE TABLE IF NOT EXISTS public.compatibility_summary (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_domain TEXT NOT NULL, -- e.g. "twitter.com", "openai.com"
  email_domain TEXT NOT NULL DEFAULT 'omnibey.com',
  provider TEXT NOT NULL DEFAULT 'OmniBey',
  total_tests INTEGER NOT NULL DEFAULT 0,
  successful_tests INTEGER NOT NULL DEFAULT 0,
  failed_tests INTEGER NOT NULL DEFAULT 0,
  success_rate NUMERIC(5, 2) NOT NULL DEFAULT 100.00,
  average_delivery_time TEXT NOT NULL DEFAULT '3s - 8s',
  confidence TEXT NOT NULL DEFAULT 'High' CHECK (confidence IN ('High', 'Medium', 'Low')),
  last_tested TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  disclaimer TEXT NOT NULL DEFAULT 'Observed historical data based on internal telemetry; not a guarantee.',
  UNIQUE(service_domain, email_domain, provider)
);

-- Seed initial compatibility data
INSERT INTO public.compatibility_summary (service_domain, email_domain, provider, total_tests, successful_tests, failed_tests, success_rate, average_delivery_time, confidence)
VALUES 
  ('discord.com', 'omnibey.com', 'OmniBey', 1420, 1398, 22, 98.45, '4 seconds', 'High'),
  ('github.com', 'omnibey.com', 'OmniBey', 980, 975, 5, 99.49, '3 seconds', 'High'),
  ('netflix.com', 'omnibey.com', 'OmniBey', 620, 580, 40, 93.55, '7 seconds', 'Medium'),
  ('openai.com', 'omnibey.com', 'OmniBey', 810, 785, 25, 96.91, '5 seconds', 'High'),
  ('spotify.com', 'omnibey.com', 'OmniBey', 510, 498, 12, 97.65, '4 seconds', 'High')
ON CONFLICT DO NOTHING;

-- 14. API KEYS & DEVELOPER PLATFORM (Prepared for Future API)
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  key_name TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  rate_limit_per_minute INTEGER NOT NULL DEFAULT 60,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.api_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  api_key_id UUID NOT NULL REFERENCES public.api_keys(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  status_code INTEGER NOT NULL,
  response_time_ms INTEGER NOT NULL,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. SYSTEM SETTINGS
CREATE TABLE IF NOT EXISTS public.system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed payment gateway numbers & accounts for manual payment
INSERT INTO public.system_settings (key, value, description)
VALUES 
  ('payment_destinations', '{
    "bkash": {"type": "Personal / Send Money", "account": "01711-000000", "instructions": "Send Money to this personal bKash number with your reference."},
    "nagad": {"type": "Personal / Send Money", "account": "01811-000000", "instructions": "Send Money to this Nagad number. Keep the Transaction ID safe."},
    "rocket": {"type": "Personal", "account": "01911-000000-8", "instructions": "Send Money to this 12-digit Rocket account number."},
    "upay": {"type": "Personal", "account": "01611-000000", "instructions": "Send Money to this Upay account."},
    "binance": {"type": "Binance Pay ID / USDT TRC20", "account": "84920194", "wallet": "TL12...xyz", "instructions": "Pay via Binance Pay ID or send USDT TRC20."}
  }'::jsonb, 'Manual payment accounts and instructions'),
  ('telegram_config', '{
    "enabled": false,
    "notify_new_payment": true,
    "notify_new_user": true,
    "notify_critical_errors": true
  }'::jsonb, 'Telegram bot alert preferences')
ON CONFLICT (key) DO NOTHING;

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_usage_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage ENABLE ROW LEVEL SECURITY;

-- Helper Function: Check if currently authenticated user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: Users see own, Admins see all
CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (
    -- Normal users cannot elevate their own role or change credits
    (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()) AND credits = (SELECT credits FROM public.profiles WHERE id = auth.uid()))
    OR public.is_admin()
  );

-- Email Addresses: Users see own, Admins see all
CREATE POLICY "Users can view own email addresses" 
  ON public.email_addresses FOR SELECT 
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can create own email addresses" 
  ON public.email_addresses FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own email addresses" 
  ON public.email_addresses FOR UPDATE 
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can delete own email addresses" 
  ON public.email_addresses FOR DELETE 
  USING (auth.uid() = user_id OR public.is_admin());

-- Messages: Users see own, Admins see all
CREATE POLICY "Users can view own messages" 
  ON public.messages FOR SELECT 
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can update own messages" 
  ON public.messages FOR UPDATE 
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can delete own messages" 
  ON public.messages FOR DELETE 
  USING (auth.uid() = user_id OR public.is_admin());

-- Credit Transactions: Users see own, Admins see all
CREATE POLICY "Users can view own credit transactions" 
  ON public.credit_transactions FOR SELECT 
  USING (auth.uid() = user_id OR public.is_admin());

-- Payments: Users can view own and create new, Admins can view and update
CREATE POLICY "Users can view own payments" 
  ON public.payments FOR SELECT 
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can insert own payments" 
  ON public.payments FOR INSERT 
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Only admins can update payments" 
  ON public.payments FOR UPDATE 
  USING (public.is_admin());

-- Audit Logs: Only admins can view
CREATE POLICY "Only admins can view audit logs" 
  ON public.audit_logs FOR SELECT 
  USING (public.is_admin());

-- ====================================================================
-- IDEMPOTENT PAYMENT APPROVAL TRANSACTION FUNCTION
-- ====================================================================
CREATE OR REPLACE FUNCTION public.approve_payment(
  p_payment_id UUID,
  p_admin_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_payment RECORD;
  v_package RECORD;
  v_user RECORD;
  v_total_credits INTEGER;
  v_new_balance INTEGER;
BEGIN
  -- 1. Lock payment row to prevent race conditions & double-spend
  SELECT * INTO v_payment 
  FROM public.payments 
  WHERE id = p_payment_id 
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Payment not found');
  END IF;

  -- 2. Check current status: must be PENDING
  IF v_payment.status = 'approved' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Payment has already been approved (Idempotent guard)');
  END IF;

  IF v_payment.status = 'rejected' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cannot approve a rejected payment');
  END IF;

  -- 3. Fetch package details
  SELECT * INTO v_package 
  FROM public.credit_packages 
  WHERE id = v_payment.package_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Credit package not found');
  END IF;

  v_total_credits := v_package.credits + v_package.bonus;

  -- 4. Lock user profile & calculate new balance
  SELECT * INTO v_user 
  FROM public.profiles 
  WHERE id = v_payment.user_id 
  FOR UPDATE;

  v_new_balance := v_user.credits + v_total_credits;

  -- 5. Update user credits
  UPDATE public.profiles 
  SET credits = v_new_balance, updated_at = NOW() 
  WHERE id = v_payment.user_id;

  -- 6. Insert credit transaction into ledger
  INSERT INTO public.credit_transactions (
    user_id, amount, transaction_type, balance_after, reference_id, reference_type, description
  ) VALUES (
    v_payment.user_id,
    v_total_credits,
    'purchase',
    v_new_balance,
    v_payment.payment_ref,
    'payment',
    'Purchased ' || v_package.name || ' (' || v_package.credits || ' credits + ' || v_package.bonus || ' bonus)'
  );

  -- 7. Update payment status to approved and clear screenshot path
  UPDATE public.payments 
  SET 
    status = 'approved',
    reviewed_at = NOW(),
    reviewed_by = p_admin_id,
    screenshot_path = NULL, -- Immediate screenshot reference removal
    updated_at = NOW()
  WHERE id = p_payment_id;

  -- 8. Record audit log
  INSERT INTO public.audit_logs (
    admin_id, action, target_type, target_id, details
  ) VALUES (
    p_admin_id,
    'payment_approved',
    'payment',
    p_payment_id::text,
    jsonb_build_object(
      'payment_ref', v_payment.payment_ref,
      'user_id', v_payment.user_id,
      'amount', v_payment.amount,
      'credits_added', v_total_credits,
      'new_balance', v_new_balance
    )
  );

  RETURN jsonb_build_object(
    'success', true, 
    'payment_ref', v_payment.payment_ref,
    'credits_added', v_total_credits,
    'new_balance', v_new_balance
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================================================
-- AUTO PROFILE CREATION TRIGGER FOR NEW SIGNUPS
-- ====================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, credits, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    15, -- 15 free trial credits upon signup
    CASE 
      WHEN new.email = 'admin@omnibey.com' THEN 'admin'::user_role
      ELSE 'user'::user_role
    END
  )
  ON CONFLICT (id) DO NOTHING;

  -- Record initial bonus credit transaction
  INSERT INTO public.credit_transactions (
    user_id, amount, transaction_type, balance_after, reference_id, reference_type, description
  ) VALUES (
    new.id,
    15,
    'bonus',
    15,
    'welcome-bonus',
    'signup',
    'Welcome bonus credits upon account creation'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
