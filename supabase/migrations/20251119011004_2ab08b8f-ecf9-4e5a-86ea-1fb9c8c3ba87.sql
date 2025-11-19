-- Create learning_content table for admin-uploaded educational content
CREATE TABLE IF NOT EXISTS public.learning_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  duration TEXT,
  difficulty_level TEXT,
  topics TEXT[],
  key_metrics TEXT[],
  major_players TEXT[],
  severity TEXT,
  mitigation TEXT,
  file_path TEXT,
  thumbnail_url TEXT,
  video_url TEXT,
  is_published BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB
);

-- Create learning_progress table to track user progress
CREATE TABLE IF NOT EXISTS public.learning_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID REFERENCES public.learning_content(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  progress_percentage INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, content_id)
);

-- Create indexes for performance
CREATE INDEX idx_learning_content_category ON public.learning_content(category);
CREATE INDEX idx_learning_content_published ON public.learning_content(is_published);
CREATE INDEX idx_learning_progress_user_id ON public.learning_progress(user_id);
CREATE INDEX idx_learning_progress_content_id ON public.learning_progress(content_id);

-- Enable RLS
ALTER TABLE public.learning_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for learning_content
CREATE POLICY "Published content is viewable by everyone"
  ON public.learning_content
  FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins can manage all learning content"
  ON public.learning_content
  FOR ALL
  USING (is_admin(auth.uid()));

-- RLS Policies for learning_progress
CREATE POLICY "Users can view their own learning progress"
  ON public.learning_progress
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own learning progress"
  ON public.learning_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own learning progress"
  ON public.learning_progress
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger for updated_at on learning_content
CREATE TRIGGER update_learning_content_updated_at
  BEFORE UPDATE ON public.learning_content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_learning_content_views(content_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.learning_content
  SET view_count = view_count + 1
  WHERE id = content_id;
END;
$$;