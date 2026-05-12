CREATE TABLE public.realtime_investment_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL,
  asset_name TEXT,
  asset_type TEXT,
  alert_category TEXT NOT NULL,
  classification TEXT NOT NULL,
  confidence_score NUMERIC NOT NULL DEFAULT 0,
  urgency_rating TEXT NOT NULL DEFAULT 'medium',
  catalyst_explanation TEXT,
  actionable_summary TEXT,
  risk_disclaimer TEXT,
  signals JSONB DEFAULT '[]'::jsonb,
  source_refs JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'active',
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.realtime_investment_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view alerts" ON public.realtime_investment_alerts
  FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can insert alerts" ON public.realtime_investment_alerts
  FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update alerts" ON public.realtime_investment_alerts
  FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete alerts" ON public.realtime_investment_alerts
  FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Service role full access alerts" ON public.realtime_investment_alerts
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX idx_realtime_alerts_status_created ON public.realtime_investment_alerts (status, created_at DESC);
CREATE INDEX idx_realtime_alerts_classification ON public.realtime_investment_alerts (classification);

CREATE TRIGGER update_realtime_alerts_updated_at
  BEFORE UPDATE ON public.realtime_investment_alerts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();