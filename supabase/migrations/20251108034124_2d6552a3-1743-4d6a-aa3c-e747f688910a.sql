-- Core Automation Infrastructure Tables

-- Automation Rules table
CREATE TABLE IF NOT EXISTS public.automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name TEXT NOT NULL,
  module TEXT NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT true,
  trigger_type TEXT NOT NULL, -- 'schedule', 'event', 'condition', 'manual'
  trigger_config JSONB NOT NULL DEFAULT '{}', -- schedule cron, event type, conditions
  action_type TEXT NOT NULL, -- 'notification', 'data_sync', 'report_generation', 'workflow'
  action_config JSONB NOT NULL DEFAULT '{}', -- action parameters
  priority INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Automation Executions table
CREATE TABLE IF NOT EXISTS public.automation_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID NOT NULL REFERENCES public.automation_rules(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'running', 'success', 'failed', 'cancelled'
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  execution_time_ms INTEGER,
  trigger_data JSONB,
  result_data JSONB,
  error_message TEXT,
  error_stack TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Automation Triggers table (for event-based triggers)
CREATE TABLE IF NOT EXISTS public.automation_triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID NOT NULL REFERENCES public.automation_rules(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'client_created', 'project_completed', 'payment_received', etc.
  event_source TEXT NOT NULL, -- table or module name
  condition_query JSONB, -- conditional logic for trigger
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Automation Schedules table
CREATE TABLE IF NOT EXISTS public.automation_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID NOT NULL REFERENCES public.automation_rules(id) ON DELETE CASCADE,
  cron_expression TEXT NOT NULL,
  timezone TEXT DEFAULT 'UTC',
  next_run_at TIMESTAMPTZ,
  last_run_at TIMESTAMPTZ,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Automation Logs table (detailed logging)
CREATE TABLE IF NOT EXISTS public.automation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id UUID REFERENCES public.automation_executions(id) ON DELETE CASCADE,
  rule_id UUID REFERENCES public.automation_rules(id) ON DELETE CASCADE,
  log_level TEXT NOT NULL, -- 'debug', 'info', 'warn', 'error'
  message TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Automation Notifications table
CREATE TABLE IF NOT EXISTS public.automation_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id UUID REFERENCES public.automation_executions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  notification_type TEXT NOT NULL, -- 'email', 'in_app', 'sms'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'failed'
  sent_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Automation Dependencies table (for workflow chains)
CREATE TABLE IF NOT EXISTS public.automation_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID NOT NULL REFERENCES public.automation_rules(id) ON DELETE CASCADE,
  depends_on_rule_id UUID NOT NULL REFERENCES public.automation_rules(id) ON DELETE CASCADE,
  dependency_type TEXT DEFAULT 'sequential', -- 'sequential', 'parallel', 'conditional'
  condition_config JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT no_self_dependency CHECK (rule_id != depends_on_rule_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_automation_rules_module ON public.automation_rules(module);
CREATE INDEX IF NOT EXISTS idx_automation_rules_enabled ON public.automation_rules(enabled);
CREATE INDEX IF NOT EXISTS idx_automation_executions_rule_id ON public.automation_executions(rule_id);
CREATE INDEX IF NOT EXISTS idx_automation_executions_status ON public.automation_executions(status);
CREATE INDEX IF NOT EXISTS idx_automation_executions_created_at ON public.automation_executions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_automation_triggers_event_type ON public.automation_triggers(event_type);
CREATE INDEX IF NOT EXISTS idx_automation_logs_execution_id ON public.automation_logs(execution_id);
CREATE INDEX IF NOT EXISTS idx_automation_notifications_user_id ON public.automation_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_automation_schedules_next_run ON public.automation_schedules(next_run_at) WHERE enabled = true;

-- RLS Policies
ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_dependencies ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view automation data
CREATE POLICY "Users can view automation rules" ON public.automation_rules FOR SELECT USING (true);
CREATE POLICY "Users can view automation executions" ON public.automation_executions FOR SELECT USING (true);
CREATE POLICY "Users can view automation triggers" ON public.automation_triggers FOR SELECT USING (true);
CREATE POLICY "Users can view automation schedules" ON public.automation_schedules FOR SELECT USING (true);
CREATE POLICY "Users can view automation logs" ON public.automation_logs FOR SELECT USING (true);
CREATE POLICY "Users can view their notifications" ON public.automation_notifications FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can view automation dependencies" ON public.automation_dependencies FOR SELECT USING (true);

-- Allow admins to manage automation rules
CREATE POLICY "Admins can manage automation rules" ON public.automation_rules FOR ALL USING (true);
CREATE POLICY "System can manage automation executions" ON public.automation_executions FOR ALL USING (true);
CREATE POLICY "System can manage automation triggers" ON public.automation_triggers FOR ALL USING (true);
CREATE POLICY "System can manage automation schedules" ON public.automation_schedules FOR ALL USING (true);
CREATE POLICY "System can insert automation logs" ON public.automation_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "System can manage notifications" ON public.automation_notifications FOR ALL USING (true);
CREATE POLICY "Admins can manage dependencies" ON public.automation_dependencies FOR ALL USING (true);

-- Update timestamp trigger
CREATE TRIGGER update_automation_rules_updated_at
  BEFORE UPDATE ON public.automation_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to calculate next run time for schedules
CREATE OR REPLACE FUNCTION public.calculate_next_cron_run(cron_expr TEXT, tz TEXT DEFAULT 'UTC')
RETURNS TIMESTAMPTZ AS $$
BEGIN
  -- Simple next run calculation (will be improved with proper cron parsing in edge function)
  -- For now, return next hour as placeholder
  RETURN (now() AT TIME ZONE tz) + INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;