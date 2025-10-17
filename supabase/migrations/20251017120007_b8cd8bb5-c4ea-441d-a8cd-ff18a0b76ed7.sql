-- Create CRM contacts table
CREATE TABLE IF NOT EXISTS public.crm_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text,
  company text,
  position text,
  status text DEFAULT 'active',
  priority text DEFAULT 'medium',
  tags text[],
  notes text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create contact interactions table
CREATE TABLE IF NOT EXISTS public.crm_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid REFERENCES public.crm_contacts(id) ON DELETE CASCADE NOT NULL,
  interaction_type text NOT NULL, -- 'email', 'phone', 'meeting', 'note'
  subject text,
  description text,
  outcome text,
  interaction_date timestamp with time zone DEFAULT now() NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_interactions ENABLE ROW LEVEL SECURITY;

-- Create policies for crm_contacts
CREATE POLICY "Anyone can view contacts"
  ON public.crm_contacts FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert contacts"
  ON public.crm_contacts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update contacts"
  ON public.crm_contacts FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete contacts"
  ON public.crm_contacts FOR DELETE
  USING (true);

-- Create policies for crm_interactions
CREATE POLICY "Anyone can view interactions"
  ON public.crm_interactions FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert interactions"
  ON public.crm_interactions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update interactions"
  ON public.crm_interactions FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete interactions"
  ON public.crm_interactions FOR DELETE
  USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_crm_contacts_updated_at
  BEFORE UPDATE ON public.crm_contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_crm_interactions_contact_id ON public.crm_interactions(contact_id);
CREATE INDEX idx_crm_interactions_date ON public.crm_interactions(interaction_date DESC);