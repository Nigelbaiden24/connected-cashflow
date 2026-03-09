
-- Create organisations table
CREATE TABLE public.organisations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organisation_name TEXT NOT NULL,
  owner_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  subscription_plan TEXT NOT NULL DEFAULT 'free',
  billing_email TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create organisation_members table
CREATE TABLE public.organisation_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member', 'viewer')),
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organisation_id, user_id)
);

-- Create organisation_invitations table
CREATE TABLE public.organisation_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member', 'viewer')),
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  token UUID NOT NULL DEFAULT gen_random_uuid(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organisation_id, email, status)
);

-- Enable RLS
ALTER TABLE public.organisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organisation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organisation_invitations ENABLE ROW LEVEL SECURITY;

-- Helper function: get user's organisation id
CREATE OR REPLACE FUNCTION public.get_user_organisation_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organisation_id FROM public.organisation_members
  WHERE user_id = _user_id LIMIT 1;
$$;

-- Helper function: check if user is org admin
CREATE OR REPLACE FUNCTION public.is_org_admin(_user_id UUID, _org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organisation_members
    WHERE user_id = _user_id AND organisation_id = _org_id AND role = 'admin'
  );
$$;

-- RLS policies for organisations
CREATE POLICY "Members can view their organisation"
ON public.organisations FOR SELECT
TO authenticated
USING (id IN (SELECT organisation_id FROM public.organisation_members WHERE user_id = auth.uid()));

CREATE POLICY "Authenticated users can create organisations"
ON public.organisations FOR INSERT
TO authenticated
WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "Org admins can update their organisation"
ON public.organisations FOR UPDATE
TO authenticated
USING (public.is_org_admin(auth.uid(), id));

-- RLS policies for organisation_members
CREATE POLICY "Members can view org members"
ON public.organisation_members FOR SELECT
TO authenticated
USING (organisation_id IN (SELECT organisation_id FROM public.organisation_members om WHERE om.user_id = auth.uid()));

CREATE POLICY "Org admins can insert members"
ON public.organisation_members FOR INSERT
TO authenticated
WITH CHECK (public.is_org_admin(auth.uid(), organisation_id) OR 
  -- Allow self-insert when creating org (no members yet)
  (user_id = auth.uid() AND NOT EXISTS (SELECT 1 FROM public.organisation_members WHERE organisation_id = organisation_members.organisation_id))
);

CREATE POLICY "Org admins can update members"
ON public.organisation_members FOR UPDATE
TO authenticated
USING (public.is_org_admin(auth.uid(), organisation_id));

CREATE POLICY "Org admins can delete members"
ON public.organisation_members FOR DELETE
TO authenticated
USING (public.is_org_admin(auth.uid(), organisation_id) OR user_id = auth.uid());

-- RLS policies for organisation_invitations
CREATE POLICY "Org members can view invitations"
ON public.organisation_invitations FOR SELECT
TO authenticated
USING (organisation_id IN (SELECT organisation_id FROM public.organisation_members WHERE user_id = auth.uid())
  OR email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Org admins can create invitations"
ON public.organisation_invitations FOR INSERT
TO authenticated
WITH CHECK (public.is_org_admin(auth.uid(), organisation_id));

CREATE POLICY "Org admins can update invitations"
ON public.organisation_invitations FOR UPDATE
TO authenticated
USING (public.is_org_admin(auth.uid(), organisation_id) 
  OR email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Trigger for updated_at on organisations
CREATE TRIGGER update_organisations_updated_at
BEFORE UPDATE ON public.organisations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
