-- 1. Fix crm_custom_columns: remove null user_id exposure
DROP POLICY IF EXISTS "Users can view their own custom columns" ON public.crm_custom_columns;
CREATE POLICY "Users can view their own custom columns"
  ON public.crm_custom_columns FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow admins to see system-level (null user_id) custom columns
CREATE POLICY "Admins can view system custom columns"
  ON public.crm_custom_columns FOR SELECT
  TO authenticated
  USING (user_id IS NULL AND public.is_admin(auth.uid()));

-- 2. Fix organisation_members INSERT policy (broken self-referential alias)
DROP POLICY IF EXISTS "Org admins can insert members" ON public.organisation_members;
CREATE POLICY "Org admins can insert members"
  ON public.organisation_members FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_org_admin(auth.uid(), organisation_id)
    OR (
      user_id = auth.uid()
      AND NOT EXISTS (
        SELECT 1 FROM public.organisation_members existing
        WHERE existing.organisation_id = organisation_members.organisation_id
          AND existing.user_id = auth.uid()
      )
    )
  );

-- 3. Secure calendar_connections_safe view with security_invoker
DROP VIEW IF EXISTS public.calendar_connections_safe;
CREATE VIEW public.calendar_connections_safe
  WITH (security_invoker = true)
AS
  SELECT id, user_id, provider, email, is_active, connected_at,
         last_synced_at, token_expires_at, created_at, updated_at
  FROM public.calendar_connections;

-- 4. Add explicit restrictive policy to prevent non-admin INSERT on user_roles
CREATE POLICY "Block non-admin role insertion"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));