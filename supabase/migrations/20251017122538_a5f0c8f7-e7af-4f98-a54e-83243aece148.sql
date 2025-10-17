-- CRM Custom Columns
CREATE TABLE IF NOT EXISTS public.crm_custom_columns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  column_name text NOT NULL,
  column_type text NOT NULL CHECK (column_type IN ('text', 'number', 'date', 'select', 'multi-select', 'checkbox', 'email', 'phone', 'url')),
  column_options jsonb DEFAULT '[]'::jsonb,
  column_order integer DEFAULT 0,
  is_required boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.crm_contact_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid NOT NULL REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
  column_id uuid NOT NULL REFERENCES public.crm_custom_columns(id) ON DELETE CASCADE,
  value text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(contact_id, column_id)
);

-- Payroll Tables
CREATE TABLE IF NOT EXISTS public.employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  employee_id text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text,
  address text,
  city text,
  state text,
  zip text,
  ssn_encrypted text,
  date_of_birth date,
  hire_date date NOT NULL,
  termination_date date,
  employment_type text DEFAULT 'full-time',
  department text,
  position text,
  pay_rate numeric NOT NULL,
  pay_frequency text DEFAULT 'bi-weekly',
  bank_name text,
  account_number_encrypted text,
  routing_number_encrypted text,
  status text DEFAULT 'active',
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.payroll_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_date date NOT NULL,
  pay_period_start date NOT NULL,
  pay_period_end date NOT NULL,
  payment_date date NOT NULL,
  status text DEFAULT 'draft',
  total_gross numeric DEFAULT 0,
  total_net numeric DEFAULT 0,
  processed_by uuid,
  processed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.payroll_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_run_id uuid NOT NULL REFERENCES public.payroll_runs(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  hours_worked numeric DEFAULT 0,
  gross_pay numeric NOT NULL,
  federal_tax numeric DEFAULT 0,
  state_tax numeric DEFAULT 0,
  social_security numeric DEFAULT 0,
  medicare numeric DEFAULT 0,
  retirement_401k numeric DEFAULT 0,
  health_insurance numeric DEFAULT 0,
  other_deductions numeric DEFAULT 0,
  net_pay numeric NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.tax_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year integer NOT NULL,
  state text,
  federal_rate numeric DEFAULT 0.22,
  state_rate numeric DEFAULT 0.05,
  social_security_rate numeric DEFAULT 0.062,
  medicare_rate numeric DEFAULT 0.0145,
  unemployment_rate numeric DEFAULT 0.006,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(year, state)
);

CREATE TABLE IF NOT EXISTS public.benefits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  benefit_type text NOT NULL,
  provider text,
  plan_name text,
  employee_contribution numeric DEFAULT 0,
  employer_contribution numeric DEFAULT 0,
  coverage_start_date date,
  coverage_end_date date,
  status text DEFAULT 'active',
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.time_off_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  request_type text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  days_requested numeric NOT NULL,
  status text DEFAULT 'pending',
  notes text,
  approved_by uuid,
  approved_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.compliance_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES public.employees(id) ON DELETE CASCADE,
  document_type text NOT NULL,
  document_name text NOT NULL,
  file_path text,
  status text DEFAULT 'pending',
  expiry_date date,
  notes text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.crm_custom_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_contact_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_off_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view custom columns" ON public.crm_custom_columns FOR SELECT USING (true);
CREATE POLICY "Anyone can manage custom columns" ON public.crm_custom_columns FOR ALL USING (true);

CREATE POLICY "Anyone can view contact data" ON public.crm_contact_data FOR SELECT USING (true);
CREATE POLICY "Anyone can manage contact data" ON public.crm_contact_data FOR ALL USING (true);

CREATE POLICY "Anyone can view employees" ON public.employees FOR SELECT USING (true);
CREATE POLICY "Anyone can manage employees" ON public.employees FOR ALL USING (true);

CREATE POLICY "Anyone can view payroll runs" ON public.payroll_runs FOR SELECT USING (true);
CREATE POLICY "Anyone can manage payroll runs" ON public.payroll_runs FOR ALL USING (true);

CREATE POLICY "Anyone can view payroll items" ON public.payroll_items FOR SELECT USING (true);
CREATE POLICY "Anyone can manage payroll items" ON public.payroll_items FOR ALL USING (true);

CREATE POLICY "Anyone can view tax settings" ON public.tax_settings FOR SELECT USING (true);
CREATE POLICY "Anyone can manage tax settings" ON public.tax_settings FOR ALL USING (true);

CREATE POLICY "Anyone can view benefits" ON public.benefits FOR SELECT USING (true);
CREATE POLICY "Anyone can manage benefits" ON public.benefits FOR ALL USING (true);

CREATE POLICY "Anyone can view time off requests" ON public.time_off_requests FOR SELECT USING (true);
CREATE POLICY "Anyone can manage time off requests" ON public.time_off_requests FOR ALL USING (true);

CREATE POLICY "Anyone can view compliance documents" ON public.compliance_documents FOR SELECT USING (true);
CREATE POLICY "Anyone can manage compliance documents" ON public.compliance_documents FOR ALL USING (true);

-- Triggers
CREATE TRIGGER update_crm_custom_columns_updated_at
  BEFORE UPDATE ON public.crm_custom_columns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_crm_contact_data_updated_at
  BEFORE UPDATE ON public.crm_contact_data
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON public.employees
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payroll_runs_updated_at
  BEFORE UPDATE ON public.payroll_runs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tax_settings_updated_at
  BEFORE UPDATE ON public.tax_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_benefits_updated_at
  BEFORE UPDATE ON public.benefits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_time_off_requests_updated_at
  BEFORE UPDATE ON public.time_off_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_compliance_documents_updated_at
  BEFORE UPDATE ON public.compliance_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX idx_crm_contact_data_contact_id ON public.crm_contact_data(contact_id);
CREATE INDEX idx_crm_contact_data_column_id ON public.crm_contact_data(column_id);
CREATE INDEX idx_employees_status ON public.employees(status);
CREATE INDEX idx_employees_department ON public.employees(department);
CREATE INDEX idx_payroll_runs_status ON public.payroll_runs(status);
CREATE INDEX idx_payroll_items_employee_id ON public.payroll_items(employee_id);
CREATE INDEX idx_benefits_employee_id ON public.benefits(employee_id);
CREATE INDEX idx_time_off_requests_employee_id ON public.time_off_requests(employee_id);