
-- Mark stuck runs (in_progress > 30 min with no finished_at) as failed
UPDATE public.pipeline_runs
SET status = 'failed',
    finished_at = now(),
    errors = COALESCE(errors, '[]'::jsonb) || '[{"error":"reset_stuck_run_edge_timeout"}]'::jsonb
WHERE status = 'running'
  AND finished_at IS NULL
  AND started_at < now() - interval '15 minutes';

-- Push all enabled pipeline schedules' next_run_at to now so cron picks them up immediately,
-- and clear stale running flags / failure counters so the new background-task version takes over.
UPDATE public.pipeline_schedule
SET next_run_at = now() - interval '1 minute',
    last_status = CASE WHEN last_status = 'running' THEN 'failed' ELSE last_status END,
    consecutive_failures = 0,
    last_error = NULL
WHERE enabled = true;
