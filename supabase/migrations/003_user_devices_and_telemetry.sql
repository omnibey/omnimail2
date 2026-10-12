-- ====================================================================
-- OmniMail Migration 003: User Device Tracking & Telemetry Extensions
-- Author: OmniBey Engineering
-- ====================================================================

-- 1. Add device and telemetry columns to public.profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS registration_device TEXT DEFAULT 'Desktop',
ADD COLUMN IF NOT EXISTS registration_browser TEXT DEFAULT 'Chrome',
ADD COLUMN IF NOT EXISTS registration_os TEXT DEFAULT 'Windows',
ADD COLUMN IF NOT EXISTS registration_ip TEXT DEFAULT '127.0.0.1',
ADD COLUMN IF NOT EXISTS last_login_device TEXT DEFAULT 'Desktop',
ADD COLUMN IF NOT EXISTS last_login_browser TEXT DEFAULT 'Chrome',
ADD COLUMN IF NOT EXISTS last_login_os TEXT DEFAULT 'Windows',
ADD COLUMN IF NOT EXISTS last_login_ip TEXT DEFAULT '127.0.0.1',
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Create user_device_sessions table for detailed session history
CREATE TABLE IF NOT EXISTS public.user_device_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  device_type TEXT NOT NULL DEFAULT 'Desktop' CHECK (device_type IN ('Desktop', 'Mobile', 'Tablet', 'Unknown')),
  browser TEXT NOT NULL DEFAULT 'Unknown Browser',
  os TEXT NOT NULL DEFAULT 'Unknown OS',
  ip_address TEXT DEFAULT '127.0.0.1',
  user_agent TEXT,
  is_current BOOLEAN NOT NULL DEFAULT false,
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indices for rapid querying
CREATE INDEX IF NOT EXISTS idx_user_device_sessions_user ON public.user_device_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_device_sessions_last_active ON public.user_device_sessions(last_active_at DESC);

-- 3. Row Level Security (RLS) Policies
ALTER TABLE public.user_device_sessions ENABLE ROW LEVEL SECURITY;

-- Admins can view and manage all device sessions
CREATE POLICY "Admins full access to device sessions"
ON public.user_device_sessions
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Users can view their own device sessions
CREATE POLICY "Users can view own device sessions"
ON public.user_device_sessions
FOR SELECT
USING (auth.uid() = user_id);

-- Notify schema upgrade complete
COMMENT ON TABLE public.user_device_sessions IS 'Audited device logins and telemetry for OmniMail security controls';
