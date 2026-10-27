-- Paywall previews for /research: small, pre-blurred screenshots of the first
-- pages of each promoted report, captured in /admin when a report is promoted.
-- The images are downscaled and blurred before upload, so they can be shown
-- to signed-out visitors without exposing the report's text.
-- Shape: [{ "page": 1, "width": 220, "height": 311, "data": "data:image/webp;base64,…" }, …]
ALTER TABLE public.generated_research_reports
  ADD COLUMN IF NOT EXISTS preview_images jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS preview_images_at timestamptz;
