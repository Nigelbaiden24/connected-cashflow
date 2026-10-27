-- Research paywall: full reports are for admins and active FlowPulse Investor
-- subscribers only. Previously any signed-in account could read every
-- promoted report directly from the table.

CREATE OR REPLACE FUNCTION public.has_research_access(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT _user_id IS NOT NULL AND (
    public.is_admin(_user_id)
    OR EXISTS (
      SELECT 1 FROM public.subscriptions s
      WHERE s.user_id = _user_id
        AND s.status IN ('active', 'trialing', 'past_due')
        AND s.current_period_end > now()
        AND s.platform IN ('investor', 'both', 'all')
    )
  );
$$;

REVOKE ALL ON FUNCTION public.has_research_access(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_research_access(uuid) TO authenticated, service_role;

DROP POLICY IF EXISTS "Authenticated users read promoted reports" ON public.generated_research_reports;
DROP POLICY IF EXISTS "Subscribers read promoted reports" ON public.generated_research_reports;
CREATE POLICY "Subscribers read promoted reports" ON public.generated_research_reports FOR SELECT
  TO authenticated
  USING (status = 'promoted' AND (SELECT public.has_research_access(auth.uid())));
