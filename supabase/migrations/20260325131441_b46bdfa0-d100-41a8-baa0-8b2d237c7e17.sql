-- Recreate views with security_invoker to enforce RLS

DROP VIEW IF EXISTS public.organisation_member_view;
CREATE VIEW public.organisation_member_view
WITH (security_invoker = true)
AS
SELECT
  id,
  organisation_name,
  owner_user_id,
  subscription_plan,
  logo_url,
  created_at,
  updated_at,
  CASE
    WHEN is_org_admin(auth.uid(), id) THEN billing_email
    ELSE NULL::text
  END AS billing_email
FROM public.organisations
WHERE id IN (
  SELECT organisation_id FROM public.organisation_members WHERE user_id = auth.uid()
);

DROP VIEW IF EXISTS public.calendar_connections_safe;
CREATE VIEW public.calendar_connections_safe
WITH (security_invoker = true)
AS
SELECT
  id, user_id, provider, email, is_active,
  connected_at, last_synced_at, token_expires_at, created_at, updated_at
FROM public.calendar_connections
WHERE user_id = auth.uid();

DROP VIEW IF EXISTS public.mfa_settings_safe;
CREATE VIEW public.mfa_settings_safe
WITH (security_invoker = true)
AS
SELECT
  id, user_id, mfa_enabled, mfa_method, created_at, updated_at
FROM public.mfa_settings
WHERE user_id = auth.uid();