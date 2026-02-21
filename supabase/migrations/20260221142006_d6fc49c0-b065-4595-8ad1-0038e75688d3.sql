
-- Create table to store all admin opportunity scrape results
CREATE TABLE public.admin_scrape_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  category TEXT NOT NULL,
  sub_category TEXT,
  custom_query TEXT,
  research_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  sources JSONB DEFAULT '[]'::jsonb,
  opportunities JSONB DEFAULT '[]'::jsonb,
  opportunities_count INT DEFAULT 0,
  raw_output TEXT,
  market_context TEXT,
  status TEXT DEFAULT 'complete',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_scrape_history ENABLE ROW LEVEL SECURITY;

-- Admin-only access
CREATE POLICY "Admins can view scrape history"
  ON public.admin_scrape_history
  FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert scrape history"
  ON public.admin_scrape_history
  FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete scrape history"
  ON public.admin_scrape_history
  FOR DELETE
  USING (public.is_admin(auth.uid()));

-- Index for efficient queries
CREATE INDEX idx_admin_scrape_history_category ON public.admin_scrape_history(category);
CREATE INDEX idx_admin_scrape_history_date ON public.admin_scrape_history(created_at DESC);
