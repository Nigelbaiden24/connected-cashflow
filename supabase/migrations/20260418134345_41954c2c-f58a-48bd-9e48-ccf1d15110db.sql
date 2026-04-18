-- Remove overly permissive public:% wildcard from Realtime subscription policy
DROP POLICY IF EXISTS "Users can subscribe to own realtime channels" ON realtime.messages;

CREATE POLICY "Users can subscribe to own realtime channels"
  ON realtime.messages FOR SELECT TO authenticated
  USING (
    auth.uid() IS NOT NULL
    AND (
      realtime.topic() = auth.uid()::text
      OR realtime.topic() LIKE auth.uid()::text || ':%'
    )
  );