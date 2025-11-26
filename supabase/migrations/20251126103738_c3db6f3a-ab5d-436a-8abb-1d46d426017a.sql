-- Allow multiple platforms for reports, not just finance
ALTER TABLE public.reports DROP CONSTRAINT IF EXISTS reports_platform_check;

ALTER TABLE public.reports
  ADD CONSTRAINT reports_platform_check
  CHECK (platform IN ('finance', 'business', 'investor'));
