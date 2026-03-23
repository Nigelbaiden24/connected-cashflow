CREATE TABLE public.push_notification_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  onesignal_id text,
  title text NOT NULL,
  message text NOT NULL,
  url text,
  notification_type text NOT NULL DEFAULT 'general',
  target_type text NOT NULL DEFAULT 'all',
  target_user_ids text[],
  recipients_count integer DEFAULT 0,
  sent_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.push_notification_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read notification logs"
  ON public.push_notification_logs
  FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Service role can insert logs"
  ON public.push_notification_logs
  FOR INSERT
  WITH CHECK (true);