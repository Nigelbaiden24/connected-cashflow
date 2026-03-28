-- API Clients table
CREATE TABLE public.api_clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  api_key text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  contact_email text,
  description text,
  rate_limit_per_minute int NOT NULL DEFAULT 60,
  rate_limit_per_day int NOT NULL DEFAULT 1000,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- API Usage Logs table
CREATE TABLE public.api_usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  api_client_id uuid REFERENCES public.api_clients(id) ON DELETE CASCADE NOT NULL,
  api_key text NOT NULL,
  endpoint text NOT NULL,
  method text NOT NULL DEFAULT 'GET',
  response_status int,
  response_time_ms int,
  ip_address text,
  user_agent text,
  request_params jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- API Permissions table
CREATE TABLE public.api_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  api_client_id uuid REFERENCES public.api_clients(id) ON DELETE CASCADE NOT NULL,
  endpoint_group text NOT NULL,
  endpoint_name text NOT NULL,
  access_level text NOT NULL DEFAULT 'none' CHECK (access_level IN ('read', 'write', 'none')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(api_client_id, endpoint_name)
);

-- API Webhooks table
CREATE TABLE public.api_webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  api_client_id uuid REFERENCES public.api_clients(id) ON DELETE CASCADE NOT NULL,
  url text NOT NULL,
  event_type text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  secret text DEFAULT encode(gen_random_bytes(16), 'hex'),
  last_triggered_at timestamptz,
  failure_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_api_usage_logs_client_id ON public.api_usage_logs(api_client_id);
CREATE INDEX idx_api_usage_logs_created_at ON public.api_usage_logs(created_at);
CREATE INDEX idx_api_usage_logs_endpoint ON public.api_usage_logs(endpoint);
CREATE INDEX idx_api_clients_api_key ON public.api_clients(api_key);
CREATE INDEX idx_api_permissions_client_id ON public.api_permissions(api_client_id);
CREATE INDEX idx_api_webhooks_client_id ON public.api_webhooks(api_client_id);
CREATE INDEX idx_api_webhooks_event_type ON public.api_webhooks(event_type);

-- Enable RLS
ALTER TABLE public.api_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_webhooks ENABLE ROW LEVEL SECURITY;

-- Admin-only policies
CREATE POLICY "Admins can manage api_clients" ON public.api_clients
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can view api_usage_logs" ON public.api_usage_logs
  FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage api_permissions" ON public.api_permissions
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage api_webhooks" ON public.api_webhooks
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Updated_at triggers
CREATE TRIGGER update_api_clients_updated_at BEFORE UPDATE ON public.api_clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_api_permissions_updated_at BEFORE UPDATE ON public.api_permissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_api_webhooks_updated_at BEFORE UPDATE ON public.api_webhooks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to validate API key and return client info
CREATE OR REPLACE FUNCTION public.validate_api_key(_api_key text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  client_record RECORD;
  usage_count_minute int;
  usage_count_day int;
BEGIN
  SELECT * INTO client_record FROM public.api_clients WHERE api_key = _api_key AND status = 'active';
  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Invalid or inactive API key');
  END IF;

  SELECT count(*) INTO usage_count_minute FROM public.api_usage_logs
  WHERE api_client_id = client_record.id AND created_at > now() - interval '1 minute';

  SELECT count(*) INTO usage_count_day FROM public.api_usage_logs
  WHERE api_client_id = client_record.id AND created_at > now() - interval '1 day';

  IF usage_count_minute >= client_record.rate_limit_per_minute THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Rate limit exceeded (per minute)', 'client_id', client_record.id);
  END IF;

  IF usage_count_day >= client_record.rate_limit_per_day THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Rate limit exceeded (per day)', 'client_id', client_record.id);
  END IF;

  RETURN jsonb_build_object(
    'valid', true,
    'client_id', client_record.id,
    'company_name', client_record.company_name,
    'plan', client_record.plan,
    'rate_limit_per_minute', client_record.rate_limit_per_minute,
    'rate_limit_per_day', client_record.rate_limit_per_day
  );
END;
$$;

-- Function to check endpoint permission
CREATE OR REPLACE FUNCTION public.check_api_permission(_client_id uuid, _endpoint text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.api_permissions
    WHERE api_client_id = _client_id
      AND endpoint_name = _endpoint
      AND access_level IN ('read', 'write')
  )
$$;