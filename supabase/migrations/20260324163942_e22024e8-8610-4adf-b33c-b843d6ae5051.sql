-- 1. Add missing UPDATE policy for admin_planner_notes
CREATE POLICY "Users can update their own planner notes"
  ON public.admin_planner_notes FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_planner_items
    WHERE admin_planner_items.id = admin_planner_notes.planner_item_id
      AND admin_planner_items.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM admin_planner_items
    WHERE admin_planner_items.id = admin_planner_notes.planner_item_id
      AND admin_planner_items.user_id = auth.uid()
  ));

-- 2. Vault helper functions for secure token/secret storage
CREATE OR REPLACE FUNCTION public.store_vault_secret(_name text, _secret text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  secret_id uuid;
BEGIN
  DELETE FROM vault.secrets WHERE name = _name;
  INSERT INTO vault.secrets (name, secret)
  VALUES (_name, _secret)
  RETURNING id INTO secret_id;
  RETURN secret_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_vault_secret(_name text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result text;
BEGIN
  SELECT decrypted_secret INTO result
  FROM vault.decrypted_secrets
  WHERE name = _name
  LIMIT 1;
  RETURN result;
END;
$$;

-- 3. Secure calendar token storage/retrieval via vault
CREATE OR REPLACE FUNCTION public.store_calendar_token(
  _user_id uuid, _provider text, _access_token text, _refresh_token text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  access_key text;
  refresh_key text;
BEGIN
  access_key := 'cal_access_' || _user_id || '_' || _provider;
  refresh_key := 'cal_refresh_' || _user_id || '_' || _provider;
  PERFORM public.store_vault_secret(access_key, _access_token);
  PERFORM public.store_vault_secret(refresh_key, _refresh_token);
  UPDATE public.calendar_connections
  SET access_token = 'vault:' || access_key,
      refresh_token = 'vault:' || refresh_key
  WHERE user_id = _user_id AND provider = _provider;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_calendar_token(
  _user_id uuid, _provider text, _token_type text
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  key_name text;
  token_val text;
BEGIN
  IF auth.uid() IS DISTINCT FROM _user_id AND NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  key_name := 'cal_' || _token_type || '_' || _user_id || '_' || _provider;
  SELECT decrypted_secret INTO token_val
  FROM vault.decrypted_secrets WHERE name = key_name LIMIT 1;
  RETURN token_val;
END;
$$;

-- 4. Secure MFA backup codes in vault
CREATE OR REPLACE FUNCTION public.store_mfa_backup_codes(_user_id uuid, _codes jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.store_vault_secret('mfa_codes_' || _user_id, _codes::text);
END;
$$;

-- 5. Updated verify_backup_code reads from vault first, falls back to table
CREATE OR REPLACE FUNCTION public.verify_backup_code(_user_id uuid, _code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  codes jsonb;
  code_entry jsonb;
  i int;
  key_name text;
BEGIN
  key_name := 'mfa_codes_' || _user_id;
  BEGIN
    SELECT decrypted_secret::jsonb INTO codes
    FROM vault.decrypted_secrets WHERE name = key_name LIMIT 1;
  EXCEPTION WHEN OTHERS THEN
    codes := NULL;
  END;
  IF codes IS NULL THEN
    SELECT backup_codes INTO codes FROM public.mfa_settings WHERE user_id = _user_id;
  END IF;
  IF codes IS NULL THEN RETURN false; END IF;
  FOR i IN 0..jsonb_array_length(codes)-1 LOOP
    code_entry := codes->i;
    IF code_entry->>'code' = _code AND (code_entry->>'used')::boolean = false THEN
      codes := jsonb_set(codes, ARRAY[i::text, 'used'], 'true'::jsonb);
      PERFORM public.store_vault_secret(key_name, codes::text);
      UPDATE public.mfa_settings SET backup_codes = codes WHERE user_id = _user_id;
      RETURN true;
    END IF;
  END LOOP;
  RETURN false;
END;
$$;