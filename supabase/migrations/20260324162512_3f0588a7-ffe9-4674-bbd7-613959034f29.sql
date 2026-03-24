-- 1. Fix reports: restrict null target_user_id to admins
DROP POLICY IF EXISTS "Users can view reports" ON public.reports;
CREATE POLICY "Users can view their own reports"
  ON public.reports FOR SELECT
  TO authenticated
  USING (
    target_user_id = auth.uid()
    OR uploaded_by = auth.uid()
    OR (target_user_id IS NULL AND public.is_admin(auth.uid()))
  );

-- 2. Create verify_backup_code function so backup codes don't need direct SELECT
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
BEGIN
  SELECT backup_codes INTO codes FROM public.mfa_settings WHERE user_id = _user_id;
  IF codes IS NULL THEN RETURN false; END IF;
  
  FOR i IN 0..jsonb_array_length(codes)-1 LOOP
    code_entry := codes->i;
    IF code_entry->>'code' = _code AND (code_entry->>'used')::boolean = false THEN
      codes := jsonb_set(codes, ARRAY[i::text, 'used'], 'true'::jsonb);
      UPDATE public.mfa_settings SET backup_codes = codes WHERE user_id = _user_id;
      RETURN true;
    END IF;
  END LOOP;
  
  RETURN false;
END;
$$;