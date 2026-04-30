-- ============================================================
-- Security hardening: address linter warnings
-- ============================================================

-- 1. Tighten permissive INSERT policy on report_access_requests
DROP POLICY IF EXISTS "Anyone can submit a report access request" ON public.report_access_requests;

CREATE POLICY "Anyone can submit a report access request"
ON public.report_access_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (
  email IS NOT NULL
  AND length(trim(email)) > 3
  AND email LIKE '%_@_%._%'
);

-- 2. Revoke EXECUTE from anon/authenticated on functions that are ONLY
--    invoked as triggers or are intended for service-role / internal use.
--    These are not called via PostgREST or RLS expressions.

-- Trigger-only functions (fire automatically; no API caller needs EXECUTE)
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.update_opportunity_products_updated_at() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.update_investor_alert_preferences_updated_at() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.update_newsletters_updated_at() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.update_plan_updated_at() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.update_conversation_timestamp() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.complete_user_invitation() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.log_team_member_changes() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.hash_api_client_key() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.hash_api_webhook_secret() FROM anon, authenticated, public;

-- Admin / service-role only RPCs (called from edge functions with service key)
REVOKE EXECUTE ON FUNCTION public.grant_platform_access(uuid, boolean, boolean, boolean) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.update_tab_permissions(uuid, jsonb) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.store_vault_secret(text, text) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.get_vault_secret(text) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.store_calendar_token(uuid, text, text, text) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.store_mfa_backup_codes(uuid, jsonb) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.validate_api_key(text) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.calculate_next_cron_run(text, text) FROM anon, authenticated, public;

-- Note: We deliberately KEEP execute access on:
--   has_role, has_role_text, is_admin, is_hr_admin, is_payroll_admin,
--   get_user_role, get_user_organisation_id, is_org_admin,
--   owns_crm_contact, owns_client, owns_plan, owns_automation_rule,
--   owns_employee, owns_team_member, check_user_permission,
--   has_platform_access, check_api_permission, get_calendar_token,
--   verify_backup_code, increment_report_downloads,
--   increment_learning_content_views
-- These are invoked from RLS policies or are called intentionally from
-- the client. Revoking would break access control.
