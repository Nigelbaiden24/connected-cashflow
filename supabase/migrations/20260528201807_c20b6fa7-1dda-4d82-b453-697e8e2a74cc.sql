UPDATE public.pipeline_schedule
SET cadence_minutes = 360,
    next_run_at = now()
WHERE source = 'opportunity-research';