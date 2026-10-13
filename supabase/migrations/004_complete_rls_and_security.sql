-- ====================================================================
-- OmniMail Migration: 004_complete_rls_and_security.sql
-- Complete Row Level Security, Transaction Functions, and Authorization Hardening
-- ====================================================================

-- 1. PREVENT CLIENT/UNAUTHORIZED ROLE & CREDIT TAMPERING ON PROFILES
CREATE OR REPLACE FUNCTION public.protect_profile_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- If update is initiated by a regular user (not an admin)
  IF NOT public.is_admin() THEN
    -- Strictly forbid changing role
    IF NEW.role IS DISTINCT FROM OLD.role THEN
      RAISE EXCEPTION 'Unauthorized: Normal users cannot modify user role';
    END IF;

    -- Strictly forbid changing credits directly via client update
    IF NEW.credits IS DISTINCT FROM OLD.credits THEN
      RAISE EXCEPTION 'Unauthorized: User credits must only be updated via verified server transactions';
    END IF;

    -- Strictly forbid changing account status
    IF NEW.account_status IS DISTINCT FROM OLD.account_status THEN
      RAISE EXCEPTION 'Unauthorized: Normal users cannot modify account status';
    END IF;
  END IF;

  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_protect_profile_fields ON public.profiles;
CREATE TRIGGER trg_protect_profile_fields
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_fields();

-- 2. COMPLETE RLS ON TABLES
ALTER TABLE public.credit_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compatibility_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_usage_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage ENABLE ROW LEVEL SECURITY;

-- 2a. Credit Packages Policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'credit_packages' AND policyname = 'Anyone can view active credit packages') THEN
    CREATE POLICY "Anyone can view active credit packages"
      ON public.credit_packages FOR SELECT
      USING (status = 'active' OR public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'credit_packages' AND policyname = 'Only admins can modify credit packages') THEN
    CREATE POLICY "Only admins can modify credit packages"
      ON public.credit_packages FOR ALL
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;
END $$;

-- 2b. Compatibility Summary Policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'compatibility_summary' AND policyname = 'Anyone can view compatibility summary') THEN
    CREATE POLICY "Anyone can view compatibility summary"
      ON public.compatibility_summary FOR SELECT
      USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'compatibility_summary' AND policyname = 'Only admins can modify compatibility summary') THEN
    CREATE POLICY "Only admins can modify compatibility summary"
      ON public.compatibility_summary FOR ALL
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;
END $$;

-- 2c. Email Providers Policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'email_providers' AND policyname = 'Authenticated users can view operational providers') THEN
    CREATE POLICY "Authenticated users can view operational providers"
      ON public.email_providers FOR SELECT
      USING (is_active = true OR public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'email_providers' AND policyname = 'Only admins can modify email providers') THEN
    CREATE POLICY "Only admins can modify email providers"
      ON public.email_providers FOR ALL
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;
END $$;

-- 2d. System Settings Policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'system_settings' AND policyname = 'Authenticated users can view payment destinations') THEN
    CREATE POLICY "Authenticated users can view payment destinations"
      ON public.system_settings FOR SELECT
      USING (key = 'payment_destinations' OR public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'system_settings' AND policyname = 'Only admins can modify system settings') THEN
    CREATE POLICY "Only admins can modify system settings"
      ON public.system_settings FOR ALL
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;
END $$;

-- 2e. Email Usage Sessions Policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'email_usage_sessions' AND policyname = 'Users can view own usage sessions') THEN
    CREATE POLICY "Users can view own usage sessions"
      ON public.email_usage_sessions FOR SELECT
      USING (auth.uid() = user_id OR public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'email_usage_sessions' AND policyname = 'Users can insert own usage sessions') THEN
    CREATE POLICY "Users can insert own usage sessions"
      ON public.email_usage_sessions FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- 2f. Email Events Policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'email_events' AND policyname = 'Users can view own email events') THEN
    CREATE POLICY "Users can view own email events"
      ON public.email_events FOR SELECT
      USING (auth.uid() = user_id OR public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'email_events' AND policyname = 'Users can insert own email events') THEN
    CREATE POLICY "Users can insert own email events"
      ON public.email_events FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- 2g. API Keys Policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'api_keys' AND policyname = 'Users can view own API keys') THEN
    CREATE POLICY "Users can view own API keys"
      ON public.api_keys FOR SELECT
      USING (auth.uid() = user_id OR public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'api_keys' AND policyname = 'Users can create own API keys') THEN
    CREATE POLICY "Users can create own API keys"
      ON public.api_keys FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'api_keys' AND policyname = 'Users can delete own API keys') THEN
    CREATE POLICY "Users can delete own API keys"
      ON public.api_keys FOR DELETE
      USING (auth.uid() = user_id OR public.is_admin());
  END IF;
