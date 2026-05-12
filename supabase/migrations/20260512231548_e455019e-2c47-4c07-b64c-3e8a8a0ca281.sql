CREATE TABLE public.discovery_engine_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL,
  asset_name TEXT,
  asset_type TEXT,
  discovery_bucket TEXT NOT NULL,
  sector TEXT,
  valuation_metrics JSONB DEFAULT '{}'::jsonb,
  momentum_metrics JSONB DEFAULT '{}'::jsonb,
  dividend_metrics JSONB DEFAULT '{}'::jsonb,
  earnings_growth JSONB DEFAULT '{}'::jsonb,
  analyst_sentiment JSONB DEFAULT '{}'::jsonb,
  volatility_metrics JSONB DEFAULT '{}'::jsonb,
  institutional_ownership JSONB DEFAULT '{}'::jsonb,
  sector_performance JSONB DEFAULT '{}'::jsonb,
  thesis TEXT,
  catalysts JSONB DEFAULT '[]'::jsonb,
  risks JSONB DEFAULT '[]'::jsonb,
  score NUMERIC NOT NULL DEFAULT 0,
  conviction TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.discovery_engine_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view discovery" ON public.discovery_engine_results
  FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins insert discovery" ON public.discovery_engine_results
  FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins update discovery" ON public.discovery_engine_results
  FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins delete discovery" ON public.discovery_engine_results
  FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Service role full access discovery" ON public.discovery_engine_results
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX idx_discovery_bucket_created ON public.discovery_engine_results (discovery_bucket, created_at DESC);
CREATE INDEX idx_discovery_status ON public.discovery_engine_results (status);

CREATE TRIGGER update_discovery_results_updated_at
  BEFORE UPDATE ON public.discovery_engine_results
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();