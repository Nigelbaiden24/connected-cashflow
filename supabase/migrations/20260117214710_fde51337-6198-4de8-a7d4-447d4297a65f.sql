-- Create CRM boards table to persist custom boards
CREATE TABLE public.crm_boards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  columns JSONB NOT NULL DEFAULT '["Item", "Status"]'::jsonb,
  column_configs JSONB DEFAULT '{}'::jsonb,
  rows JSONB NOT NULL DEFAULT '[]'::jsonb,
  display_order INTEGER DEFAULT 0,
  is_collapsed BOOLEAN DEFAULT false,
  view_mode TEXT DEFAULT 'table',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.crm_boards ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own boards" 
ON public.crm_boards 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own boards" 
ON public.crm_boards 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own boards" 
ON public.crm_boards 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own boards" 
ON public.crm_boards 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_crm_boards_updated_at
BEFORE UPDATE ON public.crm_boards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();