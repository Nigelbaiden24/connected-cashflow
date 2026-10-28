-- Push notifications for FlowPulse client users (iOS, Android and web via OneSignal).
-- OneSignal holds the push tokens; these tables record each user's devices and
-- what they want to be notified about, so the backend can target and audit sends.

-- ── Devices ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_push_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  platform text NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  subscription_id text NOT NULL,          -- OneSignal push subscription id
  onesignal_id text,                      -- OneSignal user id
  push_enabled boolean NOT NULL DEFAULT true,
  permission text,                        -- granted / denied / default
  app_version text,
  device_label text,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (subscription_id)
);
CREATE INDEX IF NOT EXISTS user_push_devices_user_idx ON public.user_push_devices (user_id);

REVOKE ALL ON public.user_push_devices FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_push_devices TO authenticated;
GRANT ALL ON public.user_push_devices TO service_role;

ALTER TABLE public.user_push_devices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own push devices" ON public.user_push_devices;
CREATE POLICY "Users manage own push devices" ON public.user_push_devices FOR ALL
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Admins read push devices" ON public.user_push_devices;
CREATE POLICY "Admins read push devices" ON public.user_push_devices FOR SELECT
  USING ((SELECT public.is_admin(auth.uid())));

-- ── Preferences ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  user_id uuid PRIMARY KEY DEFAULT auth.uid(),
  push_enabled boolean NOT NULL DEFAULT true,       -- master switch
  research boolean NOT NULL DEFAULT true,           -- new research reports
  deals boolean NOT NULL DEFAULT true,              -- new opportunities
  deal_categories text[] NOT NULL DEFAULT '{}',     -- empty = all categories
  portfolio boolean NOT NULL DEFAULT true,          -- portfolio review updates and analyst messages
  market boolean NOT NULL DEFAULT false,            -- Market Pulse highlights
  account boolean NOT NULL DEFAULT true,            -- account and subscription notices
  prompted_at timestamptz,                          -- when the in-app permission prompt was last shown
  updated_at timestamptz NOT NULL DEFAULT now()
);

REVOKE ALL ON public.notification_preferences FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.notification_preferences TO authenticated;
GRANT ALL ON public.notification_preferences TO service_role;

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own notification preferences" ON public.notification_preferences;
CREATE POLICY "Users manage own notification preferences" ON public.notification_preferences FOR ALL
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- ── Send log: topic and deep link ─────────────────────────────────────────────
ALTER TABLE public.push_notification_logs ADD COLUMN IF NOT EXISTS topic text;
ALTER TABLE public.push_notification_logs ADD COLUMN IF NOT EXISTS route text;
ALTER TABLE public.push_notification_logs ADD COLUMN IF NOT EXISTS error text;

-- ── Clean-up: forget devices not seen for 6 months (weekly) ───────────────────
DO $cron$
BEGIN
  PERFORM cron.unschedule('push-devices-cleanup') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'push-devices-cleanup');
  PERFORM cron.schedule('push-devices-cleanup', '17 3 * * 0',
    $job$ DELETE FROM public.user_push_devices WHERE last_seen_at < now() - interval '180 days'; $job$);
END
$cron$;
