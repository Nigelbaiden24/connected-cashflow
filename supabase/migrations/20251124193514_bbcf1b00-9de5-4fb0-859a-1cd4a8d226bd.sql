-- Create pending invitations table to track invited users before they confirm
CREATE TABLE IF NOT EXISTS public.pending_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  invited_role text NOT NULL,
  platform_finance boolean DEFAULT false,
  platform_business boolean DEFAULT false,
  platform_investor boolean DEFAULT false,
  invited_by uuid,
  invited_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.pending_invitations ENABLE ROW LEVEL SECURITY;

-- Admins can manage invitations
CREATE POLICY "Admins can manage pending invitations"
ON public.pending_invitations
FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Users can view their own pending invitation
CREATE POLICY "Users can view their own pending invitation"
ON public.pending_invitations
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create function to complete invitation on first login
CREATE OR REPLACE FUNCTION public.complete_user_invitation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  invitation_record RECORD;
BEGIN
  -- Check if there's a pending invitation for this user
  SELECT * INTO invitation_record
  FROM public.pending_invitations
  WHERE user_id = NEW.id
    AND completed_at IS NULL
  LIMIT 1;

  IF FOUND THEN
    -- Assign the role
    IF invitation_record.invited_role IS NOT NULL AND invitation_record.invited_role != 'viewer' THEN
      INSERT INTO public.user_roles (user_id, role)
      VALUES (NEW.id, invitation_record.invited_role::text)
      ON CONFLICT (user_id, role) DO NOTHING;
    END IF;

    -- Grant platform access
    INSERT INTO public.platform_permissions (
      user_id,
      can_access_finance_platform,
      can_access_business_platform,
      can_access_investor_platform
    ) VALUES (
      NEW.id,
      invitation_record.platform_finance,
      invitation_record.platform_business,
      invitation_record.platform_investor
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET
      can_access_finance_platform = EXCLUDED.can_access_finance_platform,
      can_access_business_platform = EXCLUDED.can_access_business_platform,
      can_access_investor_platform = EXCLUDED.can_access_investor_platform;

    -- Mark invitation as completed
    UPDATE public.pending_invitations
    SET completed_at = now()
    WHERE user_id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger to complete invitation when user confirms email
CREATE TRIGGER on_user_email_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
  EXECUTE FUNCTION public.complete_user_invitation();