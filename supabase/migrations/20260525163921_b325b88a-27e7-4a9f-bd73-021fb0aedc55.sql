
-- Data Pipeline now scrapes ONLY specific opportunities across all investment types
-- Remove non-opportunity sources, enable opportunity-focused sources at 24h cadence
DELETE FROM pipeline_schedule
WHERE source IN ('intel-orchestrate','investor-finder','elite-scraper','companies-house');

UPDATE pipeline_schedule
SET enabled = true,
    cadence_minutes = 1440,
    next_run_at = now()
WHERE source IN ('financial-research','investor-research','opportunity-research');
