
-- Fix SECURITY DEFINER view warning: recreate as SECURITY INVOKER
DROP VIEW IF EXISTS public.calendar_connections_safe;
CREATE VIEW public.calendar_connections_safe
WITH (security_invoker = true) AS
SELECT id, user_id, provider, email, is_active, connected_at, last_synced_at, token_expires_at, created_at, updated_at
FROM public.calendar_connections;
