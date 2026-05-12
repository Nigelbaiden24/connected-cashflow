CREATE TABLE IF NOT EXISTS public.analyst_market_commentary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  headline text NOT NULL,
  executive_summary text,
  mobile_summary text,
  analyst_commentary text,
  retail_breakdown text,
  push_summary text,
  sections jsonb NOT NULL DEFAULT '{}'::jsonb,
  why_moved text,
  beneficiary_sectors text,
  institutional_flows text,
  risks_ahead text,
  market_implications text,
  sources jsonb NOT NULL DEFAULT '[]'::jsonb,
  confidence_score integer,
  status text NOT NULL DEFAULT 'pending',
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.analyst_market_commentary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage market commentary"
  ON public.analyst_market_commentary
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Service role full access market commentary"
  ON public.analyst_market_commentary
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_market_commentary_status_created
  ON public.analyst_market_commentary (status, created_at DESC);

CREATE TRIGGER update_market_commentary_updated_at
  BEFORE UPDATE ON public.analyst_market_commentary
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();