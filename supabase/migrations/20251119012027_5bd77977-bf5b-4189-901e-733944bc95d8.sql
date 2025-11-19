-- Create risk assessment reports table
CREATE TABLE IF NOT EXISTS public.risk_assessment_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  report_type TEXT NOT NULL, -- 'stress_test', 'exposure_analysis', 'risk_assessment'
  report_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  report_name TEXT NOT NULL,
  summary TEXT
);

-- Create regulatory updates table
CREATE TABLE IF NOT EXISTS public.regulatory_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  content TEXT NOT NULL,
  source TEXT,
  update_date TIMESTAMPTZ DEFAULT now(),
  category TEXT NOT NULL, -- 'sec', 'crypto', 'tax', 'international'
  file_path TEXT,
  ai_generated BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.risk_assessment_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regulatory_updates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for risk_assessment_reports
CREATE POLICY "Users can view their own reports"
  ON public.risk_assessment_reports
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reports"
  ON public.risk_assessment_reports
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for regulatory_updates
CREATE POLICY "Anyone can view regulatory updates"
  ON public.regulatory_updates
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage regulatory updates"
  ON public.regulatory_updates
  FOR ALL
  USING (is_admin(auth.uid()));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_risk_reports_user_id ON public.risk_assessment_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_risk_reports_type ON public.risk_assessment_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_regulatory_updates_date ON public.regulatory_updates(update_date DESC);
CREATE INDEX IF NOT EXISTS idx_regulatory_updates_category ON public.regulatory_updates(category);