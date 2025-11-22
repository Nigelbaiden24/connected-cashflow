-- Add AI-powered fields to CRM contacts table
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS lead_score INTEGER DEFAULT 0;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS lead_score_factors JSONB DEFAULT '{}';
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS ai_recommendations JSONB DEFAULT '[]';
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS last_ai_analysis TIMESTAMP WITH TIME ZONE;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS engagement_score INTEGER DEFAULT 0;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS conversion_probability DECIMAL DEFAULT 0;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS next_best_action TEXT;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS upsell_opportunities JSONB DEFAULT '[]';

-- Create CRM interactions table for tracking engagement
CREATE TABLE IF NOT EXISTS crm_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES crm_contacts(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL,
  interaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  details JSONB DEFAULT '{}',
  outcome TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE crm_interactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for interactions
CREATE POLICY "Users can view their contact interactions"
  ON crm_interactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM crm_contacts
      WHERE crm_contacts.id = crm_interactions.contact_id
      AND crm_contacts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert interactions for their contacts"
  ON crm_interactions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM crm_contacts
      WHERE crm_contacts.id = crm_interactions.contact_id
      AND crm_contacts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their contact interactions"
  ON crm_interactions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM crm_contacts
      WHERE crm_contacts.id = crm_interactions.contact_id
      AND crm_contacts.user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_crm_interactions_contact_id ON crm_interactions(contact_id);
CREATE INDEX IF NOT EXISTS idx_crm_interactions_date ON crm_interactions(interaction_date);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_lead_score ON crm_contacts(lead_score DESC);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_conversion_probability ON crm_contacts(conversion_probability DESC);