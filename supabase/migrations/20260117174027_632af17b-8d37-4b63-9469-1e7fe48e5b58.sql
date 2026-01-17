-- Make client_id nullable for personal events (events not tied to a specific client)
ALTER TABLE public.client_meetings ALTER COLUMN client_id DROP NOT NULL;