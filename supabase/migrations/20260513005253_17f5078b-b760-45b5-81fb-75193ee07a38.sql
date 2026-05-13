
-- Make sure autoscrape is ON
UPDATE public.analyst_pipeline_settings SET autoscrape_enabled = true, updated_at = now() WHERE id = 1;

-- Helper: schedule a function call via pg_net
DO $$
DECLARE
  service_key text;
  fn_url_pipeline text := 'https://wlsmdcdfyudtvbnbqfmn.supabase.co/functions/v1/analyst-pipeline';
  fn_url_intel    text := 'https://wlsmdcdfyudtvbnbqfmn.supabase.co/functions/v1/intel-orchestrate';
BEGIN
  -- Unschedule existing if present (safe if missing)
  PERFORM cron.unschedule('analyst-pipeline-30min') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'analyst-pipeline-30min');
  PERFORM cron.unschedule('intel-orchestrate-hourly') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'intel-orchestrate-hourly');
END $$;

SELECT cron.schedule(
  'analyst-pipeline-30min',
  '*/30 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://wlsmdcdfyudtvbnbqfmn.supabase.co/functions/v1/analyst-pipeline',
    headers := jsonb_build_object('Content-Type','application/json'),
    body := jsonb_build_object('trigger','cron')
  );
  $$
);

SELECT cron.schedule(
  'intel-orchestrate-hourly',
  '15 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://wlsmdcdfyudtvbnbqfmn.supabase.co/functions/v1/intel-orchestrate',
    headers := jsonb_build_object('Content-Type','application/json'),
    body := '{}'::jsonb
  );
  $$
);
