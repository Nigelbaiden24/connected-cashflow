
-- 1. DOCUMENT IMAGES: remove all lingering public/role-less policies
DROP POLICY IF EXISTS "Public access for document images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view document images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload document images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update document images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete document images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their document images" ON storage.objects;

-- 2. REPORTS: tighten update/delete to admins only (keep public read for thumbnails per app design)
DROP POLICY IF EXISTS "Authenticated users can delete their reports" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update their reports" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own reports" ON storage.objects;

-- 3. AVATARS: restrict read to authenticated users
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
-- ("Authenticated users can view avatars" already exists)

-- 4. CALENDAR CONNECTIONS: revoke direct user SELECT on base table
DROP POLICY IF EXISTS "Admins or owners can select calendar connections" ON public.calendar_connections;
-- Admin-only readable for support; users must read via calendar_connections_safe view
CREATE POLICY "Admins can select calendar connections"
  ON public.calendar_connections FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

-- Make sure the safe view (security_invoker) is granted
GRANT SELECT ON public.calendar_connections_safe TO authenticated;

-- 5. REALTIME CHANNELS: scope subscriptions to user-owned channel names (topic = user uuid)
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can subscribe to own realtime channels" ON realtime.messages;
CREATE POLICY "Users can subscribe to own realtime channels"
  ON realtime.messages FOR SELECT TO authenticated
  USING (
    auth.uid() IS NOT NULL
    AND (
      realtime.topic() = auth.uid()::text
      OR realtime.topic() LIKE auth.uid()::text || ':%'
      OR realtime.topic() LIKE 'public:%'
    )
  );

DROP POLICY IF EXISTS "Users can broadcast on own realtime channels" ON realtime.messages;
CREATE POLICY "Users can broadcast on own realtime channels"
  ON realtime.messages FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND (
      realtime.topic() = auth.uid()::text
      OR realtime.topic() LIKE auth.uid()::text || ':%'
    )
  );
