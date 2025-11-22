-- Create team messages table for internal organization messaging
CREATE TABLE IF NOT EXISTS public.team_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message text NOT NULL,
  read boolean DEFAULT false,
  read_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create team message threads table
CREATE TABLE IF NOT EXISTS public.team_message_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participants uuid[] NOT NULL,
  last_message_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create platform permissions table
CREATE TABLE IF NOT EXISTS public.platform_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid,
  can_access_dashboard boolean DEFAULT true,
  can_access_projects boolean DEFAULT true,
  can_access_tasks boolean DEFAULT true,
  can_access_chat boolean DEFAULT true,
  can_access_calendar boolean DEFAULT true,
  can_access_document_generator boolean DEFAULT true,
  can_access_analytics boolean DEFAULT true,
  can_access_revenue boolean DEFAULT true,
  can_access_crm boolean DEFAULT true,
  can_access_team_management boolean DEFAULT false,
  can_access_payroll boolean DEFAULT false,
  can_access_security boolean DEFAULT false,
  can_access_automation boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(user_id, organization_id)
);

-- Enable RLS
ALTER TABLE public.team_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_permissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for team_messages
CREATE POLICY "Users can view messages they sent or received"
  ON public.team_messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send messages"
  ON public.team_messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their received messages"
  ON public.team_messages FOR UPDATE
  USING (auth.uid() = recipient_id);

-- RLS Policies for team_message_threads
CREATE POLICY "Users can view their threads"
  ON public.team_message_threads FOR SELECT
  USING (auth.uid() = ANY(participants));

CREATE POLICY "Users can create threads"
  ON public.team_message_threads FOR INSERT
  WITH CHECK (auth.uid() = ANY(participants));

-- RLS Policies for platform_permissions
CREATE POLICY "Users can view their own permissions"
  ON public.platform_permissions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all permissions"
  ON public.platform_permissions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create function to check user permissions
CREATE OR REPLACE FUNCTION public.check_user_permission(
  _user_id uuid,
  _permission text
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT 
      CASE _permission
        WHEN 'dashboard' THEN can_access_dashboard
        WHEN 'projects' THEN can_access_projects
        WHEN 'tasks' THEN can_access_tasks
        WHEN 'chat' THEN can_access_chat
        WHEN 'calendar' THEN can_access_calendar
        WHEN 'document_generator' THEN can_access_document_generator
        WHEN 'analytics' THEN can_access_analytics
        WHEN 'revenue' THEN can_access_revenue
        WHEN 'crm' THEN can_access_crm
        WHEN 'team_management' THEN can_access_team_management
        WHEN 'payroll' THEN can_access_payroll
        WHEN 'security' THEN can_access_security
        WHEN 'automation' THEN can_access_automation
        ELSE false
      END
    FROM public.platform_permissions
    WHERE user_id = _user_id
    LIMIT 1),
    true -- Default to true if no permissions record exists
  );
$$;

-- Create triggers for updated_at
CREATE TRIGGER update_team_messages_updated_at
  BEFORE UPDATE ON public.team_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_team_message_threads_updated_at
  BEFORE UPDATE ON public.team_message_threads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_platform_permissions_updated_at
  BEFORE UPDATE ON public.platform_permissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_team_messages_sender ON public.team_messages(sender_id);
CREATE INDEX idx_team_messages_recipient ON public.team_messages(recipient_id);
CREATE INDEX idx_team_messages_created ON public.team_messages(created_at DESC);
CREATE INDEX idx_team_message_threads_participants ON public.team_message_threads USING gin(participants);
CREATE INDEX idx_platform_permissions_user ON public.platform_permissions(user_id);