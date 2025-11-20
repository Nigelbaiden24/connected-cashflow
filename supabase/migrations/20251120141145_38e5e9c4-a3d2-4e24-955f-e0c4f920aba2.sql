-- Create storage buckets for admin uploads
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('newsletters', 'newsletters', false),
  ('portfolios', 'portfolios', false),
  ('commentary', 'commentary', false),
  ('learning', 'learning', false),
  ('videos', 'videos', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for admin-only access
CREATE POLICY "Admins can upload to newsletters bucket"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'newsletters' AND
  is_admin(auth.uid())
);

CREATE POLICY "Admins can read newsletters bucket"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'newsletters' AND is_admin(auth.uid()));

CREATE POLICY "Users can read newsletters bucket"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'newsletters');

CREATE POLICY "Admins can upload to portfolios bucket"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'portfolios' AND
  is_admin(auth.uid())
);

CREATE POLICY "Users can read portfolios bucket"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'portfolios');

CREATE POLICY "Admins can upload to commentary bucket"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'commentary' AND
  is_admin(auth.uid())
);

CREATE POLICY "Users can read commentary bucket"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'commentary');

CREATE POLICY "Admins can upload to learning bucket"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'learning' AND
  is_admin(auth.uid())
);

CREATE POLICY "Users can read learning bucket"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'learning');

CREATE POLICY "Admins can upload to videos bucket"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'videos' AND
  is_admin(auth.uid())
);

CREATE POLICY "Users can read videos bucket"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'videos');

-- Create model_portfolios table if not exists (for admin-uploaded portfolios)
CREATE TABLE IF NOT EXISTS public.model_portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  uploaded_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.model_portfolios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view model portfolios"
ON public.model_portfolios FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage model portfolios"
ON public.model_portfolios FOR ALL
TO authenticated
USING (is_admin(auth.uid()));

-- Create market_commentary table
CREATE TABLE IF NOT EXISTS public.market_commentary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  thumbnail_url TEXT,
  published_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  uploaded_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.market_commentary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view market commentary"
ON public.market_commentary FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage market commentary"
ON public.market_commentary FOR ALL
TO authenticated
USING (is_admin(auth.uid()));

-- Create investor_videos table
CREATE TABLE IF NOT EXISTS public.investor_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  thumbnail_url TEXT,
  category TEXT,
  duration_minutes INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  uploaded_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.investor_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view investor videos"
ON public.investor_videos FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage investor videos"
ON public.investor_videos FOR ALL
TO authenticated
USING (is_admin(auth.uid()));

-- Update reports table RLS to ensure admins can upload for specific users
-- (already has admin policies based on context)

-- Update newsletters table (assuming it exists, add missing columns if needed)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'newsletters' AND column_name = 'file_path') THEN
    ALTER TABLE public.newsletters ADD COLUMN file_path TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'newsletters' AND column_name = 'uploaded_by') THEN
    ALTER TABLE public.newsletters ADD COLUMN uploaded_by UUID REFERENCES auth.users(id);
  END IF;
END $$;

-- Update learning_content table (assuming it exists, add missing columns if needed)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'learning_content' AND column_name = 'file_path') THEN
    ALTER TABLE public.learning_content ADD COLUMN file_path TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'learning_content' AND column_name = 'uploaded_by') THEN
    ALTER TABLE public.learning_content ADD COLUMN uploaded_by UUID REFERENCES auth.users(id);
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_model_portfolios_created_at ON public.model_portfolios(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_market_commentary_published_date ON public.market_commentary(published_date DESC);
CREATE INDEX IF NOT EXISTS idx_investor_videos_created_at ON public.investor_videos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_investor_videos_category ON public.investor_videos(category);