ALTER TABLE public.demo_requests
ADD COLUMN IF NOT EXISTS request_type TEXT DEFAULT 'demo' CHECK (request_type IN ('demo', 'trial')),
ADD COLUMN IF NOT EXISTS platform_interest TEXT CHECK (platform_interest IN ('finance', 'investor', 'both'));