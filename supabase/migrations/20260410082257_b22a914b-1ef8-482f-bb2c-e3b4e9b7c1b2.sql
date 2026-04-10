
CREATE TABLE public.investor_finder_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  investor_name TEXT NOT NULL,
  investor_type TEXT NOT NULL DEFAULT 'vc',
  sectors TEXT[] DEFAULT '{}',
  location TEXT,
  country TEXT DEFAULT 'UK',
  stage_focus TEXT[] DEFAULT '{}',
  avg_cheque_min NUMERIC,
  avg_cheque_max NUMERIC,
  total_deals INTEGER DEFAULT 0,
  fund_size NUMERIC,
  dry_powder NUMERIC,
  actively_investing BOOLEAN DEFAULT true,
  recent_deals JSONB DEFAULT '[]',
  portfolio_companies TEXT[] DEFAULT '{}',
  contact_email TEXT,
  contact_phone TEXT,
  linkedin_url TEXT,
  website TEXT,
  geography_focus TEXT[] DEFAULT '{}',
  fundraising_status TEXT,
  keywords TEXT[] DEFAULT '{}',
  last_investment_date DATE,
  notes TEXT,
  description TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.investor_finder_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view investor profiles"
  ON public.investor_finder_profiles FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Admins can insert investor profiles"
  ON public.investor_finder_profiles FOR INSERT
  TO authenticated WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update investor profiles"
  ON public.investor_finder_profiles FOR UPDATE
  TO authenticated USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete investor profiles"
  ON public.investor_finder_profiles FOR DELETE
  TO authenticated USING (public.is_admin(auth.uid()));

CREATE TRIGGER update_investor_finder_profiles_updated_at
  BEFORE UPDATE ON public.investor_finder_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_investor_finder_type ON public.investor_finder_profiles(investor_type);
CREATE INDEX idx_investor_finder_sectors ON public.investor_finder_profiles USING GIN(sectors);
CREATE INDEX idx_investor_finder_stage ON public.investor_finder_profiles USING GIN(stage_focus);
CREATE INDEX idx_investor_finder_keywords ON public.investor_finder_profiles USING GIN(keywords);
CREATE INDEX idx_investor_finder_location ON public.investor_finder_profiles(country, location);
