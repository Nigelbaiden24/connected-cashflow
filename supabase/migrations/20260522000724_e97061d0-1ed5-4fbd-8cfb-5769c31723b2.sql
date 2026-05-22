
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Remove prior schedule if it exists, then (re)create it
DO $$
BEGIN
  PERFORM cron.unschedule('run-research-scraper-schedules-15m');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

SELECT cron.schedule(
  'run-research-scraper-schedules-15m',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://wlsmdcdfyudtvbnbqfmn.supabase.co/functions/v1/run-research-scraper-schedules',
    headers := '{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indsc21kY2RmeXVkdHZibmJxZm1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzOTEyMTYsImV4cCI6MjA3Mzk2NzIxNn0.EChqxdjqS0FmjSoC65x557HdB2sY9AFiAsN5fXH-AmU"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);
