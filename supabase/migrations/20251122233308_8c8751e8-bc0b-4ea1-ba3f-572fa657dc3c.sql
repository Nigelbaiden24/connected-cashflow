-- Insert platform-specific admin roles for nigelbaiden24@yahoo.co.uk
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Get the user ID
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'nigelbaiden24@yahoo.co.uk';
  
  -- Only proceed if user exists
  IF admin_user_id IS NOT NULL THEN
    -- Insert all three platform admin roles
    INSERT INTO public.user_roles (user_id, role)
    VALUES 
      (admin_user_id, 'finance_admin'),
      (admin_user_id, 'business_admin'),
      (admin_user_id, 'investor_admin'),
      (admin_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RAISE NOTICE 'Successfully added admin roles for user %', admin_user_id;
  ELSE
    RAISE WARNING 'User with email nigelbaiden24@yahoo.co.uk not found. Please ensure this user account exists before running this migration.';
  END IF;
END;
$$;