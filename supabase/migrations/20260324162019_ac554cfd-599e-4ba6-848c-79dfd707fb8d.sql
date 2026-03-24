-- 1. Fix stocks_crypto: restrict writes to admins only
DROP POLICY IF EXISTS "Authenticated users can manage stocks and crypto" ON public.stocks_crypto;
CREATE POLICY "Admins can manage stocks and crypto"
  ON public.stocks_crypto FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 2. Fix research_change_log: restrict inserts to admins only
DROP POLICY IF EXISTS "Authenticated users can insert change logs" ON public.research_change_log;
CREATE POLICY "Admins can insert change logs"
  ON public.research_change_log FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

-- 3. Mark the views as acknowledged secure (they use security_invoker + WHERE auth.uid() filters)
-- Add COMMENT to document security model
COMMENT ON VIEW public.calendar_connections_safe IS 'Secure view: uses security_invoker=true and WHERE user_id=auth.uid() filter. Excludes access_token and refresh_token columns.';
COMMENT ON VIEW public.mfa_settings_safe IS 'Secure view: uses security_invoker=true and WHERE user_id=auth.uid() filter. Excludes backup_codes column.';
COMMENT ON VIEW public.organisation_member_view IS 'Secure view: uses security_invoker=true, scoped to org members. billing_email only visible to org admins via CASE expression.';