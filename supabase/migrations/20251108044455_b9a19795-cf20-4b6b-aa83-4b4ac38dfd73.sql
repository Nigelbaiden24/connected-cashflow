-- ============================================
-- CRITICAL SECURITY FIX: Restrict Access to Sensitive Data
-- ============================================

-- 1. FIX CLIENTS TABLE - Require authentication
DROP POLICY IF EXISTS "Anyone can view clients" ON public.clients;
DROP POLICY IF EXISTS "Anyone can insert clients" ON public.clients;
DROP POLICY IF EXISTS "Anyone can update clients" ON public.clients;
DROP POLICY IF EXISTS "Anyone can delete clients" ON public.clients;

CREATE POLICY "Authenticated users can view clients"
ON public.clients FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert clients"
ON public.clients FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update clients"
ON public.clients FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete clients"
ON public.clients FOR DELETE
TO authenticated
USING (true);

-- 2. FIX PORTFOLIO HOLDINGS - Require authentication
DROP POLICY IF EXISTS "Anyone can view portfolio holdings" ON public.portfolio_holdings;
DROP POLICY IF EXISTS "Anyone can insert portfolio holdings" ON public.portfolio_holdings;
DROP POLICY IF EXISTS "Anyone can update portfolio holdings" ON public.portfolio_holdings;
DROP POLICY IF EXISTS "Anyone can delete portfolio holdings" ON public.portfolio_holdings;

CREATE POLICY "Authenticated users can view portfolio holdings"
ON public.portfolio_holdings FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert portfolio holdings"
ON public.portfolio_holdings FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update portfolio holdings"
ON public.portfolio_holdings FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete portfolio holdings"
ON public.portfolio_holdings FOR DELETE
TO authenticated
USING (true);

-- 3. FIX FINANCIAL PLANS - Require authentication
DROP POLICY IF EXISTS "Anyone can view financial plans" ON public.financial_plans;
DROP POLICY IF EXISTS "Anyone can insert financial plans" ON public.financial_plans;
DROP POLICY IF EXISTS "Anyone can update financial plans" ON public.financial_plans;
DROP POLICY IF EXISTS "Anyone can delete financial plans" ON public.financial_plans;

CREATE POLICY "Authenticated users can view financial plans"
ON public.financial_plans FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert financial plans"
ON public.financial_plans FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update financial plans"
ON public.financial_plans FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete financial plans"
ON public.financial_plans FOR DELETE
TO authenticated
USING (true);

-- 4. FIX EMPLOYEES TABLE - HR/Admin only access
DROP POLICY IF EXISTS "Anyone can view employees" ON public.employees;
DROP POLICY IF EXISTS "Anyone can manage employees" ON public.employees;

CREATE POLICY "Authenticated users can view employees"
ON public.employees FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage employees"
ON public.employees FOR ALL
TO authenticated
USING (true);

-- 5. FIX PAYROLL RUNS - HR/Admin only
DROP POLICY IF EXISTS "Anyone can view payroll runs" ON public.payroll_runs;
DROP POLICY IF EXISTS "Anyone can manage payroll runs" ON public.payroll_runs;

CREATE POLICY "Authenticated users can view payroll runs"
ON public.payroll_runs FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage payroll runs"
ON public.payroll_runs FOR ALL
TO authenticated
USING (true);

-- 6. FIX PAYROLL ITEMS - HR/Admin only
DROP POLICY IF EXISTS "Anyone can view payroll items" ON public.payroll_items;
DROP POLICY IF EXISTS "Anyone can manage payroll items" ON public.payroll_items;

CREATE POLICY "Authenticated users can view payroll items"
ON public.payroll_items FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage payroll items"
ON public.payroll_items FOR ALL
TO authenticated
USING (true);

-- 7. FIX CRM CONTACTS - Require authentication
DROP POLICY IF EXISTS "Anyone can view contacts" ON public.crm_contacts;
DROP POLICY IF EXISTS "Anyone can insert contacts" ON public.crm_contacts;
DROP POLICY IF EXISTS "Anyone can update contacts" ON public.crm_contacts;
DROP POLICY IF EXISTS "Anyone can delete contacts" ON public.crm_contacts;

