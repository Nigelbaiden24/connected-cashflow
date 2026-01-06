-- Add lead magnet fields to purchasable_reports for gated content
ALTER TABLE public.purchasable_reports
ADD COLUMN IF NOT EXISTS teaser_content TEXT,
ADD COLUMN IF NOT EXISTS key_insights TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS charts_data JSONB DEFAULT '[]'::JSONB,
ADD COLUMN IF NOT EXISTS author_name TEXT DEFAULT 'FlowPulse Research Team',
ADD COLUMN IF NOT EXISTS author_title TEXT,
ADD COLUMN IF NOT EXISTS reading_time TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS content_images TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add comment for clarity
COMMENT ON COLUMN public.purchasable_reports.teaser_content IS 'Visible preview content before signup gate';
COMMENT ON COLUMN public.purchasable_reports.key_insights IS 'Bullet points of key insights shown in preview';
COMMENT ON COLUMN public.purchasable_reports.charts_data IS 'Chart configurations for visible preview charts';
COMMENT ON COLUMN public.purchasable_reports.content_images IS 'Images shown in the teaser content';