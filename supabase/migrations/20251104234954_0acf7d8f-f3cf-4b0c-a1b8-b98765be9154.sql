-- Create storage bucket for document images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'document-images',
  'document-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Create policies for document images
CREATE POLICY "Anyone can view document images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'document-images');

CREATE POLICY "Authenticated users can upload document images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'document-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own document images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'document-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete their own document images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'document-images' 
  AND auth.role() = 'authenticated'
);