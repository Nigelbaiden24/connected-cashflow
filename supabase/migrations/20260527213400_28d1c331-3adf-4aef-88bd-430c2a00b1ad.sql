
-- 1. Delete opportunities promoted from the investor-research pipeline source
DELETE FROM public.opportunity_products
WHERE source = 'pipeline'
  AND (product_details->>'pipeline_source') = 'investor-research';

-- 2. Delete all pending pipeline items from investor-research
DELETE FROM public.pipeline_pending_items
WHERE source = 'investor-research';

-- 3. Delete the investor-research schedule entry
DELETE FROM public.pipeline_schedule WHERE source = 'investor-research';

-- 4. Reset any stuck "running" opportunity-research run
UPDATE public.pipeline_runs
SET status = 'failed',
    finished_at = now(),
    errors = COALESCE(errors, '[]'::jsonb) || '[{"error":"reset_stuck_run_manual"}]'::jsonb
WHERE source = 'opportunity-research' AND status = 'running';

-- 5. Reset opportunity-research schedule to fire on the next cron tick
UPDATE public.pipeline_schedule
SET next_run_at = now() - interval '1 minute',
    last_status = 'idle',
    consecutive_failures = 0,
    last_error = NULL,
    enabled = true,
    cadence_minutes = 1440
WHERE source = 'opportunity-research';
