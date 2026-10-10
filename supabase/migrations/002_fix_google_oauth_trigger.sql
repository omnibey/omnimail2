-- ====================================================================
-- OmniMail Migration: 002_fix_google_oauth_trigger.sql
-- Fix Google OAuth signup trigger ("Database error saving new user")
-- ====================================================================

-- 1. Ensure RLS INSERT policy exists on public.profiles
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'profiles' 
      AND policyname = 'Users can insert own profile'
  ) THEN
    CREATE POLICY "Users can insert own profile" 
      ON public.profiles FOR INSERT 
      WITH CHECK (auth.uid() = id OR public.is_admin());
  END IF;
END $$;

-- 2. Bulletproof handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_name TEXT;
  v_email TEXT;
  v_role public.user_role;
  v_avatar TEXT;
  v_provider TEXT;
BEGIN
  -- Extract email safely
  v_email := COALESCE(new.email, new.raw_user_meta_data->>'email', '');

  -- Extract display name safely
  v_name := COALESCE(
    NULLIF(new.raw_user_meta_data->>'full_name', ''),
    NULLIF(new.raw_user_meta_data->>'name', ''),
    NULLIF(split_part(v_email, '@', 1), ''),
    'OmniMail User'
  );

  -- Extract avatar safely
  v_avatar := COALESCE(
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'picture',
    ''
  );

  -- Determine provider
  v_provider := COALESCE(new.raw_app_meta_data->>'provider', 'email');

  -- Determine role
  IF LOWER(v_email) = 'admin@omnibey.com' THEN
    v_role := 'admin'::public.user_role;
  ELSE
    v_role := 'user'::public.user_role;
  END IF;

  -- 1. If an orphaned profile exists with the same email but different ID:
  -- Reassign foreign keys and remove orphaned profile to avoid UNIQUE(email) constraint violations
  IF v_email <> '' THEN
    BEGIN
      UPDATE public.credit_transactions 
      SET user_id = new.id 
      WHERE user_id IN (SELECT id FROM public.profiles WHERE email = v_email AND id <> new.id);

      UPDATE public.email_addresses 
      SET user_id = new.id 
      WHERE user_id IN (SELECT id FROM public.profiles WHERE email = v_email AND id <> new.id);

      UPDATE public.email_events 
      SET user_id = new.id 
      WHERE user_id IN (SELECT id FROM public.profiles WHERE email = v_email AND id <> new.id);

      UPDATE public.payments 
      SET user_id = new.id 
      WHERE user_id IN (SELECT id FROM public.profiles WHERE email = v_email AND id <> new.id);

      DELETE FROM public.profiles 
      WHERE email = v_email AND id <> new.id;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE WARNING 'handle_new_user: Conflict resolution notice: %', SQLERRM;
    END;
  END IF;

  -- 2. Insert or update the user profile
  INSERT INTO public.profiles (
    id,
    name,
    email,
    role,
    credits,
    account_status,
    google_account_email,
    avatar_url,
    created_at,
    updated_at
  )
  VALUES (
    new.id,
    v_name,
    v_email,
    v_role,
    15, -- 15 free trial credits upon signup
    'active',
    CASE WHEN v_provider = 'google' THEN v_email ELSE NULL END,
    v_avatar,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    name = COALESCE(NULLIF(EXCLUDED.name, ''), public.profiles.name),
    avatar_url = CASE WHEN EXCLUDED.avatar_url <> '' THEN EXCLUDED.avatar_url ELSE public.profiles.avatar_url END,
    google_account_email = COALESCE(EXCLUDED.google_account_email, public.profiles.google_account_email),
    updated_at = NOW();

  -- 3. Safely record welcome bonus credits (only once per user)
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM public.credit_transactions 
      WHERE user_id = new.id AND reference_id = 'welcome-bonus'
    ) THEN
      INSERT INTO public.credit_transactions (
        user_id,
        amount,
        transaction_type,
        balance_after,
        reference_id,
        reference_type,
        description,
        created_at
      ) VALUES (
        new.id,
        15,
        'bonus'::public.credit_tx_type,
        15,
        'welcome-bonus',
        'signup',
        'Welcome bonus credits upon account creation',
        NOW()
      );
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      -- Silently catch so bonus logging never aborts user creation
      RAISE WARNING 'handle_new_user: Failed to insert welcome bonus for %: %', new.id, SQLERRM;
  END;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Ultimate fallback: even if secondary operations fail, NEVER abort user creation
    RAISE WARNING 'handle_new_user unexpected error for %: %', new.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- 3. Re-bind trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Ensure schema permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;
