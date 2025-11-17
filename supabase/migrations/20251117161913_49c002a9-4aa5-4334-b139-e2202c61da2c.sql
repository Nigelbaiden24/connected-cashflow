-- Create compliance rules table for automated checks
CREATE TABLE IF NOT EXISTS public.compliance_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name TEXT NOT NULL,
  rule_type TEXT NOT NULL, -- 'kyc_aml', 'documentation', 'suitability', 'trading', 'portfolio_risk'
  description TEXT,
  severity TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  enabled BOOLEAN DEFAULT true,
  auto_check BOOLEAN DEFAULT false,
  check_frequency TEXT, -- 'daily', 'weekly', 'on_trade', 'on_profile_update'
  rule_config JSONB DEFAULT '{}', -- Rule-specific configuration
  threshold_config JSONB, -- Threshold values for the rule
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create compliance checks table for check results
CREATE TABLE IF NOT EXISTS public.compliance_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID REFERENCES public.compliance_rules(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  check_date TIMESTAMPTZ DEFAULT now(),
  status TEXT NOT NULL, -- 'pass', 'warning', 'fail', 'needs_review'
  risk_score NUMERIC(5,2), -- 0-100 score
  findings JSONB, -- Detailed findings from the check
  metadata JSONB, -- Additional check metadata
  checked_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create compliance cases table for breach management
CREATE TABLE IF NOT EXISTS public.compliance_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number TEXT UNIQUE NOT NULL,
  check_id UUID REFERENCES public.compliance_checks(id),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  rule_id UUID REFERENCES public.compliance_rules(id),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open', -- 'open', 'under_review', 'resolved', 'closed'
  priority TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  assigned_to UUID REFERENCES auth.users(id),
  resolution_notes TEXT,
  ai_suggestions JSONB, -- AI-generated remediation suggestions
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create compliance case comments for threaded discussions
CREATE TABLE IF NOT EXISTS public.compliance_case_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES public.compliance_cases(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create client compliance documents table (separate from employee compliance)
CREATE TABLE IF NOT EXISTS public.client_compliance_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL, -- 'kyc', 'aml', 'suitability', 'risk_disclosure', 'agreement'
  document_name TEXT NOT NULL,
  file_path TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'expired'
  expiry_date DATE,
  signed_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  uploaded_by UUID REFERENCES auth.users(id)
);

-- Create compliance audit trail
CREATE TABLE IF NOT EXISTS public.compliance_audit_trail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL, -- 'rule', 'check', 'case', 'document'
  entity_id UUID NOT NULL,
  action TEXT NOT NULL, -- 'created', 'updated', 'deleted', 'status_changed'
  changes JSONB, -- What changed
  user_id UUID REFERENCES auth.users(id),
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.compliance_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_case_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_compliance_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_audit_trail ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can view compliance rules"
  ON public.compliance_rules FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage compliance rules"
  ON public.compliance_rules FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Users can view checks for their clients"
  ON public.compliance_checks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.id = compliance_checks.client_id
      AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert checks for their clients"
  ON public.compliance_checks FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.id = compliance_checks.client_id
      AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view cases for their clients"
  ON public.compliance_cases FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.id = compliance_cases.client_id
      AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage cases for their clients"
  ON public.compliance_cases FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.id = compliance_cases.client_id
      AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view case comments"
  ON public.compliance_case_comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can add case comments"
  ON public.compliance_case_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view documents for their clients"
  ON public.client_compliance_documents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.id = client_compliance_documents.client_id
      AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage documents for their clients"
  ON public.client_compliance_documents FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.id = client_compliance_documents.client_id
      AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view audit trail"
  ON public.compliance_audit_trail FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can insert audit trail"
  ON public.compliance_audit_trail FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create triggers for updated_at
CREATE TRIGGER update_compliance_rules_updated_at
  BEFORE UPDATE ON public.compliance_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_compliance_cases_updated_at
  BEFORE UPDATE ON public.compliance_cases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_client_compliance_documents_updated_at
  BEFORE UPDATE ON public.client_compliance_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_compliance_checks_client ON public.compliance_checks(client_id);
CREATE INDEX idx_compliance_checks_rule ON public.compliance_checks(rule_id);
CREATE INDEX idx_compliance_checks_date ON public.compliance_checks(check_date);
CREATE INDEX idx_compliance_cases_client ON public.compliance_cases(client_id);
CREATE INDEX idx_compliance_cases_status ON public.compliance_cases(status);
CREATE INDEX idx_client_compliance_documents_client ON public.client_compliance_documents(client_id);
CREATE INDEX idx_client_compliance_documents_expiry ON public.client_compliance_documents(expiry_date);

-- Insert default compliance rules
INSERT INTO public.compliance_rules (rule_name, rule_type, description, severity, auto_check, check_frequency, threshold_config) VALUES
('KYC Document Completeness', 'kyc_aml', 'Verify all required KYC documents are current and complete', 'critical', true, 'daily', '{"required_docs": ["id", "proof_of_address", "financial_statement"]}'),
('AML Risk Scoring', 'kyc_aml', 'Assess money laundering risk based on client profile', 'high', true, 'on_profile_update', '{"high_risk_threshold": 70}'),
('Suitability Assessment', 'suitability', 'Verify investment recommendations match client risk profile', 'high', true, 'on_trade', '{"max_risk_deviation": 2}'),
('Portfolio Concentration Limits', 'portfolio_risk', 'Monitor single position limits (<10% per security)', 'high', true, 'daily', '{"max_position_pct": 10}'),
('Document Expiry Tracking', 'documentation', 'Track and alert on expiring compliance documents', 'medium', true, 'daily', '{"alert_days_before": 30}'),
('Risk Disclosure Completeness', 'documentation', 'Ensure all high-risk investment disclosures are signed', 'high', false, 'on_trade', '{}'),
('Trade Surveillance', 'trading', 'Monitor for unusual trading patterns and market abuse', 'high', true, 'daily', '{"unusual_volume_threshold": 5}'),
('Client Profile Currency', 'kyc_aml', 'Ensure client financial information is updated annually', 'medium', true, 'daily', '{"max_days_old": 365}');