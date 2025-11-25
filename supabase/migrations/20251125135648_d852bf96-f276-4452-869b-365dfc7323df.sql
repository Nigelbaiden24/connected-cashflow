-- Add report_category column to reports table
ALTER TABLE public.reports 
ADD COLUMN report_category TEXT;

-- Add comment to describe the column
COMMENT ON COLUMN public.reports.report_category IS 'Subcategory for reports, e.g., research or analysis for investor platform';