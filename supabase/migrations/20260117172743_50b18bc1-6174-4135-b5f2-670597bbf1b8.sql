-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "crm_contacts_select_all" ON public.crm_contacts;
DROP POLICY IF EXISTS "crm_contacts_insert_all" ON public.crm_contacts;
DROP POLICY IF EXISTS "crm_contacts_update_all" ON public.crm_contacts;
DROP POLICY IF EXISTS "crm_contacts_delete_all" ON public.crm_contacts;

-- Create user-specific RLS policies
CREATE POLICY "Users can view their own contacts"
ON public.crm_contacts
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contacts"
ON public.crm_contacts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contacts"
ON public.crm_contacts
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contacts"
ON public.crm_contacts
FOR DELETE
USING (auth.uid() = user_id);

-- Also update crm_custom_columns to be user-specific if it has user_id
-- First check if user_id column exists, if not add it
ALTER TABLE public.crm_custom_columns ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Drop existing policies on crm_custom_columns
DROP POLICY IF EXISTS "Enable all access for crm_custom_columns" ON public.crm_custom_columns;
DROP POLICY IF EXISTS "crm_custom_columns_select_all" ON public.crm_custom_columns;
DROP POLICY IF EXISTS "crm_custom_columns_insert_all" ON public.crm_custom_columns;
DROP POLICY IF EXISTS "crm_custom_columns_update_all" ON public.crm_custom_columns;
DROP POLICY IF EXISTS "crm_custom_columns_delete_all" ON public.crm_custom_columns;

-- Create user-specific policies for custom columns
CREATE POLICY "Users can view their own custom columns"
ON public.crm_custom_columns
FOR SELECT
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert their own custom columns"
ON public.crm_custom_columns
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom columns"
ON public.crm_custom_columns
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom columns"
ON public.crm_custom_columns
FOR DELETE
USING (auth.uid() = user_id);