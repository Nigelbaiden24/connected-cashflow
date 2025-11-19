-- Create storage policies for reports bucket
-- Allow users to download reports they have access to
CREATE POLICY "Users can download reports they have access to"
ON storage.objects FOR SELECT
TO public
USING (
  bucket_id = 'reports' 
  AND EXISTS (
    SELECT 1 
    FROM public.reports r
    INNER JOIN public.user_report_access ura ON ura.report_id = r.id
    WHERE r.file_path = storage.objects.name
    AND ura.user_id = auth.uid()
  )
);

-- Allow admins to manage all reports in storage
CREATE POLICY "Admins can manage all reports in storage"
ON storage.objects FOR ALL
TO public
USING (
  bucket_id = 'reports' 
  AND public.is_admin(auth.uid())
)
WITH CHECK (
  bucket_id = 'reports' 
  AND public.is_admin(auth.uid())
);