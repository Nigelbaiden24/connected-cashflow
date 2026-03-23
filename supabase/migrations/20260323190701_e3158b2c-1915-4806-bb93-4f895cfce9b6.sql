
-- Drop existing overly permissive public policies on crm_contact_data
DROP POLICY IF EXISTS "Allow public read access to crm_contact_data" ON public.crm_contact_data;
DROP POLICY IF EXISTS "Allow public insert access to crm_contact_data" ON public.crm_contact_data;
DROP POLICY IF EXISTS "Allow public update access to crm_contact_data" ON public.crm_contact_data;
DROP POLICY IF EXISTS "Allow public delete access to crm_contact_data" ON public.crm_contact_data;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.crm_contact_data;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.crm_contact_data;
DROP POLICY IF EXISTS "Enable update for all users" ON public.crm_contact_data;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.crm_contact_data;
DROP POLICY IF EXISTS "Anyone can view contact data" ON public.crm_contact_data;
DROP POLICY IF EXISTS "Anyone can insert contact data" ON public.crm_contact_data;
DROP POLICY IF EXISTS "Anyone can update contact data" ON public.crm_contact_data;
DROP POLICY IF EXISTS "Anyone can delete contact data" ON public.crm_contact_data;

-- Create security definer function to check contact ownership without recursion
CREATE OR REPLACE FUNCTION public.owns_crm_contact(_user_id uuid, _contact_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.crm_contacts
    WHERE id = _contact_id AND user_id = _user_id
  )
$$;

-- SELECT: owner or admin
CREATE POLICY "Owner or admin can select contact data"
ON public.crm_contact_data
FOR SELECT
TO authenticated
USING (
  public.owns_crm_contact(auth.uid(), contact_id)
  OR public.is_admin(auth.uid())
);

-- INSERT: owner or admin
CREATE POLICY "Owner or admin can insert contact data"
ON public.crm_contact_data
FOR INSERT
TO authenticated
WITH CHECK (
  public.owns_crm_contact(auth.uid(), contact_id)
  OR public.is_admin(auth.uid())
);

-- UPDATE: owner or admin
CREATE POLICY "Owner or admin can update contact data"
ON public.crm_contact_data
FOR UPDATE
TO authenticated
USING (
  public.owns_crm_contact(auth.uid(), contact_id)
  OR public.is_admin(auth.uid())
);

-- DELETE: owner or admin
CREATE POLICY "Owner or admin can delete contact data"
ON public.crm_contact_data
FOR DELETE
TO authenticated
USING (
  public.owns_crm_contact(auth.uid(), contact_id)
  OR public.is_admin(auth.uid())
);
