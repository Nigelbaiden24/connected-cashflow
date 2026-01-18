-- Create featured analyst picks table
CREATE TABLE public.featured_analyst_picks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('fund', 'stock', 'crypto', 'alternative')),
  asset_id TEXT NOT NULL,
  asset_name TEXT NOT NULL,
  asset_symbol TEXT,
  analyst_rating TEXT CHECK (analyst_rating IN ('strong_buy', 'buy', 'hold', 'sell', 'strong_sell')),
  conviction_score INTEGER CHECK (conviction_score >= 1 AND conviction_score <= 10),
  price_target DECIMAL(15, 2),
  current_price DECIMAL(15, 2),
  upside_potential DECIMAL(5, 2),
  investment_thesis TEXT,
  key_catalysts TEXT[],
  risk_factors TEXT[],
  time_horizon TEXT CHECK (time_horizon IN ('short_term', 'medium_term', 'long_term')),
  sector TEXT,
  market_cap TEXT,
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  display_order INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.featured_analyst_picks ENABLE ROW LEVEL SECURITY;

-- Allow public read access for active picks
CREATE POLICY "Anyone can view active analyst picks"
ON public.featured_analyst_picks
FOR SELECT
USING (is_active = true);

-- Allow authenticated users to manage picks (admin)
CREATE POLICY "Authenticated users can manage analyst picks"
ON public.featured_analyst_picks
FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Create index for efficient queries
CREATE INDEX idx_analyst_picks_week ON public.featured_analyst_picks(week_start_date, week_end_date);
CREATE INDEX idx_analyst_picks_active ON public.featured_analyst_picks(is_active);
CREATE INDEX idx_analyst_picks_asset_type ON public.featured_analyst_picks(asset_type);

-- Create trigger for updated_at
CREATE TRIGGER update_featured_analyst_picks_updated_at
BEFORE UPDATE ON public.featured_analyst_picks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();