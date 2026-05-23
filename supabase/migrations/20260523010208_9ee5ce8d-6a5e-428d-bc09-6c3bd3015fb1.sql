
-- 1) Clear plaintext API keys and secrets (hashes already exist)
UPDATE public.api_clients SET api_key = NULL WHERE api_key IS NOT NULL;
UPDATE public.api_webhooks SET secret = NULL WHERE secret IS NOT NULL;

-- 2) Truncate historical plaintext API keys in usage logs
UPDATE public.api_usage_logs
SET api_key = LEFT(api_key, 8) || '...'
WHERE api_key IS NOT NULL AND length(api_key) > 11 AND api_key NOT LIKE '%...';

-- 3) MFA backup codes: clear column where vault copy already exists
UPDATE public.mfa_settings ms
SET backup_codes = NULL
WHERE backup_codes IS NOT NULL
  AND EXISTS (SELECT 1 FROM vault.secrets WHERE name = 'mfa_codes_' || ms.user_id::text);

-- 4) Remove tables from realtime publication (broadcasts not scoped per-user)
ALTER PUBLICATION supabase_realtime DROP TABLE public.business_activity_feed;
ALTER PUBLICATION supabase_realtime DROP TABLE public.fund_analyst_activity;
ALTER PUBLICATION supabase_realtime DROP TABLE public.stocks_crypto_analyst_activity;

-- 5) dm_finder_contacts: fix INSERT check to allow admin-attributed inserts
DROP POLICY IF EXISTS "Admins manage dm_finder_contacts" ON public.dm_finder_contacts;
CREATE POLICY "Admins manage dm_finder_contacts"
  ON public.dm_finder_contacts
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 6) pipeline_pending_items: restrict SELECT to admins only
DROP POLICY IF EXISTS "Authenticated read pipeline pending" ON public.pipeline_pending_items;

-- 7) subscriptions: drop overlapping/public-role policies
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.subscriptions;
-- "Owner or admin can manage subscriptions" (FOR ALL) remains and covers reads

-- 8) calendar_connections: let owners view their own connections
CREATE POLICY "Users can view their own calendar connections"
  ON public.calendar_connections
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
