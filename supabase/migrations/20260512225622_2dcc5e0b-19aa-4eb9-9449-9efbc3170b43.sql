CREATE TABLE public.analyst_benchmark_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  headline TEXT NOT NULL,
  executive_summary TEXT,
  mobile_summary TEXT,
  push_summary TEXT,
  full_commentary TEXT,
  rankings JSONB DEFAULT '{}'::jsonb,
  outperformers JSONB DEFAULT '[]'::jsonb,
  underperformers JSONB DEFAULT '[]'::jsonb,
  capital_flows JSONB DEFAULT '[]'::jsonb,
  momentum_shifts JSONB DEFAULT '[]'::jsonb,
  trend_reversals JSONB DEFAULT '[]'::jsonb,
  anomalies JSONB DEFAULT '[]'::jsonb,
  sector_analysis JSONB DEFAULT '{}'::jsonb,
  regional_analysis JSONB DEFAULT '{}'::jsonb,
  growth_vs_value JSONB DEFAULT '{}'::jsonb,
  sentiment_analysis JSONB DEFAULT '{}'::jsonb,
  sources JSONB DEFAULT '[]'::jsonb,
  confidence_score NUMERIC DEFAULT 3.0,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.analyst_benchmark_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage benchmark reports"
ON public.analyst_benchmark_reports
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Service role full access benchmark reports"
ON public.analyst_benchmark_reports
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE INDEX idx_benchmark_reports_status_created
  ON public.analyst_benchmark_reports (status, created_at DESC);

CREATE TRIGGER update_analyst_benchmark_reports_updated_at
BEFORE UPDATE ON public.analyst_benchmark_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();