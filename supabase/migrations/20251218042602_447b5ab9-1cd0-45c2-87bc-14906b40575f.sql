-- Add category and preview_images columns to purchasable_reports
ALTER TABLE public.purchasable_reports 
ADD COLUMN IF NOT EXISTS category text DEFAULT 'General',
ADD COLUMN IF NOT EXISTS preview_images text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS page_count integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS featured boolean DEFAULT false;