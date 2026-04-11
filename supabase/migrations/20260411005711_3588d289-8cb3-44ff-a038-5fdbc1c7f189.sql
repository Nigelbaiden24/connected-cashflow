
-- Create company_intelligence table for PitchBook-style data (FlowPulse Finance)
CREATE TABLE public.company_intelligence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  ticker TEXT,
  sector TEXT,
  industry TEXT,
  location TEXT,
  country TEXT DEFAULT 'UK',
  revenue_estimate NUMERIC,
  revenue_currency TEXT DEFAULT 'GBP',
  employee_count INTEGER,
  ownership_type TEXT DEFAULT 'private',
  fundraising_history JSONB DEFAULT '[]',
  competitors TEXT[] DEFAULT '{}',
  funding_rounds JSONB DEFAULT '[]',
  ma_transactions JSONB DEFAULT '[]',
  valuations JSONB DEFAULT '[]',
  exits JSONB DEFAULT '[]',
  founded_year INTEGER,
  website TEXT,
  description TEXT,
  status TEXT DEFAULT 'active',
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.company_intelligence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view company intelligence"
  ON public.company_intelligence FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert company intelligence"
  ON public.company_intelligence FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update company intelligence"
  ON public.company_intelligence FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete company intelligence"
  ON public.company_intelligence FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE INDEX idx_company_intelligence_sector ON public.company_intelligence (sector);
CREATE INDEX idx_company_intelligence_country ON public.company_intelligence (country);
CREATE INDEX idx_company_intelligence_status ON public.company_intelligence (status);

CREATE TRIGGER update_company_intelligence_updated_at
  BEFORE UPDATE ON public.company_intelligence
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create startup_discovery table for crowdfunding/startup profiles (FlowPulse Investor)
CREATE TABLE public.startup_discovery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  sector TEXT,
  industry TEXT,
  founders TEXT[] DEFAULT '{}',
  location TEXT,
  country TEXT DEFAULT 'UK',
  funding_total NUMERIC DEFAULT 0,
  funding_currency TEXT DEFAULT 'GBP',
  headcount INTEGER,
  founding_year INTEGER,
  crowdfunding_platform TEXT,
  campaign_url TEXT,
  lead_score NUMERIC DEFAULT 0,
  growth_indicators JSONB DEFAULT '{}',
  buyer_signals JSONB DEFAULT '{}',
  pitch_deck_url TEXT,
  website TEXT,
  description TEXT,
  status TEXT DEFAULT 'active',
  logo_url TEXT,
  prospect_tags TEXT[] DEFAULT '{}',
  last_funding_date DATE,
  funding_stage TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.startup_discovery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view startup discovery"
  ON public.startup_discovery FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert startup discovery"
  ON public.startup_discovery FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update startup discovery"
  ON public.startup_discovery FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete startup discovery"
  ON public.startup_discovery FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE INDEX idx_startup_discovery_sector ON public.startup_discovery (sector);
CREATE INDEX idx_startup_discovery_platform ON public.startup_discovery (crowdfunding_platform);
CREATE INDEX idx_startup_discovery_tags ON public.startup_discovery USING GIN (prospect_tags);
CREATE INDEX idx_startup_discovery_lead_score ON public.startup_discovery (lead_score DESC);

CREATE TRIGGER update_startup_discovery_updated_at
  BEFORE UPDATE ON public.startup_discovery
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Fix the reports bucket to be public so opportunity images display correctly
UPDATE storage.buckets SET public = true WHERE id = 'reports';