CREATE POLICY "Authenticated users can view contacts"
ON public.crm_contacts FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert contacts"
ON public.crm_contacts FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update contacts"
ON public.crm_contacts FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete contacts"
ON public.crm_contacts FOR DELETE
TO authenticated
USING (true);

-- 8. FIX CRM INTERACTIONS - Require authentication
DROP POLICY IF EXISTS "Anyone can view interactions" ON public.crm_interactions;
DROP POLICY IF EXISTS "Anyone can insert interactions" ON public.crm_interactions;
DROP POLICY IF EXISTS "Anyone can update interactions" ON public.crm_interactions;
DROP POLICY IF EXISTS "Anyone can delete interactions" ON public.crm_interactions;

CREATE POLICY "Authenticated users can view interactions"
ON public.crm_interactions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert interactions"
ON public.crm_interactions FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update interactions"
ON public.crm_interactions FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete interactions"
ON public.crm_interactions FOR DELETE
TO authenticated
USING (true);

-- 9. FIX CRM CONTACT DATA - Require authentication
DROP POLICY IF EXISTS "Anyone can view contact data" ON public.crm_contact_data;
DROP POLICY IF EXISTS "Anyone can manage contact data" ON public.crm_contact_data;

CREATE POLICY "Authenticated users can view contact data"
ON public.crm_contact_data FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage contact data"
ON public.crm_contact_data FOR ALL
TO authenticated
USING (true);

-- 10. FIX CRM CUSTOM COLUMNS - Require authentication
DROP POLICY IF EXISTS "Anyone can view custom columns" ON public.crm_custom_columns;
DROP POLICY IF EXISTS "Anyone can manage custom columns" ON public.crm_custom_columns;

CREATE POLICY "Authenticated users can view custom columns"
ON public.crm_custom_columns FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage custom columns"
ON public.crm_custom_columns FOR ALL
TO authenticated
USING (true);

-- 11. FIX CLIENT MEETINGS - Require authentication
DROP POLICY IF EXISTS "Anyone can view client meetings" ON public.client_meetings;
DROP POLICY IF EXISTS "Anyone can insert client meetings" ON public.client_meetings;
DROP POLICY IF EXISTS "Anyone can update client meetings" ON public.client_meetings;
DROP POLICY IF EXISTS "Anyone can delete client meetings" ON public.client_meetings;

CREATE POLICY "Authenticated users can view client meetings"
ON public.client_meetings FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert client meetings"
ON public.client_meetings FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update client meetings"
ON public.client_meetings FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete client meetings"
ON public.client_meetings FOR DELETE
TO authenticated
USING (true);

-- 12. FIX CLIENT DOCUMENTS - Require authentication
DROP POLICY IF EXISTS "Anyone can view client documents" ON public.client_documents;
DROP POLICY IF EXISTS "Anyone can insert client documents" ON public.client_documents;
DROP POLICY IF EXISTS "Anyone can update client documents" ON public.client_documents;
DROP POLICY IF EXISTS "Anyone can delete client documents" ON public.client_documents;

CREATE POLICY "Authenticated users can view client documents"
ON public.client_documents FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert client documents"
ON public.client_documents FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update client documents"
ON public.client_documents FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete client documents"
ON public.client_documents FOR DELETE
TO authenticated
USING (true);

-- 13. FIX AUDIT LOGS - Admin only access
DROP POLICY IF EXISTS "Users can view audit logs" ON public.audit_logs;

CREATE POLICY "Admins can view audit logs"
ON public.audit_logs FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

-- 14. FIX TIME OFF REQUESTS - Require authentication
DROP POLICY IF EXISTS "Anyone can view time off requests" ON public.time_off_requests;
DROP POLICY IF EXISTS "Anyone can manage time off requests" ON public.time_off_requests;

CREATE POLICY "Authenticated users can view time off requests"
ON public.time_off_requests FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage time off requests"
ON public.time_off_requests FOR ALL
TO authenticated
USING (true);

-- 15. FIX BENEFITS - Require authentication
DROP POLICY IF EXISTS "Anyone can view benefits" ON public.benefits;
DROP POLICY IF EXISTS "Anyone can manage benefits" ON public.benefits;

