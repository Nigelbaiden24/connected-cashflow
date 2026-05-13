ALTER TABLE public.analyst_market_commentary  ADD COLUMN IF NOT EXISTS target_platform text;
ALTER TABLE public.analyst_benchmark_reports  ADD COLUMN IF NOT EXISTS target_platform text;
ALTER TABLE public.analyst_dynamic_watchlist  ADD COLUMN IF NOT EXISTS target_platform text;
ALTER TABLE public.realtime_investment_alerts ADD COLUMN IF NOT EXISTS target_platform text;
ALTER TABLE public.discovery_engine_results   ADD COLUMN IF NOT EXISTS target_platform text;
ALTER TABLE public.etf_fund_analyses          ADD COLUMN IF NOT EXISTS target_platform text;
ALTER TABLE public.investor_segments          ADD COLUMN IF NOT EXISTS target_platform text;

-- Optional CHECK guard via trigger-free constraint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'analyst_market_commentary_target_platform_check') THEN
    ALTER TABLE public.analyst_market_commentary  ADD CONSTRAINT analyst_market_commentary_target_platform_check  CHECK (target_platform IS NULL OR target_platform IN ('finance','investor','both'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'analyst_benchmark_reports_target_platform_check') THEN
    ALTER TABLE public.analyst_benchmark_reports  ADD CONSTRAINT analyst_benchmark_reports_target_platform_check  CHECK (target_platform IS NULL OR target_platform IN ('finance','investor','both'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'analyst_dynamic_watchlist_target_platform_check') THEN
    ALTER TABLE public.analyst_dynamic_watchlist  ADD CONSTRAINT analyst_dynamic_watchlist_target_platform_check  CHECK (target_platform IS NULL OR target_platform IN ('finance','investor','both'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'realtime_investment_alerts_target_platform_check') THEN
    ALTER TABLE public.realtime_investment_alerts ADD CONSTRAINT realtime_investment_alerts_target_platform_check CHECK (target_platform IS NULL OR target_platform IN ('finance','investor','both'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'discovery_engine_results_target_platform_check') THEN
    ALTER TABLE public.discovery_engine_results   ADD CONSTRAINT discovery_engine_results_target_platform_check   CHECK (target_platform IS NULL OR target_platform IN ('finance','investor','both'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'etf_fund_analyses_target_platform_check') THEN
    ALTER TABLE public.etf_fund_analyses          ADD CONSTRAINT etf_fund_analyses_target_platform_check          CHECK (target_platform IS NULL OR target_platform IN ('finance','investor','both'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'investor_segments_target_platform_check') THEN
    ALTER TABLE public.investor_segments          ADD CONSTRAINT investor_segments_target_platform_check          CHECK (target_platform IS NULL OR target_platform IN ('finance','investor','both'));
  END IF;
END $$;