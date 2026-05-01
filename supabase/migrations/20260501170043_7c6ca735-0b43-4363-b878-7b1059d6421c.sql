
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- pipeline_schedule: cadence + state per source
CREATE TABLE public.pipeline_schedule (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT NOT NULL UNIQUE,
  enabled BOOLEAN NOT NULL DEFAULT true,
  cadence_minutes INTEGER NOT NULL DEFAULT 360,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  next_run_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_run_at TIMESTAMPTZ,
  last_status TEXT,
  last_error TEXT,
  consecutive_failures INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- pipeline_runs: per-execution audit trail
CREATE TABLE public.pipeline_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'running',
  attempt INTEGER NOT NULL DEFAULT 1,
  triggered_by TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ,
  duration_ms INTEGER,
  records_fetched INTEGER DEFAULT 0,
  records_new INTEGER DEFAULT 0,
  records_enriched INTEGER DEFAULT 0,
  records_staged INTEGER DEFAULT 0,
  errors JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_pipeline_runs_source_started ON public.pipeline_runs(source, started_at DESC);

-- pipeline_pending_items: AI-enriched candidates awaiting promotion
CREATE TABLE public.pipeline_pending_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  run_id UUID REFERENCES public.pipeline_runs(id) ON DELETE SET NULL,
  source TEXT NOT NULL,
  target_table TEXT NOT NULL,
  target_platform TEXT,
  dedup_hash TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  summary TEXT,
  category TEXT,
  source_url TEXT,
  raw_payload JSONB,
  enriched_payload JSONB,
  ai_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  ai_score NUMERIC(3,1),
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  promoted_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_pipeline_pending_status ON public.pipeline_pending_items(status, created_at DESC);
CREATE INDEX idx_pipeline_pending_source ON public.pipeline_pending_items(source);

-- Enable RLS — admin-only
ALTER TABLE public.pipeline_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_pending_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage pipeline_schedule" ON public.pipeline_schedule
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins read pipeline_runs" ON public.pipeline_runs
  FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins manage pipeline_pending_items" ON public.pipeline_pending_items
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- updated_at trigger
CREATE TRIGGER update_pipeline_schedule_updated_at
  BEFORE UPDATE ON public.pipeline_schedule
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed schedule rows for the 6 known sources (staggered next_run_at)
INSERT INTO public.pipeline_schedule (source, enabled, cadence_minutes, next_run_at, config) VALUES
  ('financial-research',   true, 360, now() + interval '1 minute',  '{}'::jsonb),
  ('intel-orchestrate',    true, 180, now() + interval '3 minutes', '{}'::jsonb),
  ('opportunity-research', true, 360, now() + interval '5 minutes', '{}'::jsonb),
  ('investor-finder',      true, 720, now() + interval '7 minutes', '{}'::jsonb),
  ('elite-scraper',        true, 720, now() + interval '9 minutes', '{}'::jsonb),
  ('companies-house',      true, 720, now() + interval '11 minutes','{}'::jsonb)
ON CONFLICT (source) DO NOTHING;

-- Schedule pg_cron job to invoke run-data-pipeline every 30 minutes
SELECT cron.schedule(
  'run-data-pipeline-every-30min',
  '*/30 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://wlsmdcdfyudtvbnbqfmn.supabase.co/functions/v1/run-data-pipeline',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indsc21kY2RmeXVkdHZibmJxZm1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzOTEyMTYsImV4cCI6MjA3Mzk2NzIxNn0.EChqxdjqS0FmjSoC65x557HdB2sY9AFiAsN5fXH-AmU"}'::jsonb,
    body := jsonb_build_object('triggered_by', 'cron', 'time', now())
  );
  $$
);
