
-- 1. api_clients: explicit restrictive admin-only SELECT
CREATE POLICY "Restrict api_clients reads to admins" ON public.api_clients
AS RESTRICTIVE FOR SELECT TO authenticated
USING (public.is_admin(auth.uid()));

-- 2. api_usage_logs: rename plaintext api_key to api_key_prefix
ALTER TABLE public.api_usage_logs RENAME COLUMN api_key TO api_key_prefix;

-- 3. company_finder_searches & results: owner SELECT
CREATE POLICY "Users view own company finder searches" ON public.company_finder_searches
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users view own company finder results" ON public.company_finder_results
FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.company_finder_searches s
  WHERE s.id = company_finder_results.search_id AND s.user_id = auth.uid()
));

-- 4. dm_finder_searches & contacts: owner SELECT
CREATE POLICY "Users view own dm finder searches" ON public.dm_finder_searches
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users view own dm finder contacts" ON public.dm_finder_contacts
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- 5. mfa_settings: null out any plaintext backup codes (vault is source of truth)
UPDATE public.mfa_settings SET backup_codes = NULL WHERE backup_codes IS NOT NULL;
