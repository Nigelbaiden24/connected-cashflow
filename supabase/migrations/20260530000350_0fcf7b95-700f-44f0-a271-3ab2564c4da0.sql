
-- Re-enable master auto-scraper switch
INSERT INTO public.platform_config (key, value, updated_at)
VALUES ('auto_scraper_enabled', '{"enabled": true}'::jsonb, now())
ON CONFLICT (key) DO UPDATE SET value = '{"enabled": true}'::jsonb, updated_at = now();

-- Re-enable data pipeline schedule, set 6h cadence, next run immediately
UPDATE public.pipeline_schedule
SET enabled = true,
    cadence_minutes = 360,
    next_run_at = now(),
    consecutive_failures = 0,
    last_error = NULL
WHERE source = 'opportunity-research';

-- Re-enable stock + crypto research scraper autopilots, next run in 1 min
UPDATE public.research_scraper_schedules
SET enabled = true,
    frequency_hours = 24,
    next_run_at = now() + interval '1 minute'
WHERE asset_type IN ('stock','crypto')
  AND topic LIKE '\_\_AUTOPILOT\_\_%' ESCAPE '\';
