
-- Create table for storing generated research reports
CREATE TABLE public.orchestrated_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  report_title TEXT NOT NULL,
  asset_id TEXT,
  asset_name TEXT,
  asset_type TEXT,
  selected_modules TEXT[] NOT NULL,
  report_content JSONB NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'completed', 'failed')),
  generated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.orchestrated_reports ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own reports" 
ON public.orchestrated_reports 
FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create reports" 
ON public.orchestrated_reports 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own reports" 
ON public.orchestrated_reports 
FOR UPDATE 
USING (auth.uid() = user_id OR user_id IS NULL);

-- Add updated_at trigger
CREATE TRIGGER update_orchestrated_reports_updated_at
BEFORE UPDATE ON public.orchestrated_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_orchestrated_reports_user_id ON public.orchestrated_reports(user_id);
CREATE INDEX idx_orchestrated_reports_asset_id ON public.orchestrated_reports(asset_id);
