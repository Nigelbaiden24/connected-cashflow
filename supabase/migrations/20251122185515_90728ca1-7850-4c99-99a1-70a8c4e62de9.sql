-- Add user_id column to model_portfolios table for user-specific portfolios
ALTER TABLE model_portfolios ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create an index for better query performance
CREATE INDEX IF NOT EXISTS idx_model_portfolios_user_id ON model_portfolios(user_id);

-- Update RLS policies to allow users to see their own portfolios and public ones
DROP POLICY IF EXISTS "Users can view public model portfolios" ON model_portfolios;
DROP POLICY IF EXISTS "Users can view their own model portfolios" ON model_portfolios;

CREATE POLICY "Users can view public and their own model portfolios"
  ON model_portfolios
  FOR SELECT
  USING (user_id IS NULL OR user_id = auth.uid());