-- Create watchlist items table
CREATE TABLE IF NOT EXISTS public.watchlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  watchlist_id UUID REFERENCES public.investment_watchlists(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  asset_type TEXT NOT NULL, -- 'stock', 'crypto', 'commodity', 'etf'
  current_price NUMERIC,
  change_percent NUMERIC,
  added_at TIMESTAMPTZ DEFAULT now(),
  alert_price_high NUMERIC,
  alert_price_low NUMERIC,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Update investment_watchlists to support admin watchlists
ALTER TABLE public.investment_watchlists 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS created_by_admin BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS category TEXT;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_watchlist_items_watchlist_id ON public.watchlist_items(watchlist_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_items_symbol ON public.watchlist_items(symbol);
CREATE INDEX IF NOT EXISTS idx_watchlists_public ON public.investment_watchlists(is_public) WHERE is_public = true;

-- Enable RLS
ALTER TABLE public.watchlist_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for watchlist_items
CREATE POLICY "Users can view items in their own watchlists"
  ON public.watchlist_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.investment_watchlists
      WHERE id = watchlist_items.watchlist_id
      AND (user_id = auth.uid() OR is_public = true)
    )
  );

CREATE POLICY "Users can create items in their own watchlists"
  ON public.watchlist_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.investment_watchlists
      WHERE id = watchlist_items.watchlist_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update items in their own watchlists"
  ON public.watchlist_items
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.investment_watchlists
      WHERE id = watchlist_items.watchlist_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete items in their own watchlists"
  ON public.watchlist_items
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.investment_watchlists
      WHERE id = watchlist_items.watchlist_id
      AND user_id = auth.uid()
    )
  );

-- Update existing RLS policies for investment_watchlists to include public watchlists
DROP POLICY IF EXISTS "Users can view their own watchlists" ON public.investment_watchlists;

CREATE POLICY "Users can view their own and public watchlists"
  ON public.investment_watchlists
  FOR SELECT
  USING (auth.uid() = user_id OR is_public = true);

-- Admins can manage all watchlists
CREATE POLICY "Admins can manage all watchlists"
  ON public.investment_watchlists
  FOR ALL
  USING (is_admin(auth.uid()));