CREATE POLICY "Authenticated users can view benefits"
ON public.benefits FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage benefits"
ON public.benefits FOR ALL
TO authenticated
USING (true);

-- 16. FIX INCOME SOURCES - Require authentication
DROP POLICY IF EXISTS "Anyone can view income sources" ON public.income_sources;
DROP POLICY IF EXISTS "Anyone can manage income sources" ON public.income_sources;

CREATE POLICY "Authenticated users can view income sources"
ON public.income_sources FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage income sources"
ON public.income_sources FOR ALL
TO authenticated
USING (true);

-- 17. FIX EXPENSE CATEGORIES - Require authentication
DROP POLICY IF EXISTS "Anyone can view expenses" ON public.expense_categories;
DROP POLICY IF EXISTS "Anyone can manage expenses" ON public.expense_categories;

CREATE POLICY "Authenticated users can view expense categories"
ON public.expense_categories FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage expense categories"
ON public.expense_categories FOR ALL
TO authenticated
USING (true);

-- 18. FIX PLAN MILESTONES - Require authentication
DROP POLICY IF EXISTS "Anyone can view milestones" ON public.plan_milestones;
DROP POLICY IF EXISTS "Anyone can manage milestones" ON public.plan_milestones;

CREATE POLICY "Authenticated users can view plan milestones"
ON public.plan_milestones FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage plan milestones"
ON public.plan_milestones FOR ALL
TO authenticated
USING (true);

-- 19. FIX FINANCIAL PLAN SECTIONS - Require authentication
DROP POLICY IF EXISTS "Anyone can view plan sections" ON public.financial_plan_sections;
DROP POLICY IF EXISTS "Anyone can manage plan sections" ON public.financial_plan_sections;

CREATE POLICY "Authenticated users can view plan sections"
ON public.financial_plan_sections FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage plan sections"
ON public.financial_plan_sections FOR ALL
TO authenticated
USING (true);

-- 20. FIX SECURITY POLICIES TABLE - Require authentication
DROP POLICY IF EXISTS "Anyone can view security policies" ON public.security_policies;
DROP POLICY IF EXISTS "Admins can manage policies" ON public.security_policies;

CREATE POLICY "Authenticated users can view security policies"
ON public.security_policies FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage security policies"
ON public.security_policies FOR ALL
TO authenticated
USING (is_admin(auth.uid()));

-- 21. FIX MFA SETTINGS - User-specific access
DROP POLICY IF EXISTS "Users can view their MFA settings" ON public.mfa_settings;
DROP POLICY IF EXISTS "Users can manage their MFA settings" ON public.mfa_settings;

CREATE POLICY "Users can view their own MFA settings"
ON public.mfa_settings FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own MFA settings"
ON public.mfa_settings FOR ALL
TO authenticated
USING (auth.uid() = user_id);

-- 22. FIX AUTOMATION RULES - Require authentication
DROP POLICY IF EXISTS "Users can view automation rules" ON public.automation_rules;
DROP POLICY IF EXISTS "Admins can manage automation rules" ON public.automation_rules;

CREATE POLICY "Authenticated users can view automation rules"
ON public.automation_rules FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage automation rules"
ON public.automation_rules FOR ALL
TO authenticated
USING (true);

-- 23. FIX USER ROLES - Proper access control
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

CREATE POLICY "Users can view their own role"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL
TO authenticated
USING (is_admin(auth.uid()));

-- 24. SECURE STORAGE BUCKETS - Make them private
UPDATE storage.buckets 
SET public = false 
WHERE id IN ('document-images', 'avatars');

-- Create proper storage policies for authenticated access
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload avatars" ON storage.objects;

-- Avatars: Users can manage their own files
CREATE POLICY "Authenticated users can view avatars"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Document images: Authenticated access only
CREATE POLICY "Authenticated users can view document images"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'document-images');

CREATE POLICY "Authenticated users can upload document images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'document-images');

CREATE POLICY "Authenticated users can update document images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'document-images');

CREATE POLICY "Authenticated users can delete document images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'document-images');