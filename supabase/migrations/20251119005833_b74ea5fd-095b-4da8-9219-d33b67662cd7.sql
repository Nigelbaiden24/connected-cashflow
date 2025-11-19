-- Create user_portfolios table for storing uploaded portfolio data
CREATE TABLE IF NOT EXISTS public.user_portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  portfolio_name TEXT NOT NULL,
  upload_date TIMESTAMPTZ DEFAULT NOW(),
  holdings JSONB NOT NULL,
  total_value DECIMAL(15,2),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create portfolio_benchmarks table for storing comparison results
CREATE TABLE IF NOT EXISTS public.portfolio_benchmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID REFERENCES public.user_portfolios(id) ON DELETE CASCADE,
  benchmark_name TEXT NOT NULL,
  comparison_data JSONB NOT NULL,
  ai_analysis TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_benchmarks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_portfolios
CREATE POLICY "Users can view their own portfolios"
  ON public.user_portfolios
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own portfolios"
  ON public.user_portfolios
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own portfolios"
  ON public.user_portfolios
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own portfolios"
  ON public.user_portfolios
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for portfolio_benchmarks
CREATE POLICY "Users can view their own benchmark comparisons"
  ON public.portfolio_benchmarks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_portfolios
      WHERE user_portfolios.id = portfolio_benchmarks.portfolio_id
      AND user_portfolios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own benchmark comparisons"
  ON public.portfolio_benchmarks
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_portfolios
      WHERE user_portfolios.id = portfolio_benchmarks.portfolio_id
      AND user_portfolios.user_id = auth.uid()
    )
  );

-- Add indexes for performance
CREATE INDEX idx_user_portfolios_user_id ON public.user_portfolios(user_id);
CREATE INDEX idx_portfolio_benchmarks_portfolio_id ON public.portfolio_benchmarks(portfolio_id);

-- Trigger for updated_at on user_portfolios
CREATE TRIGGER update_user_portfolios_updated_at
  BEFORE UPDATE ON public.user_portfolios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();