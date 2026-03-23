
-- Replace WITH CHECK (true) with field-level validation on public forms

-- contact_submissions
DROP POLICY IF EXISTS "Anon can submit contact forms" ON public.contact_submissions;
DROP POLICY IF EXISTS "Authenticated can submit contact forms" ON public.contact_submissions;
CREATE POLICY "Anon can submit contact forms" ON public.contact_submissions FOR INSERT TO anon
WITH CHECK (email IS NOT NULL AND name IS NOT NULL);
CREATE POLICY "Authenticated can submit contact forms" ON public.contact_submissions FOR INSERT TO authenticated
WITH CHECK (email IS NOT NULL AND name IS NOT NULL);

-- demo_requests
DROP POLICY IF EXISTS "Anon can submit demo requests" ON public.demo_requests;
DROP POLICY IF EXISTS "Authenticated can submit demo requests" ON public.demo_requests;
CREATE POLICY "Anon can submit demo requests" ON public.demo_requests FOR INSERT TO anon
WITH CHECK (email IS NOT NULL AND name IS NOT NULL);
CREATE POLICY "Authenticated can submit demo requests" ON public.demo_requests FOR INSERT TO authenticated
WITH CHECK (email IS NOT NULL AND name IS NOT NULL);

-- job_applications (uses candidate_email, candidate_name)
DROP POLICY IF EXISTS "Anon can submit job applications" ON public.job_applications;
DROP POLICY IF EXISTS "Authenticated can submit job applications" ON public.job_applications;
CREATE POLICY "Anon can submit job applications" ON public.job_applications FOR INSERT TO anon
WITH CHECK (candidate_email IS NOT NULL AND candidate_name IS NOT NULL);
CREATE POLICY "Authenticated can submit job applications" ON public.job_applications FOR INSERT TO authenticated
WITH CHECK (candidate_email IS NOT NULL AND candidate_name IS NOT NULL);

-- newsletter_subscriptions
DROP POLICY IF EXISTS "Anon can subscribe to newsletters" ON public.newsletter_subscriptions;
DROP POLICY IF EXISTS "Authenticated can subscribe to newsletters" ON public.newsletter_subscriptions;
CREATE POLICY "Anon can subscribe to newsletters" ON public.newsletter_subscriptions FOR INSERT TO anon
WITH CHECK (email IS NOT NULL);
CREATE POLICY "Authenticated can subscribe to newsletters" ON public.newsletter_subscriptions FOR INSERT TO authenticated
WITH CHECK (email IS NOT NULL);

-- opportunity_inquiries
DROP POLICY IF EXISTS "Anon can submit inquiries" ON public.opportunity_inquiries;
DROP POLICY IF EXISTS "Authenticated can submit inquiries" ON public.opportunity_inquiries;
CREATE POLICY "Anon can submit inquiries" ON public.opportunity_inquiries FOR INSERT TO anon
WITH CHECK (email IS NOT NULL AND name IS NOT NULL);
CREATE POLICY "Authenticated can submit inquiries" ON public.opportunity_inquiries FOR INSERT TO authenticated
WITH CHECK (email IS NOT NULL AND name IS NOT NULL);
