-- Create user roles enum
CREATE TYPE public.user_role AS ENUM ('admin', 'manager', 'analyst', 'viewer');

-- Create user roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role user_role NOT NULL DEFAULT 'viewer',
  permissions jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(user_id)
);

-- Create audit logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text,
  ip_address text,
  user_agent text,
  details jsonb,
  severity text DEFAULT 'info',
  timestamp timestamp with time zone DEFAULT now() NOT NULL
);

-- Create secure vault table
CREATE TABLE IF NOT EXISTS public.secure_vault (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  category text DEFAULT 'password',
  encrypted_data text NOT NULL,
  metadata jsonb,
  access_count integer DEFAULT 0,
  last_accessed timestamp with time zone,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create security policies table
CREATE TABLE IF NOT EXISTS public.security_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_name text NOT NULL,
  policy_type text NOT NULL,
  description text,
  status text DEFAULT 'active',
  compliance_frameworks text[],
  last_reviewed timestamp with time zone,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create cyber risk assessments table
CREATE TABLE IF NOT EXISTS public.cyber_risk_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_name text NOT NULL,
  risk_level text DEFAULT 'medium',
  category text NOT NULL,
  description text,
  mitigation_status text DEFAULT 'open',
  impact_score integer,
  likelihood_score integer,
  assigned_to uuid,
  due_date timestamp with time zone,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create MFA settings table
CREATE TABLE IF NOT EXISTS public.mfa_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  mfa_enabled boolean DEFAULT false,
  mfa_method text DEFAULT 'totp',
  backup_codes text[],
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.secure_vault ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cyber_risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mfa_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own role"
  ON public.user_roles FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (true);

-- RLS Policies for audit_logs
CREATE POLICY "Users can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (true);

CREATE POLICY "System can insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (true);

-- RLS Policies for secure_vault
CREATE POLICY "Users can view their vault items"
  ON public.secure_vault FOR SELECT
  USING (true);

CREATE POLICY "Users can insert vault items"
  ON public.secure_vault FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their vault items"
  ON public.secure_vault FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete their vault items"
  ON public.secure_vault FOR DELETE
  USING (true);

-- RLS Policies for security_policies
CREATE POLICY "Anyone can view security policies"
  ON public.security_policies FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage policies"
  ON public.security_policies FOR ALL
  USING (true);

-- RLS Policies for cyber_risk_assessments
CREATE POLICY "Users can view risk assessments"
  ON public.cyber_risk_assessments FOR SELECT
  USING (true);

CREATE POLICY "Users can create risk assessments"
  ON public.cyber_risk_assessments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update risk assessments"
  ON public.cyber_risk_assessments FOR UPDATE
  USING (true);

-- RLS Policies for mfa_settings
CREATE POLICY "Users can view their MFA settings"
  ON public.mfa_settings FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their MFA settings"
  ON public.mfa_settings FOR ALL
  USING (true);

-- Create triggers for updated_at
CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_secure_vault_updated_at
  BEFORE UPDATE ON public.secure_vault
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_security_policies_updated_at
  BEFORE UPDATE ON public.security_policies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cyber_risk_assessments_updated_at
  BEFORE UPDATE ON public.cyber_risk_assessments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mfa_settings_updated_at
  BEFORE UPDATE ON public.mfa_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);
CREATE INDEX idx_secure_vault_user_id ON public.secure_vault(user_id);
CREATE INDEX idx_cyber_risk_level ON public.cyber_risk_assessments(risk_level);