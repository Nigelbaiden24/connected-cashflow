-- Create admin productivity logs table to track all actions
CREATE TABLE public.admin_productivity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  action_description TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admin time block schedules table
CREATE TABLE public.admin_time_block_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  block_date DATE NOT NULL,
  start_hour INTEGER NOT NULL CHECK (start_hour >= 0 AND start_hour <= 23),
  end_hour INTEGER NOT NULL CHECK (end_hour >= 0 AND end_hour <= 24),
  block_type TEXT NOT NULL DEFAULT 'task',
  task_id UUID REFERENCES public.admin_planner_items(id) ON DELETE SET NULL,
  custom_label TEXT,
  is_completed BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_productivity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_time_block_schedules ENABLE ROW LEVEL SECURITY;

-- RLS Policies for productivity logs
CREATE POLICY "Users can view their own productivity logs"
  ON public.admin_productivity_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own productivity logs"
  ON public.admin_productivity_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for time block schedules
CREATE POLICY "Users can view their own time blocks"
  ON public.admin_time_block_schedules FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own time blocks"
  ON public.admin_time_block_schedules FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own time blocks"
  ON public.admin_time_block_schedules FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own time blocks"
  ON public.admin_time_block_schedules FOR DELETE
  USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_admin_time_block_schedules_updated_at
  BEFORE UPDATE ON public.admin_time_block_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for performance
CREATE INDEX idx_admin_productivity_logs_user_date ON public.admin_productivity_logs(user_id, created_at DESC);
CREATE INDEX idx_admin_time_block_schedules_user_date ON public.admin_time_block_schedules(user_id, block_date);