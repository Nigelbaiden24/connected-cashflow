-- Client Risk Assessments table
CREATE TABLE IF NOT EXISTS public.client_risk_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  risk_score INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  assessment_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  factors JSONB DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Client Pipeline Stages table
CREATE TABLE IF NOT EXISTS public.client_pipeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  stage TEXT NOT NULL CHECK (stage IN ('new_lead', 'discovery', 'risk_profile', 'proposal_sent', 'active_client')),
  stage_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Advisor Tasks table
CREATE TABLE IF NOT EXISTS public.advisor_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  task_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue')),
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Advisory Revenues table
CREATE TABLE IF NOT EXISTS public.advisory_revenues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  revenue_type TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Portfolio Watchlist table
CREATE TABLE IF NOT EXISTS public.portfolio_watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  symbol TEXT NOT NULL,
  asset_name TEXT NOT NULL,
  current_price DECIMAL(15,4),
  daily_change DECIMAL(10,4),
  daily_change_percent DECIMAL(10,4),
  affected_clients INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Advisor Alerts table
CREATE TABLE IF NOT EXISTS public.advisor_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  alert_type TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('info', 'warning', 'critical')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_entity_id UUID,
  related_entity_type TEXT,
  is_read BOOLEAN DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Advisor Activity Log table
CREATE TABLE IF NOT EXISTS public.advisor_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  activity_type TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Advisor Goals table
CREATE TABLE IF NOT EXISTS public.advisor_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  goal_type TEXT NOT NULL,
  target_value DECIMAL(15,2) NOT NULL,
  current_value DECIMAL(15,2) DEFAULT 0,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.client_risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_pipeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advisor_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advisory_revenues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advisor_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advisor_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advisor_goals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for client_risk_assessments
CREATE POLICY "Users can view risk assessments for their clients"
  ON public.client_risk_assessments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.clients 
      WHERE clients.id = client_risk_assessments.client_id 
      AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage risk assessments for their clients"
  ON public.client_risk_assessments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.clients 
      WHERE clients.id = client_risk_assessments.client_id 
      AND clients.user_id = auth.uid()
    )
  );

-- RLS Policies for client_pipeline
CREATE POLICY "Users can view pipeline for their clients"
  ON public.client_pipeline FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.clients 
      WHERE clients.id = client_pipeline.client_id 
      AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage pipeline for their clients"
  ON public.client_pipeline FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.clients 
      WHERE clients.id = client_pipeline.client_id 
      AND clients.user_id = auth.uid()
    )
  );

-- RLS Policies for advisor_tasks
CREATE POLICY "Users can view their own tasks"
  ON public.advisor_tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own tasks"
  ON public.advisor_tasks FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for advisory_revenues
CREATE POLICY "Users can view their own revenues"
  ON public.advisory_revenues FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own revenues"
  ON public.advisory_revenues FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for portfolio_watchlist
CREATE POLICY "Users can view their own watchlist"
  ON public.portfolio_watchlist FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own watchlist"
  ON public.portfolio_watchlist FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for advisor_alerts
CREATE POLICY "Users can view their own alerts"
  ON public.advisor_alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own alerts"
  ON public.advisor_alerts FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for advisor_activity
CREATE POLICY "Users can view their own activity"
  ON public.advisor_activity FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert activity"
  ON public.advisor_activity FOR INSERT
  WITH CHECK (true);

-- RLS Policies for advisor_goals
CREATE POLICY "Users can view their own goals"
  ON public.advisor_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own goals"
  ON public.advisor_goals FOR ALL
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_risk_assessments_client ON public.client_risk_assessments(client_id);
CREATE INDEX idx_pipeline_client ON public.client_pipeline(client_id);
CREATE INDEX idx_advisor_tasks_user ON public.advisor_tasks(user_id);
CREATE INDEX idx_advisor_tasks_due_date ON public.advisor_tasks(due_date);
CREATE INDEX idx_revenues_user ON public.advisory_revenues(user_id);
CREATE INDEX idx_watchlist_user ON public.portfolio_watchlist(user_id);
CREATE INDEX idx_alerts_user ON public.advisor_alerts(user_id);
CREATE INDEX idx_activity_user ON public.advisor_activity(user_id);
CREATE INDEX idx_goals_user ON public.advisor_goals(user_id);

-- Triggers for updated_at
CREATE TRIGGER update_client_risk_assessments_updated_at
  BEFORE UPDATE ON public.client_risk_assessments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_client_pipeline_updated_at
  BEFORE UPDATE ON public.client_pipeline
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_advisor_tasks_updated_at
  BEFORE UPDATE ON public.advisor_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_advisor_goals_updated_at
  BEFORE UPDATE ON public.advisor_goals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();