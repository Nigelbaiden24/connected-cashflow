-- Add user_id columns to tables that need user-specific data
ALTER TABLE public.clients ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.crm_contacts ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.employees ADD COLUMN created_by uuid REFERENCES auth.users(id);
ALTER TABLE public.payroll_runs ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.demo_requests ADD COLUMN user_id uuid REFERENCES auth.users(id);

-- Update RLS policies for user-specific access
DROP POLICY IF EXISTS "Authenticated users can view clients" ON public.clients;
DROP POLICY IF EXISTS "Authenticated users can insert clients" ON public.clients;
DROP POLICY IF EXISTS "Authenticated users can update clients" ON public.clients;
DROP POLICY IF EXISTS "Authenticated users can delete clients" ON public.clients;

CREATE POLICY "Users can view their own clients"
  ON public.clients FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own clients"
  ON public.clients FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients"
  ON public.clients FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients"
  ON public.clients FOR DELETE
  USING (auth.uid() = user_id);

-- CRM Contacts
DROP POLICY IF EXISTS "Authenticated users can view contacts" ON public.crm_contacts;
DROP POLICY IF EXISTS "Authenticated users can insert contacts" ON public.crm_contacts;
DROP POLICY IF EXISTS "Authenticated users can update contacts" ON public.crm_contacts;
DROP POLICY IF EXISTS "Authenticated users can delete contacts" ON public.crm_contacts;

CREATE POLICY "Users can view their own contacts"
  ON public.crm_contacts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contacts"
  ON public.crm_contacts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contacts"
  ON public.crm_contacts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contacts"
  ON public.crm_contacts FOR DELETE
  USING (auth.uid() = user_id);

-- Portfolio Holdings (linked through clients)
DROP POLICY IF EXISTS "Authenticated users can view portfolio holdings" ON public.portfolio_holdings;
DROP POLICY IF EXISTS "Authenticated users can insert portfolio holdings" ON public.portfolio_holdings;
DROP POLICY IF EXISTS "Authenticated users can update portfolio holdings" ON public.portfolio_holdings;
DROP POLICY IF EXISTS "Authenticated users can delete portfolio holdings" ON public.portfolio_holdings;

CREATE POLICY "Users can view portfolio holdings for their clients"
  ON public.portfolio_holdings FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.clients 
    WHERE clients.id = portfolio_holdings.client_id 
    AND clients.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert portfolio holdings for their clients"
  ON public.portfolio_holdings FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.clients 
    WHERE clients.id = portfolio_holdings.client_id 
    AND clients.user_id = auth.uid()
  ));

CREATE POLICY "Users can update portfolio holdings for their clients"
  ON public.portfolio_holdings FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.clients 
    WHERE clients.id = portfolio_holdings.client_id 
    AND clients.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete portfolio holdings for their clients"
  ON public.portfolio_holdings FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.clients 
    WHERE clients.id = portfolio_holdings.client_id 
    AND clients.user_id = auth.uid()
  ));

-- Financial Plans (linked through clients)
DROP POLICY IF EXISTS "Authenticated users can view financial plans" ON public.financial_plans;
DROP POLICY IF EXISTS "Authenticated users can insert financial plans" ON public.financial_plans;
DROP POLICY IF EXISTS "Authenticated users can update financial plans" ON public.financial_plans;
DROP POLICY IF EXISTS "Authenticated users can delete financial plans" ON public.financial_plans;

CREATE POLICY "Users can view financial plans for their clients"
  ON public.financial_plans FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.clients 
    WHERE clients.id = financial_plans.client_id 
    AND clients.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert financial plans for their clients"
  ON public.financial_plans FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.clients 
    WHERE clients.id = financial_plans.client_id 
    AND clients.user_id = auth.uid()
  ));

CREATE POLICY "Users can update financial plans for their clients"
  ON public.financial_plans FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.clients 
    WHERE clients.id = financial_plans.client_id 
    AND clients.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete financial plans for their clients"
  ON public.financial_plans FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.clients 
    WHERE clients.id = financial_plans.client_id 
    AND clients.user_id = auth.uid()
  ));

