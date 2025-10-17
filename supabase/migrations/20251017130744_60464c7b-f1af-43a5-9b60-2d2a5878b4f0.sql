-- Create financial plans table
CREATE TABLE public.financial_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  plan_name TEXT NOT NULL,
  plan_type TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  current_net_worth NUMERIC,
  target_net_worth NUMERIC,
  risk_tolerance TEXT,
  time_horizon INTEGER,
  primary_objectives TEXT[],
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  notes TEXT
);

-- Create financial plan sections table
CREATE TABLE public.financial_plan_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID NOT NULL REFERENCES public.financial_plans(id) ON DELETE CASCADE,
  section_type TEXT NOT NULL,
  section_name TEXT NOT NULL,
  section_data JSONB NOT NULL DEFAULT '{}',
  section_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create income sources table
CREATE TABLE public.income_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID NOT NULL REFERENCES public.financial_plans(id) ON DELETE CASCADE,
  source_name TEXT NOT NULL,
  source_type TEXT NOT NULL,
  annual_amount NUMERIC NOT NULL,
  start_date DATE,
  end_date DATE,
  growth_rate NUMERIC DEFAULT 0,
  tax_treatment TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create expense categories table
CREATE TABLE public.expense_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID NOT NULL REFERENCES public.financial_plans(id) ON DELETE CASCADE,
  category_name TEXT NOT NULL,
  annual_amount NUMERIC NOT NULL,
  is_essential BOOLEAN DEFAULT true,
  frequency TEXT DEFAULT 'annual',
  inflation_adjusted BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create plan milestones table
CREATE TABLE public.plan_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID NOT NULL REFERENCES public.financial_plans(id) ON DELETE CASCADE,
  milestone_name TEXT NOT NULL,
  target_date DATE NOT NULL,
  target_amount NUMERIC,
  status TEXT DEFAULT 'pending',
  achievement_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create plan recommendations table
CREATE TABLE public.plan_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID NOT NULL REFERENCES public.financial_plans(id) ON DELETE CASCADE,
  recommendation_type TEXT NOT NULL,
  priority TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  implementation_timeline TEXT,
  estimated_cost NUMERIC,
  expected_benefit TEXT,
  status TEXT DEFAULT 'proposed',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.financial_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_plan_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.income_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_recommendations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for financial_plans
CREATE POLICY "Anyone can view financial plans"
ON public.financial_plans
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Anyone can insert financial plans"
ON public.financial_plans
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Anyone can update financial plans"
ON public.financial_plans
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Anyone can delete financial plans"
ON public.financial_plans
FOR DELETE
TO authenticated
USING (true);

-- RLS Policies for financial_plan_sections
CREATE POLICY "Anyone can view plan sections"
ON public.financial_plan_sections
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Anyone can manage plan sections"
ON public.financial_plan_sections
FOR ALL
TO authenticated
USING (true);

-- RLS Policies for income_sources
CREATE POLICY "Anyone can view income sources"
ON public.income_sources
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Anyone can manage income sources"
ON public.income_sources
FOR ALL
TO authenticated
USING (true);

-- RLS Policies for expense_categories
CREATE POLICY "Anyone can view expenses"
ON public.expense_categories
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Anyone can manage expenses"
ON public.expense_categories
FOR ALL
TO authenticated
USING (true);

-- RLS Policies for plan_milestones
CREATE POLICY "Anyone can view milestones"
ON public.plan_milestones
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Anyone can manage milestones"
ON public.plan_milestones
FOR ALL
TO authenticated
USING (true);

-- RLS Policies for plan_recommendations
CREATE POLICY "Anyone can view recommendations"
ON public.plan_recommendations
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Anyone can manage recommendations"
ON public.plan_recommendations
FOR ALL
TO authenticated
USING (true);

-- Create triggers
CREATE TRIGGER update_financial_plans_updated_at
BEFORE UPDATE ON public.financial_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_financial_plan_sections_updated_at
BEFORE UPDATE ON public.financial_plan_sections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_income_sources_updated_at
BEFORE UPDATE ON public.income_sources
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_expense_categories_updated_at
BEFORE UPDATE ON public.expense_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_plan_milestones_updated_at
BEFORE UPDATE ON public.plan_milestones
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_plan_recommendations_updated_at
BEFORE UPDATE ON public.plan_recommendations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();