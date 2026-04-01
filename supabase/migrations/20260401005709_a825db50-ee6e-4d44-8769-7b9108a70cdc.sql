
-- =============================================
-- 1. FIX DOCUMENT-IMAGES BUCKET: Remove all public policies, add authenticated owner-scoped
-- =============================================
DROP POLICY IF EXISTS "Anyone can view document images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload document images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update document images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete document images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete document images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update document images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view document images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload document images" ON storage.objects;

CREATE POLICY "Authenticated users can view own document images"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'document-images' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "Authenticated users can upload own document images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'document-images' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "Authenticated users can update own document images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'document-images' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "Authenticated users can delete own document images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'document-images' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can manage document images"
  ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'document-images' AND public.is_admin(auth.uid()))
  WITH CHECK (bucket_id = 'document-images' AND public.is_admin(auth.uid()));

-- =============================================
-- 2. FIX REPORTS BUCKET: Remove open policies, add ownership checks
-- =============================================
DROP POLICY IF EXISTS "Authenticated users can delete their reports" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update their reports" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload reports" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete reports" ON storage.objects;
DROP POLICY IF EXISTS "Public can view reports" ON storage.objects;

CREATE POLICY "Users can upload own reports"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'reports' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own reports"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'reports' AND ((auth.uid())::text = (storage.foldername(name))[1] OR public.is_admin(auth.uid())));

CREATE POLICY "Users can update own reports"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'reports' AND ((auth.uid())::text = (storage.foldername(name))[1] OR public.is_admin(auth.uid())));

CREATE POLICY "Users can delete own reports"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'reports' AND ((auth.uid())::text = (storage.foldername(name))[1] OR public.is_admin(auth.uid())));

-- =============================================
-- 3. FIX ORGANISATION_MEMBER_VIEW: Recreate with security_invoker
-- =============================================
DROP VIEW IF EXISTS public.organisation_member_view;
CREATE VIEW public.organisation_member_view
  WITH (security_invoker = true)
AS
SELECT id, organisation_name, owner_user_id, subscription_plan, logo_url, created_at, updated_at,
    CASE WHEN is_org_admin(auth.uid(), id) THEN billing_email ELSE NULL::text END AS billing_email
FROM organisations
WHERE id IN (SELECT organisation_id FROM organisation_members WHERE user_id = auth.uid());

-- =============================================
-- 4. FIX CALENDAR_CONNECTIONS: Restrict direct SELECT
-- =============================================
DROP POLICY IF EXISTS "Users can view their own calendar connections" ON public.calendar_connections;

DROP VIEW IF EXISTS public.calendar_connections_safe;
CREATE VIEW public.calendar_connections_safe
  WITH (security_invoker = true)
AS
SELECT id, user_id, provider, email, is_active, connected_at, last_synced_at, token_expires_at, created_at, updated_at
FROM calendar_connections
WHERE user_id = auth.uid();

CREATE POLICY "Admins or owners can select calendar connections"
  ON public.calendar_connections FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()) OR user_id = auth.uid());
