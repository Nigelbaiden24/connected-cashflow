CREATE TABLE public.investor_segments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  target_user_id UUID NOT NULL UNIQUE,
  primary_segment TEXT NOT NULL,
  secondary_segments JSONB DEFAULT '[]'::jsonb,
  segment_confidence NUMERIC DEFAULT 3.0,
  behavioural_signals JSONB DEFAULT '{}'::jsonb,
  risk_tolerance TEXT,
  engagement_score NUMERIC DEFAULT 0,
  recommended_assets JSONB DEFAULT '[]'::jsonb,
  recommended_portfolios JSONB DEFAULT '[]'::jsonb,
  recommended_content JSONB DEFAULT '[]'::jsonb,
  recommended_alerts JSONB DEFAULT '[]'::jsonb,
  recommended_watchlists JSONB DEFAULT '[]'::jsonb,
  summary TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.investor_segments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage investor segments"
ON public.investor_segments FOR ALL TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Users read own segment"
ON public.investor_segments FOR SELECT TO authenticated
USING (target_user_id = auth.uid());

CREATE POLICY "Service role full access investor segments"
ON public.investor_segments FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE INDEX idx_investor_segments_segment
  ON public.investor_segments (primary_segment, updated_at DESC);

CREATE TRIGGER update_investor_segments_updated_at
BEFORE UPDATE ON public.investor_segments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();