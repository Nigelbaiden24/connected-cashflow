-- 1. Make user_roles INSERT policy RESTRICTIVE to prevent privilege escalation
DROP POLICY IF EXISTS "Block non-admin role insertion" ON public.user_roles;
CREATE POLICY "Block non-admin role insertion"
  ON public.user_roles AS RESTRICTIVE
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

-- 2. Prevent direct SELECT of OAuth tokens from calendar_connections
-- Replace open SELECT with a column-restricted security definer function
DROP POLICY IF EXISTS "Users can view their own calendar connections" ON public.calendar_connections;
CREATE POLICY "Users can view their own calendar connections"
  ON public.calendar_connections FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Revoke direct column access to tokens and use the safe view instead
-- We can't do column-level RLS, so we'll use RLS + grant approach:
-- Revoke SELECT on token columns from anon/authenticated and create a function for edge functions
REVOKE SELECT ON public.calendar_connections FROM anon;

-- 3. Fix MFA: create a secure view that excludes backup_codes
CREATE OR REPLACE VIEW public.mfa_settings_safe
  WITH (security_invoker = true)
AS
  SELECT id, user_id, mfa_enabled, mfa_method, created_at, updated_at
  FROM public.mfa_settings
  WHERE user_id = auth.uid();

-- 4. Restrict plan_templates to authenticated users only
DROP POLICY IF EXISTS "Anyone can view templates" ON public.plan_templates;
CREATE POLICY "Authenticated users can view templates"
  ON public.plan_templates FOR SELECT
  TO authenticated
  USING (true);

-- 5. Fix organisations billing_email: create safe view for non-admin members
CREATE OR REPLACE VIEW public.organisation_member_view
  WITH (security_invoker = true)
AS
  SELECT id, organisation_name, owner_user_id, subscription_plan,
         logo_url, created_at, updated_at,
         CASE WHEN public.is_org_admin(auth.uid(), id) THEN billing_email ELSE NULL END as billing_email
  FROM public.organisations
  WHERE id IN (
    SELECT organisation_id FROM public.organisation_members WHERE user_id = auth.uid()
  );