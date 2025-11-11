-- Update RLS policies for crm_contacts to allow unauthenticated access

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own contacts" ON crm_contacts;
DROP POLICY IF EXISTS "Users can insert their own contacts" ON crm_contacts;
DROP POLICY IF EXISTS "Users can update their own contacts" ON crm_contacts;
DROP POLICY IF EXISTS "Users can delete their own contacts" ON crm_contacts;

-- Create new policies that allow anyone to manage contacts
CREATE POLICY "Anyone can view contacts"
ON crm_contacts
FOR SELECT
TO public
USING (true);

CREATE POLICY "Anyone can insert contacts"
ON crm_contacts
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Anyone can update contacts"
ON crm_contacts
FOR UPDATE
TO public
USING (true);

CREATE POLICY "Anyone can delete contacts"
ON crm_contacts
FOR DELETE
TO public
USING (true);

-- Update RLS policies for related tables to allow unauthenticated access

-- crm_contact_data
DROP POLICY IF EXISTS "Authenticated users can view contact data" ON crm_contact_data;
DROP POLICY IF EXISTS "Authenticated users can manage contact data" ON crm_contact_data;

CREATE POLICY "Anyone can view contact data"
ON crm_contact_data
FOR SELECT
TO public
USING (true);

CREATE POLICY "Anyone can manage contact data"
ON crm_contact_data
FOR ALL
TO public
USING (true);

-- crm_custom_columns
DROP POLICY IF EXISTS "Authenticated users can view custom columns" ON crm_custom_columns;
DROP POLICY IF EXISTS "Authenticated users can manage custom columns" ON crm_custom_columns;

CREATE POLICY "Anyone can view custom columns"
ON crm_custom_columns
FOR SELECT
TO public
USING (true);

CREATE POLICY "Anyone can manage custom columns"
ON crm_custom_columns
FOR ALL
TO public
USING (true);

-- crm_interactions
DROP POLICY IF EXISTS "Users can view interactions for their contacts" ON crm_interactions;
DROP POLICY IF EXISTS "Users can insert interactions for their contacts" ON crm_interactions;
DROP POLICY IF EXISTS "Users can update interactions for their contacts" ON crm_interactions;
DROP POLICY IF EXISTS "Users can delete interactions for their contacts" ON crm_interactions;

CREATE POLICY "Anyone can view interactions"
ON crm_interactions
FOR SELECT
TO public
USING (true);

CREATE POLICY "Anyone can insert interactions"
ON crm_interactions
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Anyone can update interactions"
ON crm_interactions
FOR UPDATE
TO public
USING (true);

CREATE POLICY "Anyone can delete interactions"
ON crm_interactions
FOR DELETE
TO public
USING (true);