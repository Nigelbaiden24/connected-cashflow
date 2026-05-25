
DELETE FROM pipeline_schedule WHERE source = 'financial-research';

UPDATE pipeline_schedule
SET enabled = true,
    cadence_minutes = 1440,
    next_run_at = now()
WHERE source IN ('investor-research','opportunity-research');
