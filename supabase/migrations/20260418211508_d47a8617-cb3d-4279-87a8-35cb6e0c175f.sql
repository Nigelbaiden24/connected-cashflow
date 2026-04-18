
-- Table to capture leads who request access to Insights (lead magnet reports)
CREATE TABLE public.report_access_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  job_title TEXT,
  reason TEXT,
  report_id UUID,
  report_title TEXT,
  category TEXT,
  source_page TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  notes TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.report_access_requests ENABLE ROW LEVEL SECURITY;

-- Anyone (anonymous + authenticated) can submit a request
CREATE POLICY "Anyone can submit a report access request"
ON public.report_access_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only admins can read submissions
CREATE POLICY "Admins can view report access requests"
ON public.report_access_requests
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- Only admins can update / triage submissions
CREATE POLICY "Admins can update report access requests"
ON public.report_access_requests
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()));

-- Only admins can delete submissions
CREATE POLICY "Admins can delete report access requests"
ON public.report_access_requests
FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE TRIGGER update_report_access_requests_updated_at
BEFORE UPDATE ON public.report_access_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_report_access_requests_created_at
ON public.report_access_requests (created_at DESC);

CREATE INDEX idx_report_access_requests_status
ON public.report_access_requests (status);
