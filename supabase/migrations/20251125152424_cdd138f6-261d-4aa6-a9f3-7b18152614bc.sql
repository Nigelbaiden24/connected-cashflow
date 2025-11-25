-- Create reports storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('reports', 'reports', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for reports bucket
CREATE POLICY "Public can view reports"
ON storage.objects FOR SELECT
USING (bucket_id = 'reports');

CREATE POLICY "Authenticated users can upload reports"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'reports' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update their reports"
ON storage.objects FOR UPDATE
USING (bucket_id = 'reports' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete reports"
ON storage.objects FOR DELETE
USING (bucket_id = 'reports' AND auth.role() = 'authenticated');