
-- Set stock & crypto research scraper schedules to 24h
UPDATE public.research_scraper_schedules
SET frequency_hours = 24, updated_at = now()
WHERE asset_type IN ('stock','crypto');

-- Reschedule cron jobs to run once every 24h (00:10 UTC daily)
SELECT cron.unschedule('run-data-pipeline-hourly');
SELECT cron.unschedule('run-research-scraper-schedules-15m');

SELECT cron.schedule(
  'run-data-pipeline-daily',
  '10 0 * * *',
  $$
  select net.http_post(
    url := 'https://wlsmdcdfyudtvbnbqfmn.supabase.co/functions/v1/run-data-pipeline',
    headers := '{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indsc21kY2RmeXVkdHZibmJxZm1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzOTEyMTYsImV4cCI6MjA3Mzk2NzIxNn0.EChqxdjqS0FmjSoC65x557HdB2sY9AFiAsN5fXH-AmU"}'::jsonb,
    body := jsonb_build_object('triggered_by','cron','t', now())
  );
  $$
);

SELECT cron.schedule(
  'run-research-scraper-schedules-daily',
  '20 0 * * *',
  $$
  SELECT net.http_post(
    url := 'https://wlsmdcdfyudtvbnbqfmn.supabase.co/functions/v1/run-research-scraper-schedules',
    headers := '{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indsc21kY2RmeXVkdHZibmJxZm1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzOTEyMTYsImV4cCI6MjA3Mzk2NzIxNn0.EChqxdjqS0FmjSoC65x557HdB2sY9AFiAsN5fXH-AmU"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
