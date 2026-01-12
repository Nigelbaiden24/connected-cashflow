-- Create asset research reports table
CREATE TABLE public.asset_research_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('fund', 'etf', 'stock', 'crypto')),
  asset_id TEXT NOT NULL,
  asset_name TEXT NOT NULL,
  asset_symbol TEXT,
  
  -- Fundamental Analysis
  fundamental_analysis JSONB DEFAULT '{}'::jsonb,
  
  -- Competitive Advantage / Quality Analysis
  quality_analysis JSONB DEFAULT '{}'::jsonb,
  
  -- Valuation & Attractiveness
  valuation_analysis JSONB DEFAULT '{}'::jsonb,
  
  -- Risk Analysis (Multi-dimensional)
  risk_analysis JSONB DEFAULT '{}'::jsonb,
  
  -- Performance Diagnostics & Attribution
  performance_analysis JSONB DEFAULT '{}'::jsonb,
  
  -- Management / Governance Assessment
  governance_analysis JSONB DEFAULT '{}'::jsonb,
  
  -- ESG & Sustainability
  esg_analysis JSONB DEFAULT '{}'::jsonb,
  
  -- Role-in-Portfolio Framework
  portfolio_role JSONB DEFAULT '{}'::jsonb,
  
  -- Scenario & Stress Insight
  scenario_analysis JSONB DEFAULT '{}'::jsonb,
  
  -- Model Governance & Explainability
  model_governance JSONB DEFAULT '{}'::jsonb,
  
  -- Scores and Ratings
  overall_quality_score INTEGER CHECK (overall_quality_score >= 0 AND overall_quality_score <= 100),
  risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
  valuation_score INTEGER CHECK (valuation_score >= 0 AND valuation_score <= 100),
  esg_score INTEGER CHECK (esg_score >= 0 AND esg_score <= 100),
  
  -- Metadata
  data_sources TEXT[],
  confidence_level TEXT CHECK (confidence_level IN ('high', 'medium', 'low')),
  material_changes TEXT[],
  last_significant_change TEXT,
  
  -- Versioning and audit
  version INTEGER DEFAULT 1,
  previous_version_id UUID REFERENCES public.asset_research_reports(id),
  
  -- Timestamps
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  data_as_of TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Unique constraint per asset
  CONSTRAINT unique_current_report UNIQUE (asset_type, asset_id)
);

-- Create research generation queue for automation
CREATE TABLE public.research_generation_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('fund', 'etf', 'stock', 'crypto')),
  asset_id TEXT NOT NULL,
  asset_name TEXT NOT NULL,
  asset_symbol TEXT,
  asset_data JSONB DEFAULT '{}'::jsonb,
  priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create research change log for "What changed and why"
CREATE TABLE public.research_change_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID REFERENCES public.asset_research_reports(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL,
  asset_id TEXT NOT NULL,
  change_type TEXT NOT NULL CHECK (change_type IN ('risk_profile', 'strategy_drift', 'valuation_change', 'performance_shift', 'governance_change', 'esg_update', 'initial_generation')),
  change_summary TEXT NOT NULL,
  previous_values JSONB,
  new_values JSONB,
  significance TEXT CHECK (significance IN ('material', 'moderate', 'minor')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.asset_research_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_generation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_change_log ENABLE ROW LEVEL SECURITY;

-- Public read access for research reports (non-personalized research)
CREATE POLICY "Research reports are publicly readable"
ON public.asset_research_reports FOR SELECT
USING (true);

-- Admin-only write access for research reports
CREATE POLICY "Only authenticated users can manage research"
ON public.asset_research_reports FOR ALL
USING (auth.uid() IS NOT NULL);

-- Admin access for queue
CREATE POLICY "Authenticated users can manage queue"
ON public.research_generation_queue FOR ALL
USING (auth.uid() IS NOT NULL);

-- Public read access for change log
CREATE POLICY "Change log is publicly readable"
ON public.research_change_log FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert change logs"
ON public.research_change_log FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Indexes for performance
CREATE INDEX idx_research_reports_asset ON public.asset_research_reports(asset_type, asset_id);
CREATE INDEX idx_research_reports_scores ON public.asset_research_reports(overall_quality_score, risk_score);
CREATE INDEX idx_research_queue_status ON public.research_generation_queue(status, scheduled_for);
CREATE INDEX idx_change_log_report ON public.research_change_log(report_id, created_at DESC);

-- Updated at trigger
CREATE TRIGGER update_research_reports_updated_at
BEFORE UPDATE ON public.asset_research_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();