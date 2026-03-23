
-- =====================================================
-- SECURITY HARDENING BATCH 3 - Critical privilege escalation & data exposure fixes
-- =====================================================

-- 1. report_purchases - Remove public INSERT/UPDATE, keep service_role bypass
DROP POLICY IF EXISTS "System can insert purchases" ON public.report_purchases;
DROP POLICY IF EXISTS "System can update purchases" ON public.report_purchases;
-- Service role bypasses RLS, so no replacement needed for webhook flows

-- 2. user_report_access - Remove "Authenticated can manage" (privilege escalation)
DROP POLICY IF EXISTS "Authenticated can manage report access" ON public.user_report_access;
-- Keep admin-only and user SELECT policies

-- 3. reports - Remove "Authenticated can manage reports" (privilege escalation)
DROP POLICY IF EXISTS "Authenticated can manage reports" ON public.reports;
-- Keep admin-only and user SELECT policies

-- 4. featured_analyst_picks - Replace open policy with admin-only
DROP POLICY IF EXISTS "Authenticated users can manage analyst picks" ON public.featured_analyst_picks;
CREATE POLICY "Admin can manage analyst picks" ON public.featured_analyst_picks FOR ALL TO authenticated
USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- 5. contact_submissions - Restrict SELECT to admin only
DROP POLICY IF EXISTS "Authenticated users can view submissions" ON public.contact_submissions;
CREATE POLICY "Admin can view contact submissions" ON public.contact_submissions FOR SELECT TO authenticated
USING (public.is_admin(auth.uid()));

-- 6. compliance_audit_trail - Restrict SELECT to admin only
DROP POLICY IF EXISTS "Users can view audit trail" ON public.compliance_audit_trail;
CREATE POLICY "Admin can view audit trail" ON public.compliance_audit_trail FOR SELECT TO authenticated
USING (public.is_admin(auth.uid()));

-- 7. plan_recommendations - Drop duplicate open SELECT policy (owner-scoped one already exists)
DROP POLICY IF EXISTS "Anyone can view recommendations" ON public.plan_recommendations;

-- 8. orchestrated_reports - Remove user_id IS NULL branches
DROP POLICY IF EXISTS "Users can create reports" ON public.orchestrated_reports;
DROP POLICY IF EXISTS "Users can update their own reports" ON public.orchestrated_reports;
DROP POLICY IF EXISTS "Users can view their own reports" ON public.orchestrated_reports;

CREATE POLICY "Owner or admin can view orchestrated reports" ON public.orchestrated_reports FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "Owner can create orchestrated reports" ON public.orchestrated_reports FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owner or admin can update orchestrated reports" ON public.orchestrated_reports FOR UPDATE TO authenticated
USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

-- 9. compliance_case_comments - Restrict SELECT to admin
DROP POLICY IF EXISTS "Users can view case comments" ON public.compliance_case_comments;
CREATE POLICY "Admin can view case comments" ON public.compliance_case_comments FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

-- 10. automation_notifications - Drop legacy policy with user_id IS NULL
DROP POLICY IF EXISTS "Users can view their notifications" ON public.automation_notifications;

-- 11. plan_templates - Fix INSERT to require auth.uid() = created_by
DROP POLICY IF EXISTS "Users can create their own templates" ON public.plan_templates;
CREATE POLICY "Users can create their own templates" ON public.plan_templates FOR INSERT TO authenticated
WITH CHECK (auth.uid() = created_by);

-- 12. vacancies - Restrict SELECT to show only own or admin (protect contact details)
DROP POLICY IF EXISTS "Auth users can view vacancies" ON public.vacancies;
CREATE POLICY "Owner or admin can view vacancies" ON public.vacancies FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
