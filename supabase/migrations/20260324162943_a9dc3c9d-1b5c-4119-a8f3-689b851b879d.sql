-- 1. Add RESTRICTIVE UPDATE policy on user_roles to prevent self-escalation
CREATE POLICY "Block non-admin role updates"
  ON public.user_roles AS RESTRICTIVE
  FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 2. Add RESTRICTIVE DELETE policy on user_roles
CREATE POLICY "Block non-admin role deletion"
  ON public.user_roles AS RESTRICTIVE
  FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));