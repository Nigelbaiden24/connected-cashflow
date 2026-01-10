-- Create stocks and crypto database table
CREATE TABLE public.stocks_crypto (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Basic Info
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('stock', 'crypto')),
  description TEXT,
  
  -- Market Data
  current_price DECIMAL(20, 8),
  price_currency TEXT DEFAULT 'USD',
  market_cap DECIMAL(20, 2),
  volume_24h DECIMAL(20, 2),
  circulating_supply DECIMAL(20, 2),
  total_supply DECIMAL(20, 2),
  
  -- Performance
  price_change_24h DECIMAL(10, 4),
  price_change_7d DECIMAL(10, 4),
  price_change_30d DECIMAL(10, 4),
  price_change_1y DECIMAL(10, 4),
  all_time_high DECIMAL(20, 8),
  all_time_low DECIMAL(20, 8),
  
  -- Stock-specific fields
  exchange TEXT,
  sector TEXT,
  industry TEXT,
  pe_ratio DECIMAL(10, 2),
  eps DECIMAL(10, 4),
  dividend_yield DECIMAL(10, 4),
  beta DECIMAL(10, 4),
  fifty_two_week_high DECIMAL(20, 8),
  fifty_two_week_low DECIMAL(20, 8),
  
  -- Crypto-specific fields
  blockchain TEXT,
  consensus_mechanism TEXT,
  launch_date DATE,
  
  -- Media
  logo_url TEXT,
  
  -- Analyst Ratings (same as funds)
  analyst_rating TEXT CHECK (analyst_rating IN ('Gold', 'Silver', 'Bronze', 'Neutral', 'Negative')),
  rating_rationale TEXT,
  
  -- Conviction Scores (0-5 scale)
  score_fundamentals INTEGER CHECK (score_fundamentals >= 0 AND score_fundamentals <= 5),
  score_technicals INTEGER CHECK (score_technicals >= 0 AND score_technicals <= 5),
  score_momentum INTEGER CHECK (score_momentum >= 0 AND score_momentum <= 5),
  score_risk INTEGER CHECK (score_risk >= 0 AND score_risk <= 5),
  overall_score DECIMAL(3, 2),
  
  -- Analyst Commentary
  investment_thesis TEXT,
  strengths TEXT,
  risks TEXT,
  suitable_investor_type TEXT,
  key_watchpoints TEXT,
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  is_featured BOOLEAN DEFAULT false,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  last_updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.stocks_crypto ENABLE ROW LEVEL SECURITY;

-- Public can view published assets
CREATE POLICY "Public can view published stocks and crypto"
ON public.stocks_crypto
FOR SELECT
USING (status = 'published');

-- Authenticated users can manage (admin functionality)
CREATE POLICY "Authenticated users can manage stocks and crypto"
ON public.stocks_crypto
FOR ALL
USING (auth.role() = 'authenticated');

-- Create updated_at trigger
CREATE TRIGGER update_stocks_crypto_updated_at
BEFORE UPDATE ON public.stocks_crypto
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes
CREATE INDEX idx_stocks_crypto_asset_type ON public.stocks_crypto(asset_type);
CREATE INDEX idx_stocks_crypto_symbol ON public.stocks_crypto(symbol);
CREATE INDEX idx_stocks_crypto_status ON public.stocks_crypto(status);
CREATE INDEX idx_stocks_crypto_analyst_rating ON public.stocks_crypto(analyst_rating);
CREATE INDEX idx_stocks_crypto_sector ON public.stocks_crypto(sector);
CREATE INDEX idx_stocks_crypto_is_featured ON public.stocks_crypto(is_featured);