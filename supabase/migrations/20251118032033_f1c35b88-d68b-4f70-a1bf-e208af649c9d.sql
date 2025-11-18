-- ============================================
-- CRITICAL SECURITY FIXES - PART 2 (CORRECTED)
-- Skip CRM contacts as policies already exist
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

-- 2. FIX EMPLOYEES - Restrict to HR admins and employee themselves
DROP POLICY IF EXISTS "Users can view their own employees" ON public.employees;
DROP POLICY IF EXISTS "Users can manage their own employees" ON public.employees;

CREATE POLICY "HR admins and employees can view employee data"
ON public.employees
FOR SELECT
TO authenticated
USING (
  public.is_hr_admin(auth.uid()) OR 
  auth.uid() = user_id OR
  auth.uid() = created_by
);

CREATE POLICY "HR admins can insert employees"
ON public.employees
FOR INSERT
TO authenticated
WITH CHECK (public.is_hr_admin(auth.uid()));

CREATE POLICY "HR admins can update employees"
ON public.employees
FOR UPDATE
TO authenticated
USING (public.is_hr_admin(auth.uid()))
WITH CHECK (public.is_hr_admin(auth.uid()));

CREATE POLICY "HR admins can delete employees"
ON public.employees
FOR DELETE
TO authenticated
USING (public.is_hr_admin(auth.uid()));

-- 3. FIX CANDIDATES - Restrict to admins only
DROP POLICY IF EXISTS "Anyone can insert candidates" ON public.candidates;
DROP POLICY IF EXISTS "Users can view their own candidate profile" ON public.candidates;
DROP POLICY IF EXISTS "Users can update their own candidate profile" ON public.candidates;
DROP POLICY IF EXISTS "Admins can view all candidates" ON public.candidates;

CREATE POLICY "Admins and candidates can view candidate data"
ON public.candidates
FOR SELECT
TO authenticated
USING (
  public.is_admin(auth.uid()) OR
  auth.uid() = user_id
);

CREATE POLICY "Admins and public can insert candidates"
ON public.candidates
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin(auth.uid()) OR auth.uid() IS NOT NULL);

CREATE POLICY "Admins and candidates can update their data"
ON public.candidates
FOR UPDATE
TO authenticated
USING (
  public.is_admin(auth.uid()) OR
  auth.uid() = user_id
)
WITH CHECK (
  public.is_admin(auth.uid()) OR
  auth.uid() = user_id
);

-- 4. FIX PAYROLL ITEMS - Restrict to payroll admins only
DROP POLICY IF EXISTS "Authenticated users can view payroll items" ON public.payroll_items;
DROP POLICY IF EXISTS "Authenticated users can manage payroll items" ON public.payroll_items;

CREATE POLICY "Payroll admins can view all payroll items"
ON public.payroll_items
FOR SELECT
TO authenticated
USING (public.is_payroll_admin(auth.uid()));

CREATE POLICY "Payroll admins can insert payroll items"
ON public.payroll_items
FOR INSERT
TO authenticated
WITH CHECK (public.is_payroll_admin(auth.uid()));

CREATE POLICY "Payroll admins can update payroll items"
ON public.payroll_items
FOR UPDATE
TO authenticated
USING (public.is_payroll_admin(auth.uid()))
WITH CHECK (public.is_payroll_admin(auth.uid()));

CREATE POLICY "Payroll admins can delete payroll items"
ON public.payroll_items
FOR DELETE
TO authenticated
USING (public.is_payroll_admin(auth.uid()));

-- 5. FIX PAYROLL RUNS - Restrict to payroll admins only
DROP POLICY IF EXISTS "Users can view their own payroll runs" ON public.payroll_runs;
DROP POLICY IF EXISTS "Users can manage their own payroll runs" ON public.payroll_runs;

CREATE POLICY "Payroll admins can view all payroll runs"
ON public.payroll_runs
FOR SELECT
TO authenticated
USING (public.is_payroll_admin(auth.uid()));

CREATE POLICY "Payroll admins can insert payroll runs"
ON public.payroll_runs
FOR INSERT
TO authenticated
WITH CHECK (public.is_payroll_admin(auth.uid()));

CREATE POLICY "Payroll admins can update payroll runs"
ON public.payroll_runs
FOR UPDATE
TO authenticated
USING (public.is_payroll_admin(auth.uid()))
WITH CHECK (public.is_payroll_admin(auth.uid()));

CREATE POLICY "Payroll admins can delete payroll runs"
ON public.payroll_runs
FOR DELETE
TO authenticated
USING (public.is_payroll_admin(auth.uid()));

-- 6. FIX BENEFITS - Restrict to HR admins and employee
DROP POLICY IF EXISTS "Anyone can view benefits" ON public.benefits;
DROP POLICY IF EXISTS "Anyone can manage benefits" ON public.benefits;

CREATE POLICY "Employees and HR can view benefits"
ON public.benefits
FOR SELECT
TO authenticated
USING (
  public.is_hr_admin(auth.uid()) OR
  EXISTS (
    SELECT 1 FROM public.employees 
    WHERE id = benefits.employee_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "HR admins can manage benefits"
ON public.benefits
FOR ALL
TO authenticated
USING (public.is_hr_admin(auth.uid()))
WITH CHECK (public.is_hr_admin(auth.uid()));

-- 7. FIX COMPLIANCE DOCUMENTS - Restrict to HR admins and employee
DROP POLICY IF EXISTS "Anyone can view compliance documents" ON public.compliance_documents;
DROP POLICY IF EXISTS "Anyone can manage compliance documents" ON public.compliance_documents;

CREATE POLICY "Employees and HR can view compliance documents"
ON public.compliance_documents
FOR SELECT
TO authenticated
USING (
  public.is_hr_admin(auth.uid()) OR
  EXISTS (
    SELECT 1 FROM public.employees 
    WHERE id = compliance_documents.employee_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "HR admins can manage compliance documents"
ON public.compliance_documents
FOR ALL
TO authenticated
USING (public.is_hr_admin(auth.uid()))
WITH CHECK (public.is_hr_admin(auth.uid()));

-- 8. FIX SECURE VAULT - Restrict to user's own items
DROP POLICY IF EXISTS "Users can view their vault items" ON public.secure_vault;
DROP POLICY IF EXISTS "Users can insert vault items" ON public.secure_vault;
DROP POLICY IF EXISTS "Users can update their vault items" ON public.secure_vault;
DROP POLICY IF EXISTS "Users can delete their vault items" ON public.secure_vault;

CREATE POLICY "Users can view only their own vault items"
ON public.secure_vault
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vault items"
ON public.secure_vault
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vault items"
ON public.secure_vault
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vault items"
ON public.secure_vault
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);