-- Create a function to get user primary role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::text FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY 
    CASE role::text
      WHEN 'admin' THEN 1
      WHEN 'manager' THEN 2
      WHEN 'analyst' THEN 3
      WHEN 'hr_admin' THEN 4
      WHEN 'payroll_admin' THEN 5
      WHEN 'client' THEN 6
      WHEN 'viewer' THEN 7
      ELSE 8
    END
  LIMIT 1
$$;

-- Create function to check if user has specific role (text-based)
CREATE OR REPLACE FUNCTION public.has_role_text(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role::text = _role
  )
$$;