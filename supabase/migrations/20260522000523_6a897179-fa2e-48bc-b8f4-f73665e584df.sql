
-- Multi-page report support
ALTER TABLE public.generated_research_reports
  ADD COLUMN IF NOT EXISTS pages jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS page_count integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS report_date date NOT NULL DEFAULT CURRENT_DATE;

-- Scheduled scrapers
CREATE TABLE IF NOT EXISTS public.research_scraper_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_type text NOT NULL CHECK (asset_type IN ('stock','crypto')),
  topic text NOT NULL,
  ticker text,
  extra_urls text[] NOT NULL DEFAULT '{}',
  frequency_hours integer NOT NULL DEFAULT 24 CHECK (frequency_hours BETWEEN 1 AND 720),
  enabled boolean NOT NULL DEFAULT true,
  last_run_at timestamptz,
  last_run_status text,
  last_run_error text,
  next_run_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rss_due ON public.research_scraper_schedules(enabled, next_run_at);
CREATE INDEX IF NOT EXISTS idx_rss_asset ON public.research_scraper_schedules(asset_type);

ALTER TABLE public.research_scraper_schedules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admins manage research scraper schedules" ON public.research_scraper_schedules;
CREATE POLICY "admins manage research scraper schedules"
ON public.research_scraper_schedules
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE TRIGGER update_rss_updated_at
BEFORE UPDATE ON public.research_scraper_schedules
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
