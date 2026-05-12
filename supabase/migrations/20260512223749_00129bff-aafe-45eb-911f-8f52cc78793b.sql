
CREATE TABLE public.analyst_raw_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  source_url TEXT,
  title TEXT,
  content TEXT,
  raw_payload JSONB,
  dedup_hash TEXT UNIQUE,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  classified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_raw_signals_classified ON public.analyst_raw_signals (classified, fetched_at DESC);

CREATE TABLE public.analyst_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  raw_signal_id UUID REFERENCES public.analyst_raw_signals(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  tickers TEXT[] DEFAULT '{}',
  sectors TEXT[] DEFAULT '{}',
  regions TEXT[] DEFAULT '{}',
  sentiment NUMERIC,
  urgency INTEGER,
  summary TEXT,
  scored BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_signals_scored ON public.analyst_signals (scored, created_at DESC);

CREATE TABLE public.analyst_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_key TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  persona TEXT NOT NULL,
  conviction NUMERIC NOT NULL DEFAULT 0,
  opportunity_score INTEGER NOT NULL DEFAULT 0,
  risk_score INTEGER NOT NULL DEFAULT 0,
  time_horizon TEXT,
  evidence_signal_ids UUID[] DEFAULT '{}',
  metadata JSONB,
  brief_generated BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_opps_brief ON public.analyst_opportunities (brief_generated, created_at DESC);

CREATE TABLE public.analyst_briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID REFERENCES public.analyst_opportunities(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  persona TEXT NOT NULL,
  category TEXT NOT NULL,
  conviction NUMERIC NOT NULL DEFAULT 0,
  opportunity_score INTEGER NOT NULL DEFAULT 0,
  risk_score INTEGER NOT NULL DEFAULT 0,
  time_horizon TEXT,
  thesis TEXT,
  catalyst TEXT,
  key_levels TEXT,
  risks TEXT,
  action TEXT,
  full_markdown TEXT,
  compliance_pass BOOLEAN NOT NULL DEFAULT false,
  compliance_flags JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending',
  promoted_opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE SET NULL,
  rejection_reason TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_briefs_status ON public.analyst_briefs (status, created_at DESC);

CREATE TABLE public.analyst_pipeline_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trigger_source TEXT NOT NULL DEFAULT 'cron',
  scraped INTEGER NOT NULL DEFAULT 0,
  classified INTEGER NOT NULL DEFAULT 0,
  scored INTEGER NOT NULL DEFAULT 0,
  generated INTEGER NOT NULL DEFAULT 0,
  errors JSONB DEFAULT '[]'::jsonb,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ,
  duration_ms INTEGER
);
CREATE INDEX idx_runs_started ON public.analyst_pipeline_runs (started_at DESC);

CREATE TABLE public.analyst_pipeline_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  autoscrape_enabled BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (id = 1)
);
INSERT INTO public.analyst_pipeline_settings (id, autoscrape_enabled) VALUES (1, true) ON CONFLICT DO NOTHING;

ALTER TABLE public.analyst_raw_signals       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyst_signals           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyst_opportunities     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyst_briefs            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyst_pipeline_runs     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyst_pipeline_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage analyst_raw_signals"      ON public.analyst_raw_signals      FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins manage analyst_signals"          ON public.analyst_signals          FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins manage analyst_opportunities"    ON public.analyst_opportunities    FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins manage analyst_briefs"           ON public.analyst_briefs           FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins manage analyst_pipeline_runs"    ON public.analyst_pipeline_runs    FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins manage analyst_pipeline_settings" ON public.analyst_pipeline_settings FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE TRIGGER trg_analyst_briefs_updated
  BEFORE UPDATE ON public.analyst_briefs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
