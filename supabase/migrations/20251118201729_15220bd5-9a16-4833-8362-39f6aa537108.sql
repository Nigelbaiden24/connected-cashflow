-- Create business_projects table
CREATE TABLE IF NOT EXISTS public.business_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'on-track', 'at-risk', 'behind', 'completed', 'cancelled')),
  health_status TEXT DEFAULT 'on-track' CHECK (health_status IN ('on-track', 'at-risk', 'behind', 'completed')),
  start_date DATE,
  due_date DATE,
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  assigned_team_members UUID[],
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  budget DECIMAL(15,2),
  actual_cost DECIMAL(15,2),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.business_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own projects"
  ON public.business_projects FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = created_by OR auth.uid() = ANY(assigned_team_members));

CREATE POLICY "Users can insert their own projects"
  ON public.business_projects FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.uid() = created_by);

CREATE POLICY "Users can update their own projects"
  ON public.business_projects FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() = created_by);

CREATE POLICY "Users can delete their own projects"
  ON public.business_projects FOR DELETE
  USING (auth.uid() = user_id OR auth.uid() = created_by);

-- Create business_tasks table (without generated column)
CREATE TABLE IF NOT EXISTS public.business_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.business_projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  task_name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in-progress', 'review', 'completed', 'blocked')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  assigned_to UUID REFERENCES auth.users(id),
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  estimated_hours DECIMAL(8,2),
  actual_hours DECIMAL(8,2),
  sla_target_hours INTEGER,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.business_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tasks they created or are assigned to"
  ON public.business_tasks FOR SELECT
  USING (
    auth.uid() = user_id OR 
    auth.uid() = assigned_to OR 
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM public.business_projects 
      WHERE id = business_tasks.project_id 
      AND (user_id = auth.uid() OR auth.uid() = ANY(assigned_team_members))
    )
  );

CREATE POLICY "Users can insert tasks"
  ON public.business_tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.uid() = created_by);

CREATE POLICY "Users can update their tasks"
  ON public.business_tasks FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() = assigned_to OR auth.uid() = created_by);

CREATE POLICY "Users can delete their tasks"
  ON public.business_tasks FOR DELETE
  USING (auth.uid() = user_id OR auth.uid() = created_by);

-- Create business_workflows table
CREATE TABLE IF NOT EXISTS public.business_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  workflow_name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT,
  trigger_config JSONB,
  action_config JSONB,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'error', 'draft')),
  execution_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  last_run_at TIMESTAMPTZ,
  time_saved_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.business_workflows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own workflows"
  ON public.business_workflows FOR ALL
  USING (auth.uid() = user_id);

-- Create business_activity_feed table
CREATE TABLE IF NOT EXISTS public.business_activity_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('task_created', 'task_updated', 'task_completed', 'project_created', 'project_updated', 'document_uploaded', 'comment_added', 'workflow_triggered', 'ai_insight', 'status_change')),
  entity_type TEXT,
  entity_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB,
  actor_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.business_activity_feed ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view activity feed"
  ON public.business_activity_feed FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = actor_id);

CREATE POLICY "Users can create activity"
  ON public.business_activity_feed FOR INSERT
  WITH CHECK (auth.uid() = actor_id);

-- Create business_notifications table
CREATE TABLE IF NOT EXISTS public.business_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('task_overdue', 'approval_needed', 'task_blocked', 'missing_assignee', 'workflow_failed', 'deadline_approaching', 'comment_mention')),
  title TEXT NOT NULL,
  message TEXT,
  severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  entity_type TEXT,
  entity_id UUID,
  is_read BOOLEAN DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.business_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON public.business_notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.business_notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Create business_documents table
CREATE TABLE IF NOT EXISTS public.business_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.business_projects(id) ON DELETE CASCADE,
  document_name TEXT NOT NULL,
  document_type TEXT,
  file_path TEXT,
  file_size BIGINT,
  status TEXT DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'pending_approval', 'approved', 'rejected', 'archived')),
  uploaded_by UUID REFERENCES auth.users(id),
  requires_signature BOOLEAN DEFAULT false,
  signed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.business_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view documents in their projects"
  ON public.business_documents FOR SELECT
  USING (
    auth.uid() = user_id OR 
    auth.uid() = uploaded_by OR
    EXISTS (
      SELECT 1 FROM public.business_projects 
      WHERE id = business_documents.project_id 
      AND (user_id = auth.uid() OR auth.uid() = ANY(assigned_team_members))
    )
  );

CREATE POLICY "Users can upload documents"
  ON public.business_documents FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.uid() = uploaded_by);

CREATE POLICY "Users can update their documents"
  ON public.business_documents FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() = uploaded_by);

-- Create business_time_tracking table
CREATE TABLE IF NOT EXISTS public.business_time_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  task_id UUID REFERENCES public.business_tasks(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.business_projects(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration_minutes INTEGER,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.business_time_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own time entries"
  ON public.business_time_tracking FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own time entries"
  ON public.business_time_tracking FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own time entries"
  ON public.business_time_tracking FOR UPDATE
  USING (auth.uid() = user_id);

-- Create business_dashboard_preferences table
CREATE TABLE IF NOT EXISTS public.business_dashboard_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  widget_config JSONB DEFAULT '{
    "showKPIs": true,
    "showActivityFeed": true,
    "showWorkloadHeatmap": true,
    "showProjectHealth": true,
    "showAutomations": true,
    "showDeadlines": true,
    "showNotifications": true,
    "showDocuments": true,
    "showTimeTracking": true,
    "layout": "default"
  }'::jsonb,
  theme_config JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.business_dashboard_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own preferences"
  ON public.business_dashboard_preferences FOR ALL
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_business_tasks_assigned_to ON public.business_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_business_tasks_project_id ON public.business_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_business_tasks_due_date ON public.business_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_business_tasks_status ON public.business_tasks(status);
CREATE INDEX IF NOT EXISTS idx_business_projects_user_id ON public.business_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_business_activity_feed_created_at ON public.business_activity_feed(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_business_notifications_user_id ON public.business_notifications(user_id, is_read);

-- Enable realtime for activity feed
ALTER PUBLICATION supabase_realtime ADD TABLE public.business_activity_feed;
ALTER PUBLICATION supabase_realtime ADD TABLE public.business_notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.business_tasks;