-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Authenticated users can upload document images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own document images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own document images" ON storage.objects;

-- Create new permissive policies for document images
CREATE POLICY "Anyone can upload document images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'document-images');

CREATE POLICY "Anyone can update document images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'document-images');

CREATE POLICY "Anyone can delete document images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'document-images');