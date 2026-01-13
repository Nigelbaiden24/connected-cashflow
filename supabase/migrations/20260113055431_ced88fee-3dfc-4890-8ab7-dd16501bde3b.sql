-- Create fund_analyst_activity table for fund analyst ratings and insights
CREATE TABLE public.fund_analyst_activity (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  isin TEXT NOT NULL,
  fund_name TEXT NOT NULL,
  fund_type TEXT,
  asset_class TEXT,
  provider TEXT,
  analyst_rating TEXT CHECK (analyst_rating IN ('Gold', 'Silver', 'Bronze', 'Neutral', 'Negative')),
  rating_rationale TEXT,
  score_fundamentals INTEGER CHECK (score_fundamentals >= 0 AND score_fundamentals <= 5),
  score_performance INTEGER CHECK (score_performance >= 0 AND score_performance <= 5),
  score_risk INTEGER CHECK (score_risk >= 0 AND score_risk <= 5),
  score_cost INTEGER CHECK (score_cost >= 0 AND score_cost <= 5),
  score_esg INTEGER CHECK (score_esg >= 0 AND score_esg <= 5),
  overall_score NUMERIC(3,1) CHECK (overall_score >= 0 AND overall_score <= 5),
  investment_thesis TEXT,
  strengths TEXT,
  risks TEXT,
  suitable_investor_type TEXT,
  key_watchpoints TEXT,
  one_year_return NUMERIC(10,2),
  three_year_return NUMERIC(10,2),
  five_year_return NUMERIC(10,2),
  ocf NUMERIC(5,2),
  aum NUMERIC(15,2),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID,
  last_updated_by UUID
);

-- Create index for faster queries
CREATE INDEX idx_fund_analyst_activity_isin ON public.fund_analyst_activity(isin);
CREATE INDEX idx_fund_analyst_activity_status ON public.fund_analyst_activity(status);
CREATE INDEX idx_fund_analyst_activity_updated ON public.fund_analyst_activity(updated_at DESC);
CREATE INDEX idx_fund_analyst_activity_rating ON public.fund_analyst_activity(analyst_rating);

-- Enable RLS
ALTER TABLE public.fund_analyst_activity ENABLE ROW LEVEL SECURITY;

-- Allow public read access for published entries
CREATE POLICY "Anyone can view published fund analyst activity"
ON public.fund_analyst_activity
FOR SELECT
USING (status = 'published');

-- Allow admins full access
CREATE POLICY "Admins can manage fund analyst activity"
ON public.fund_analyst_activity
FOR ALL
USING (public.is_admin(auth.uid()));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.fund_analyst_activity;

-- Create trigger for updated_at
CREATE TRIGGER update_fund_analyst_activity_updated_at
  BEFORE UPDATE ON public.fund_analyst_activity
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();