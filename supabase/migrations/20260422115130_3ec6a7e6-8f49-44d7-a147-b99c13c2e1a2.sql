
-- 1. Make 'reports' bucket private so paid reports can't be downloaded via public URL
UPDATE storage.buckets SET public = false WHERE id = 'reports';

-- 2. Restrict newsletters table read access to authenticated users only
DROP POLICY IF EXISTS "Anyone can view published newsletters" ON public.newsletters;
CREATE POLICY "Authenticated users can view newsletters"
  ON public.newsletters
  FOR SELECT
  TO authenticated
  USING (true);

-- 3. Restrict newsletters storage bucket SELECT to admins or active subscribers
DROP POLICY IF EXISTS "Users can read newsletters bucket" ON storage.objects;
CREATE POLICY "Subscribers and admins can read newsletters bucket"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'newsletters'
    AND (
      public.is_admin(auth.uid())
      OR EXISTS (
        SELECT 1
        FROM public.newsletter_subscriptions ns
        JOIN auth.users u ON u.email = ns.email
        WHERE u.id = auth.uid()
          AND ns.is_active = true
      )
    )
  );
