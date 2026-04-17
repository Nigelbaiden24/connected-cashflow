-- Intelligence pipeline schema (PitchBook-lite)

-- Sources registry
CREATE TABLE public.intel_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_key text UNIQUE NOT NULL,
  name text NOT NULL,
  source_type text NOT NULL, -- 'registry' | 'news' | 'company_site' | 'github' | 'newsletter' | 'grant' | 'vc_portfolio' | 'job_board'
  base_url text,
  priority_weight int NOT NULL DEFAULT 3, -- 1 (low) .. 5 (highest reliability)
  enabled boolean NOT NULL DEFAULT true,
  last_run_at timestamptz,
  config jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Companies (canonical record)
CREATE TABLE public.intel_companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  normalized_name text NOT NULL, -- lowercased, no Ltd/Inc/etc.
  registry_id text, -- Companies House number, SEC CIK, etc.
  registry_source text, -- 'companies_house' | 'sec_edgar' | etc.
  country text,
  region text,
  sector text,
  sub_sector text,
  website text,
  description text,
  founded_date date,
  employee_count_estimate int,
  status text NOT NULL DEFAULT 'active', -- active | dissolved | merged
  merged_into_id uuid REFERENCES public.intel_companies(id) ON DELETE SET NULL,
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  confidence_score numeric(3,2) NOT NULL DEFAULT 0.50, -- 0..1
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_intel_companies_normalized_name ON public.intel_companies(normalized_name);
CREATE INDEX idx_intel_companies_sector ON public.intel_companies(sector);
CREATE INDEX idx_intel_companies_country ON public.intel_companies(country);
CREATE INDEX idx_intel_companies_registry ON public.intel_companies(registry_source, registry_id);

-- Company aliases (for dedup)
CREATE TABLE public.intel_company_aliases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.intel_companies(id) ON DELETE CASCADE,
  alias text NOT NULL,
  normalized_alias text NOT NULL,
  source text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (company_id, normalized_alias)
);
CREATE INDEX idx_intel_company_aliases_normalized ON public.intel_company_aliases(normalized_alias);

-- People (directors, founders, key personnel)
CREATE TABLE public.intel_people (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  normalized_name text NOT NULL,
  linkedin_url text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_intel_people_normalized_name ON public.intel_people(normalized_name);

-- Company <-> People link (roles)
CREATE TABLE public.intel_company_people (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.intel_companies(id) ON DELETE CASCADE,
  person_id uuid NOT NULL REFERENCES public.intel_people(id) ON DELETE CASCADE,
  role text NOT NULL, -- 'director' | 'officer' | 'founder' | 'ceo' | etc.
  appointed_on date,
  resigned_on date,
  source text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_intel_company_people_company ON public.intel_company_people(company_id);
CREATE INDEX idx_intel_company_people_person ON public.intel_company_people(person_id);

-- Investors
CREATE TABLE public.intel_investors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  normalized_name text NOT NULL,
  investor_type text, -- 'vc' | 'pe' | 'angel' | 'corporate' | 'family_office' | 'government'
  website text,
  country text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_intel_investors_normalized_name ON public.intel_investors(normalized_name);

-- Universal event log (funding, hiring, filings, products, grants, partnerships, formations)
CREATE TABLE public.intel_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.intel_companies(id) ON DELETE CASCADE,
  event_type text NOT NULL, -- 'funding_round' | 'hiring_spike' | 'filing' | 'director_change' | 'product_launch' | 'grant_award' | 'partnership' | 'formation' | 'exit' | 'github_activity'
  event_subtype text,
  event_date date,
  title text NOT NULL,
  summary text,
  amount_value numeric(18,2),
  amount_currency text,
  funding_stage text, -- 'pre_seed' | 'seed' | 'series_a' | etc.
  source_id uuid REFERENCES public.intel_sources(id) ON DELETE SET NULL,
  source_url text,
  signal_tier text NOT NULL DEFAULT 'media_reported', -- 'official' | 'first_party' | 'investor_confirmed' | 'media_reported' | 'curated_insight'
  confidence text NOT NULL DEFAULT 'medium', -- 'high' | 'medium' | 'low'
  confidence_score numeric(3,2) NOT NULL DEFAULT 0.50,
  cross_verified_count int NOT NULL DEFAULT 1,
  raw_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  structured_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'new', -- 'new' | 'reviewed' | 'promoted' | 'dismissed' | 'flagged'
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_intel_events_company ON public.intel_events(company_id);
CREATE INDEX idx_intel_events_type ON public.intel_events(event_type);
CREATE INDEX idx_intel_events_date ON public.intel_events(event_date DESC);
CREATE INDEX idx_intel_events_status ON public.intel_events(status);
CREATE INDEX idx_intel_events_confidence ON public.intel_events(confidence);

-- Event <-> Investor link
CREATE TABLE public.intel_event_investors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.intel_events(id) ON DELETE CASCADE,
  investor_id uuid NOT NULL REFERENCES public.intel_investors(id) ON DELETE CASCADE,
  is_lead boolean NOT NULL DEFAULT false,
  amount_value numeric(18,2),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, investor_id)
);

