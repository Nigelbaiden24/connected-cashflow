-- Create calendar_connections table to store OAuth tokens
CREATE TABLE calendar_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('google', 'outlook')),
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  email TEXT,
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  last_synced_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

-- Enable RLS
ALTER TABLE calendar_connections ENABLE ROW LEVEL SECURITY;

-- Users can view their own connections
CREATE POLICY "Users can view their own calendar connections"
  ON calendar_connections
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own connections
CREATE POLICY "Users can insert their own calendar connections"
  ON calendar_connections
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own connections
CREATE POLICY "Users can update their own calendar connections"
  ON calendar_connections
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own connections
CREATE POLICY "Users can delete their own calendar connections"
  ON calendar_connections
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_calendar_connections_user_provider ON calendar_connections(user_id, provider);

-- Create trigger for updated_at
CREATE TRIGGER update_calendar_connections_updated_at
  BEFORE UPDATE ON calendar_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();