-- Create opportunities table for investor platform
CREATE TABLE public.opportunities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ref_number TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  short_description TEXT NOT NULL,
  industry TEXT NOT NULL,
  location TEXT NOT NULL,
  business_description TEXT,
  industry_overview TEXT,
  business_highlights TEXT[],
  financial_summary TEXT,
  team_overview TEXT,
  image_url TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create opportunity inquiries table
CREATE TABLE public.opportunity_inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_inquiries ENABLE ROW LEVEL SECURITY;

-- Policies for opportunities (public read, admin write)
CREATE POLICY "Anyone can view active opportunities"
  ON public.opportunities
  FOR SELECT
  USING (status = 'active');

CREATE POLICY "Admins can manage opportunities"
  ON public.opportunities
  FOR ALL
  USING (is_admin(auth.uid()));

-- Policies for inquiries (anyone can insert, admin can view)
CREATE POLICY "Anyone can submit inquiries"
  ON public.opportunity_inquiries
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view inquiries"
  ON public.opportunity_inquiries
  FOR SELECT
  USING (is_admin(auth.uid()));

-- Create indexes
CREATE INDEX idx_opportunities_status ON public.opportunities(status);
CREATE INDEX idx_opportunities_ref_number ON public.opportunities(ref_number);
CREATE INDEX idx_inquiries_opportunity ON public.opportunity_inquiries(opportunity_id);