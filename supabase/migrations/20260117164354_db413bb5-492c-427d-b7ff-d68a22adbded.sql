-- Create a table for planner item notes (CRM-style activity timeline)
CREATE TABLE public.admin_planner_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  planner_item_id UUID NOT NULL REFERENCES public.admin_planner_items(id) ON DELETE CASCADE,
  note_text TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_planner_notes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own planner notes"
ON public.admin_planner_notes
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.admin_planner_items 
    WHERE id = planner_item_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can create notes on their own planner items"
ON public.admin_planner_notes
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_planner_items 
    WHERE id = planner_item_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own planner notes"
ON public.admin_planner_notes
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.admin_planner_items 
    WHERE id = planner_item_id AND user_id = auth.uid()
  )
);

-- Create index for performance
CREATE INDEX idx_planner_notes_item_id ON public.admin_planner_notes(planner_item_id);
CREATE INDEX idx_planner_notes_created_at ON public.admin_planner_notes(created_at DESC);