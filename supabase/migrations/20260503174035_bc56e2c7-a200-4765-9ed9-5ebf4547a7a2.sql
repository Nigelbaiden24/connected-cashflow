
UPDATE public.pipeline_schedule
  SET cadence_minutes = 180,
      next_run_at = LEAST(next_run_at, now() + interval '5 minutes'),
      enabled = true;

-- Reschedule cron to fire every hour so any source that's due (3h cadence) runs promptly
DO $$
DECLARE jid bigint;
BEGIN
  SELECT jobid INTO jid FROM cron.job WHERE jobname = 'run-data-pipeline-every-30min';
  IF jid IS NOT NULL THEN PERFORM cron.unschedule(jid); END IF;
  SELECT jobid INTO jid FROM cron.job WHERE jobname = 'run-data-pipeline-hourly';
  IF jid IS NOT NULL THEN PERFORM cron.unschedule(jid); END IF;
END $$;

SELECT cron.schedule(
  'run-data-pipeline-hourly',
  '0 * * * *',
  $$
  select net.http_post(
    url := 'https://wlsmdcdfyudtvbnbqfmn.supabase.co/functions/v1/run-data-pipeline',
    headers := '{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indsc21kY2RmeXVkdHZibmJxZm1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzOTEyMTYsImV4cCI6MjA3Mzk2NzIxNn0.EChqxdjqS0FmjSoC65x557HdB2sY9AFiAsN5fXH-AmU"}'::jsonb,
    body := jsonb_build_object('triggered_by','cron','t', now())
  );
  $$
);
