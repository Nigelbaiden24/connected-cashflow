
-- =====================================================
-- ENTERPRISE SECURITY HARDENING MIGRATION
-- =====================================================

-- 1. HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION public.owns_client(_user_id uuid, _client_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.clients WHERE id = _client_id AND user_id = _user_id) $$;

CREATE OR REPLACE FUNCTION public.owns_plan(_user_id uuid, _plan_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (
  SELECT 1 FROM public.financial_plans fp JOIN public.clients c ON fp.client_id = c.id
  WHERE fp.id = _plan_id AND (c.user_id = _user_id OR fp.created_by = _user_id)
) $$;

CREATE OR REPLACE FUNCTION public.owns_automation_rule(_user_id uuid, _rule_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.automation_rules WHERE id = _rule_id AND created_by = _user_id) $$;

-- 2. crm_contact_data - Drop 4 legacy public policies
DROP POLICY IF EXISTS "crm_contact_data_select_all" ON public.crm_contact_data;
DROP POLICY IF EXISTS "crm_contact_data_insert_all" ON public.crm_contact_data;
DROP POLICY IF EXISTS "crm_contact_data_update_all" ON public.crm_contact_data;
DROP POLICY IF EXISTS "crm_contact_data_delete_all" ON public.crm_contact_data;

-- 3. crm_interactions - Replace public _all policies with owner-scoped
DROP POLICY IF EXISTS "crm_interactions_select_all" ON public.crm_interactions;
DROP POLICY IF EXISTS "crm_interactions_insert_all" ON public.crm_interactions;
DROP POLICY IF EXISTS "crm_interactions_update_all" ON public.crm_interactions;
DROP POLICY IF EXISTS "crm_interactions_delete_all" ON public.crm_interactions;
DROP POLICY IF EXISTS "Owner or admin can select interactions" ON public.crm_interactions;
DROP POLICY IF EXISTS "Owner or admin can insert interactions" ON public.crm_interactions;
DROP POLICY IF EXISTS "Owner or admin can update interactions" ON public.crm_interactions;
DROP POLICY IF EXISTS "Owner or admin can delete interactions" ON public.crm_interactions;

CREATE POLICY "Owner or admin can select interactions" ON public.crm_interactions FOR SELECT TO authenticated
USING (public.owns_crm_contact(auth.uid(), contact_id) OR public.is_admin(auth.uid()));
CREATE POLICY "Owner or admin can insert interactions" ON public.crm_interactions FOR INSERT TO authenticated
WITH CHECK (public.owns_crm_contact(auth.uid(), contact_id) OR public.is_admin(auth.uid()));
CREATE POLICY "Owner or admin can update interactions" ON public.crm_interactions FOR UPDATE TO authenticated
USING (public.owns_crm_contact(auth.uid(), contact_id) OR public.is_admin(auth.uid()));
CREATE POLICY "Owner or admin can delete interactions" ON public.crm_interactions FOR DELETE TO authenticated
USING (public.owns_crm_contact(auth.uid(), contact_id) OR public.is_admin(auth.uid()));

-- 4. client_goals - Replace "Anyone can" with owner-scoped
DROP POLICY IF EXISTS "Anyone can view client goals" ON public.client_goals;
DROP POLICY IF EXISTS "Anyone can insert client goals" ON public.client_goals;
DROP POLICY IF EXISTS "Anyone can update client goals" ON public.client_goals;
DROP POLICY IF EXISTS "Anyone can delete client goals" ON public.client_goals;

CREATE POLICY "Owner or admin can select client goals" ON public.client_goals FOR SELECT TO authenticated
USING (public.owns_client(auth.uid(), client_id) OR public.is_admin(auth.uid()));
CREATE POLICY "Owner or admin can insert client goals" ON public.client_goals FOR INSERT TO authenticated
WITH CHECK (public.owns_client(auth.uid(), client_id) OR public.is_admin(auth.uid()));
CREATE POLICY "Owner or admin can update client goals" ON public.client_goals FOR UPDATE TO authenticated
USING (public.owns_client(auth.uid(), client_id) OR public.is_admin(auth.uid()));
CREATE POLICY "Owner or admin can delete client goals" ON public.client_goals FOR DELETE TO authenticated
USING (public.owns_client(auth.uid(), client_id) OR public.is_admin(auth.uid()));

-- 5. tax_settings - Admin write, authenticated read
DROP POLICY IF EXISTS "Anyone can manage tax settings" ON public.tax_settings;
DROP POLICY IF EXISTS "Anyone can view tax settings" ON public.tax_settings;

CREATE POLICY "Authenticated users can view tax settings" ON public.tax_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage tax settings" ON public.tax_settings FOR ALL TO authenticated
USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- 6. subscriptions - User-scoped
DROP POLICY IF EXISTS "System can manage subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Owner or admin can manage subscriptions" ON public.subscriptions;

CREATE POLICY "Users can view own subscriptions" ON public.subscriptions FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "Owner or admin can manage subscriptions" ON public.subscriptions FOR ALL TO authenticated
USING (user_id = auth.uid() OR public.is_admin(auth.uid()))
WITH CHECK (user_id = auth.uid() OR public.is_admin(auth.uid()));

-- 7. expense_categories - Plan-owner scoped
DROP POLICY IF EXISTS "Authenticated users can manage expense categories" ON public.expense_categories;
DROP POLICY IF EXISTS "Authenticated users can view expense categories" ON public.expense_categories;

CREATE POLICY "Plan owner or admin can select expense categories" ON public.expense_categories FOR SELECT TO authenticated
USING (public.owns_plan(auth.uid(), plan_id) OR public.is_admin(auth.uid()));
CREATE POLICY "Plan owner or admin can insert expense categories" ON public.expense_categories FOR INSERT TO authenticated
WITH CHECK (public.owns_plan(auth.uid(), plan_id) OR public.is_admin(auth.uid()));
CREATE POLICY "Plan owner or admin can update expense categories" ON public.expense_categories FOR UPDATE TO authenticated
USING (public.owns_plan(auth.uid(), plan_id) OR public.is_admin(auth.uid()));
CREATE POLICY "Plan owner or admin can delete expense categories" ON public.expense_categories FOR DELETE TO authenticated
USING (public.owns_plan(auth.uid(), plan_id) OR public.is_admin(auth.uid()));

-- 8. automation tables - Restrict to authenticated + admin/owner

-- automation_rules
DROP POLICY IF EXISTS "Authenticated users can manage automation rules" ON public.automation_rules;
DROP POLICY IF EXISTS "Authenticated users can view automation rules" ON public.automation_rules;
CREATE POLICY "Owner or admin can manage automation rules" ON public.automation_rules FOR ALL TO authenticated
USING (created_by = auth.uid() OR public.is_admin(auth.uid()))
WITH CHECK (created_by = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "Auth users can view own automation rules" ON public.automation_rules FOR SELECT TO authenticated
USING (created_by = auth.uid() OR public.is_admin(auth.uid()));

-- automation_dependencies
DROP POLICY IF EXISTS "Admins can manage dependencies" ON public.automation_dependencies;
DROP POLICY IF EXISTS "Users can view automation dependencies" ON public.automation_dependencies;
CREATE POLICY "Admin can manage automation dependencies" ON public.automation_dependencies FOR ALL TO authenticated
USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Auth users can view automation dependencies" ON public.automation_dependencies FOR SELECT TO authenticated
USING (public.owns_automation_rule(auth.uid(), rule_id) OR public.is_admin(auth.uid()));

-- automation_executions
DROP POLICY IF EXISTS "System can manage automation executions" ON public.automation_executions;
DROP POLICY IF EXISTS "Users can view automation executions" ON public.automation_executions;
CREATE POLICY "Admin can manage automation executions" ON public.automation_executions FOR ALL TO authenticated
USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Auth users can view automation executions" ON public.automation_executions FOR SELECT TO authenticated
USING (public.owns_automation_rule(auth.uid(), rule_id) OR public.is_admin(auth.uid()));

-- automation_logs
DROP POLICY IF EXISTS "System can insert automation logs" ON public.automation_logs;
DROP POLICY IF EXISTS "Users can view automation logs" ON public.automation_logs;
CREATE POLICY "Admin can insert automation logs" ON public.automation_logs FOR INSERT TO authenticated
WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Auth users can view automation logs" ON public.automation_logs FOR SELECT TO authenticated
USING ((rule_id IS NOT NULL AND public.owns_automation_rule(auth.uid(), rule_id)) OR public.is_admin(auth.uid()));

-- automation_notifications
DROP POLICY IF EXISTS "System can manage notifications" ON public.automation_notifications;
CREATE POLICY "Users can view own automation notifications" ON public.automation_notifications FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "Admin can manage automation notifications" ON public.automation_notifications FOR ALL TO authenticated
USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- automation_schedules
DROP POLICY IF EXISTS "System can manage automation schedules" ON public.automation_schedules;
DROP POLICY IF EXISTS "Users can view automation schedules" ON public.automation_schedules;
CREATE POLICY "Admin can manage automation schedules" ON public.automation_schedules FOR ALL TO authenticated
USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Auth users can view automation schedules" ON public.automation_schedules FOR SELECT TO authenticated
USING (public.owns_automation_rule(auth.uid(), rule_id) OR public.is_admin(auth.uid()));

-- automation_triggers
DROP POLICY IF EXISTS "System can manage automation triggers" ON public.automation_triggers;
DROP POLICY IF EXISTS "Users can view automation triggers" ON public.automation_triggers;
CREATE POLICY "Admin can manage automation triggers" ON public.automation_triggers FOR ALL TO authenticated
USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Auth users can view automation triggers" ON public.automation_triggers FOR SELECT TO authenticated
USING (public.owns_automation_rule(auth.uid(), rule_id) OR public.is_admin(auth.uid()));

-- 9. cyber_risk_assessments - Authenticated read, admin write
DROP POLICY IF EXISTS "Users can view risk assessments" ON public.cyber_risk_assessments;
DROP POLICY IF EXISTS "Users can create risk assessments" ON public.cyber_risk_assessments;
DROP POLICY IF EXISTS "Users can update risk assessments" ON public.cyber_risk_assessments;
CREATE POLICY "Authenticated can view risk assessments" ON public.cyber_risk_assessments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin can insert risk assessments" ON public.cyber_risk_assessments FOR INSERT TO authenticated
WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admin can update risk assessments" ON public.cyber_risk_assessments FOR UPDATE TO authenticated
USING (public.is_admin(auth.uid()));

-- 10. Make public storage buckets private
UPDATE storage.buckets SET public = false WHERE id IN ('document-images', 'reports');
