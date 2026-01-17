-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view meetings for their clients" ON public.client_meetings;
DROP POLICY IF EXISTS "Users can insert meetings for their clients" ON public.client_meetings;
DROP POLICY IF EXISTS "Users can update meetings for their clients" ON public.client_meetings;
DROP POLICY IF EXISTS "Users can delete meetings for their clients" ON public.client_meetings;

-- Add user_id column to client_meetings for personal events
ALTER TABLE public.client_meetings ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Create more flexible RLS policies that allow personal meetings and client meetings
CREATE POLICY "Users can view their own meetings or meetings for their clients"
ON public.client_meetings
FOR SELECT
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM clients 
    WHERE clients.id = client_meetings.client_id 
    AND clients.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own meetings or meetings for their clients"
ON public.client_meetings
FOR INSERT
WITH CHECK (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM clients 
    WHERE clients.id = client_meetings.client_id 
    AND clients.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own meetings or meetings for their clients"
ON public.client_meetings
FOR UPDATE
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM clients 
    WHERE clients.id = client_meetings.client_id 
    AND clients.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own meetings or meetings for their clients"
ON public.client_meetings
FOR DELETE
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM clients 
    WHERE clients.id = client_meetings.client_id 
    AND clients.user_id = auth.uid()
  )
);