-- Create investment watchlists table
CREATE TABLE IF NOT EXISTS public.investment_watchlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create watchlist items table
CREATE TABLE IF NOT EXISTS public.watchlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  watchlist_id UUID REFERENCES public.investment_watchlists(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  added_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT
);

-- Create user portfolio table
CREATE TABLE IF NOT EXISTS public.user_portfolio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 0,
  purchase_price NUMERIC NOT NULL,
  purchase_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.investment_watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_portfolio ENABLE ROW LEVEL SECURITY;

-- Policies for watchlists
CREATE POLICY "Users can view their own watchlists"
  ON public.investment_watchlists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own watchlists"
  ON public.investment_watchlists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own watchlists"
  ON public.investment_watchlists FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own watchlists"
  ON public.investment_watchlists FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for watchlist items
CREATE POLICY "Users can view items from their watchlists"
  ON public.watchlist_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.investment_watchlists
    WHERE id = watchlist_items.watchlist_id
    AND user_id = auth.uid()
  ));

CREATE POLICY "Users can add items to their watchlists"
  ON public.watchlist_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.investment_watchlists
    WHERE id = watchlist_items.watchlist_id
    AND user_id = auth.uid()
  ));

CREATE POLICY "Users can update items in their watchlists"
  ON public.watchlist_items FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.investment_watchlists
    WHERE id = watchlist_items.watchlist_id
    AND user_id = auth.uid()
  ));

CREATE POLICY "Users can delete items from their watchlists"
  ON public.watchlist_items FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.investment_watchlists
    WHERE id = watchlist_items.watchlist_id
    AND user_id = auth.uid()
  ));

-- Policies for portfolio
CREATE POLICY "Users can view their own portfolio"
  ON public.user_portfolio FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own portfolio items"
  ON public.user_portfolio FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own portfolio items"
  ON public.user_portfolio FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own portfolio items"
  ON public.user_portfolio FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_watchlists_user_id ON public.investment_watchlists(user_id);
CREATE INDEX idx_watchlist_items_watchlist_id ON public.watchlist_items(watchlist_id);
CREATE INDEX idx_portfolio_user_id ON public.user_portfolio(user_id);
CREATE INDEX idx_portfolio_symbol ON public.user_portfolio(symbol);