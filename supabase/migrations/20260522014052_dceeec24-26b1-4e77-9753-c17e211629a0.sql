-- Remove opportunities with generic stock images so they can be re-promoted with bespoke AI thumbnails
DELETE FROM public.opportunity_products
WHERE thumbnail_url ~* 'images\.unsplash\.com|source\.unsplash\.com|picsum\.photos|placehold\.co|placeholder';

DELETE FROM public.investor_finder_opportunities
WHERE image_url ~* 'images\.unsplash\.com|source\.unsplash\.com|picsum\.photos|placehold\.co|placeholder';

DELETE FROM public.opportunities
WHERE image_url ~* 'images\.unsplash\.com|source\.unsplash\.com|picsum\.photos|placehold\.co|placeholder';

-- Reset matching pipeline_pending_items so admins can re-approve and trigger fresh AI thumbnail generation
UPDATE public.pipeline_pending_items
SET status = 'pending', reviewed_at = NULL, reviewed_by = NULL
WHERE status IN ('approved', 'promoted')
  AND (
    (enriched_payload->>'thumbnail_url') ~* 'images\.unsplash\.com|source\.unsplash\.com|picsum\.photos|placehold\.co|placeholder'
    OR (enriched_payload->>'image_url') ~* 'images\.unsplash\.com|source\.unsplash\.com|picsum\.photos|placehold\.co|placeholder'
    OR (raw_payload->>'thumbnail_url') ~* 'images\.unsplash\.com|source\.unsplash\.com|picsum\.photos|placehold\.co|placeholder'
    OR (raw_payload->>'image_url') ~* 'images\.unsplash\.com|source\.unsplash\.com|picsum\.photos|placehold\.co|placeholder'
  );