-- Market Pulse: right-hand news sidebar and movers ticker on FlowPulse Investor.
-- Filled by the market-pulse-refresh edge function. platform_config
-- 'market_pulse' holds the admin's Auto/Manual choice; in Manual nothing runs
-- on a schedule.

CREATE TABLE IF NOT EXISTS public.market_pulse_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('news', 'trending', 'article', 'mover')),
  title text NOT NULL,
  summary text,
  why text,
  url text,
  source text,
  image_url text,
  symbol text,
  asset_type text CHECK (asset_type IN ('stock', 'crypto', 'index')),
  price numeric,
  currency text,
  changes jsonb,                 -- {"1d": 1.2, "1w": -3.4, "1m": ..., "ytd": ..., "1y": ...} in %
  tags text[],
  rank integer NOT NULL DEFAULT 0,
  published_at timestamptz,
  batch_id uuid,
  hidden boolean NOT NULL DEFAULT false,
  pinned boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS market_pulse_items_kind_idx ON public.market_pulse_items (kind, created_at DESC);

REVOKE ALL ON public.market_pulse_items FROM anon, authenticated;
GRANT SELECT ON public.market_pulse_items TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.market_pulse_items TO authenticated;
GRANT ALL ON public.market_pulse_items TO service_role;

ALTER TABLE public.market_pulse_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Signed-in users read market pulse" ON public.market_pulse_items;
CREATE POLICY "Signed-in users read market pulse" ON public.market_pulse_items FOR SELECT
  USING (auth.uid() IS NOT NULL AND (hidden = false OR (SELECT public.is_admin(auth.uid()))));

DROP POLICY IF EXISTS "Admins manage market pulse" ON public.market_pulse_items;
CREATE POLICY "Admins manage market pulse" ON public.market_pulse_items FOR ALL
  USING ((SELECT public.is_admin(auth.uid())))
  WITH CHECK ((SELECT public.is_admin(auth.uid())));

-- Default settings: Manual until an admin switches to Auto.
DO $data$
BEGIN
  INSERT INTO public.platform_config (key, value)
  VALUES ('market_pulse', jsonb_build_object(
    'mode', 'manual', 'interval_minutes', 120, 'sidebar_enabled', true, 'ticker_enabled', true
  ))
  ON CONFLICT (key) DO NOTHING;
END
$data$;

-- Every 15 minutes; the function does nothing unless mode = 'auto' and a
-- refresh is due (interval_minutes since the last run).
DO $cron$
BEGIN
  PERFORM cron.unschedule('market-pulse-tick') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'market-pulse-tick');
  PERFORM cron.schedule(
    'market-pulse-tick',
    '*/15 * * * *',
    $job$
    select net.http_post(
      url := 'https://wlsmdcdfyudtvbnbqfmn.supabase.co/functions/v1/market-pulse-refresh',
      headers := '{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indsc21kY2RmeXVkdHZibmJxZm1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzOTEyMTYsImV4cCI6MjA3Mzk2NzIxNn0.EChqxdjqS0FmjSoC65x557HdB2sY9AFiAsN5fXH-AmU"}'::jsonb,
      body := jsonb_build_object('triggered_by', 'cron')
    );
    $job$
  );
END
$cron$;
