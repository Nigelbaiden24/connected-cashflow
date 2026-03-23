
-- =====================================================
-- FINAL SECURITY HARDENING - Fix all remaining warnings
-- =====================================================

-- ============ 1. FIX "ALWAYS TRUE" INSERT POLICIES ============

-- 1a. advisor_activity
DROP POLICY IF EXISTS "System can insert activity" ON public.advisor_activity;
CREATE POLICY "Authenticated users can insert own activity" ON public.advisor_activity FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 1b. audit_logs
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;
CREATE POLICY "Authenticated can insert own audit logs" ON public.audit_logs FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 1c. compliance_audit_trail
DROP POLICY IF EXISTS "System can insert audit trail" ON public.compliance_audit_trail;
CREATE POLICY "Authenticated can insert own audit trail" ON public.compliance_audit_trail FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 1d. contact_submissions: public form → split by role
DROP POLICY IF EXISTS "Anyone can submit contact forms" ON public.contact_submissions;
CREATE POLICY "Anon can submit contact forms" ON public.contact_submissions FOR INSERT TO anon
WITH CHECK (true);
CREATE POLICY "Authenticated can submit contact forms" ON public.contact_submissions FOR INSERT TO authenticated
WITH CHECK (true);

-- 1e. crm_notifications
DROP POLICY IF EXISTS "System can insert notifications" ON public.crm_notifications;
CREATE POLICY "Authenticated can insert own crm notifications" ON public.crm_notifications FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 1f. demo_requests: public form → split by role
DROP POLICY IF EXISTS "Anyone can submit demo requests" ON public.demo_requests;
CREATE POLICY "Anon can submit demo requests" ON public.demo_requests FOR INSERT TO anon
WITH CHECK (true);
CREATE POLICY "Authenticated can submit demo requests" ON public.demo_requests FOR INSERT TO authenticated
WITH CHECK (true);

-- 1g. investor_alert_notifications
DROP POLICY IF EXISTS "System can insert notifications" ON public.investor_alert_notifications;
CREATE POLICY "Authenticated can insert own investor notifications" ON public.investor_alert_notifications FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 1h. job_applications: public form → split by role
DROP POLICY IF EXISTS "Anyone can submit applications" ON public.job_applications;
CREATE POLICY "Anon can submit job applications" ON public.job_applications FOR INSERT TO anon
WITH CHECK (true);
CREATE POLICY "Authenticated can submit job applications" ON public.job_applications FOR INSERT TO authenticated
WITH CHECK (true);

-- 1i. newsletter_subscriptions: public form → split by role
DROP POLICY IF EXISTS "Anyone can subscribe to newsletters" ON public.newsletter_subscriptions;
CREATE POLICY "Anon can subscribe to newsletters" ON public.newsletter_subscriptions FOR INSERT TO anon
WITH CHECK (true);
CREATE POLICY "Authenticated can subscribe to newsletters" ON public.newsletter_subscriptions FOR INSERT TO authenticated
WITH CHECK (true);

-- 1j. opportunity_inquiries: public form → split by role
DROP POLICY IF EXISTS "Anyone can submit inquiries" ON public.opportunity_inquiries;
CREATE POLICY "Anon can submit inquiries" ON public.opportunity_inquiries FOR INSERT TO anon
WITH CHECK (true);
CREATE POLICY "Authenticated can submit inquiries" ON public.opportunity_inquiries FOR INSERT TO authenticated
WITH CHECK (true);

-- 1k. plan_versions
DROP POLICY IF EXISTS "System can create plan versions" ON public.plan_versions;
CREATE POLICY "Plan owner can create versions" ON public.plan_versions FOR INSERT TO authenticated
WITH CHECK (public.owns_plan(auth.uid(), plan_id));

-- 1l. push_notification_logs: admin only (sent_by column)
DROP POLICY IF EXISTS "Service role can insert logs" ON public.push_notification_logs;
CREATE POLICY "Admin can insert push logs" ON public.push_notification_logs FOR INSERT TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

-- ============ 2. FIX EXPOSED SENSITIVE DATA ============

-- 2a. calendar_connections: create safe view hiding tokens
CREATE OR REPLACE VIEW public.calendar_connections_safe AS
SELECT id, user_id, provider, email, is_active, connected_at, last_synced_at, token_expires_at, created_at, updated_at
FROM public.calendar_connections;

-- 2b. newsletter_subscriptions: remove user-scoped email lookup to prevent enumeration
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.newsletter_subscriptions;

-- ============ 3. FIX MISSING RLS PROTECTION ============

-- 3a. research_generation_queue: admin only
DROP POLICY IF EXISTS "Authenticated users can manage queue" ON public.research_generation_queue;
CREATE POLICY "Admin can manage research queue" ON public.research_generation_queue FOR ALL TO authenticated
USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- 3b. asset_research_reports: restrict writes to admin, keep public SELECT
DROP POLICY IF EXISTS "Only authenticated users can manage research" ON public.asset_research_reports;
CREATE POLICY "Admin can manage research reports" ON public.asset_research_reports FOR ALL TO authenticated
USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- 3c. team_members: remove overly permissive SELECT
DROP POLICY IF EXISTS "Anyone authenticated can select team members" ON public.team_members;
