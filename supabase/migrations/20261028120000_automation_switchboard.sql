-- Automation switchboard: every automatic (timed) job is OFF until an admin switches it on.
--
-- 1. Saves each live pg_cron job (name, timing, exact command) into public.automation_jobs,
--    then unschedules it, so nothing runs or spends AI/Firecrawl credits on its own.
--    Housekeeping jobs that only tidy tables (no AI, no HTTP) stay on.
-- 2. Admins turn jobs back on one by one (or all) from Admin > AI Usage, which calls
--    public.set_automation_job / public.set_all_automation. Turning a job on reschedules
--    it with the saved command; off unschedules it again.
-- 3. The existing master scraper switch and Market Pulse mode are set to off/manual too,
--    so a job switched on here still respects those inner settings.
-- Nothing is deleted.

CREATE TABLE IF NOT EXISTS public.automation_jobs (
  jobname     text PRIMARY KEY,
  schedule    text NOT NULL,
  command     text NOT NULL,
  label       text,
  description text,
  uses_ai     boolean NOT NULL DEFAULT true,
  enabled     boolean NOT NULL DEFAULT false,
  updated_at  timestamptz NOT NULL DEFAULT now(),
  updated_by  uuid
);

ALTER TABLE public.automation_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins read automation jobs" ON public.automation_jobs;
CREATE POLICY "Admins read automation jobs"
  ON public.automation_jobs FOR SELECT
  USING (public.is_admin(auth.uid()));
-- No insert/update/delete policies: changes go only through the functions below.

-- Save the live jobs and switch them off.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    INSERT INTO public.automation_jobs (jobname, schedule, command, enabled)
    SELECT j.jobname, j.schedule, j.command, false
    FROM cron.job j
    WHERE j.jobname IS NOT NULL
      AND j.jobname NOT IN ('provider-cache-cleanup', 'push-devices-cleanup')
    ON CONFLICT (jobname) DO UPDATE
      SET schedule = EXCLUDED.schedule, command = EXCLUDED.command, enabled = false, updated_at = now();

    PERFORM cron.unschedule(j.jobid)
    FROM cron.job j
    WHERE j.jobname IN (SELECT jobname FROM public.automation_jobs);
  END IF;
END $$;

-- Friendly names for the jobs we know about (unknown live jobs keep their raw name).
UPDATE public.automation_jobs a SET label = v.label, description = v.description, uses_ai = v.uses_ai
FROM (VALUES
  ('run-data-pipeline-every-30min',        'Opportunity discovery (every 30 min)', 'Finds and writes up new investment opportunities, with AI cover images.', true),
  ('run-data-pipeline-hourly',             'Opportunity discovery (hourly)',       'Older hourly version of opportunity discovery.', true),
  ('run-data-pipeline-daily',              'Opportunity discovery (daily)',        'Once-a-day opportunity discovery sweep.', true),
  ('analyst-pipeline-30min',               'Analyst pipeline',                     'AI analyst write-ups for queued opportunities and funds.', true),
  ('intel-orchestrate-hourly',             'Intelligence orchestrator',            'Runs the intelligence research sources in turn.', true),
  ('run-research-scraper-schedules-15m',   'Research scrapers (every 15 min)',     'Runs the saved research scraper schedules.', true),
  ('run-research-scraper-schedules-daily', 'Research scrapers (daily)',            'Runs the saved research scraper schedules once a day.', true),
  ('market-pulse-tick',                    'Market Pulse',                         'Refreshes the Market Pulse news and movers feed.', true)
) AS v(jobname, label, description, uses_ai)
WHERE a.jobname = v.jobname;

-- The existing inner switches start off too.
UPDATE public.platform_config SET value = jsonb_build_object('enabled', false), updated_at = now()
WHERE key = 'auto_scraper_enabled';
UPDATE public.platform_config SET value = coalesce(value, '{}'::jsonb) || jsonb_build_object('mode', 'manual'), updated_at = now()
WHERE key = 'market_pulse';

-- Live state for the admin panel: saved jobs plus whether each is scheduled right now.
CREATE OR REPLACE FUNCTION public.automation_status()
RETURNS TABLE (jobname text, label text, description text, schedule text, uses_ai boolean, enabled boolean, scheduled boolean, updated_at timestamptz)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'Admins only'; END IF;
  RETURN QUERY
  SELECT a.jobname, a.label, a.description, a.schedule, a.uses_ai, a.enabled,
         EXISTS (SELECT 1 FROM cron.job j WHERE j.jobname = a.jobname),
         a.updated_at
  FROM public.automation_jobs a
  ORDER BY a.uses_ai DESC, coalesce(a.label, a.jobname);
END $$;

CREATE OR REPLACE FUNCTION public.set_automation_job(_jobname text, _enabled boolean)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.automation_jobs;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'Admins only'; END IF;
  SELECT * INTO r FROM public.automation_jobs WHERE jobname = _jobname;
  IF NOT FOUND THEN RAISE EXCEPTION 'Unknown job %', _jobname; END IF;

  PERFORM cron.unschedule(j.jobid) FROM cron.job j WHERE j.jobname = _jobname;
  IF _enabled THEN
    PERFORM cron.schedule(r.jobname, r.schedule, r.command);
  END IF;

  UPDATE public.automation_jobs SET enabled = _enabled, updated_at = now(), updated_by = auth.uid()
  WHERE jobname = _jobname;
  RETURN _enabled;
END $$;

CREATE OR REPLACE FUNCTION public.set_all_automation(_enabled boolean)
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE n integer := 0; r record;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'Admins only'; END IF;
  FOR r IN SELECT jobname FROM public.automation_jobs LOOP
    PERFORM public.set_automation_job(r.jobname, _enabled);
    n := n + 1;
  END LOOP;
  RETURN n;
END $$;

REVOKE ALL ON FUNCTION public.automation_status() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.set_automation_job(text, boolean) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.set_all_automation(boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.automation_status() TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_automation_job(text, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_all_automation(boolean) TO authenticated;
