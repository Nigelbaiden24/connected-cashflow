
CREATE TABLE IF NOT EXISTS public.platform_config (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

ALTER TABLE public.platform_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read platform config" ON public.platform_config;
CREATE POLICY "Anyone can read platform config"
  ON public.platform_config FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins manage platform config" ON public.platform_config;
CREATE POLICY "Admins manage platform config"
  ON public.platform_config FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

INSERT INTO public.platform_config (key, value)
VALUES ('auto_scraper_enabled', '{"enabled": false}'::jsonb)
ON CONFLICT (key) DO NOTHING;