-- Source runs (job log)
CREATE TABLE public.intel_source_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid NOT NULL REFERENCES public.intel_sources(id) ON DELETE CASCADE,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  status text NOT NULL DEFAULT 'running', -- 'running' | 'success' | 'partial' | 'failed'
  items_found int NOT NULL DEFAULT 0,
  items_inserted int NOT NULL DEFAULT 0,
  items_updated int NOT NULL DEFAULT 0,
  errors jsonb DEFAULT '[]'::jsonb,
  triggered_by text DEFAULT 'cron'
);
CREATE INDEX idx_intel_source_runs_source ON public.intel_source_runs(source_id, started_at DESC);

-- Auto-generated alerts for admin review
CREATE TABLE public.intel_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type text NOT NULL, -- 'new_funding' | 'hiring_spike' | 'new_formation' | 'high_growth' | 'inconsistency'
  severity text NOT NULL DEFAULT 'medium', -- 'low' | 'medium' | 'high' | 'critical'
  title text NOT NULL,
  description text,
  company_id uuid REFERENCES public.intel_companies(id) ON DELETE CASCADE,
  event_id uuid REFERENCES public.intel_events(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'unread', -- 'unread' | 'read' | 'actioned' | 'dismissed'
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_intel_alerts_status ON public.intel_alerts(status);
CREATE INDEX idx_intel_alerts_severity ON public.intel_alerts(severity);
CREATE INDEX idx_intel_alerts_created ON public.intel_alerts(created_at DESC);

-- Enable RLS — admin only for everything
ALTER TABLE public.intel_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intel_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intel_company_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intel_people ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intel_company_people ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intel_investors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intel_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intel_event_investors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intel_source_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intel_alerts ENABLE ROW LEVEL SECURITY;

-- Admin-only policies (uses existing public.is_admin function)
DO $$
DECLARE
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'intel_sources','intel_companies','intel_company_aliases','intel_people',
    'intel_company_people','intel_investors','intel_events','intel_event_investors',
    'intel_source_runs','intel_alerts'
  ]
  LOOP
    EXECUTE format('CREATE POLICY "Admins manage %1$I" ON public.%1$I FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()))', tbl);
  END LOOP;
END $$;

-- Updated_at triggers
CREATE TRIGGER trg_intel_sources_updated BEFORE UPDATE ON public.intel_sources
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_intel_companies_updated BEFORE UPDATE ON public.intel_companies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_intel_people_updated BEFORE UPDATE ON public.intel_people
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_intel_investors_updated BEFORE UPDATE ON public.intel_investors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_intel_events_updated BEFORE UPDATE ON public.intel_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed source registry
INSERT INTO public.intel_sources (source_key, name, source_type, base_url, priority_weight) VALUES
  ('companies_house', 'Companies House', 'registry', 'https://api.company-information.service.gov.uk', 5),
  ('sec_edgar', 'SEC EDGAR', 'registry', 'https://data.sec.gov', 5),
  ('techcrunch', 'TechCrunch', 'news', 'https://techcrunch.com', 3),
  ('sifted', 'Sifted', 'news', 'https://sifted.eu', 3),
  ('crunchbase_news', 'Crunchbase News', 'news', 'https://news.crunchbase.com', 3),
  ('github', 'GitHub', 'github', 'https://api.github.com', 4),
  ('substack', 'Substack VC Newsletters', 'newsletter', 'https://substack.com', 3),
  ('beehiiv', 'Beehiiv VC Newsletters', 'newsletter', 'https://beehiiv.com', 3),
  ('innovate_uk', 'Innovate UK', 'grant', 'https://www.ukri.org/councils/innovate-uk', 5),
  ('eu_funding', 'EU Funding & Tenders Portal', 'grant', 'https://ec.europa.eu/info/funding-tenders', 5);