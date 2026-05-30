UPDATE public.platform_config SET value = jsonb_set(COALESCE(value,'{}'::jsonb),'{enabled}','false'::jsonb), updated_at = now() WHERE key='auto_scraper_enabled';
UPDATE public.pipeline_schedule SET enabled = false, updated_at = now();
UPDATE public.research_scraper_schedules SET enabled = false, updated_at = now();
UPDATE public.analyst_pipeline_settings SET autoscrape_enabled = false, updated_at = now();