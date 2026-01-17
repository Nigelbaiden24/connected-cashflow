-- Create admin_targets table for long-term targets tracking
CREATE TABLE public.admin_targets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  target_type TEXT NOT NULL DEFAULT 'quarterly', -- quarterly, annual, project
  category TEXT, -- revenue, growth, clients, performance
  target_value NUMERIC,
  current_value NUMERIC DEFAULT 0,
  unit TEXT, -- percentage, count, currency
  status TEXT NOT NULL DEFAULT 'in_progress', -- in_progress, achieved, missed, on_hold
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admin_target_updates table for tracking progress updates
CREATE TABLE public.admin_target_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  target_id UUID NOT NULL REFERENCES public.admin_targets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  update_text TEXT NOT NULL,
  previous_value NUMERIC,
  new_value NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_target_updates ENABLE ROW LEVEL SECURITY;

-- RLS policies for admin_targets
CREATE POLICY "Users can view their own targets" 
ON public.admin_targets 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own targets" 
ON public.admin_targets 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own targets" 
ON public.admin_targets 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own targets" 
ON public.admin_targets 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS policies for admin_target_updates
CREATE POLICY "Users can view updates for their targets" 
ON public.admin_target_updates 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.admin_targets 
  WHERE admin_targets.id = admin_target_updates.target_id 
  AND admin_targets.user_id = auth.uid()
));

CREATE POLICY "Users can create updates for their targets" 
ON public.admin_target_updates 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.admin_targets 
  WHERE admin_targets.id = admin_target_updates.target_id 
  AND admin_targets.user_id = auth.uid()
));

CREATE POLICY "Users can delete updates for their targets" 
ON public.admin_target_updates 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.admin_targets 
  WHERE admin_targets.id = admin_target_updates.target_id 
  AND admin_targets.user_id = auth.uid()
));

-- Add updated_at trigger
CREATE TRIGGER update_admin_targets_updated_at
BEFORE UPDATE ON public.admin_targets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();