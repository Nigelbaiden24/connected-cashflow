CREATE TABLE IF NOT EXISTS public.generated_research_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('stock','crypto')),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  ticker TEXT,
  excerpt TEXT,
  hero_image_url TEXT,
  html_content TEXT NOT NULL,
  pdf_path TEXT,
  ai_score NUMERIC DEFAULT 3 CHECK (ai_score >= 0 AND ai_score <= 5),
  ai_tags TEXT[] DEFAULT ARRAY[]::text[],
  sources JSONB DEFAULT '[]'::jsonb,
  reading_time_minutes INT DEFAULT 5,
  author_name TEXT DEFAULT 'FlowPulse Research',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','promoted','archived')),
  promoted_at TIMESTAMPTZ,
  promoted_by UUID,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_grr_status_asset ON public.generated_research_reports (status, asset_type, promoted_at DESC);
CREATE INDEX IF NOT EXISTS idx_grr_created ON public.generated_research_reports (created_at DESC);

ALTER TABLE public.generated_research_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage generated reports"
ON public.generated_research_reports
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Authenticated users read promoted reports"
ON public.generated_research_reports
FOR SELECT
TO authenticated
USING (status = 'promoted');

CREATE TRIGGER trg_grr_updated_at
BEFORE UPDATE ON public.generated_research_reports
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();