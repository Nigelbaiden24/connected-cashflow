-- Create function to increment report downloads
CREATE OR REPLACE FUNCTION public.increment_report_downloads(report_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.purchasable_reports
  SET download_count = download_count + 1
  WHERE id = report_id;
END;
$$;