-- Client Meetings (linked through clients)
DROP POLICY IF EXISTS "Authenticated users can view client meetings" ON public.client_meetings;
DROP POLICY IF EXISTS "Authenticated users can insert client meetings" ON public.client_meetings;
DROP POLICY IF EXISTS "Authenticated users can update client meetings" ON public.client_meetings;
DROP POLICY IF EXISTS "Authenticated users can delete client meetings" ON public.client_meetings;

CREATE POLICY "Users can view meetings for their clients"
  ON public.client_meetings FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.clients 
    WHERE clients.id = client_meetings.client_id 
    AND clients.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert meetings for their clients"
  ON public.client_meetings FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.clients 
    WHERE clients.id = client_meetings.client_id 
    AND clients.user_id = auth.uid()
  ));

CREATE POLICY "Users can update meetings for their clients"
  ON public.client_meetings FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.clients 
    WHERE clients.id = client_meetings.client_id 
    AND clients.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete meetings for their clients"
  ON public.client_meetings FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.clients 
    WHERE clients.id = client_meetings.client_id 
    AND clients.user_id = auth.uid()
  ));

-- Client Documents (linked through clients)
DROP POLICY IF EXISTS "Authenticated users can view client documents" ON public.client_documents;
DROP POLICY IF EXISTS "Authenticated users can insert client documents" ON public.client_documents;
DROP POLICY IF EXISTS "Authenticated users can update client documents" ON public.client_documents;
DROP POLICY IF EXISTS "Authenticated users can delete client documents" ON public.client_documents;

CREATE POLICY "Users can view documents for their clients"
  ON public.client_documents FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.clients 
    WHERE clients.id = client_documents.client_id 
    AND clients.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert documents for their clients"
  ON public.client_documents FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.clients 
    WHERE clients.id = client_documents.client_id 
    AND clients.user_id = auth.uid()
  ));

CREATE POLICY "Users can update documents for their clients"
  ON public.client_documents FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.clients 
    WHERE clients.id = client_documents.client_id 
    AND clients.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete documents for their clients"
  ON public.client_documents FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.clients 
    WHERE clients.id = client_documents.client_id 
    AND clients.user_id = auth.uid()
  ));

-- CRM Interactions (linked through crm_contacts)
DROP POLICY IF EXISTS "Authenticated users can view interactions" ON public.crm_interactions;
DROP POLICY IF EXISTS "Authenticated users can insert interactions" ON public.crm_interactions;
DROP POLICY IF EXISTS "Authenticated users can update interactions" ON public.crm_interactions;
DROP POLICY IF EXISTS "Authenticated users can delete interactions" ON public.crm_interactions;

CREATE POLICY "Users can view interactions for their contacts"
  ON public.crm_interactions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.crm_contacts 
    WHERE crm_contacts.id = crm_interactions.contact_id 
    AND crm_contacts.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert interactions for their contacts"
  ON public.crm_interactions FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.crm_contacts 
    WHERE crm_contacts.id = crm_interactions.contact_id 
    AND crm_contacts.user_id = auth.uid()
  ));

CREATE POLICY "Users can update interactions for their contacts"
  ON public.crm_interactions FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.crm_contacts 
    WHERE crm_contacts.id = crm_interactions.contact_id 
    AND crm_contacts.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete interactions for their contacts"
  ON public.crm_interactions FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.crm_contacts 
    WHERE crm_contacts.id = crm_interactions.contact_id 
    AND crm_contacts.user_id = auth.uid()
  ));

-- Employees
DROP POLICY IF EXISTS "Authenticated users can view employees" ON public.employees;
DROP POLICY IF EXISTS "Authenticated users can manage employees" ON public.employees;

CREATE POLICY "Users can view their own employees"
  ON public.employees FOR SELECT
  USING (auth.uid() = created_by OR auth.uid() = user_id);

CREATE POLICY "Users can manage their own employees"
  ON public.employees FOR ALL
  USING (auth.uid() = created_by);

-- Payroll Runs
DROP POLICY IF EXISTS "Authenticated users can view payroll runs" ON public.payroll_runs;
DROP POLICY IF EXISTS "Authenticated users can manage payroll runs" ON public.payroll_runs;

CREATE POLICY "Users can view their own payroll runs"
  ON public.payroll_runs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own payroll runs"
  ON public.payroll_runs FOR ALL
  USING (auth.uid() = user_id);