
-- Ensure pgcrypto is available for hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- ============================================================
-- 1. Hash api_clients.api_key and api_webhooks.secret at rest
-- ============================================================
ALTER TABLE public.api_clients ADD COLUMN IF NOT EXISTS api_key_hash text;
ALTER TABLE public.api_webhooks ADD COLUMN IF NOT EXISTS secret_hash text;

-- Backfill hashes for existing rows
UPDATE public.api_clients
SET api_key_hash = encode(extensions.digest(api_key, 'sha256'), 'hex')
WHERE api_key_hash IS NULL AND api_key IS NOT NULL;

UPDATE public.api_webhooks
SET secret_hash = encode(extensions.digest(secret, 'sha256'), 'hex')
WHERE secret_hash IS NULL AND secret IS NOT NULL;

-- Trigger: when api_key is set/changed, store hash and clear plaintext
CREATE OR REPLACE FUNCTION public.hash_api_client_key()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  IF NEW.api_key IS NOT NULL AND NEW.api_key <> '' AND (TG_OP = 'INSERT' OR NEW.api_key IS DISTINCT FROM OLD.api_key) THEN
    NEW.api_key_hash := encode(extensions.digest(NEW.api_key, 'sha256'), 'hex');
    -- Keep plaintext only on INSERT response cycle would require app-side handling.
    -- We null it out so it isn't stored at rest.
    NEW.api_key := NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_hash_api_client_key ON public.api_clients;
CREATE TRIGGER trg_hash_api_client_key
  BEFORE INSERT OR UPDATE ON public.api_clients
  FOR EACH ROW EXECUTE FUNCTION public.hash_api_client_key();

CREATE OR REPLACE FUNCTION public.hash_api_webhook_secret()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  IF NEW.secret IS NOT NULL AND NEW.secret <> '' AND (TG_OP = 'INSERT' OR NEW.secret IS DISTINCT FROM OLD.secret) THEN
    NEW.secret_hash := encode(extensions.digest(NEW.secret, 'sha256'), 'hex');
    NEW.secret := NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_hash_api_webhook_secret ON public.api_webhooks;
CREATE TRIGGER trg_hash_api_webhook_secret
  BEFORE INSERT OR UPDATE ON public.api_webhooks
  FOR EACH ROW EXECUTE FUNCTION public.hash_api_webhook_secret();

-- Clear existing plaintext values now that hashes exist
UPDATE public.api_clients SET api_key = NULL WHERE api_key IS NOT NULL AND api_key_hash IS NOT NULL;
UPDATE public.api_webhooks SET secret = NULL WHERE secret IS NOT NULL AND secret_hash IS NOT NULL;

-- Update validate_api_key to compare against hash
CREATE OR REPLACE FUNCTION public.validate_api_key(_api_key text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  client_record RECORD;
  usage_count_minute int;
  usage_count_day int;
  key_hash text;
BEGIN
  key_hash := encode(extensions.digest(_api_key, 'sha256'), 'hex');

  SELECT * INTO client_record
  FROM public.api_clients
  WHERE api_key_hash = key_hash AND status = 'active';

  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Invalid or inactive API key');
  END IF;

  SELECT count(*) INTO usage_count_minute FROM public.api_usage_logs
  WHERE api_client_id = client_record.id AND created_at > now() - interval '1 minute';

  SELECT count(*) INTO usage_count_day FROM public.api_usage_logs
  WHERE api_client_id = client_record.id AND created_at > now() - interval '1 day';

  IF usage_count_minute >= client_record.rate_limit_per_minute THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Rate limit exceeded (per minute)', 'client_id', client_record.id);
  END IF;

  IF usage_count_day >= client_record.rate_limit_per_day THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Rate limit exceeded (per day)', 'client_id', client_record.id);
  END IF;

  RETURN jsonb_build_object(
    'valid', true,
    'client_id', client_record.id,
    'company_name', client_record.company_name,
    'plan', client_record.plan,
    'rate_limit_per_minute', client_record.rate_limit_per_minute,
    'rate_limit_per_day', client_record.rate_limit_per_day
  );
END;
$$;

-- ============================================================
-- 2. Remove user-specific tables from realtime publication
--    to prevent cross-user data leakage via postgres_changes.
--    Public feeds remain published.
-- ============================================================
ALTER PUBLICATION supabase_realtime DROP TABLE public.business_tasks;
ALTER PUBLICATION supabase_realtime DROP TABLE public.business_notifications;
