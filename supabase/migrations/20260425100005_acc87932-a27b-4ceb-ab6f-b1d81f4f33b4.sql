-- Generalize admin_scrape_history so all scrapers can save their results
ALTER TABLE public.admin_scrape_history
  ADD COLUMN IF NOT EXISTS source text,
  ADD COLUMN IF NOT EXISTS platform text,
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS payload jsonb;

CREATE INDEX IF NOT EXISTS idx_admin_scrape_history_source ON public.admin_scrape_history(source);
CREATE INDEX IF NOT EXISTS idx_admin_scrape_history_platform ON public.admin_scrape_history(platform);
CREATE INDEX IF NOT EXISTS idx_admin_scrape_history_created_at ON public.admin_scrape_history(created_at DESC);