-- Create plan comments table for collaboration
CREATE TABLE IF NOT EXISTS public.plan_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.financial_plans(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create plan tasks table for workflow management
CREATE TABLE IF NOT EXISTS public.plan_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.financial_plans(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create plan versions table for version control
CREATE TABLE IF NOT EXISTS public.plan_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.financial_plans(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  plan_data JSONB NOT NULL,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  change_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create smart alerts table
CREATE TABLE IF NOT EXISTS public.plan_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.financial_plans(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('aum_change', 'inactivity', 'time_horizon', 'risk_score', 'custom')),
  condition_config JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_triggered TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create saved views table for custom dashboards
CREATE TABLE IF NOT EXISTS public.plan_saved_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  view_name TEXT NOT NULL,
  filter_config JSONB NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create plan templates table
CREATE TABLE IF NOT EXISTS public.plan_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name TEXT NOT NULL,
  template_type TEXT NOT NULL,
  template_data JSONB NOT NULL,
  is_system BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.plan_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_saved_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for plan_comments
CREATE POLICY "Users can view comments on their plans"
  ON public.plan_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.financial_plans fp
      INNER JOIN public.clients c ON fp.client_id = c.id
      WHERE fp.id = plan_comments.plan_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create comments on their plans"
  ON public.plan_comments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.financial_plans fp
      INNER JOIN public.clients c ON fp.client_id = c.id
      WHERE fp.id = plan_comments.plan_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own comments"
  ON public.plan_comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON public.plan_comments FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for plan_tasks
CREATE POLICY "Users can view tasks on their plans"
  ON public.plan_tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.financial_plans fp
      INNER JOIN public.clients c ON fp.client_id = c.id
      WHERE fp.id = plan_tasks.plan_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage tasks on their plans"
  ON public.plan_tasks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.financial_plans fp
      INNER JOIN public.clients c ON fp.client_id = c.id
      WHERE fp.id = plan_tasks.plan_id AND c.user_id = auth.uid()
    )
  );

-- RLS Policies for plan_versions
CREATE POLICY "Users can view versions of their plans"
  ON public.plan_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.financial_plans fp
      INNER JOIN public.clients c ON fp.client_id = c.id
      WHERE fp.id = plan_versions.plan_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "System can create plan versions"
  ON public.plan_versions FOR INSERT
  WITH CHECK (true);

-- RLS Policies for plan_alerts
CREATE POLICY "Users can manage their own alerts"
  ON public.plan_alerts FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for plan_saved_views
CREATE POLICY "Users can manage their own saved views"
  ON public.plan_saved_views FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for plan_templates
CREATE POLICY "Anyone can view templates"
  ON public.plan_templates FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own templates"
  ON public.plan_templates FOR INSERT
  WITH CHECK (auth.uid() = created_by OR is_system = false);

-- Create indexes for performance
CREATE INDEX idx_plan_comments_plan_id ON public.plan_comments(plan_id);
CREATE INDEX idx_plan_tasks_plan_id ON public.plan_tasks(plan_id);
CREATE INDEX idx_plan_tasks_assigned_to ON public.plan_tasks(assigned_to);
CREATE INDEX idx_plan_versions_plan_id ON public.plan_versions(plan_id);
CREATE INDEX idx_plan_alerts_user_id ON public.plan_alerts(user_id);
CREATE INDEX idx_plan_saved_views_user_id ON public.plan_saved_views(user_id);

-- Create trigger for updating updated_at timestamps
CREATE OR REPLACE FUNCTION update_plan_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_plan_comments_updated_at
  BEFORE UPDATE ON public.plan_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_plan_updated_at();

CREATE TRIGGER update_plan_tasks_updated_at
  BEFORE UPDATE ON public.plan_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_plan_updated_at();

CREATE TRIGGER update_plan_saved_views_updated_at
  BEFORE UPDATE ON public.plan_saved_views
  FOR EACH ROW
  EXECUTE FUNCTION update_plan_updated_at();