-- Create team_members table
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  department TEXT NOT NULL,
  role_title TEXT NOT NULL,
  role_id UUID,
  avatar_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave', 'offboarded')),
  workload_score INTEGER DEFAULT 0 CHECK (workload_score >= 0 AND workload_score <= 100),
  utilization_score INTEGER DEFAULT 0 CHECK (utilization_score >= 0 AND utilization_score <= 100),
  join_date DATE NOT NULL DEFAULT CURRENT_DATE,
  permissions JSONB DEFAULT '{}'::jsonb,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create roles table
CREATE TABLE public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_name TEXT NOT NULL UNIQUE,
  department TEXT NOT NULL,
  permissions_schema JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create workload_items table
CREATE TABLE public.workload_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES public.team_members(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked')),
  due_date DATE,
  hours_estimated NUMERIC,
  hours_logged NUMERIC DEFAULT 0,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add foreign key constraint
ALTER TABLE public.team_members 
ADD CONSTRAINT fk_role 
FOREIGN KEY (role_id) 
REFERENCES public.roles(id) 
ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workload_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for team_members
CREATE POLICY "Authenticated users can view team members"
  ON public.team_members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert team members"
  ON public.team_members FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update team members"
  ON public.team_members FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete team members"
  ON public.team_members FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for roles
CREATE POLICY "Authenticated users can view roles"
  ON public.roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage roles"
  ON public.roles FOR ALL
  TO authenticated
  USING (true);

-- RLS Policies for workload_items
CREATE POLICY "Authenticated users can view workload items"
  ON public.workload_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage workload items"
  ON public.workload_items FOR ALL
  TO authenticated
  USING (true);

-- Create indexes for performance
CREATE INDEX idx_team_members_department ON public.team_members(department);
CREATE INDEX idx_team_members_status ON public.team_members(status);
CREATE INDEX idx_team_members_role_id ON public.team_members(role_id);
CREATE INDEX idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX idx_workload_items_member_id ON public.workload_items(member_id);
CREATE INDEX idx_workload_items_status ON public.workload_items(status);

-- Trigger for updating updated_at on team_members
CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON public.team_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for updating updated_at on roles
CREATE TRIGGER update_roles_updated_at
  BEFORE UPDATE ON public.roles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for updating updated_at on workload_items
CREATE TRIGGER update_workload_items_updated_at
  BEFORE UPDATE ON public.workload_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for audit logging on team_members
CREATE OR REPLACE FUNCTION log_team_member_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (
      user_id,
      action,
      resource_type,
      resource_id,
      details
    ) VALUES (
      auth.uid(),
      'team_member_updated',
      'team_member',
      NEW.id::text,
      jsonb_build_object(
        'old', row_to_json(OLD),
        'new', row_to_json(NEW)
      )
    );
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (
      user_id,
      action,
      resource_type,
      resource_id,
      details
    ) VALUES (
      auth.uid(),
      'team_member_created',
      'team_member',
      NEW.id::text,
      row_to_json(NEW)::jsonb
    );
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (
      user_id,
      action,
      resource_type,
      resource_id,
      details
    ) VALUES (
      auth.uid(),
      'team_member_deleted',
      'team_member',
      OLD.id::text,
      row_to_json(OLD)::jsonb
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER team_member_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.team_members
  FOR EACH ROW
  EXECUTE FUNCTION log_team_member_changes();

-- Insert default roles
INSERT INTO public.roles (role_name, department, permissions_schema) VALUES
  ('Admin', 'Administration', '{"can_view_workload": true, "can_edit_team_members": true, "can_manage_roles": true, "can_view_finance": true, "can_access_sensitive_tabs": true}'::jsonb),
  ('Manager', 'Management', '{"can_view_workload": true, "can_edit_team_members": true, "can_manage_roles": false, "can_view_finance": true, "can_access_sensitive_tabs": true}'::jsonb),
  ('HR', 'Human Resources', '{"can_view_workload": true, "can_edit_team_members": true, "can_manage_roles": true, "can_view_finance": false, "can_access_sensitive_tabs": true}'::jsonb),
  ('Finance', 'Finance', '{"can_view_workload": true, "can_edit_team_members": false, "can_manage_roles": false, "can_view_finance": true, "can_access_sensitive_tabs": true}'::jsonb),
  ('Read Only', 'General', '{"can_view_workload": true, "can_edit_team_members": false, "can_manage_roles": false, "can_view_finance": false, "can_access_sensitive_tabs": false}'::jsonb),
  ('Restricted', 'Intern', '{"can_view_workload": false, "can_edit_team_members": false, "can_manage_roles": false, "can_view_finance": false, "can_access_sensitive_tabs": false}'::jsonb);