-- Update reports bucket to be public
UPDATE storage.buckets
SET public = true
WHERE id = 'reports';