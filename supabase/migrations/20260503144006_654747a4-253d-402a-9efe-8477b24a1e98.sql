INSERT INTO public.pipeline_schedule (source, enabled, cadence_minutes, next_run_at, config)
VALUES ('investor-research', true, 360, now(), '{"platform":"investor"}'::jsonb)
ON CONFLICT (source) DO UPDATE SET
  enabled = EXCLUDED.enabled,
  cadence_minutes = EXCLUDED.cadence_minutes,
  config = EXCLUDED.config;

UPDATE public.pipeline_schedule
SET config = COALESCE(config, '{}'::jsonb) || '{"platform":"finance"}'::jsonb
WHERE source = 'financial-research';