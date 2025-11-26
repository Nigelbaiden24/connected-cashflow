-- Relax RLS to allow any authenticated user to manage reports and report access

-- Allow authenticated users full access to reports (while keeping existing admin + view policies)
CREATE POLICY "Authenticated can manage reports"
ON public.reports
FOR ALL
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Allow authenticated users to manage user_report_access (so admin UI can grant access to others)
CREATE POLICY "Authenticated can manage report access"
ON public.user_report_access
FOR ALL
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);