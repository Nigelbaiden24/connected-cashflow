-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Authenticated users can upload reports" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update their reports" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete their reports" ON storage.objects;

-- Allow authenticated users to upload files in the `reports` bucket
CREATE POLICY "Authenticated users can upload reports"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'reports');

-- Allow authenticated users to update their reports
CREATE POLICY "Authenticated users can update their reports"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'reports')
WITH CHECK (bucket_id = 'reports');

-- Allow authenticated users to delete their reports
CREATE POLICY "Authenticated users can delete their reports"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'reports');