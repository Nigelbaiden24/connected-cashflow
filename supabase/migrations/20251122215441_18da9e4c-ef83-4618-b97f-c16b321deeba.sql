-- Ensure investor_alerts table has all necessary columns
ALTER TABLE public.investor_alerts ADD COLUMN IF NOT EXISTS ticker TEXT;
ALTER TABLE public.investor_alerts ADD COLUMN IF NOT EXISTS company TEXT;
ALTER TABLE public.investor_alerts ADD COLUMN IF NOT EXISTS alert_data JSONB;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_investor_alerts_alert_type ON public.investor_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_investor_alerts_created_at ON public.investor_alerts(created_at DESC);