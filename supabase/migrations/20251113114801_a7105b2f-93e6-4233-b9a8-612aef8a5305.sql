-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public access for document images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload document images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their document images" ON storage.objects;

-- Create or update document-images storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'document-images',
  'document-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

-- Allow anyone to view images (public access)
CREATE POLICY "Public access for document images"
ON storage.objects FOR SELECT
USING (bucket_id = 'document-images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload document images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'document-images' 
  AND auth.role() = 'authenticated'
);

-- Allow users to delete their document images
CREATE POLICY "Users can delete their document images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'document-images' 
  AND auth.role() = 'authenticated'
);