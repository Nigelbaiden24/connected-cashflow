UPDATE public.pipeline_runs
SET status = 'failed',
    finished_at = now(),
    errors = COALESCE(errors, '[]'::jsonb) || '[{"error":"orphaned: edge function timeout, auto-cleaned"}]'::jsonb
WHERE status = 'running'
  AND started_at < now() - interval '30 minutes';

UPDATE public.pipeline_schedule
SET next_run_at = now(),
    consecutive_failures = 0,
    last_error = NULL
WHERE source IN ('opportunity-research','elite-scraper');