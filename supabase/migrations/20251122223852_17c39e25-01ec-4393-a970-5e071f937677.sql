-- Create market trends table for admin uploads
CREATE TABLE IF NOT EXISTS public.market_trends (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  impact TEXT NOT NULL CHECK (impact IN ('High', 'Medium', 'Low')),
  timeframe TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  is_published BOOLEAN DEFAULT true
);

-- Enable RLS
ALTER TABLE public.market_trends ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view published market trends"
ON public.market_trends
FOR SELECT
USING (is_published = true);

CREATE POLICY "Admins can manage market trends"
ON public.market_trends
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Create index
CREATE INDEX idx_market_trends_published ON public.market_trends(is_published, created_at DESC);