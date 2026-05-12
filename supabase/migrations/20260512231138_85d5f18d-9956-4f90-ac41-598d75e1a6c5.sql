CREATE TABLE public.etf_fund_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticker TEXT NOT NULL,
  fund_name TEXT NOT NULL,
  fund_type TEXT,
  asset_class TEXT,
  region TEXT,
  holdings_concentration JSONB DEFAULT '{}'::jsonb,
  sector_exposure JSONB DEFAULT '{}'::jsonb,
  historical_performance JSONB DEFAULT '{}'::jsonb,
  fee_analysis JSONB DEFAULT '{}'::jsonb,
  fund_flows JSONB DEFAULT '{}'::jsonb,
  manager_performance JSONB DEFAULT '{}'::jsonb,
  volatility_metrics JSONB DEFAULT '{}'::jsonb,
  summary TEXT,
  pros JSONB DEFAULT '[]'::jsonb,
  cons JSONB DEFAULT '[]'::jsonb,
  suitable_investor_types JSONB DEFAULT '[]'::jsonb,
  comparative_analysis TEXT,
  trend_commentary TEXT,
  overall_score NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.etf_fund_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view etf analyses" ON public.etf_fund_analyses
  FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins insert etf analyses" ON public.etf_fund_analyses
  FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins update etf analyses" ON public.etf_fund_analyses
  FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins delete etf analyses" ON public.etf_fund_analyses
  FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Service role full access etf analyses" ON public.etf_fund_analyses
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX idx_etf_analyses_ticker ON public.etf_fund_analyses (ticker);
CREATE INDEX idx_etf_analyses_status_created ON public.etf_fund_analyses (status, created_at DESC);

CREATE TRIGGER update_etf_analyses_updated_at
  BEFORE UPDATE ON public.etf_fund_analyses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();