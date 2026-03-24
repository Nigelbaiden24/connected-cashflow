-- Fix cyber_risk_assessments: restrict SELECT to admins only
DROP POLICY IF EXISTS "Authenticated can view risk assessments" ON public.cyber_risk_assessments;
CREATE POLICY "Admins can view risk assessments"
  ON public.cyber_risk_assessments FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));