END $$;

-- 3. TRANSACTION FUNCTION: REJECT PAYMENT SAFELY
CREATE OR REPLACE FUNCTION public.reject_payment(
  p_payment_id UUID,
  p_admin_id UUID,
  p_reason TEXT DEFAULT 'Transaction could not be verified against merchant statements.'
)
RETURNS JSONB AS $$
DECLARE
  v_payment RECORD;
BEGIN
  -- 1. Lock payment row to prevent concurrent race conditions
  SELECT * INTO v_payment 
  FROM public.payments 
  WHERE id = p_payment_id 
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Payment not found');
  END IF;

  IF v_payment.status = 'approved' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cannot reject an already approved payment');
  END IF;

  IF v_payment.status = 'rejected' THEN
    RETURN jsonb_build_object('success', true, 'message', 'Payment was already rejected', 'payment_ref', v_payment.payment_ref);
  END IF;

  -- 2. Update payment status
  UPDATE public.payments 
  SET 
    status = 'rejected',
    reviewed_at = NOW(),
    reviewed_by = p_admin_id,
    rejection_reason = p_reason,
    updated_at = NOW()
  WHERE id = p_payment_id;

  -- 3. Record audit log
  INSERT INTO public.audit_logs (
    admin_id, action, target_type, target_id, details
  ) VALUES (
    p_admin_id,
    'payment_rejected',
    'payment',
    p_payment_id::text,
    jsonb_build_object(
      'payment_ref', v_payment.payment_ref,
      'user_id', v_payment.user_id,
      'amount', v_payment.amount,
      'reason', p_reason
    )
  );

  RETURN jsonb_build_object(
    'success', true, 
    'payment_ref', v_payment.payment_ref,
    'status', 'rejected',
    'reason', p_reason
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. TRANSACTION FUNCTION: ADJUST CREDITS SAFELY
CREATE OR REPLACE FUNCTION public.adjust_credits(
  p_user_id UUID,
  p_admin_id UUID,
  p_amount INTEGER,
  p_reason TEXT DEFAULT 'Administrative balance adjustment'
)
RETURNS JSONB AS $$
DECLARE
  v_user RECORD;
  v_new_balance INTEGER;
BEGIN
  -- 1. Lock user profile row to prevent balance calculation races
  SELECT * INTO v_user 
  FROM public.profiles 
  WHERE id = p_user_id 
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'User profile not found');
  END IF;

  v_new_balance := v_user.credits + p_amount;

  -- Prevent negative credit balance
  IF v_new_balance < 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Credit balance cannot become negative');
  END IF;

  -- 2. Update balance
  UPDATE public.profiles 
  SET credits = v_new_balance, updated_at = NOW() 
  WHERE id = p_user_id;

  -- 3. Record immutable ledger transaction
  INSERT INTO public.credit_transactions (
    user_id, amount, transaction_type, balance_after, reference_id, reference_type, description
  ) VALUES (
    p_user_id,
    p_amount,
    'admin_adjustment'::public.credit_tx_type,
    v_new_balance,
    p_admin_id::text,
    'admin_adjustment',
    p_reason
  );

  -- 4. Record audit log
  INSERT INTO public.audit_logs (
    admin_id, action, target_type, target_id, details
  ) VALUES (
    p_admin_id,
    'credits_adjusted',
    'user',
    p_user_id::text,
    jsonb_build_object(
      'amount', p_amount,
      'old_balance', v_user.credits,
      'new_balance', v_new_balance,
      'reason', p_reason
    )
  );

  RETURN jsonb_build_object(
    'success', true, 
    'user_id', p_user_id,
    'amount', p_amount,
    'new_balance', v_new_balance
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
