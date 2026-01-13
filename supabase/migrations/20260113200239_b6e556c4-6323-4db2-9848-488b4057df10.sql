-- Remove the restrictive model_portfolios policy that limits visibility to own or null user_id
-- Admin-uploaded portfolios should be visible to all authenticated users

DROP POLICY IF EXISTS "Users can view public and their own model portfolios" ON public.model_portfolios;

-- The "Anyone can view model portfolios" policy with qual=true already handles this correctly