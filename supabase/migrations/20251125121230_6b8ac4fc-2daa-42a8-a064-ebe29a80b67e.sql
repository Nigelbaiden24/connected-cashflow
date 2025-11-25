-- Drop all existing RLS policies on CRM tables
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('crm_contacts', 'crm_contact_data', 'crm_custom_columns', 'crm_interactions')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- Ensure RLS is enabled on CRM tables
ALTER TABLE public.crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_contact_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_custom_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_interactions ENABLE ROW LEVEL SECURITY;

-- Create fully open policies for all operations on CRM tables

-- crm_contacts
CREATE POLICY "crm_contacts_select_all" ON public.crm_contacts
  FOR SELECT USING (true);
CREATE POLICY "crm_contacts_insert_all" ON public.crm_contacts
  FOR INSERT WITH CHECK (true);
CREATE POLICY "crm_contacts_update_all" ON public.crm_contacts
  FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "crm_contacts_delete_all" ON public.crm_contacts
  FOR DELETE USING (true);

-- crm_contact_data
CREATE POLICY "crm_contact_data_select_all" ON public.crm_contact_data
  FOR SELECT USING (true);
CREATE POLICY "crm_contact_data_insert_all" ON public.crm_contact_data
  FOR INSERT WITH CHECK (true);
CREATE POLICY "crm_contact_data_update_all" ON public.crm_contact_data
  FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "crm_contact_data_delete_all" ON public.crm_contact_data
  FOR DELETE USING (true);

-- crm_custom_columns
CREATE POLICY "crm_custom_columns_select_all" ON public.crm_custom_columns
  FOR SELECT USING (true);
CREATE POLICY "crm_custom_columns_insert_all" ON public.crm_custom_columns
  FOR INSERT WITH CHECK (true);
CREATE POLICY "crm_custom_columns_update_all" ON public.crm_custom_columns
  FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "crm_custom_columns_delete_all" ON public.crm_custom_columns
  FOR DELETE USING (true);

-- crm_interactions
CREATE POLICY "crm_interactions_select_all" ON public.crm_interactions
  FOR SELECT USING (true);
CREATE POLICY "crm_interactions_insert_all" ON public.crm_interactions
  FOR INSERT WITH CHECK (true);
CREATE POLICY "crm_interactions_update_all" ON public.crm_interactions
  FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "crm_interactions_delete_all" ON public.crm_interactions
  FOR DELETE USING (true);