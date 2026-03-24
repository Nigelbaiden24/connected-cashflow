-- 1. Fix calendar_connections: change INSERT/UPDATE/DELETE policies from public to authenticated
DROP POLICY IF EXISTS "Users can insert their own calendar connections" ON public.calendar_connections;
CREATE POLICY "Users can insert their own calendar connections"
  ON public.calendar_connections FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own calendar connections" ON public.calendar_connections;
CREATE POLICY "Users can update their own calendar connections"
  ON public.calendar_connections FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own calendar connections" ON public.calendar_connections;
CREATE POLICY "Users can delete their own calendar connections"
  ON public.calendar_connections FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 2. Fix pending_invitations: ensure null user_id rows are admin-only
DROP POLICY IF EXISTS "Users can view their own invitation" ON public.pending_invitations;
CREATE POLICY "Users can view their own invitation"
  ON public.pending_invitations FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR (user_id IS NULL AND public.is_admin(auth.uid()))
  );