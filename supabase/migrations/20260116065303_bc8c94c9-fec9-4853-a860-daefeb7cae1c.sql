-- Admin Planner Tables for Enterprise Planning System

-- Planner Items (Tasks & Job Applications)
CREATE TABLE public.admin_planner_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('task', 'job_application')),
  crm_contact_id UUID REFERENCES public.crm_contacts(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'waiting', 'completed', 'rejected', 'offer')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  target_date DATE,
  outcome_notes TEXT,
  description TEXT,
  calendar_event_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Admin Time Tracking Sessions
CREATE TABLE public.admin_time_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_time TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Daily Time Aggregates (for faster queries)
CREATE TABLE public.admin_time_daily (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_seconds INTEGER NOT NULL DEFAULT 0,
  session_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- AI Assistant Conversation History
CREATE TABLE public.admin_planner_ai_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  response TEXT NOT NULL,
  context_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_planner_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_time_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_time_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_planner_ai_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin_planner_items
CREATE POLICY "Admins can manage their planner items" 
ON public.admin_planner_items 
FOR ALL 
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- RLS Policies for admin_time_sessions
CREATE POLICY "Admins can manage their time sessions" 
ON public.admin_time_sessions 
FOR ALL 
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- RLS Policies for admin_time_daily
CREATE POLICY "Admins can manage their daily time" 
ON public.admin_time_daily 
FOR ALL 
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- RLS Policies for admin_planner_ai_history
CREATE POLICY "Admins can manage their AI history" 
ON public.admin_planner_ai_history 
FOR ALL 
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Indexes for performance
CREATE INDEX idx_planner_items_user_status ON public.admin_planner_items(user_id, status);
CREATE INDEX idx_planner_items_target_date ON public.admin_planner_items(target_date);
CREATE INDEX idx_time_sessions_user_date ON public.admin_time_sessions(user_id, session_date);
CREATE INDEX idx_time_daily_user_date ON public.admin_time_daily(user_id, date);

-- Update trigger for planner items
CREATE TRIGGER update_admin_planner_items_updated_at
BEFORE UPDATE ON public.admin_planner_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update trigger for time daily
CREATE TRIGGER update_admin_time_daily_updated_at
BEFORE UPDATE ON public.admin_time_daily
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();