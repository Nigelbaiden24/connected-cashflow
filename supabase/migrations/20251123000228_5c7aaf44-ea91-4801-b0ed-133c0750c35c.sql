-- Add platform access columns to platform_permissions table
ALTER TABLE public.platform_permissions
ADD COLUMN IF NOT EXISTS can_access_finance_platform boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS can_access_business_platform boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS can_access_investor_platform boolean DEFAULT false;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_platform_permissions_user_id ON public.platform_permissions(user_id);

-- Create function to grant platform access
CREATE OR REPLACE FUNCTION public.grant_platform_access(
  _user_id uuid,
  _finance boolean DEFAULT false,
  _business boolean DEFAULT false,
  _investor boolean DEFAULT false
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.platform_permissions (
    user_id,
    can_access_finance_platform,
    can_access_business_platform,
    can_access_investor_platform
  ) VALUES (
    _user_id,
    _finance,
    _business,
    _investor
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    can_access_finance_platform = EXCLUDED.can_access_finance_platform,
    can_access_business_platform = EXCLUDED.can_access_business_platform,
    can_access_investor_platform = EXCLUDED.can_access_investor_platform,
    updated_at = now();
END;
$$;

-- Create function to check platform access
CREATE OR REPLACE FUNCTION public.has_platform_access(
  _user_id uuid,
  _platform text
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE _platform
    WHEN 'finance' THEN COALESCE(can_access_finance_platform, false)
    WHEN 'business' THEN COALESCE(can_access_business_platform, false)
    WHEN 'investor' THEN COALESCE(can_access_investor_platform, false)
    ELSE false
  END
  FROM public.platform_permissions
  WHERE user_id = _user_id;
$$;

-- Add comment for documentation
COMMENT ON COLUMN public.platform_permissions.can_access_finance_platform IS 'User has access to Finance platform';
COMMENT ON COLUMN public.platform_permissions.can_access_business_platform IS 'User has access to Business platform';
COMMENT ON COLUMN public.platform_permissions.can_access_investor_platform IS 'User has access to Investor platform';