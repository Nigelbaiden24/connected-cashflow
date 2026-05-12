ALTER TABLE public.analyst_briefs
  ADD COLUMN IF NOT EXISTS extended jsonb NOT NULL DEFAULT '{}'::jsonb;