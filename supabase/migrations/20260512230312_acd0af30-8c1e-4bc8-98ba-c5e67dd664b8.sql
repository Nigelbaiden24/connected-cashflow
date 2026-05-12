CREATE TABLE public.analyst_dynamic_watchlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL,
  asset_name TEXT,
  asset_type TEXT,
  trigger_type TEXT NOT NULL,
  watchlist_reason TEXT,
  entry_risk_level TEXT,
  momentum_score NUMERIC DEFAULT 0,
  catalyst_summary TEXT,
  support_resistance TEXT,
  alert_urgency_score NUMERIC DEFAULT 0,
  signals JSONB DEFAULT '[]'::jsonb,
  confidence_score NUMERIC DEFAULT 3.0,
  status TEXT NOT NULL DEFAULT 'active',
  expires_at TIMESTAMPTZ,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.analyst_dynamic_watchlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage dynamic watchlist"
ON public.analyst_dynamic_watchlist
FOR ALL TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Service role full access dynamic watchlist"
ON public.analyst_dynamic_watchlist
FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE INDEX idx_dyn_watchlist_status_urgency
  ON public.analyst_dynamic_watchlist (status, alert_urgency_score DESC, created_at DESC);

CREATE TRIGGER update_analyst_dynamic_watchlist_updated_at
BEFORE UPDATE ON public.analyst_dynamic_watchlist
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();