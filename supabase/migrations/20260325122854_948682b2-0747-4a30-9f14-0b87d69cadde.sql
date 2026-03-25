-- Create login_activity table for tracking sign-in events
CREATE TABLE IF NOT EXISTS public.login_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address text,
  user_agent text,
  device_type text,
  location text,
  login_status text NOT NULL DEFAULT 'success',
  failure_reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.login_activity ENABLE ROW LEVEL SECURITY;

-- Users can view their own login activity
CREATE POLICY "Users can view own login activity"
  ON public.login_activity
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Admins can view all login activity
CREATE POLICY "Admins can view all login activity"
  ON public.login_activity
  FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Allow inserts for authenticated users (own records)
CREATE POLICY "Users can insert own login activity"
  ON public.login_activity
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_login_activity_user_id ON public.login_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_login_activity_created_at ON public.login_activity(created_at DESC);