-- ============================================
-- SECURITY FUNCTIONS AND RLS POLICIES
-- ============================================

-- 1. Create helper functions with proper search_path
CREATE OR REPLACE FUNCTION public.is_hr_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'hr_admin')
  )
$$;

CREATE OR REPLACE FUNCTION public.is_payroll_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'payroll_admin')
  )
$$;

-- 2. FIX CRM CONTACTS - Restrict to user's own contacts
DROP POLICY IF EXISTS "Anyone can view contacts" ON public.crm_contacts;
DROP POLICY IF EXISTS "Anyone can insert contacts" ON public.crm_contacts;
DROP POLICY IF EXISTS "Anyone can update contacts" ON public.crm_contacts;
DROP POLICY IF EXISTS "Anyone can delete contacts" ON public.crm_contacts;

CREATE POLICY "Users can view only their own contacts"
ON public.crm_contacts FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contacts"
ON public.crm_contacts FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contacts"
ON public.crm_contacts FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contacts"
ON public.crm_contacts FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- 3. FIX EMPLOYEES - Restrict to HR admins and employee
DROP POLICY IF EXISTS "Users can view their own employees" ON public.employees;
DROP POLICY IF EXISTS "Users can manage their own employees" ON public.employees;

CREATE POLICY "HR admins and employees can view"
ON public.employees FOR SELECT TO authenticated
USING (public.is_hr_admin(auth.uid()) OR auth.uid() = user_id);

CREATE POLICY "HR admins can manage employees"
ON public.employees FOR ALL TO authenticated
USING (public.is_hr_admin(auth.uid()));

-- 4. FIX CANDIDATES - Restrict to admins and candidate
DROP POLICY IF EXISTS "Anyone can insert candidates" ON public.candidates;
DROP POLICY IF EXISTS "Users can view their own candidate profile" ON public.candidates;
DROP POLICY IF EXISTS "Users can update their own candidate profile" ON public.candidates;
DROP POLICY IF EXISTS "Admins can view all candidates" ON public.candidates;

CREATE POLICY "Admins and candidates view"
ON public.candidates FOR SELECT TO authenticated
USING (public.is_admin(auth.uid()) OR auth.uid() = user_id);

CREATE POLICY "Anyone can register as candidate"
ON public.candidates FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins and candidates update"
ON public.candidates FOR UPDATE TO authenticated
USING (public.is_admin(auth.uid()) OR auth.uid() = user_id);

-- 5. FIX PAYROLL ITEMS - Payroll admins only
DROP POLICY IF EXISTS "Authenticated users can view payroll items" ON public.payroll_items;
DROP POLICY IF EXISTS "Authenticated users can manage payroll items" ON public.payroll_items;

CREATE POLICY "Payroll admins only"
ON public.payroll_items FOR ALL TO authenticated
USING (public.is_payroll_admin(auth.uid()));

-- 6. FIX PAYROLL RUNS - Payroll admins only
DROP POLICY IF EXISTS "Users can view their own payroll runs" ON public.payroll_runs;
DROP POLICY IF EXISTS "Users can manage their own payroll runs" ON public.payroll_runs;

CREATE POLICY "Payroll admins manage runs"
ON public.payroll_runs FOR ALL TO authenticated
USING (public.is_payroll_admin(auth.uid()));

-- 7. FIX BENEFITS - HR admins and employee
DROP POLICY IF EXISTS "Anyone can view benefits" ON public.benefits;

CREATE POLICY "HR and employees view benefits"
ON public.benefits FOR SELECT TO authenticated
USING (
  public.is_hr_admin(auth.uid()) OR
  EXISTS (
    SELECT 1 FROM public.employees 
    WHERE id = benefits.employee_id AND user_id = auth.uid()
  )
);

CREATE POLICY "HR admins manage benefits"
ON public.benefits FOR ALL TO authenticated
USING (public.is_hr_admin(auth.uid()));

-- 8. FIX COMPLIANCE DOCUMENTS - HR admins and employee
DROP POLICY IF EXISTS "Anyone can view compliance documents" ON public.compliance_documents;
DROP POLICY IF EXISTS "Anyone can manage compliance documents" ON public.compliance_documents;

CREATE POLICY "HR and employees view docs"
ON public.compliance_documents FOR SELECT TO authenticated
USING (
  public.is_hr_admin(auth.uid()) OR
  EXISTS (
    SELECT 1 FROM public.employees 
    WHERE id = compliance_documents.employee_id AND user_id = auth.uid()
  )
);

CREATE POLICY "HR admins manage docs"
ON public.compliance_documents FOR ALL TO authenticated
USING (public.is_hr_admin(auth.uid()));

-- 9. FIX TIME OFF REQUESTS - HR and employee
DROP POLICY IF EXISTS "Anyone can view time off" ON public.time_off_requests;

CREATE POLICY "HR and employees view time off"
ON public.time_off_requests FOR SELECT TO authenticated
USING (
  public.is_hr_admin(auth.uid()) OR
  EXISTS (
    SELECT 1 FROM public.employees 
    WHERE id = time_off_requests.employee_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Employees create time off"
ON public.time_off_requests FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.employees 
    WHERE id = time_off_requests.employee_id AND user_id = auth.uid()
  )
);

CREATE POLICY "HR admins manage time off"
ON public.time_off_requests FOR ALL TO authenticated
USING (public.is_hr_admin(auth.uid()));

-- 10. FIX CRM INTERACTIONS - User-scoped
DROP POLICY IF EXISTS "Anyone can view interactions" ON public.crm_interactions;
DROP POLICY IF EXISTS "Anyone can insert interactions" ON public.crm_interactions;
DROP POLICY IF EXISTS "Anyone can update interactions" ON public.crm_interactions;
DROP POLICY IF EXISTS "Anyone can delete interactions" ON public.crm_interactions;

CREATE POLICY "Users view own interactions"
ON public.crm_interactions FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.crm_contacts 
    WHERE id = crm_interactions.contact_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users manage own interactions"
ON public.crm_interactions FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.crm_contacts 
    WHERE id = crm_interactions.contact_id AND user_id = auth.uid()
  )
);

-- 11. FIX SECURE VAULT - Proper user restriction
DROP POLICY IF EXISTS "Users can view their vault items" ON public.secure_vault;
DROP POLICY IF EXISTS "Users can insert vault items" ON public.secure_vault;
DROP POLICY IF EXISTS "Users can update their vault items" ON public.secure_vault;
DROP POLICY IF EXISTS "Users can delete their vault items" ON public.secure_vault;

CREATE POLICY "Users manage own vault"
ON public.secure_vault FOR ALL TO authenticated
USING (auth.uid() = user_id);