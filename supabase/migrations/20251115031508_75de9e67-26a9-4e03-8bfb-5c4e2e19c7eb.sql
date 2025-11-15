-- Create storage bucket for report PDFs
INSERT INTO storage.buckets (id, name, public)
VALUES ('reports', 'reports', false);

-- Create reports table
CREATE TABLE IF NOT EXISTS public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  file_path text NOT NULL,
  report_type text NOT NULL,
  platform text NOT NULL CHECK (platform IN ('finance', 'business')),
  thumbnail_url text,
  published_date date DEFAULT CURRENT_DATE,
  uploaded_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user report access table
CREATE TABLE IF NOT EXISTS public.user_report_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  report_id uuid NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  granted_at timestamptz DEFAULT now(),
  UNIQUE(user_id, report_id)
);

-- Enable RLS
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_report_access ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reports
CREATE POLICY "Admins can manage all reports"
  ON public.reports
  FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Users can view reports they have access to"
  ON public.reports
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_report_access
      WHERE user_report_access.report_id = reports.id
      AND user_report_access.user_id = auth.uid()
    )
  );

-- RLS Policies for user_report_access
CREATE POLICY "Admins can manage report access"
  ON public.user_report_access
  FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Users can view their own access"
  ON public.user_report_access
  FOR SELECT
  USING (auth.uid() = user_id);

-- Storage policies for reports bucket
CREATE POLICY "Admins can upload reports"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'reports' AND
    is_admin(auth.uid())
  );

CREATE POLICY "Admins can update reports"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'reports' AND
    is_admin(auth.uid())
  );

CREATE POLICY "Admins can delete reports"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'reports' AND
    is_admin(auth.uid())
  );

CREATE POLICY "Users can view reports they have access to"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'reports' AND
    EXISTS (
      SELECT 1 FROM public.reports r
      JOIN public.user_report_access ura ON r.id = ura.report_id
      WHERE r.file_path = storage.objects.name
      AND ura.user_id = auth.uid()
    )
  );

-- Create updated_at trigger
CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();