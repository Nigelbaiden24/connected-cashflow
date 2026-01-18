-- Add platform column to user_portfolios for platform-specific data separation
ALTER TABLE public.user_portfolios 
ADD COLUMN IF NOT EXISTS platform TEXT DEFAULT 'finance' CHECK (platform IN ('finance', 'investor'));

-- Add platform column to investment_watchlists for platform-specific data separation  
ALTER TABLE public.investment_watchlists 
ADD COLUMN IF NOT EXISTS platform TEXT DEFAULT 'finance' CHECK (platform IN ('finance', 'investor'));

-- Add platform column to portfolio_watchlist for platform-specific data separation
ALTER TABLE public.portfolio_watchlist 
ADD COLUMN IF NOT EXISTS platform TEXT DEFAULT 'finance' CHECK (platform IN ('finance', 'investor'));

-- Add target_user_id to reports table to allow admin to upload content to specific users
-- When null, the report is visible to all users on that platform (universal)
-- When set, only that specific user can see the report
ALTER TABLE public.reports
ADD COLUMN IF NOT EXISTS target_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_user_portfolios_platform ON public.user_portfolios(platform);
CREATE INDEX IF NOT EXISTS idx_user_portfolios_user_platform ON public.user_portfolios(user_id, platform);
CREATE INDEX IF NOT EXISTS idx_investment_watchlists_platform ON public.investment_watchlists(platform);
CREATE INDEX IF NOT EXISTS idx_investment_watchlists_user_platform ON public.investment_watchlists(user_id, platform);
CREATE INDEX IF NOT EXISTS idx_reports_target_user ON public.reports(target_user_id);

-- Update RLS policy for reports to handle target_user_id
DROP POLICY IF EXISTS "Users can view reports" ON public.reports;
CREATE POLICY "Users can view reports" ON public.reports
FOR SELECT USING (
  -- Universal reports (no target user) are visible to all authenticated users
  (target_user_id IS NULL AND auth.uid() IS NOT NULL)
  OR 
  -- Targeted reports are only visible to the specific user
  (target_user_id = auth.uid())
);

-- Update RLS for user_portfolios to be user and platform specific
DROP POLICY IF EXISTS "Users can view own portfolios" ON public.user_portfolios;
DROP POLICY IF EXISTS "Users can insert own portfolios" ON public.user_portfolios;
DROP POLICY IF EXISTS "Users can update own portfolios" ON public.user_portfolios;
DROP POLICY IF EXISTS "Users can delete own portfolios" ON public.user_portfolios;

CREATE POLICY "Users can view own portfolios" ON public.user_portfolios
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own portfolios" ON public.user_portfolios
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own portfolios" ON public.user_portfolios
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own portfolios" ON public.user_portfolios
FOR DELETE USING (auth.uid() = user_id);

-- Update RLS for investment_watchlists to be user and platform specific
DROP POLICY IF EXISTS "Users can view own watchlists" ON public.investment_watchlists;
DROP POLICY IF EXISTS "Users can insert own watchlists" ON public.investment_watchlists;
DROP POLICY IF EXISTS "Users can update own watchlists" ON public.investment_watchlists;
DROP POLICY IF EXISTS "Users can delete own watchlists" ON public.investment_watchlists;

CREATE POLICY "Users can view own or public watchlists" ON public.investment_watchlists
FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert own watchlists" ON public.investment_watchlists
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own watchlists" ON public.investment_watchlists
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own watchlists" ON public.investment_watchlists
FOR DELETE USING (auth.uid() = user_id);