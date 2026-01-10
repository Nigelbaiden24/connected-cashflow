-- Add new scoring dimensions for opportunity products
ALTER TABLE public.opportunity_products
ADD COLUMN IF NOT EXISTS transparency_score numeric DEFAULT 3,
ADD COLUMN IF NOT EXISTS complexity_score numeric DEFAULT 3,
ADD COLUMN IF NOT EXISTS market_sentiment_score numeric DEFAULT 3,
ADD COLUMN IF NOT EXISTS age_condition_score numeric DEFAULT 3,
ADD COLUMN IF NOT EXISTS geographic_regulatory_score numeric DEFAULT 3;

-- Add commentary fields for each dimension
ALTER TABLE public.opportunity_products
ADD COLUMN IF NOT EXISTS liquidity_commentary text,
ADD COLUMN IF NOT EXISTS transparency_commentary text,
ADD COLUMN IF NOT EXISTS risk_commentary text,
ADD COLUMN IF NOT EXISTS complexity_commentary text,
ADD COLUMN IF NOT EXISTS market_sentiment_commentary text,
ADD COLUMN IF NOT EXISTS age_condition_commentary text,
ADD COLUMN IF NOT EXISTS geographic_regulatory_commentary text;

-- Add index for filtering by scores
CREATE INDEX IF NOT EXISTS idx_opportunity_products_scores ON public.opportunity_products (overall_conviction_score, analyst_rating);